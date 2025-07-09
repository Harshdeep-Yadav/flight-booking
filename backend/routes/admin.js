const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateUser = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Apply authentication and admin check to all admin routes
router.use(authenticateUser);
router.use(adminOnly);

// Dashboard
router.get('/stats', adminController.getStats);

// Flights
router.get('/flights', adminController.listFlights);
router.post('/flights', adminController.createFlight);
router.put('/flights/:id', adminController.updateFlight);
router.delete('/flights/:id', adminController.deleteFlight);

// Bookings
router.get('/bookings', adminController.listBookings);
router.put('/bookings/:id', adminController.updateBooking);
router.delete('/bookings/:id', adminController.deleteBooking);

// Users
router.get('/users', adminController.listUsers);

module.exports = router; 