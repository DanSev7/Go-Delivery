// controllers/orderController.js
const orderQueries = require('../queries/orderQueries');
const riderQueries = require('../queries/riderQueries');

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { totalPrice, orderStatus, paymentStatus, deliveryAddress, deliveryFee } = req.body;
    const restaurantId = req.params.restaurantId;
    const customerId = req.user.userId; // Assume user is logged in as customer

    console.log("CustomerId : ", customerId, "restaurantId : ", restaurantId);

    const newOrder = await orderQueries.createOrder(
      customerId,
      restaurantId,
      totalPrice,
      orderStatus,
      paymentStatus,
      deliveryAddress,
      deliveryFee
    );

    res.status(201).json(newOrder);
  } catch (error) {
    console.log("Error creating order : ", error.message);
    res.status(500).json({ message: 'Error creating order', error });
  }
};

// Assign Rider after the order has been created
const assignRider = async (req, res) => {
  try {
    const riderId = req.user.userId; // Rider ID will be passed in the body after successful payment
    const orderId = req.params.id; // Order ID will be in the URL parameter

    const updatedOrder = await orderQueries.assignRiderToOrder(orderId, riderId);

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.log("Error while assigning rider : ", error.message);
    res.status(500).json({ message: 'Error assigning rider', error });
  }
};

// Get an order by ID
const getOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderQueries.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error });
  }
};

// Get all orders for a restaurant
const getOrdersForRestaurant = async (req, res) => {
  const { restaurantId } = req.params;
  console.log("Restaurant ID : ", restaurantId);
  try {
    const orders = await orderQueries.getOrdersByRestaurant(restaurantId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders  = await orderQueries.listAllOrders();

    res.json(orders).status(200);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
}

// Get orders by manager_id
const getOrdersByManager = async (req, res) => {
  const { managerId } = req.params;
  try {
    const orders = await orderQueries.getOrdersByManagerId(managerId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log("Order ID : ", orderId);
    const { order_status } = req.body;
    console.log("Order Status : ", order_status);
    const updatedOrder = await orderQueries.updateOrderStatus(orderId, order_status);
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    console.log("Error while updating order status : ", error.message);
    res.status(500).json({ message: 'Error updating order status', error });
  }
};

// Delete an order
const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await orderQueries.deleteOrder(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error });
  }
};

// List all orders for a customer
const listOrdersForCustomer = async (req, res) => {
  try {
    const customerId = req.user.userId;
    console.log("Customer Id : ", customerId);
    const orders = await orderQueries.listOrdersForCustomer(customerId);
    res.json(orders);
  } catch (error) {
    console.log("Error : ", error.message);
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// List all orders for a rider
const listOrdersForRider = async (req, res) => {
  try {
    const riderId = req.user.userId;
    const orders = await orderQueries.listOrdersForRider(riderId);
    res.json(orders);
  } catch (error) {
    console.log("Error : ", error.message);
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { payment_status } = req.body;
    const updatedOrder = await orderQueries.updatePaymentStatus(orderId, payment_status);
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status', error });
  }
};

// Get Rider's Active Orders
const getRiderActiveOrders = async (req, res) => {
  const riderId = req.user.userId; // Assuming rider is authenticated
  console.log("Rider Id : ", riderId);

  try {
    const activeOrders = await orderQueries.getRiderActiveOrdersQuery(riderId);

    if (activeOrders.length > 0) {
      res.status(200).json({
        success: true,
        orders: activeOrders,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No active orders found',
      });
    }
  } catch (error) {
    console.error('Error fetching active orders:', error);
    res.status(500).json({ error: 'Failed to fetch active orders' });
  }
};

// Update Order Status
const updateOrderStatusRider = async (req, res) => {
  const riderId = req.user.user_id; // Assuming the rider is authenticated
  const { orderId, newStatus } = req.body; // Order ID and new status passed in the body

  // Only allow certain statuses
  const validStatuses = ['delivered', 'cancelled', 'on_the_way'];

  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  try {
    // Update order status in the database
    const result = await orderQueries.updateOrderStatusQuery(orderId, riderId, newStatus);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found or not assigned to the rider' });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Get Completed Orders for the Rider
const getCompletedOrders = async (req, res) => {
  const riderId = req.user.user_id; // Assuming the rider is authenticated

  try {
    // Fetch the completed orders for the rider
    const completedOrders = await orderQueries.getCompletedOrdersQuery(riderId);

    if (completedOrders.length === 0) {
      return res.status(404).json({ message: 'No completed orders found for this rider' });
    }

    res.status(200).json({
      success: true,
      orders: completedOrders,
    });
  } catch (error) {
    console.error('Error fetching completed orders:', error);
    res.status(500).json({ error: 'Failed to fetch completed orders' });
  }
};

// In your ordersController.js or similar file
const getUnassignedOrders = async (req, res) => {
  try {
    const orders = await ordersQueries.getUnassignedOrders();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unassigned orders', error });
  }
};


// In your ordersController.js or similar file
const acceptOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const rider_id = req.user.userId; // Assuming rider_id is stored in req.user after authentication

    const updatedOrder = await ordersQueries.acceptOrder(rider_id, order_id);
    
    if (updatedOrder) {
      res.status(200).json(updatedOrder);
    } else {
      res.status(400).json({ message: 'Order already assigned or does not exist' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error accepting order', error });
  }
};



module.exports = {
  createOrder,
  assignRider,
  getOrder,
  getOrdersForRestaurant,
  getOrdersByManager,
  updateOrderStatus,
  deleteOrder,
  listOrdersForCustomer,
  listOrdersForRider,
  updatePaymentStatus,
  getAllOrders,
  getRiderActiveOrders,
  updateOrderStatusRider,
  getCompletedOrders,
  getUnassignedOrders
};
