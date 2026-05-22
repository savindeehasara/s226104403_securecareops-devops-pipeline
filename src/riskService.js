/**
 * SecureCareOps Risk Service
 *
 * This file contains the business logic for classifying appointment risk.
 * Keeping this logic in a separate file makes the project easier to test,
 * maintain, and analyse in the Jenkins pipeline.
 */

/**
 * Classifies an appointment into LOW, MEDIUM, or HIGH risk.
 *
 * Risk rules:
 * - HIGH: emergency appointment, critical symptoms, or very high priority.
 * - MEDIUM: missing contact details, missing doctor name, or medium priority.
 * - LOW: normal appointment with complete details.
 *
 * @param {Object} appointment - Appointment details submitted by the user.
 * @returns {string} Risk level: LOW, MEDIUM, or HIGH.
 */
function classifyAppointmentRisk(appointment) {
  // If no appointment object is provided, treat it as medium risk
  // because incomplete data needs staff attention.
  if (!appointment) {
    return 'MEDIUM';
  }

  // Convert text fields to lowercase so comparisons are consistent.
  const type = String(appointment.type || '').toLowerCase();
  const symptoms = String(appointment.symptoms || '').toLowerCase();
  const priority = String(appointment.priority || '').toLowerCase();

  // HIGH risk conditions represent urgent clinical or operational cases.
  const highRiskSymptoms = ['chest pain', 'breathing difficulty', 'severe bleeding', 'stroke'];

  // Check whether the symptoms field contains any high-risk keyword.
  const hasHighRiskSymptom = highRiskSymptoms.some((keyword) =>
    symptoms.includes(keyword)
  );

  // Emergency appointment, critical symptoms, or high priority are HIGH risk.
  if (type === 'emergency' || priority === 'high' || hasHighRiskSymptom) {
    return 'HIGH';
  }

  // Missing important information is MEDIUM risk because staff need to follow up.
  if (!appointment.patientName || !appointment.contactNumber || !appointment.doctorName) {
    return 'MEDIUM';
  }

  // Medium priority appointments are classified as MEDIUM risk.
  if (priority === 'medium') {
    return 'MEDIUM';
  }

  // If none of the above conditions match, the appointment is LOW risk.
  return 'LOW';
}

/**
 * Creates a summary count of appointment risk levels.
 *
 * @param {Array} appointments - List of appointment records.
 * @returns {Object} Summary of LOW, MEDIUM, and HIGH risk counts.
 */
function generateRiskSummary(appointments) {
  // Start the summary with zero counts for each risk category.
  const summary = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0
  };

  // If appointments is not an array, return the empty summary safely.
  if (!Array.isArray(appointments)) {
    return summary;
  }

  // Count how many appointments belong to each risk category.
  appointments.forEach((appointment) => {
    const riskLevel = classifyAppointmentRisk(appointment);
    summary[riskLevel] += 1;
  });

  return summary;
}

// Export the functions so they can be used in app.js and tested in Jest.
module.exports = {
  classifyAppointmentRisk,
  generateRiskSummary
};