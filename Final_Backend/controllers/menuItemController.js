// controllers/menuItemController.js
const menuItemQueries = require('../queries/menuItemQueries');

// Create a new menu item
const createMenuItem = async (req, res) => {
  try {
    const { name, price, description, image, category, availabilityStatus } = req.body;
    const restaurantId = req.params.restaurantId;
    console.log("Restaurant Id on creating menuitems : ", restaurantId)

    // Fetch manager_id for the given restaurantId
    const managerId = await menuItemQueries.getManagerIdByRestaurantId(restaurantId);

    // Check if the logged-in user is the manager
    if (managerId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to create menu item for this restaurant' });
    }

    const newMenuItem = await menuItemQueries.createMenuItem(
      name,
      price,
      restaurantId,
      description,
      image,
      category,
      availabilityStatus
    );

    res.status(201).json(newMenuItem);
  } catch (error) {
    console.log("Error: ", error.message);  
    res.status(500).json({ message: 'Error creating menu item', error });
  }
};


// Get a menu item by ID
const getMenuItem = async (req, res) => {
  try {
    const menuItemId = req.params.id;
    console.log("Menu Item Id :", menuItemId);
    const menuItem = await menuItemQueries.getMenuItemById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu item', error });
  }
};

// Update menu item details
const updateMenuItem = async (req, res) => {
  try {
    const menuItemId = req.params.id;
    console.log("MenuItemId :", menuItemId);
    const updates = req.body;
    console.log("Updated Image : ", updates.image);
    const updatedMenuItem = await menuItemQueries.updateMenuItem(menuItemId, updates);
    if (!updatedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(updatedMenuItem);
  } catch (error) {
    console.log("Error on update menuItems : ", error.message);
    res.status(500).json({ message: 'Error updating menu item', error });
  }
};

// Delete a menu item by ID
const deleteMenuItem = async (req, res) => {
  try {
    const menuItemId = req.params.id;
    console.log("MenuItem Id when trying to delete the menu Item : ", menuItemId);

    // Get the restaurantId from the menu item
    const menuItem = await menuItemQueries.getMenuItemById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const restaurantId = menuItem.restaurant_id;

    // Fetch manager_id for the restaurantId
    const managerId = await menuItemQueries.getManagerIdByRestaurantId(restaurantId);

    // Check if the logged-in user is the manager
    if (managerId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete menu item for this restaurant' });
    }

    const deletedMenuItem = await menuItemQueries.deleteMenuItem(menuItemId);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting menu item', error });
  }
};


// List menu items by restaurant ID
const listMenuItemsByRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    // Fetch manager_id for the restaurantId
    const managerId = await menuItemQueries.getManagerIdByRestaurantId(restaurantId);

    // Check if the logged-in user is the manager
    if (managerId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to view menu items for this restaurant' });
    }

    const menuItems = await menuItemQueries.listMenuItemsByRestaurant(restaurantId);
    res.json(menuItems);
  } catch (error) {
    console.log("Error when trying to retrieve menu items by restaurant Id: ", error.message);
    res.status(500).json({ message: 'Error fetching menu items', error });
  }
};

// List menu items by restaurant ID
const listMenuItemsByRestaurantCustomer = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId; // Get restaurant ID from URL parameter
    const menuItems = await menuItemQueries.listMenuItemsByRestaurant(restaurantId);
    res.json(menuItems);
  } catch (error) {
    console.log("Error when trying to retrieve menu items by restaurant Id : ", error.message);
    res.status(500).json({ message: 'Error fetching menu items', error });
  }
};


// Update the rating for a menu item
const rateMenuItem = async (req, res) => {
  try {
    const menuItemId = req.params.id;
    console.log("MenuItemId is : ", menuItemId);
    const { rating } = req.body;
    console.log("Menu Item Id : ", menuItemId, "rating : "+ rating);

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const updatedMenuItem = await menuItemQueries.updateMenuItemRating(menuItemId, rating);
    if (!updatedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(updatedMenuItem);
  } catch (error) {
    console.log("Error when updating menu item rating : ", error.message);
    res.status(500).json({ message: 'Error updating menu item rating', error });
  }
};

module.exports = {
  createMenuItem,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  listMenuItemsByRestaurant,
  rateMenuItem,
  listMenuItemsByRestaurantCustomer
};
