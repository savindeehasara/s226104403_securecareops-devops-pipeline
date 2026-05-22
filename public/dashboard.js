let currentAppointments = [];

async function loadDashboard() {
  const apiStatus = document.getElementById('apiStatus');
  const totalAppointments = document.getElementById('totalAppointments');
  const highRisk = document.getElementById('highRisk');
  const riskSummary = document.getElementById('riskSummary');
  const table = document.getElementById('appointmentTable');

  try {
    // Load health status
    const healthResponse = await fetch('/health');

    if (!healthResponse.ok) {
      throw new Error('Health endpoint failed');
    }

    const healthData = await healthResponse.json();
    apiStatus.textContent = healthData.status;

    // Load appointment data
    const appointmentsResponse = await fetch('/appointments');

    if (!appointmentsResponse.ok) {
      throw new Error('Appointments endpoint failed');
    }

    const appointmentsData = await appointmentsResponse.json();
    currentAppointments = appointmentsData.appointments;

    totalAppointments.textContent = appointmentsData.count;

    // Calculate risk summary from loaded appointment records
    const summary = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0
    };

    currentAppointments.forEach((appointment) => {
      if (appointment.riskLevel === 'LOW') {
        summary.LOW += 1;
      } else if (appointment.riskLevel === 'MEDIUM') {
        summary.MEDIUM += 1;
      } else if (appointment.riskLevel === 'HIGH') {
        summary.HIGH += 1;
      }
    });

    highRisk.textContent = summary.HIGH;

    riskSummary.innerHTML = `
      <strong>LOW:</strong> ${summary.LOW} |
      <strong>MEDIUM:</strong> ${summary.MEDIUM} |
      <strong>HIGH:</strong> ${summary.HIGH}
    `;

    // Load appointment table
    table.innerHTML = '';

    if (currentAppointments.length === 0) {
      table.innerHTML = `
        <tr>
          <td colspan="7">No appointments available. Create a new appointment using the form above.</td>
        </tr>
      `;
      return;
    }

    currentAppointments.forEach((appointment) => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${appointment.patientName}</td>
        <td>${appointment.doctorName}</td>
        <td>${appointment.type}</td>
        <td>${appointment.priority}</td>
        <td>${appointment.symptoms}</td>
        <td><span class="badge ${appointment.riskLevel}">${appointment.riskLevel}</span></td>
        <td>
          <button class="edit-button" onclick="startEdit('${appointment.id}')">Edit</button>
          <button class="delete-button" onclick="deleteAppointment('${appointment.id}')">Delete</button>
        </td>
      `;

      table.appendChild(row);
    });
  } catch (error) {
    apiStatus.textContent = 'ERROR';
    riskSummary.textContent = 'Unable to load dashboard data.';
    console.error('Dashboard loading error:', error);
  }
}

async function submitAppointment(event) {
  event.preventDefault();

  const appointmentId = document.getElementById('appointmentId').value;

  const appointmentData = {
    patientName: document.getElementById('patientName').value,
    contactNumber: document.getElementById('contactNumber').value,
    doctorName: document.getElementById('doctorName').value,
    type: document.getElementById('type').value,
    priority: document.getElementById('priority').value,
    symptoms: document.getElementById('symptoms').value
  };

  try {
    let response;

    if (appointmentId) {
      response = await fetch(`/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });
    } else {
      response = await fetch('/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });
    }

    if (!response.ok) {
      throw new Error('Appointment request failed');
    }

    resetForm();

    document.getElementById('formMessage').textContent = appointmentId
      ? 'Appointment updated successfully.'
      : 'Appointment created successfully.';

    await loadDashboard();
  } catch (error) {
    document.getElementById('formMessage').textContent = 'Unable to save appointment.';
    console.error('Save appointment error:', error);
  }
}

function startEdit(appointmentId) {
  const appointment = currentAppointments.find((item) => item.id === appointmentId);

  if (!appointment) {
    return;
  }

  document.getElementById('appointmentId').value = appointment.id;
  document.getElementById('patientName').value = appointment.patientName;
  document.getElementById('contactNumber').value = appointment.contactNumber;
  document.getElementById('doctorName').value = appointment.doctorName;
  document.getElementById('type').value = appointment.type;
  document.getElementById('priority').value = appointment.priority;
  document.getElementById('symptoms').value = appointment.symptoms;

  document.getElementById('submitButton').textContent = 'Update Appointment';
  document.getElementById('formMessage').textContent = 'Editing selected appointment.';
}

async function deleteAppointment(appointmentId) {
  const confirmDelete = confirm('Are you sure you want to delete this appointment?');

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`/appointments/${appointmentId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Delete request failed');
    }

    document.getElementById('formMessage').textContent = 'Appointment deleted successfully.';

    await loadDashboard();
  } catch (error) {
    document.getElementById('formMessage').textContent = 'Unable to delete appointment.';
    console.error('Delete appointment error:', error);
  }
}

function resetForm() {
  document.getElementById('appointmentForm').reset();
  document.getElementById('appointmentId').value = '';
  document.getElementById('submitButton').textContent = 'Create Appointment';
}

document.getElementById('appointmentForm').addEventListener('submit', submitAppointment);

document.getElementById('cancelEditButton').addEventListener('click', () => {
  resetForm();
  document.getElementById('formMessage').textContent = 'Edit cancelled.';
});

loadDashboard();