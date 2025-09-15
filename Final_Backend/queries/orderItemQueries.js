
const { query } = require('../config/db');

// Create a new order item
const createOrderItem = async (orderId, menuItemId, quantity, price) => {
  const result = await query(
    'INSERT INTO OrderItems (order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
    [orderId, menuItemId, quantity, price]
  );
  return result.rows[0];
};

// Get all order items with food image for a specific order
const getOrderItemsWithImage = async (orderId) => {
  const result = await query(
    `SELECT oi.order_item_id, oi.quantity, r.restaurant_id, oi.price, mi.name,mi.menu_item_id, mi.image
     FROM OrderItems oi
      JOIN Orders o ON oi.order_id = o.order_id
     JOIN MenuItems mi ON oi.menu_item_id = mi.menu_item_id
    JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
     WHERE oi.order_id = $1`,
    [orderId]
  );
  return result.rows;
};

// Update an order item (quantity, price)
const updateOrderItem = async (orderItemId, quantity, price) => {
  const result = await query(
    'UPDATE OrderItems SET quantity = $1, price = $2, updated_at = CURRENT_TIMESTAMP WHERE order_item_id = $3 RETURNING *',
    [quantity, price, orderItemId]
  );
  return result.rows[0];
};

// Delete an order item
const deleteOrderItem = async (orderItemId) => {
  await query('DELETE FROM OrderItems WHERE order_item_id = $1', [orderItemId]);
};

// Get all order items for a specific customer
const getOrderItemsForCustomer = async (customerId) => {
  const result = await query(
    `SELECT 
  oi.order_item_id, oi.quantity, oi.price, oi.created_at, o.order_status, mi.name, mi.image,o.order_id, o.order_status, o.payment_status, 
  o.customer_id, r.image AS restaurant_image, r.name AS restaurant_name, SUM(oi.quantity) OVER (PARTITION BY o.order_id) AS total_quantity
  FROM OrderItems oi
    JOIN MenuItems mi ON oi.menu_item_id = mi.menu_item_id
    JOIN Orders o ON oi.order_id = o.order_id
    JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
      WHERE o.customer_id = $1
`,
    [customerId]
  );
  return result.rows;
};




// Get all order items for a specific restaurant
const getOrderItemsForRestaurant = async (restaurantId) => {
  const result = await query(
    `SELECT oi.order_item_id, oi.quantity, oi.price, mi.name, mi.image, o.total_price, o.order_status
     FROM OrderItems oi
     JOIN Orders o ON oi.order_id = o.order_id
     JOIN MenuItems mi ON oi.menu_item_id = mi.menu_item_id
     WHERE o.restaurant_id = $1`,
    [restaurantId]
  );
  return result.rows;
};

module.exports = {
  createOrderItem,
  getOrderItemsWithImage,
  updateOrderItem,
  deleteOrderItem,
  getOrderItemsForCustomer,
  getOrderItemsForRestaurant,
};
