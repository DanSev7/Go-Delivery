const express = require('express');
const orderItemController = require('../controllers/orderItemController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Create a new order item
router.post('/:orderId/:menuItemId', authMiddleware, orderItemController.createOrderItem);

// Get all order items with food images for a specific order
router.get('/:orderId', authMiddleware, orderItemController.getOrderItemsWithImage);

// Update an order item (quantity, price)
router.put('/:orderItemId', authMiddleware, orderItemController.updateOrderItem);

// Delete an order item
router.delete('/:orderItemId', authMiddleware, orderItemController.deleteOrderItem);

// Get all order items for a specific customer
router.get('/customers', authMiddleware, orderItemController.getAllOrderItemsForCustomer); // here this request makes conflict with the /:orderId line number 11

// Get all order items for a specific restaurant
router.get('/restaurant/:restaurantId', authMiddleware, orderItemController.getOrderItemsForRestaurant);

router.get('/customers/:customerId', authMiddleware, orderItemController.getOrderItemsForCustomer);

// router.get('/order-items/:orderId', authMiddleware, orderItemController.fetchOrderItems);


module.exports = router;
