// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Register a new user
router.post('/register', userController.registerUser);

// Login a user
router.post('/login', userController.loginUser);

// Get user profile (protected route)
router.get('/profile', authMiddleware, userController.getUserProfile);

// Update User profile
router.put('/update/:userId', authMiddleware, userController.updateUser);

// Change password
router.post('/:userId/change-password', authMiddleware, userController.updateUserPassword);

// Request password reset
router.post('/password/reset-request', userController.requestPasswordReset);

// Reset password with token
router.post('/password/reset', userController.resetPassword);

module.exports = router;
