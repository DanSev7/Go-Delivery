const express = require('express');
const menuItemController = require('../controllers/menuItemController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { restaurantManagerOnly, checkRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create a new menu item (restaurant managers only)
router.post('/:restaurantId', restaurantManagerOnly(), menuItemController.createMenuItem);

// Get a menu item by ID (all authenticated users)
router.get('/:id', checkRole(['admin', 'restaurant_manager', 'customer']), menuItemController.getMenuItem);

// Update menu item details (restaurant managers only)
router.put('/:id', restaurantManagerOnly(), menuItemController.updateMenuItem);

// Delete a menu item by ID (restaurant managers only)
router.delete('/:id', restaurantManagerOnly(), menuItemController.deleteMenuItem);

// List menu items by restaurant ID (restaurant managers)
router.get('/restaurants/:restaurantId', restaurantManagerOnly(), menuItemController.listMenuItemsByRestaurant);

// List Menu item for customer
router.get('/restaurant/:restaurantId', checkRole(['customer']), menuItemController.listMenuItemsByRestaurantCustomer);

// Rate a menu item (customers only)
router.put('/rate/:id', checkRole(['customer']), menuItemController.rateMenuItem);

module.exports = router;
