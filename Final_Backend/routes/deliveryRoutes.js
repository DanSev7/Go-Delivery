// routes/deliveryRoutes.js
const express = require('express');
const router = express.Router();
const { fetchAvailableDeliveries } = require('../controllers/deliveryController');

// Define the GET route to fetch available deliveries
router.get('/', fetchAvailableDeliveries);

module.exports = router;
