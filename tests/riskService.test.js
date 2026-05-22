/**
 * Risk Service Tests
 *
 * These tests check the appointment risk classification logic.
 * Jenkins will run these tests during the automated Test stage.
 */

const {
  classifyAppointmentRisk,
  generateRiskSummary
} = require('../src/riskService');

describe('Risk Service', () => {
  test('should classify emergency appointments as HIGH risk', () => {
    // Create an emergency appointment example.
    const appointment = {
      patientName: 'Test Patient',
      contactNumber: '0400000000',
      doctorName: 'Dr Test',
      type: 'emergency',
      priority: 'low',
      symptoms: 'mild fever'
    };

    // Emergency type should always be HIGH risk.
    expect(classifyAppointmentRisk(appointment)).toBe('HIGH');
  });

  test('should classify high priority appointments as HIGH risk', () => {
    // Create a high priority appointment example.
    const appointment = {
      patientName: 'Test Patient',
      contactNumber: '0400000000',
      doctorName: 'Dr Test',
      type: 'general',
      priority: 'high',
      symptoms: 'headache'
    };

    // High priority should be classified as HIGH risk.
    expect(classifyAppointmentRisk(appointment)).toBe('HIGH');
  });

  test('should classify dangerous symptoms as HIGH risk', () => {
    // Create an appointment with a serious symptom.
    const appointment = {
      patientName: 'Test Patient',
      contactNumber: '0400000000',
      doctorName: 'Dr Test',
      type: 'general',
      priority: 'low',
      symptoms: 'patient has chest pain'
    };

    // Chest pain is listed as a high-risk symptom.
    expect(classifyAppointmentRisk(appointment)).toBe('HIGH');
  });

  test('should classify missing contact details as MEDIUM risk', () => {
    // Create an appointment with missing contact number.
    const appointment = {
      patientName: 'Test Patient',
      doctorName: 'Dr Test',
      type: 'general',
      priority: 'low',
      symptoms: 'mild cough'
    };

    // Missing important information should be MEDIUM risk.
    expect(classifyAppointmentRisk(appointment)).toBe('MEDIUM');
  });

  test('should classify complete normal appointments as LOW risk', () => {
    // Create a normal complete appointment.
    const appointment = {
      patientName: 'Test Patient',
      contactNumber: '0400000000',
      doctorName: 'Dr Test',
      type: 'general',
      priority: 'low',
      symptoms: 'routine checkup'
    };

    // A complete normal appointment should be LOW risk.
    expect(classifyAppointmentRisk(appointment)).toBe('LOW');
  });

  test('should generate a correct risk summary', () => {
    // Create multiple appointments with different risk levels.
    const appointments = [
      {
        patientName: 'Low Risk Patient',
        contactNumber: '0400000001',
        doctorName: 'Dr A',
        type: 'general',
        priority: 'low',
        symptoms: 'routine checkup'
      },
      {
        patientName: 'Medium Risk Patient',
        doctorName: 'Dr B',
        type: 'general',
        priority: 'low',
        symptoms: 'mild fever'
      },
      {
        patientName: 'High Risk Patient',
        contactNumber: '0400000003',
        doctorName: 'Dr C',
        type: 'emergency',
        priority: 'high',
        symptoms: 'breathing difficulty'
      }
    ];

    // Generate summary counts.
    const summary = generateRiskSummary(appointments);

    // Confirm each risk category has the correct count.
    expect(summary.LOW).toBe(1);
    expect(summary.MEDIUM).toBe(1);
    expect(summary.HIGH).toBe(1);
  });
});