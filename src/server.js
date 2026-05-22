/**
 * SecureCareOps Server
 *
 * This file starts the Express application.
 * It is separated from app.js so automated tests can import the app
 * without starting a real server.
 */

const app = require('./app');

// Use the port from the environment if available.
// If not, use port 3000 for local development.
const PORT = process.env.PORT || 3000;

// Start the API server.
app.listen(PORT, () => {
  console.log(`SecureCareOps API is running on port ${PORT}`);
});