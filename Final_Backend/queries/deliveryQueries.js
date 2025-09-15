const { query } = require('../config/db');

const getAvailableDeliveries = async () => {
    const result = await query ( `
      SELECT 
    o.order_id AS "orderId", 
    o.delivery_address AS "destination", 
    o.total_price AS "totalPrice", 
    u.name AS "customerName", 
    u.phone_number AS "customerPhone" 
    FROM orders o 
    JOIN users u ON o.customer_id = u.user_id 
    WHERE o.order_status = 'pending';

    `);
  
    return result.rows; // Execute the query and return the result
  };

  module.exports = {
    getAvailableDeliveries
  }