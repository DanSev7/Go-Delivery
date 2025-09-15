const express = require('express');
const { getStats } = require('../controllers/adminController');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminOnly());

// Route to get statistics
router.get('/stats', getStats);
router.get('/users', userController.getAllUsers);
router.delete('/users/:userId', userController.deleteUser);

module.exports = router;
