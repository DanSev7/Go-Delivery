// queries/restaurantQueries.js
const { query } = require('../config/db');

// Create a new restaurant
const createRestaurant = async (name, location, phone_number, image, logo, opening_hours, average_delivery_time, managerId, category) => {
  const result = await query(
    'INSERT INTO Restaurants (name, location, phone_number, image, logo, opening_hours, average_delivery_time, manager_id, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [name, location, phone_number, image, logo, opening_hours, average_delivery_time, managerId, category]
  );
  return result.rows[0];
};

// Get a restaurant by ID
const getRestaurantById = async (id) => {
  const result = await query('SELECT * FROM Restaurants WHERE manager_id = $1', [id]);
  return result.rows[0];
};

// Update restaurant details
const updateRestaurantAdmin = async (id, updates) => {
  const { name, location, phone_number, image, logo, opening_hours, average_delivery_time, category } = updates;
  const result = await query(
    'UPDATE Restaurants SET name = $1, location = $2, phone_number = $3, image = $4, logo = $5, opening_hours = $6, average_delivery_time = $7, category=$8, updated_at = CURRENT_TIMESTAMP WHERE restaurant_id = $9 RETURNING *',
    [name, location, phone_number, image, logo, opening_hours, average_delivery_time, category, id]
  );
  return result.rows[0];
};
// update restaurant details Admin
const updateRestaurant = async (id, updates) => {
  const { name, location, phone_number, image, logo, opening_hours, average_delivery_time, category } = updates;
  const result = await query(
    'UPDATE Restaurants SET name = $1, location = $2, phone_number = $3, image = $4, logo = $5, opening_hours = $6, average_delivery_time = $7, category=$8, updated_at = CURRENT_TIMESTAMP WHERE manager_id = $9 RETURNING *',
    [name, location, phone_number, image, logo, opening_hours, average_delivery_time, category, id]
  );
  return result.rows[0];
};

// Delete a restaurant by ID
const deleteRestaurant = async (id) => {
  const result = await query('DELETE FROM Restaurants WHERE restaurant_id = $1 RETURNING *', [id]);
  return result.rows[0];
};

// List restaurants (can add filtering by manager_id)
const listRestaurants = async (managerId) => {
  if (managerId) {
    const result = await query('SELECT * FROM Restaurants WHERE manager_id = $1', [managerId]);
    return result.rows;
  } else {
    // If no managerId provided, return all restaurants
    const result = await query('SELECT * FROM Restaurants');
    return result.rows;
  }
};


// Query to list all restaurants for admins
const listAllRestaurants = async () => {
  const result = await query('SELECT * FROM Restaurants');
  return result.rows;
};

// Calculate the average rating for a restaurant
const calculateRestaurantRating = async (restaurantId) => {
    const result = await query(`
      SELECT AVG(rating) AS average_rating
      FROM RatingsAndReviews
      WHERE restaurant_id = $1
    `, [restaurantId]);
  
    return result.rows[0].average_rating || 0; // Default to 0 if no ratings
  };
  
  // Update restaurant rating
  const updateRestaurantRating = async (restaurantId) => {
    const averageRating = await calculateRestaurantRating(restaurantId);
  
    const result = await query(`
      UPDATE Restaurants
      SET rating = $1, updated_at = CURRENT_TIMESTAMP
      WHERE restaurant_id = $2
      RETURNING *
    `, [averageRating, restaurantId]);
  
    return result.rows[0];
  };

  const getRestaurantIdByManager = async (managerId) => {
    const result = await query(
      'SELECT restaurant_id FROM Restaurants WHERE manager_id = $1',
      [managerId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Restaurant not found for this manager');
    }
    
    return result.rows[0].restaurant_id;
  };
  

  // Get total orders for a specific restaurant
  const getTotalOrders = async (managerId) => {
    const restaurantId = await getRestaurantIdByManager(managerId);
  
    const result = await query(
      'SELECT COUNT(*) FROM Orders WHERE restaurant_id = $1',
      [restaurantId]
    );
    return parseInt(result.rows[0].count, 10);
  };
  

// Get pending orders for a specific restaurant
const getPendingOrders = async (managerId) => {
  const restaurantId = await getRestaurantIdByManager(managerId);

  const result = await query(
    'SELECT COUNT(*) FROM Orders WHERE order_status = $1 AND restaurant_id = $2',
    ['pending', restaurantId]
  );
  return parseInt(result.rows[0].count, 10);
};


// Get completed orders for a specific restaurant
const getCompletedOrders = async (managerId) => {
  const restaurantId = await getRestaurantIdByManager(managerId);

  const result = await query(
    'SELECT COUNT(*) FROM Orders WHERE order_status = $1 AND restaurant_id = $2',
    ['delivered', restaurantId]
  );
  return parseInt(result.rows[0].count, 10);
};

// Get Cancelled orders for a specific restaurant
const getCancelledOrders = async (managerId) => {
  const restaurantId = await getRestaurantIdByManager(managerId);

  const result = await query(
    'SELECT COUNT(*) FROM Orders WHERE order_status = $1 AND restaurant_id = $2',
    ['cancelled', restaurantId]
  );
  return parseInt(result.rows[0].count, 10);
};


// Get total revenue for a specific restaurant
const getTotalRevenue = async (managerId) => {
  const restaurantId = await getRestaurantIdByManager(managerId);

  const result = await query(
    'SELECT SUM(total_price) FROM Orders WHERE restaurant_id = $1',
    [restaurantId]
  );
  return parseFloat(result.rows[0].sum || 0).toFixed(2); // Default to 0 if no orders found
};


// Get the most popular food items for a specific restaurant (based on order count)
const getPopularFood = async (managerId) => {
  const restaurantId = await getRestaurantIdByManager(managerId);

  const result = await query(`
    SELECT mi.name AS name, COUNT(oi.menu_item_id) AS value
    FROM OrderItems oi
    JOIN MenuItems mi ON oi.menu_item_id = mi.menu_item_id
    WHERE mi.restaurant_id = $1
    GROUP BY mi.name
    ORDER BY value DESC
  `, [restaurantId]);
  return result.rows;
};


// Get the most popular food items for a specific restaurant (based on food rating)
const getPopularFoodByRating = async (managerId) => {
  const restaurantId = await getRestaurantIdByManager(managerId);

  const result = await query(`
    SELECT mi.name AS name, AVG(rr.rating) AS rating, COUNT(oi.menu_item_id) AS value
    FROM OrderItems oi
    JOIN MenuItems mi ON oi.menu_item_id = mi.menu_item_id
    JOIN RatingsAndReviews rr ON mi.menu_item_id = rr.menu_item_id
    WHERE mi.restaurant_id = $1
    GROUP BY mi.name
    HAVING AVG(rr.rating) >= 4
    ORDER BY rating DESC
  `, [restaurantId]);
  return result.rows;
};


// Get orders grouped by month for a specific restaurant (for line chart)
const getOrdersByMonth = async (managerId) => {
  const restaurantId = await getRestaurantIdByManager(managerId);

  const result = await query(`
    SELECT EXTRACT(DAY FROM order_time) AS day, COUNT(*) AS total_orders
    FROM Orders
    WHERE restaurant_id = $1
    GROUP BY day
    ORDER BY day
  `, [restaurantId]);
  return result.rows;
};

// In restaurantQueries.js
const getRestaurantByManager = async (managerId) => {
  const result = await query('SELECT * FROM restaurants WHERE manager_id = $1', [managerId]);
  return result.rows[0]; // Return the first restaurant or undefined
};


  
module.exports = {
  createRestaurant,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  listRestaurants,
  listAllRestaurants,
  updateRestaurantRating,
  getTotalOrders,
  getPendingOrders,
  getCompletedOrders,
  getCancelledOrders,
  getTotalRevenue,
  getPopularFood,
  getOrdersByMonth,
  getPopularFoodByRating,
  getRestaurantByManager,
  updateRestaurantAdmin
};
