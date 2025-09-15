// // controllers/orderItemController.js
// const orderItemQueries = require('../queries/orderItemQueries');

// const createOrderItem = async (req, res) => {
//   try {
//     const { quantity, price } = req.body;
//     const orderId = req.params.orderId; // From params
//     console.log("Order Id : ", orderId);
//     const menuItemId = req.params.menuItemId; // From params

//     const newOrderItem = await orderItemQueries.createOrderItem(orderId, menuItemId, quantity, price);
//     res.status(201).json(newOrderItem);
//   } catch (error) {
//     console.log("Error creating Order Item : ", error.message);
//     res.status(500).json({ message: 'Error creating order item', error });
//   }
// };

// const getOrderItemsWithImage = async (req, res) => {
//   try {
//     const orderId = req.params.orderId;

//     const orderItems = await orderItemQueries.getOrderItemsByOrderId(orderId);
//     res.status(200).json(orderItems);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching order items', error });
//   }
// };

// module.exports = { createOrderItem, getOrderItemsWithImage };
const orderItemQueries = require('../queries/orderItemQueries');

// Create a new order item
const createOrderItem = async (req, res) => {
  try {
    const { quantity, price } = req.body;
    const { orderId, menuItemId } = req.params;

    const newOrderItem = await orderItemQueries.createOrderItem(orderId, menuItemId, quantity, price);
    res.status(201).json(newOrderItem);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order item', error });
  }
};

// Get all order items with food image for a specific order
const getOrderItemsWithImage = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderItems = await orderItemQueries.getOrderItemsWithImage(orderId);
    res.status(200).json(orderItems);
  } catch (error) {
    console.log("Error : ", error.message);
    res.status(500).json({ message: 'Error fetching order items', error });
  }
};

const getOrderItemsForCustomer = async (req, res) => {
  try {
        const {customerId} = req.params;
        const orderItems = await orderItemQueries.getOrderItemsForCustomer(customerId);
        console.log("Order Items price : ", orderItems);
        res.status(200).json(orderItems);
  } catch (error) {
    res.status(500).json({message : 'Error fetching customers order items : ', error});
  }
}

// Update an order item (quantity, price)
const updateOrderItem = async (req, res) => {
  try {
    const { quantity, price } = req.body;
    const orderItemId = req.params.orderItemId;

    const updatedOrderItem = await orderItemQueries.updateOrderItem(orderItemId, quantity, price);
    res.status(200).json(updatedOrderItem);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order item', error });
  }
};

// Delete an order item
const deleteOrderItem = async (req, res) => {
  try {
    const orderItemId = req.params.orderItemId;

    await orderItemQueries.deleteOrderItem(orderItemId);
    res.status(204).json({ message: 'Order item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order item', error });
  }
};

// Get all order items for a specific customer
const getAllOrderItemsForCustomer = async (req, res) => {
  try {
    const customerId = req.user.userId;
    console.log("Customer Id : ", customerId)

    const orderItems = await orderItemQueries.getOrderItemsForCustomer(customerId);
    res.status(200).json(orderItems);
  } catch (error) {
    console.log("Error getting order items for customer : ", error.message);    
    res.status(500).json({ message: 'Error fetching customer order items', error });
  }
};


// Get all order items for a specific restaurant
const getOrderItemsForRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    const orderItems = await orderItemQueries.getOrderItemsForRestaurant(restaurantId);
    res.status(200).json(orderItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurant order items', error });
  }
};

module.exports = {
  createOrderItem,
  getOrderItemsWithImage,
  updateOrderItem,
  deleteOrderItem,
  getAllOrderItemsForCustomer,
  getOrderItemsForRestaurant,
  getOrderItemsForCustomer,
};
