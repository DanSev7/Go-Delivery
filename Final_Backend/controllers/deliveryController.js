// controllers/deliveryController.js
const { getAvailableDeliveries } = require('../queries/deliveryQueries');

const fetchAvailableDeliveries = async (req, res) => {
  try {
    const deliveries = await getAvailableDeliveries(); // Call the query
    res.json(deliveries.rows); // Send the result as JSON
  } catch (err) {
    console.error(err.message); // Log any error
    res.status(500).json({ error: 'Server error' }); // Handle server error
  }
};

module.exports = {
  fetchAvailableDeliveries,
};