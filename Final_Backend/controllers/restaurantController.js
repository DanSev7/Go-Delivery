const restaurantQueries = require('../queries/restaurantQueries');

const createRestaurant = async (req, res) => {
  try {
    const { name, location, phone_number, image, logo, opening_hours, average_delivery_time, category } = req.body;
    const managerId = req.user.userId; // Manager ID from the authenticated user
    console.log("Manager Id : ", managerId);

    // Check if the user has the role of restaurant_manager
    // if (req.user.role !== 'restaurant_manager') {
    //   return res.status(403).json({ message: 'Access denied. User is not a restaurant manager.' });
    // }

    const newRestaurant = await restaurantQueries.createRestaurant(
      name,
      location,
      phone_number,
      image,
      logo,
      opening_hours,
      average_delivery_time,
      managerId,
      category
    );

    res.status(201).json(newRestaurant);
  } catch (error) {
    console.log("Error : ", error.message);
    res.status(500).json({ message: 'Error creating restaurant', error });
  }
};

const getRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    console.log("Restaurant Id on get Restaurant : ", restaurantId);
    const restaurant = await restaurantQueries.getRestaurantById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    console.log("Error : ", error.message);
    res.status(500).json({ message: 'Error fetching restaurant', error });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const role = req.user.role;
    console.log("Restaurant Id : ", restaurantId);
    const updates = req.body;
    console.log("Updates Field : ", updates);
    let updatedRestaurant;
    // console.log("Updates : ", updates);
    if(role === 'admin'){
      updatedRestaurant = await restaurantQueries.updateRestaurantAdmin(restaurantId, updates);
    } else if (role === 'restaurant_manager') {
      updatedRestaurant = await restaurantQueries.updateRestaurant(restaurantId, updates);
    }
    if (!updatedRestaurant) {
      console.log("Restaurant Not found")
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(updatedRestaurant);
  } catch (error) {
    console.log("Errror updating restaurant : ", error.message);
    res.status(500).json({ message: 'Error updating restaurant', error });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const deletedRestaurant = await restaurantQueries.deleteRestaurant(restaurantId);
    if (!deletedRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting restaurant', error });
  }
};

// Updated to fetch all restaurants for admin
const listRestaurants = async (req, res) => {
  try {
    const role = req.user.role;
    console.log("Role : ", role);
    let restaurants;

    if (role === 'admin') {
      // Fetch all restaurants if the user is an admin
      restaurants = await restaurantQueries.listAllRestaurants();
    } else if (role === 'restaurant_manager') {
      // Fetch only the manager's restaurants if the user is a restaurant manager
      const managerId = req.user.userId;
      console.log("Manager Id: ", managerId);
      restaurants = await restaurantQueries.listAllRestaurants(managerId);
    } else if ( role === 'customer') {
      restaurants = await restaurantQueries.listAllRestaurants();
      // console.log("Restaurants : ", restaurants);
    } else{
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json(restaurants);
  } catch (error) {
    console.log("Error listing restaurants: ", error.message);
    res.status(500).json({ message: 'Error fetching restaurants', error });
  }
};

// Update restaurant rating after a review is added
const addReview = async (req, res) => {
  try {
    const { restaurantId, menuItemId, deliveryPersonId, rating, review } = req.body;
    const userId = req.user.userId;

    // Add review to RatingsAndReviews
    const result = await query(
      'INSERT INTO RatingsAndReviews (user_id, restaurant_id, menu_item_id, delivery_person_id, rating, review) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, restaurantId, menuItemId, deliveryPersonId, rating, review]
    );

    // Update restaurant rating
    await restaurantQueries.updateRestaurantRating(restaurantId);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error });
  }
};



// Fetch dashboard data for a specific restaurant
const getRestaurantDashboard = async (req, res) => {
  try {
    const managerId = req.user.userId; // Assuming the manager is authenticated
    console.log("ManagerId on the dashboard side: ", managerId);

    // Check if the manager has a restaurant
    const restaurant = await restaurantQueries.getRestaurantByManager(managerId);

    if (!restaurant) {
      return res.status(200).json({
        isNewManager: true,  // Flag to indicate a new manager without a restaurant
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        popularFood: [],
        ordersByMonth: []
      });
    }

    // Fetch restaurant dashboard statistics if the restaurant exists
    const totalOrders = await restaurantQueries.getTotalOrders(managerId);
    const pendingOrders = await restaurantQueries.getPendingOrders(managerId);
    const completedOrders = await restaurantQueries.getCompletedOrders(managerId);
    const cancelledOrders = await restaurantQueries.getCancelledOrders(managerId);
    const totalRevenue = parseFloat(await restaurantQueries.getTotalRevenue(managerId)) || 0;
    const popularFood = await restaurantQueries.getPopularFoodByRating(managerId);
    const ordersByMonth = await restaurantQueries.getOrdersByMonth(managerId);

    return res.status(200).json({
      isNewManager: false,  // Manager has a restaurant, load the dashboard normally
      restaurant,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      popularFood,
      ordersByMonth
    });
  } catch (error) {
    console.error("Error fetching restaurant dashboard data: ", error);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};


module.exports = {
  createRestaurant,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  listRestaurants,
  addReview,
  getRestaurantDashboard
};
