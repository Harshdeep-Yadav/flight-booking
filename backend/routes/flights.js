const express = require('express');
const router = express.Router();
const flightsController = require('../controllers/flightsController');
const authenticateUser = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Public routes
router.get('/', flightsController.listFlights);
router.get('/search', flightsController.searchFlights);
router.get('/:id', flightsController.getFlight);

// Admin-only routes
router.post('/', authenticateUser, adminOnly, flightsController.createFlight);
router.put('/:id', authenticateUser, adminOnly, flightsController.updateFlight);
router.delete('/:id', authenticateUser, adminOnly, flightsController.deleteFlight);
router.get('/stats/overview', authenticateUser, adminOnly, flightsController.getFlightStats);

// In-memory store for demo (replace with DB triggers in production)
let clients = [];
let flightStatuses = {};

// SSE endpoint
router.get('/status/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// Simulate a flight status update (for demo/testing)
router.post('/status/update', (req, res) => {
  const { flight_id, status } = req.body;
  if (!flight_id || !status) return res.status(400).json({ error: 'Missing flight_id or status' });
  flightStatuses[flight_id] = status;
  // Broadcast to all clients
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify({ flight_id, status })}\n\n`);
  });
  res.json({ success: true });
});

module.exports = router; 