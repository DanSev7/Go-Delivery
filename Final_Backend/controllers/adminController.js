const {query} = require('../config/db'); // Import your database connection

// Function to get total orders
const getTotalOrders = async () => {
  const result = await query('SELECT COUNT(*) AS count FROM Orders');
  return parseInt(result.rows[0].count, 10);
};

// Function to get total users
const getTotalUsers = async () => {
  const result = await query('SELECT COUNT(*) AS count FROM Users');
  return parseInt(result.rows[0].count, 10);
};

// Function to get total restaurants
const getTotalRestaurants = async () => {
  const result = await query('SELECT COUNT(*) AS count FROM Restaurants');
  return parseInt(result.rows[0].count, 10);
};

// Function to get total categories
const getTotalCategories = async () => {
  const result = await query('SELECT COUNT(*) AS count FROM Categories');
  return parseInt(result.rows[0].count, 10);
};

// Controller function to handle the request
const getStats = async (req, res) => {
  try {
    const totalOrders = await getTotalOrders();
    const totalUsers = await getTotalUsers();
    const totalRestaurants = await getTotalRestaurants();
    const totalCategories = await getTotalCategories();

    res.json({
      totalOrders,
      totalUsers,
      totalRestaurants,
      totalCategories,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

module.exports = {
  getStats,
};
