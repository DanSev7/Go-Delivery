const ratingsAndReviewsQueries = require('../queries/reviewQueries');

// Validate existence of IDs
const validateForeignKeys = async (menu_item_id, rider_id, restaurant_id, customer_id) => {
   try {
    const results = await Promise.all([
      menu_item_id ? ratingsAndReviewsQueries.checkMenuItemExists(menu_item_id) : Promise.resolve(true),
      rider_id ? ratingsAndReviewsQueries.checkRiderExists(rider_id) : Promise.resolve(true),
      restaurant_id ? ratingsAndReviewsQueries.checkRestaurantExists(restaurant_id) : Promise.resolve(true),
      ratingsAndReviewsQueries.checkCustomerExists(customer_id)
    ]);

    console.log('Validation results:', results); // Add this line to debug

    return results.every(result => result === true);
  } catch (error) {
    console.error('Error validating foreign keys:', error); // Add this line to debug
    throw error;
  }
};

// Add a review
const addReview = async (req, res) => {
  try {
    const { menu_item_id, rider_id, restaurant_id, rating, feedback } = req.body;
    const customer_id = req.user.userId;

    // Validate foreign keys
    const isValid = await validateForeignKeys(menu_item_id, rider_id, restaurant_id, customer_id);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid references. Check your IDs.' });
    }

    const review = await ratingsAndReviewsQueries.createReview(
      menu_item_id, customer_id, rider_id, restaurant_id, rating, feedback
    );
    res.status(201).json(review);
  } catch (error) {
    console.log("Error adding reviews : ", error.message);
    res.status(500).json({ message: 'Error adding review', error });
  }
};

// Get reviews for a specific menu item, rider, or restaurant
const getReviews = async (req, res) => {
  try {
    const { menu_item_id, rider_id, restaurant_id } = req.query;

    const reviews = await ratingsAndReviewsQueries.getReviews(menu_item_id, rider_id, restaurant_id);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const review_id = req.params.reviewId;
    const { rating, review_text } = req.body;

    const updatedReview = await ratingsAndReviewsQueries.updateReview(review_id, rating, review_text);
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const review_id = req.params.reviewId;

    await ratingsAndReviewsQueries.deleteReview(review_id);
    res.status(204).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error });
  }
};
// Get aggregate rating for restaurant
const getRestaurantRating = async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const ratingData = await ratingsAndReviewsQueries.getAggregateRestaurantRating(restaurant_id);
    res.status(200).json(ratingData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurant rating', error });
  }
};

// Get aggregate rating for menu item
const getMenuItemRating = async (req, res) => {
  try {
    const { menu_item_id } = req.params;
    const ratingData = await ratingsAndReviewsQueries.getAggregateMenuItemRating(menu_item_id);
    res.status(200).json(ratingData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu item rating', error });
  }
};

// Get aggregate rating for rider
const getRiderRating = async (req, res) => {
  try {
    const { rider_id } = req.params;
    const ratingData = await ratingsAndReviewsQueries.getAggregateRiderRating(rider_id);
    res.status(200).json(ratingData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rider rating', error });
  }
};

// Function to check if a review exists for a specific item by a customer
const checkReviewStatus = async (req, res) => {
  try {
    const customer_id = req.user.userId; // Assuming customer_id is stored in req.user after authentication
    const { menu_item_id } = req.params;

    const reviewSubmitted = await ratingsAndReviewsQueries.checkReviewStatus(customer_id, menu_item_id);
    
    return res.status(200).json({ reviewSubmitted });
  } catch (error) {
    console.error('Error checking review status:', error);
    return res.status(500).json({ error: 'An error occurred while checking review status.' });
  }
};



module.exports = {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
  getRestaurantRating,
  getMenuItemRating,
  getRiderRating,
  checkReviewStatus 
};
