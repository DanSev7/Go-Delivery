// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Create a new order
router.post('/:restaurantId', authMiddleware, orderController.createOrder);

// Route to get rider's completed orders
router.get('/rider/completed-orders', authMiddleware,  orderController.getCompletedOrders);

// Get an order by ID
router.get('/:id', authMiddleware, orderController.getOrder);

// Get all orders for a restaurant
router.get('/restaurant/:restaurantId', authMiddleware, orderController.getOrdersForRestaurant);

// Get all orders by manager_id
router.get('/manager/:managerId', authMiddleware, orderController.getOrdersByManager);

// Route to get rider's active orders
router.get('/rider/active-orders', authMiddleware, orderController.getRiderActiveOrders);

// Route to update order status (e.g., mark as delivered)
router.put('/rider/update-order-status', authMiddleware,  orderController.updateOrderStatus);


// Update order status
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);

// Delete an order
router.delete('/:id', authMiddleware, orderController.deleteOrder);

// List orders for a customer
router.get('/customer/orders', authMiddleware, orderController.listOrdersForCustomer);

// List orders for a rider
router.get('/rider/orders', authMiddleware, orderController.listOrdersForRider);

// Update payment status
router.put('/:id/payment-status', authMiddleware, orderController.updatePaymentStatus);

// Assign rider to an order
router.put('/:id/assign-rider', authMiddleware, orderController.assignRider);

router.get('/', authMiddleware, orderController.getAllOrders);


module.exports = router;
