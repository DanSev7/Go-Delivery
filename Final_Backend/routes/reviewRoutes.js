const express = require('express');
const ratingsAndReviewsController = require('../controllers/reviewController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Add a review
router.post('/', authMiddleware, ratingsAndReviewsController.addReview);

// Update a review
router.put('/:reviewId', authMiddleware, ratingsAndReviewsController.updateReview);

// Delete a review
router.delete('/:reviewId', authMiddleware, ratingsAndReviewsController.deleteReview);

// Get aggregate rating for restaurant
router.get('/restaurant/:restaurant_id/rating', authMiddleware, ratingsAndReviewsController.getRestaurantRating);

// Get aggregate rating for menu item
router.get('/menu_item/:menu_item_id/rating', authMiddleware, ratingsAndReviewsController.getMenuItemRating);

// Get aggregate rating for rider
router.get('/rider/:rider_id/rating', authMiddleware, ratingsAndReviewsController.getRiderRating);

// Route to check if a review exists for a specific menu item
router.get('/status/:menu_item_id', authMiddleware, ratingsAndReviewsController.checkReviewStatus);

// Get reviews for a specific menu item, rider, or restaurant
router.get('/', authMiddleware, ratingsAndReviewsController.getReviews);


module.exports = router;
