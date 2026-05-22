/**
 * SecureCareOps Main Application
 *
 * This file defines the Express application, API routes, security middleware,
 * monitoring metrics, and appointment management endpoints.
 */

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const client = require('prom-client');
const path = require('path');
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require('./dataStore');

const {
  classifyAppointmentRisk,
  generateRiskSummary
} = require('./riskService');

// Create the Express application.
const app = express();

// Apply basic security headers to reduce common web security risks.
// app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// Enable JSON request body parsing.
app.use(express.json());

// Serve the visual dashboard from the public folder.
app.use(express.static(path.join(__dirname, '../public')));

// Log HTTP requests so application activity can be reviewed.
app.use(morgan('combined'));

// Create a Prometheus registry to store application metrics.
const register = new client.Registry();

// Add default Node.js process metrics such as memory and CPU usage.
client.collectDefaultMetrics({ register });

// Create a custom counter for tracking total HTTP requests.
const httpRequestCounter = new client.Counter({
  name: 'securecareops_http_requests_total',
  help: 'Total number of HTTP requests received by SecureCareOps',
  labelNames: ['method', 'route', 'status_code']
});

// Register the custom metric.
register.registerMetric(httpRequestCounter);

/**
 * Middleware to count every HTTP request.
 * This supports the Monitoring stage in the Jenkins pipeline.
 */
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode
    });
  });

  next();
});

/**
 * Root endpoint.
 * This confirms that the API is running.
 */
// app.get('/', (req, res) => {
//   res.status(200).json({
//     application: 'SecureCareOps',
//     message: 'Healthcare appointment and risk tracking API is running',
//     version: '1.0.0'
//   });
// });



/**
 * Health endpoint.
 * Jenkins can call this after deployment to confirm the application is alive.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'SecureCareOps API',
    timestamp: new Date().toISOString()
  });
});

/**
 * Metrics endpoint.
 * Prometheus can scrape this endpoint for monitoring data.
 */
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

/**
 * Get all appointments.
 * Each appointment is returned with an extra calculated risk level.
 */
app.get('/appointments', (req, res) => {
  const appointments = getAllAppointments().map((appointment) => ({
    ...appointment,
    riskLevel: classifyAppointmentRisk(appointment)
  }));

  res.status(200).json({
    count: appointments.length,
    appointments
  });
});

/**
 * Get one appointment by ID.
 */
app.get('/appointments/:id', (req, res) => {
  const appointment = getAppointmentById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      error: 'Appointment not found'
    });
  }

  return res.status(200).json({
    ...appointment,
    riskLevel: classifyAppointmentRisk(appointment)
  });
});

/**
 * Create a new appointment.
 */
app.post('/appointments', (req, res) => {
  const {
    patientName,
    contactNumber,
    doctorName,
    type,
    priority,
    symptoms,
    status
  } = req.body;

  // Basic validation ensures required fields are provided.
  if (!patientName || !contactNumber || !doctorName) {
    return res.status(400).json({
      error: 'patientName, contactNumber, and doctorName are required'
    });
  }

  const newAppointment = createAppointment({
    patientName,
    contactNumber,
    doctorName,
    type,
    priority,
    symptoms,
    status
  });

  return res.status(201).json({
    message: 'Appointment created successfully',
    appointment: {
      ...newAppointment,
      riskLevel: classifyAppointmentRisk(newAppointment)
    }
  });
});

/**
 * Update an existing appointment.
 */
app.put('/appointments/:id', (req, res) => {
  const updatedAppointment = updateAppointment(req.params.id, req.body);

  if (!updatedAppointment) {
    return res.status(404).json({
      error: 'Appointment not found'
    });
  }

  return res.status(200).json({
    message: 'Appointment updated successfully',
    appointment: {
      ...updatedAppointment,
      riskLevel: classifyAppointmentRisk(updatedAppointment)
    }
  });
});

/**
 * Delete an appointment by ID.
 */
app.delete('/appointments/:id', (req, res) => {
  const wasDeleted = deleteAppointment(req.params.id);

  if (!wasDeleted) {
    return res.status(404).json({
      error: 'Appointment not found'
    });
  }

  return res.status(200).json({
    message: 'Appointment deleted successfully'
  });
});

/**
 * Risk summary endpoint.
 * This gives a quick overview of LOW, MEDIUM, and HIGH risk appointments.
 */
app.get('/risk-summary', (req, res) => {
  const appointments = getAllAppointments();
  const summary = generateRiskSummary(appointments);

  res.status(200).json({
    totalAppointments: appointments.length,
    riskSummary: summary
  });
});

// Export the app so tests can use it without starting the server.
module.exports = app;