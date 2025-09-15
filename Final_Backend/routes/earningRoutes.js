const express = require('express');
const router = express.Router();
const earningsController = require('../controllers/earningController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Route to get earnings (today, week, month)
// router.get('/earnings/:period', authMiddleware, earningsController.getRiderEarnings);

// Route to fetch earnings for a specific rider
router.get('/:riderId', earningsController.getRiderEarnings);

module.exports = router;
