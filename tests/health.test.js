/**
 * Health Endpoint Tests
 *
 * These tests confirm that the SecureCareOps API is running correctly.
 * Jenkins will run this file during the automated Test stage.
 */

const request = require('supertest');
const app = require('../src/app');

describe('Health and Root API Endpoints', () => {
  test('GET / should return the visual dashboard page', async () => {
    // Send a GET request to the root endpoint.
    const response = await request(app).get('/');

    // Confirm the dashboard page returns HTTP 200 OK.
    expect(response.statusCode).toBe(200);

    // Confirm the response is an HTML page.
    expect(response.headers['content-type']).toContain('text/html');

    // Confirm the dashboard contains the project name.
    expect(response.text).toContain('SecureCareOps Dashboard');

    // Confirm the dashboard contains DevOps evidence links.
    expect(response.text).toContain('DevOps Evidence Links');
  });

  test('GET /health should return service status UP', async () => {
    // Send a GET request to the health endpoint.
    const response = await request(app).get('/health');

    // Confirm the health endpoint returns HTTP 200 OK.
    expect(response.statusCode).toBe(200);

    // Confirm the service status is UP.
    expect(response.body.status).toBe('UP');

    // Confirm the response identifies the correct service.
    expect(response.body.service).toBe('SecureCareOps API');

    // Confirm the response includes a timestamp.
    expect(response.body.timestamp).toBeDefined();
  });

  test('GET /metrics should return Prometheus metrics', async () => {
    // Send a GET request to the metrics endpoint.
    const response = await request(app).get('/metrics');

    // Confirm the metrics endpoint returns HTTP 200 OK.
    expect(response.statusCode).toBe(200);

    // Confirm the metrics output includes the custom HTTP request counter.
    expect(response.text).toContain('securecareops_http_requests_total');
  });
});