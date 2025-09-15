const express = require('express');
const riderController = require('../controllers/riderController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Professional SaaS API Routes with proper validation and authorization

// Public routes (for admin/restaurant managers)
router.get('/available', authMiddleware, roleMiddleware.adminOrRestaurantManager(), riderController.getAvailableRiders);
router.get('/:riderId', authMiddleware, riderController.getRiderById);

// Rider registration (authenticated users only)
router.post('/register', 
  authMiddleware, 
  riderController.validateRiderData, 
  riderController.registerRider
);

// Rider management (admin only)
router.delete('/:riderId', authMiddleware, roleMiddleware.adminOnly(), riderController.deleteRider);

// Rider-specific routes (authenticated rider only)
router.get('/profile/me', authMiddleware, roleMiddleware.riderOnly(), riderController.getRiderProfile);
router.put('/profile/me', authMiddleware, roleMiddleware.riderOnly(), riderController.updateRiderProfile);
router.get('/location/me', authMiddleware, roleMiddleware.riderOnly(), riderController.getRiderLocation);
router.put('/location/me', authMiddleware, roleMiddleware.riderOnly(), riderController.updateRiderLocation);
router.put('/status/:riderId', authMiddleware, riderController.updateRiderStatus);

// Order management routes (rider only)
router.get('/orders/available', authMiddleware, roleMiddleware.riderOnly(), riderController.getAvailableOrders);
router.get('/orders/accepted', authMiddleware, roleMiddleware.riderOnly(), riderController.getAcceptedOrders);
router.get('/orders/assigned', authMiddleware, roleMiddleware.riderOnly(), riderController.getAssignedOrders);
router.get('/orders/delivered', authMiddleware, roleMiddleware.riderOnly(), riderController.getDeliveredOrders);
router.post('/orders/:order_id/assign', authMiddleware, roleMiddleware.riderOnly(), riderController.assignOrderToRider);
router.put('/orders/:order_id/accept', authMiddleware, roleMiddleware.riderOnly(), riderController.acceptOrder);
router.put('/orders/:order_id/complete', authMiddleware, roleMiddleware.riderOnly(), riderController.completeOrder);

module.exports = router;
