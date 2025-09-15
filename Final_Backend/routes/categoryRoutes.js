const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminOnly, checkRole } = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Category routes
router.get('/', checkRole(['admin', 'restaurant_manager', 'customer']), categoryController.getAllCategories);
router.post('/', adminOnly(), categoryController.createCategory);
router.put('/update/:id', adminOnly(), categoryController.updateCategory);
router.delete('/:id', adminOnly(), categoryController.deleteCategory);

module.exports = router;
