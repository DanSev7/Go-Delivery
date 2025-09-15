// routes/restaurantRoutes.js
const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const {authMiddleware} = require('../middlewares/authMiddleware');
const { adminOnly, restaurantManagerOnly, adminOrRestaurantManager, checkRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create a new restaurant (restaurant managers only)
router.post('/', restaurantManagerOnly(), restaurantController.createRestaurant);

// Get restaurant Dashboard details (restaurant managers only)
router.get('/dashboard', restaurantManagerOnly(), restaurantController.getRestaurantDashboard);

// Get a restaurant by ID (admin or restaurant manager)
router.get('/:id', adminOrRestaurantManager(), restaurantController.getRestaurant);

// Update restaurant details (admin or restaurant manager)
router.put('/:id', adminOrRestaurantManager(), restaurantController.updateRestaurant);

// Delete a restaurant by ID (admin only)
router.delete('/:id', adminOnly(), restaurantController.deleteRestaurant);

// List all restaurants (admin sees all, managers see their own, customers see all)
router.get('/', checkRole(['admin', 'restaurant_manager', 'customer']), restaurantController.listRestaurants);

// Add a review (customers only)
router.post('/reviews', checkRole(['customer']), restaurantController.addReview);

module.exports = router;
