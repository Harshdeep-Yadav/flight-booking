const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const authenticateUser = require('../middleware/auth');

// All booking routes require authentication
router.use(authenticateUser);

// User booking routes
router.get('/user', bookingsController.getUserBookings);
router.get('/:id', bookingsController.getBooking);
router.post('/', bookingsController.createBooking);
router.put('/:id', bookingsController.updateBooking);
router.delete('/:id', bookingsController.cancelBooking);

// Admin routes (these will be protected by adminOnly middleware in admin.js)
router.get('/', bookingsController.listBookings);
router.get('/flight/:flightId', bookingsController.getFlightBookings);

module.exports = router; 