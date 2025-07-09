const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authenticateUser = require('../middleware/auth');

// Public routes
router.post('/register', usersController.register);
router.post('/login', usersController.login);

// Protected routes
router.use(authenticateUser);

router.get('/profile', usersController.getProfile);
router.put('/profile', usersController.updateProfile);
router.get('/bookings', usersController.getUserBookings);

module.exports = router;
