// queries/menuItemQueries.js
const { query } = require('../config/db');

// Create a new menu item
const createMenuItem = async (name, price, restaurantId, description, image, category, availabilityStatus) => {
  const result = await query(
    'INSERT INTO MenuItems (name, price, restaurant_id, description, image, category, availability_status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [name, price, restaurantId, description, image, category, availabilityStatus]
  );
  return result.rows[0];
};

// Get a menu item by ID
const getMenuItemById = async (id) => {
  const result = await query('SELECT * FROM MenuItems WHERE menu_item_id = $1', [id]);
  return result.rows[0];
};

// Update menu item details
const updateMenuItem = async (id, updates) => {
  const { name, price, description, image, category, availabilityStatus } = updates;
  const result = await query(
    'UPDATE MenuItems SET name = $1, price = $2, description = $3, image = $4, category = $5, availability_status = $6, updated_at = CURRENT_TIMESTAMP WHERE menu_item_id = $7 RETURNING *',
    [name, price, description, image, category, availabilityStatus, id]
  );
  return result.rows[0];
};

// Delete a menu item by ID
const deleteMenuItem = async (id) => {
  const result = await query('DELETE FROM MenuItems WHERE menu_item_id = $1 RETURNING *', [id]);
  return result.rows[0];
};

// List menu items by restaurant ID
const listMenuItemsByRestaurant = async (restaurantId) => {
  const result = await query('SELECT * FROM MenuItems WHERE restaurant_id = $1', [restaurantId]);
  return result.rows;
};

// Update the rating for a menu item
const updateMenuItemRating = async (menuItemId, rating) => {
  const result = await query(`
    UPDATE MenuItems
    SET rating = $1, updated_at = CURRENT_TIMESTAMP
    WHERE menu_item_id = $2 RETURNING *
  `, [rating, menuItemId]);

  return result.rows[0];
};
// Get the manager_id for a restaurant by restaurant_id
const getManagerIdByRestaurantId = async (restaurantId) => {
  const result = await query('SELECT manager_id FROM Restaurants WHERE restaurant_id = $1', [restaurantId]);
  console.log("Result on Manager Id : ",  result.rows[0].manager_id)
  return result.rows[0]?.manager_id;
};

module.exports = {
  createMenuItem,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  listMenuItemsByRestaurant,
  updateMenuItemRating,
  getManagerIdByRestaurantId
};
