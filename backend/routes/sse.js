const express = require('express');
const router = express.Router();
const sseController = require('../controllers/sseController');

// SSE endpoint for real-time flight status updates
router.get('/flight-status', sseController.flightStatusSSE);

// Get current status of a specific flight
router.get('/flight-status/:flightId', sseController.getFlightStatus);

module.exports = router; 