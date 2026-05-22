/**
 * Appointment API Tests
 *
 * These tests check the CRUD appointment endpoints.
 * Jenkins will run this file during the automated Test stage.
 */

const request = require('supertest');
const app = require('../src/app');

const {
  resetAppointments
} = require('../src/dataStore');

describe('Appointment API Endpoints', () => {
  beforeEach(() => {
    // Reset the appointment store before each test.
    // This makes the tests predictable and repeatable.
    resetAppointments([]);
  });

  test('GET /appointments should return an empty appointment list', async () => {
    // Send a GET request to retrieve all appointments.
    const response = await request(app).get('/appointments');

    // Confirm the endpoint returns HTTP 200 OK.
    expect(response.statusCode).toBe(200);

    // Confirm the count is zero after resetting the store.
    expect(response.body.count).toBe(0);

    // Confirm appointments is an array.
    expect(Array.isArray(response.body.appointments)).toBe(true);
  });

  test('POST /appointments should create a new LOW risk appointment', async () => {
    // Create a normal appointment payload.
    const newAppointment = {
      patientName: 'John Citizen',
      contactNumber: '0400000100',
      doctorName: 'Dr Green',
      type: 'general',
      priority: 'low',
      symptoms: 'routine checkup'
    };

    // Send the appointment data to the API.
    const response = await request(app)
      .post('/appointments')
      .send(newAppointment);

    // Confirm the API returns HTTP 201 Created.
    expect(response.statusCode).toBe(201);

    // Confirm the success message is returned.
    expect(response.body.message).toBe('Appointment created successfully');

    // Confirm the appointment has an automatically generated ID.
    expect(response.body.appointment.id).toBeDefined();

    // Confirm this normal appointment is classified as LOW risk.
    expect(response.body.appointment.riskLevel).toBe('LOW');
  });

  test('POST /appointments should reject missing required fields', async () => {
    // Create an invalid appointment without required fields.
    const invalidAppointment = {
      patientName: 'Incomplete Patient'
    };

    // Send invalid data to the API.
    const response = await request(app)
      .post('/appointments')
      .send(invalidAppointment);

    // Confirm the API returns HTTP 400 Bad Request.
    expect(response.statusCode).toBe(400);

    // Confirm the validation error is returned.
    expect(response.body.error).toBe('patientName, contactNumber, and doctorName are required');
  });

  test('GET /appointments/:id should return one appointment by ID', async () => {
    // First create an appointment.
    const createResponse = await request(app)
      .post('/appointments')
      .send({
        patientName: 'Mary Adams',
        contactNumber: '0400000200',
        doctorName: 'Dr Blue',
        type: 'general',
        priority: 'medium',
        symptoms: 'headache'
      });

    // Store the generated appointment ID.
    const appointmentId = createResponse.body.appointment.id;

    // Request the appointment using its ID.
    const response = await request(app).get(`/appointments/${appointmentId}`);

    // Confirm the appointment is found.
    expect(response.statusCode).toBe(200);

    // Confirm the returned appointment has the same ID.
    expect(response.body.id).toBe(appointmentId);

    // Medium priority should be classified as MEDIUM risk.
    expect(response.body.riskLevel).toBe('MEDIUM');
  });

  test('PUT /appointments/:id should update an appointment', async () => {
    // First create an appointment.
    const createResponse = await request(app)
      .post('/appointments')
      .send({
        patientName: 'Update Patient',
        contactNumber: '0400000300',
        doctorName: 'Dr Yellow',
        type: 'general',
        priority: 'low',
        symptoms: 'mild fever'
      });

    // Store the generated appointment ID.
    const appointmentId = createResponse.body.appointment.id;

    // Update the appointment priority to high.
    const response = await request(app)
      .put(`/appointments/${appointmentId}`)
      .send({
        priority: 'high',
        symptoms: 'breathing difficulty'
      });

    // Confirm the update request succeeded.
    expect(response.statusCode).toBe(200);

    // Confirm the success message is returned.
    expect(response.body.message).toBe('Appointment updated successfully');

    // High priority and breathing difficulty should become HIGH risk.
    expect(response.body.appointment.riskLevel).toBe('HIGH');
  });

  test('DELETE /appointments/:id should delete an appointment', async () => {
    // First create an appointment.
    const createResponse = await request(app)
      .post('/appointments')
      .send({
        patientName: 'Delete Patient',
        contactNumber: '0400000400',
        doctorName: 'Dr Red',
        type: 'general',
        priority: 'low',
        symptoms: 'routine review'
      });

    // Store the generated appointment ID.
    const appointmentId = createResponse.body.appointment.id;

    // Delete the appointment.
    const deleteResponse = await request(app).delete(`/appointments/${appointmentId}`);

    // Confirm deletion succeeded.
    expect(deleteResponse.statusCode).toBe(200);

    // Confirm the deletion message is returned.
    expect(deleteResponse.body.message).toBe('Appointment deleted successfully');

    // Try to retrieve the deleted appointment.
    const getResponse = await request(app).get(`/appointments/${appointmentId}`);

    // Confirm it is no longer found.
    expect(getResponse.statusCode).toBe(404);
  });

  test('GET /risk-summary should return risk counts', async () => {
    // Create a LOW risk appointment.
    await request(app)
      .post('/appointments')
      .send({
        patientName: 'Low Risk Patient',
        contactNumber: '0400000500',
        doctorName: 'Dr Low',
        type: 'general',
        priority: 'low',
        symptoms: 'routine checkup'
      });

    // Create a HIGH risk appointment.
    await request(app)
      .post('/appointments')
      .send({
        patientName: 'High Risk Patient',
        contactNumber: '0400000600',
        doctorName: 'Dr High',
        type: 'emergency',
        priority: 'high',
        symptoms: 'chest pain'
      });

    // Request the risk summary.
    const response = await request(app).get('/risk-summary');

    // Confirm the request succeeded.
    expect(response.statusCode).toBe(200);

    // Confirm the total appointment count.
    expect(response.body.totalAppointments).toBe(2);

    // Confirm the risk summary values.
    expect(response.body.riskSummary.LOW).toBe(1);
    expect(response.body.riskSummary.MEDIUM).toBe(0);
    expect(response.body.riskSummary.HIGH).toBe(1);
  });
});