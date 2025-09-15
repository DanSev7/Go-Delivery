// queries/orderQueries.js
const { query } = require('../config/db');

// Function to get restaurant_id for a manager_id
const getRestaurantIdByManagerId = async (managerId) => {
  const result = await query(
    'SELECT restaurant_id FROM Restaurants WHERE manager_id = $1',
    [managerId]
  );
  return result.rows[0] ? result.rows[0].restaurant_id : null;
};

// Create Order without riderId
const createOrder = async (customerId, restaurantId, totalPrice, orderStatus, paymentStatus, deliveryAddress, deliveryFee) => {
  const result = await query(
    'INSERT INTO Orders (customer_id, restaurant_id, total_price, order_status, payment_status, delivery_address, delivery_fee) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [customerId, restaurantId, totalPrice, orderStatus, paymentStatus, deliveryAddress, deliveryFee]
  );
  return result.rows[0];
};

// Assign riderId after the order has been created
const assignRiderToOrder = async (orderId, riderId) => {
  const result = await query(
    'UPDATE Orders SET rider_id = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2 RETURNING *',
    [riderId, orderId]
  );
  return result.rows[0];
};

// Query to list all restaurants for admins
const listAllOrders = async () => {
  const result = await query('SELECT * FROM orders');
  return result.rows;
};

// Get an order by ID
const getOrderById = async (orderId) => {
  const result = await query('SELECT * FROM Orders WHERE order_id = $1', [orderId]);
  return result.rows[0];
};

// Update an order's status
const updateOrderStatus = async (orderId, orderStatus) => {
  const result = await query(
    'UPDATE Orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2 RETURNING *',
    [orderStatus, orderId]
  );
  return result.rows[0];
};

// Update payment status
const updatePaymentStatus = async (orderId, paymentStatus) => {
  const result = await query(
    'UPDATE Orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2 RETURNING *',
    [paymentStatus, orderId]
  );
  return result.rows[0];
};

// List all orders for a customer
const listOrdersForCustomer = async (customerId) => {
  const result = await query('SELECT * FROM Orders WHERE customer_id = $1', [customerId]);
  return result.rows;
};

// List all orders for a rider
const listOrdersForRider = async (riderId) => {
  const result = await query('SELECT * FROM Orders WHERE rider_id = $1', [riderId]);
  return result.rows;
};

// Fetch all orders
const getAllOrders = async () => {
  const sql = `
    SELECT 
      orders.*,
      riders.rider_id
    FROM orders
    LEFT JOIN riders ON orders.rider_id = riders.rider_id
  `; // Left join to include rider info if assigned
  const result = await query(sql);
  return result.rows;
};

// Get orders by restaurant ID
const getOrdersByRestaurant = async (restaurantId) => {
  const result = await query('SELECT * FROM Orders WHERE restaurant_id = $1', [restaurantId]);
  return result.rows;
};

// Delete an order by ID
const deleteOrder = async (orderId) => {
  const result = await query('DELETE FROM Orders WHERE order_id = $1 RETURNING *', [orderId]);
  return result.rows[0];
};

// Get orders by manager_id
const getOrdersByManagerId = async (managerId) => {
  const restaurantId = await getRestaurantIdByManagerId(managerId);
  if (!restaurantId) {
    throw new Error('No restaurant found for this manager');
  }
  return getOrdersByRestaurant(restaurantId);
};

// Query to get the Rider's active orders
const getRiderActiveOrdersQuery = async (riderId) => {
  try {
    const result = await query(
      `SELECT order_id, total_price, delivery_address, order_status, delivery_time
       FROM Orders 
       WHERE rider_id = $1 AND order_status IN ('on_the_way', 'pending', 'delivered')`,
      [riderId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching active orders:', error);
    throw error;
  }
};

// Query to update the order status for the rider
const updateOrderStatusQuery = async (orderId, riderId, newStatus) => {
  try {
    const result = await query(
      `UPDATE Orders 
       SET order_status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $2 AND rider_id = $3 AND order_status != 'delivered'`,
      [newStatus, orderId, riderId]
    );
    return result;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Query to get the completed orders for the rider
const getCompletedOrdersQuery = async (riderId) => {
  try {
    const result = await query(
      `SELECT order_id, customer_id, restaurant_id, total_price, delivery_address, order_status, order_time, delivery_time
       FROM Orders
       WHERE rider_id = $1 AND order_status = 'delivered'
       ORDER BY delivery_time DESC`,
      [riderId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching completed orders:', error);
    throw error;
  }
};

// Get available orders
const getAvailableOrders = async (req, res) => {
  try {
    const orders = await riderQueries.getAvailableOrders();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching available orders:', error);
    res.status(500).json({ message: 'Error fetching available orders', error });
  }
};

// Accept an order
const acceptOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const rider_id = req.user.userId; // Assuming rider_id is stored in req.user after authentication

    const order = await riderQueries.acceptOrder(order_id, rider_id);
    if (order) {
      res.status(200).json(order);
    } else {
      res.status(404).json({ message: 'Order not found or already accepted' });
    }
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ message: 'Error accepting order', error });
  }
};




module.exports = {
  createOrder,
  assignRiderToOrder,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  listOrdersForCustomer,
  listOrdersForRider,
  getAllOrders,
  getOrdersByRestaurant,
  deleteOrder,
  getOrdersByManagerId,
  listAllOrders,
  getRiderActiveOrdersQuery,
  updateOrderStatusQuery,
  getCompletedOrdersQuery,
  getAvailableOrders,
  acceptOrder
};
