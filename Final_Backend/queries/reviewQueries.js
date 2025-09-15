const { query } = require('../config/db');

// Check if Menu Item exists
const checkMenuItemExists = async (menu_item_id) => {
  const result = await query('SELECT 1 FROM MenuItems WHERE menu_item_id = $1', [menu_item_id]);
  console.log("Successfully exists");

  return result.rowCount > 0;
};

// Check if Rider exists
const checkRiderExists = async (rider_id) => {
  const result = await query('SELECT 1 FROM Users WHERE user_id = $1 AND role = $2', [rider_id, 'rider']);
  console.log("Result : ", result.rows)
  console.log("Successfully exists");

  return result.rowCount > 0;
};

// Check if Restaurant exists
const checkRestaurantExists = async (restaurant_id) => {
  const result = await query('SELECT 1 FROM Restaurants WHERE restaurant_id = $1', [restaurant_id]);
  console.log("Successfully exists");

  return result.rowCount > 0;
};

// Check if Customer exists
const checkCustomerExists = async (customer_id) => {
  const result = await query('SELECT 1 FROM Users WHERE user_id = $1 AND role = $2', [customer_id, 'customer']);
  console.log("Successfully exists");
  return result.rowCount > 0;
};

// Create a new review
const createReview = async (menu_item_id, customer_id, rider_id, restaurant_id, rating, review_text) => {
  const result = await query(
    `INSERT INTO RatingsAndReviews (menu_item_id, customer_id, rider_id, restaurant_id, rating, review_text, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
     RETURNING *`,
    [menu_item_id, customer_id, rider_id, restaurant_id, rating, review_text]
  );
  return result.rows[0];
};

// Get reviews for a specific menu item, rider, or restaurant
const getReviews = async (menu_item_id, rider_id, restaurant_id) => {
  let queryText = 'SELECT * FROM RatingsAndReviews WHERE 1=1';
  const queryParams = [];

  if (menu_item_id) {
    queryText += ' AND menu_item_id = $1';
    queryParams.push(menu_item_id);
  }
  if (rider_id) {
    queryText += ' AND rider_id = $2';
    queryParams.push(rider_id);
  }
  if (restaurant_id) {
    queryText += ' AND restaurant_id = $3';
    queryParams.push(restaurant_id);
  }

  const result = await query(queryText, queryParams);
  return result.rows;
};

// Update a review
const updateReview = async (review_id, rating, review_text) => {
  const result = await query(
    `UPDATE RatingsAndReviews SET rating = $1, review_text = $2, updated_at = CURRENT_TIMESTAMP 
     WHERE review_id = $3 RETURNING *`,
    [rating, review_text, review_id]
  );
  return result.rows[0];
};

// Delete a review
const deleteReview = async (review_id) => {
  await query('DELETE FROM RatingsAndReviews WHERE review_id = $1', [review_id]);
};

const getAggregateRestaurantRating = async (restaurant_id) => {
  const result = await query(`
    SELECT AVG(rating) AS average_rating, COUNT(*) AS total_reviews
    FROM RatingsAndReviews
    WHERE restaurant_id = $1
  `, [restaurant_id]);
  return result.rows[0];
};

const getAggregateMenuItemRating = async (menu_item_id) => {
  const result = await query(`
    SELECT AVG(rating) AS average_rating, COUNT(*) AS total_reviews
    FROM RatingsAndReviews
    WHERE menu_item_id = $1
  `, [menu_item_id]);
  return result.rows[0];
};

const getAggregateRiderRating = async (rider_id) => {
  const result = await query(`
    SELECT AVG(rating) AS average_rating, COUNT(*) AS total_reviews
    FROM RatingsAndReviews
    WHERE rider_id = $1
  `, [rider_id]);
  return result.rows[0];
};

// Function to check if a review exists for a specific item by a customer
const checkReviewStatus = async (customer_id, menu_item_id) => {
  try {
    const result = await query(`
      SELECT 1 FROM RatingsAndReviews 
      WHERE customer_id = $1 AND menu_item_id = $2;
    `, [customer_id, menu_item_id]);
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error checking review status:', error);
    throw new Error('Database query failed');
  }
};


module.exports = {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  checkMenuItemExists,
  checkRiderExists,
  checkRestaurantExists,
  checkCustomerExists,
  getAggregateMenuItemRating,
  getAggregateRestaurantRating,
  getAggregateRiderRating,
  checkReviewStatus
};
