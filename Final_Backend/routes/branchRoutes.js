// routes/branchRoutes.js
const express = require('express');
const router = express.Router();
const { getBranches } = require('../controllers/branchesController');

// Define the route to fetch branches
router.get('/', getBranches);

module.exports = router;
