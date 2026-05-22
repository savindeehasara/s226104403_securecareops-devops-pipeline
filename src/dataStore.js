/**
 * SecureCareOps Data Store
 *
 * This file provides a simple in-memory data store for appointment records.
 * It keeps the project lightweight and easy to test in a Jenkins CI/CD pipeline.
 */

const { randomUUID } = require('crypto');

// Initial sample appointments are included so the API has useful data when it starts.
let appointments = [
  {
    id: randomUUID(),
    patientName: 'Nimal Perera',
    contactNumber: '0400000001',
    doctorName: 'Dr Smith',
    type: 'general',
    priority: 'low',
    symptoms: 'mild fever',
    status: 'scheduled'
  },
  {
    id: randomUUID(),
    patientName: 'Sarah Williams',
    contactNumber: '0400000002',
    doctorName: 'Dr Chen',
    type: 'emergency',
    priority: 'high',
    symptoms: 'breathing difficulty',
    status: 'scheduled'
  }
];

/**
 * Returns all appointment records.
 *
 * @returns {Array} List of appointments.
 */
function getAllAppointments() {
  return appointments;
}

/**
 * Finds one appointment using its unique ID.
 *
 * @param {string} id - Appointment ID.
 * @returns {Object|undefined} Matching appointment or undefined.
 */
function getAppointmentById(id) {
  return appointments.find((appointment) => appointment.id === id);
}

/**
 * Creates a new appointment record.
 *
 * @param {Object} appointmentData - Appointment details from request body.
 * @returns {Object} Newly created appointment.
 */
function createAppointment(appointmentData) {
  const newAppointment = {
    id: randomUUID(),
    patientName: appointmentData.patientName,
    contactNumber: appointmentData.contactNumber,
    doctorName: appointmentData.doctorName,
    type: appointmentData.type || 'general',
    priority: appointmentData.priority || 'low',
    symptoms: appointmentData.symptoms || '',
    status: appointmentData.status || 'scheduled'
  };

  appointments.push(newAppointment);
  return newAppointment;
}

/**
 * Updates an existing appointment.
 *
 * @param {string} id - Appointment ID.
 * @param {Object} updateData - New appointment values.
 * @returns {Object|null} Updated appointment or null if not found.
 */
function updateAppointment(id, updateData) {
  const appointmentIndex = appointments.findIndex((appointment) => appointment.id === id);

  if (appointmentIndex === -1) {
    return null;
  }

  appointments[appointmentIndex] = {
    ...appointments[appointmentIndex],
    ...updateData,
    id
  };

  return appointments[appointmentIndex];
}

/**
 * Deletes an appointment by ID.
 *
 * @param {string} id - Appointment ID.
 * @returns {boolean} True if deleted, false if not found.
 */
function deleteAppointment(id) {
  const originalLength = appointments.length;

  appointments = appointments.filter((appointment) => appointment.id !== id);

  return appointments.length < originalLength;
}

/**
 * Resets the data store during automated tests.
 * This keeps tests reliable and repeatable.
 *
 * @param {Array} testAppointments - Replacement test data.
 */
function resetAppointments(testAppointments = []) {
  appointments = testAppointments;
}

// Export functions so app.js and tests can use them.
module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  resetAppointments
};