const riderQueries = require('../queries/riderQueries');
const userQueries = require('../queries/userQueries');
const { query } = require('../config/db');
const {
  validateVehicleType,
  validateRiderStatus,
  validateAddress,
  ValidationError,
  RIDER_STATUS,
  VEHICLE_TYPES
} = require('../utils/validation');

// Professional validation middleware
const validateRiderData = (req, res, next) => {
  try {
    const { vehicle_type, status = RIDER_STATUS[0], location } = req.body;
    const validatedData = {};

    // Validate vehicle type
    validatedData.vehicle_type = validateVehicleType(vehicle_type);

    // Validate status (optional, defaults to 'available')
    if (status) {
      validatedData.status = validateRiderStatus(status);
    } else {
      validatedData.status = 'available';
    }

    // Validate location
    validatedData.location = validateAddress(location, 'location');

    // Attach validated data to request
    req.validatedData = validatedData;
    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        field: error.field,
        code: error.code
      });
    }
    next(error);
  }
};

// Create or register a new rider (Professional SaaS approach)
const registerRider = async (req, res) => {
  try {
    const { vehicle_type, status, location } = req.validatedData || req.body;
    const riderId = req.user.userId;

    // Check if user exists and has the correct role
    const user = await userQueries.getUserById(riderId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.role !== 'rider') {
      return res.status(403).json({
        success: false,
        message: 'User must have rider role to register as rider',
        code: 'INVALID_ROLE',
        details: `Current role: ${user.role}, required: rider`
      });
    }

    // Check if rider already exists
    const existingRider = await riderQueries.getRiderById(riderId);
    if (existingRider) {
      return res.status(409).json({
        success: false,
        message: 'Rider already registered',
        code: 'RIDER_EXISTS',
        data: existingRider
      });
    }

    // Create rider with validated data
    const newRider = await riderQueries.createRider(
      riderId, 
      vehicle_type, 
      status || 'available', 
      location
    );

    res.status(201).json({
      success: true,
      message: 'Rider registered successfully',
      data: {
        ...newRider,
        rider_name: user.name,
        rider_email: user.email,
        rider_phone: user.phone_number
      },
      code: 'RIDER_CREATED'
    });
  } catch (error) {
    console.error('Error creating rider:', error.message);
    
    // Handle database constraint errors professionally
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Rider already exists',
        code: 'DUPLICATE_RIDER'
      });
    }
    
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user reference',
        code: 'INVALID_USER_ID'
      });
    }

    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be one of: available, busy, offline',
        code: 'INVALID_STATUS'
      });
    }

    // Pass to error handler
    next(error);
  }
};

// Get rider details by rider ID (Professional SaaS approach)
const getRiderById = async (req, res) => {
  try {
    const riderId = parseInt(req.params.riderId);
    
    if (isNaN(riderId) || riderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rider ID format',
        code: 'INVALID_RIDER_ID'
      });
    }

    const rider = await riderQueries.getRiderById(riderId);
    
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found',
        code: 'RIDER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rider retrieved successfully',
      data: rider,
      code: 'RIDER_FOUND'
    });
  } catch (error) {
    console.error('Error fetching rider:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching rider',
      code: 'SERVER_ERROR'
    });
  }
};

// Update rider's status (Professional SaaS approach)
const updateRiderStatus = async (req, res) => {
  try {
    const riderId = parseInt(req.params.riderId);
    const { status, current_orders = 0 } = req.body;

    // Validation
    if (isNaN(riderId) || riderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rider ID format',
        code: 'INVALID_RIDER_ID'
      });
    }

    if (!status || !Object.values(RIDER_STATUS).includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${Object.values(RIDER_STATUS).join(', ')}`,
        code: 'INVALID_STATUS'
      });
    }

    if (isNaN(current_orders) || current_orders < 0) {
      return res.status(400).json({
        success: false,
        message: 'Current orders must be a non-negative number',
        code: 'INVALID_CURRENT_ORDERS'
      });
    }

    // Check if rider exists
    const existingRider = await riderQueries.getRiderById(riderId);
    if (!existingRider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found',
        code: 'RIDER_NOT_FOUND'
      });
    }

    const updatedRider = await riderQueries.updateRiderStatus(riderId, status.toLowerCase(), current_orders);
    
    res.status(200).json({
      success: true,
      message: 'Rider status updated successfully',
      data: updatedRider,
      code: 'STATUS_UPDATED'
    });
  } catch (error) {
    console.error('Error updating rider status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating rider status',
      code: 'SERVER_ERROR'
    });
  }
};

// Get all available riders (Professional SaaS approach)
const getAvailableRiders = async (req, res) => {
  try {
    const riders = await riderQueries.getAvailableRiders();
    
    res.status(200).json({
      success: true,
      message: `Found ${riders.length} available riders`,
      data: riders,
      count: riders.length,
      code: 'RIDERS_FOUND'
    });
  } catch (error) {
    console.error('Error fetching available riders:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching available riders',
      code: 'SERVER_ERROR'
    });
  }
};

// Delete rider (Professional SaaS approach)
const deleteRider = async (req, res) => {
  try {
    const riderId = parseInt(req.params.riderId);
    
    if (isNaN(riderId) || riderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rider ID format',
        code: 'INVALID_RIDER_ID'
      });
    }

    // Check if rider exists
    const existingRider = await riderQueries.getRiderById(riderId);
    if (!existingRider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found',
        code: 'RIDER_NOT_FOUND'
      });
    }

    await riderQueries.deleteRider(riderId);
    
    res.status(200).json({
      success: true,
      message: 'Rider deleted successfully',
      code: 'RIDER_DELETED'
    });
  } catch (error) {
    console.error('Error deleting rider:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting rider',
      code: 'SERVER_ERROR'
    });
  }
};

// 
// Get Rider's Current Location
const getRiderLocation = async (req, res) => {
  const riderId = req.user.user_id; // Assuming the rider is authenticated and the user_id is in the token

  try {
    const riderLocation = await riderQueries.getRiderLocationQuery(riderId);

    if (!riderLocation) {
      return res.status(404).json({ error: 'Rider location not found' });
    }

    res.status(200).json({
      success: true,
      location: riderLocation.location,  // Responding with the rider's current location
      status: riderLocation.status,      // Responding with rider status (available, on_delivery, etc.)
    });
  } catch (error) {
    console.error('Error fetching rider location:', error);
    res.status(500).json({ error: 'Failed to fetch rider location' });
  }
};


// Update Rider's Current Location
const updateRiderLocation = async (req, res) => {
  const riderId = req.user.user_id;  // Assuming the rider is authenticated and user_id is in the token
  const { location } = req.body;  // Expecting location data from the request body (e.g., GPS coordinates)

  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }

  try {
    await riderQueries.updateRiderLocationQuery(riderId, location);

    res.status(200).json({ success: true, message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating rider location:', error);
    res.status(500).json({ error: 'Failed to update rider location' });
  }
};

// Fetch Rider Profile
const getRiderProfile = async (req, res) => {
  const riderId = req.user.user_id;

  try {
    const riderProfile = await riderQueries.getRiderProfileQuery(riderId);

    if (!riderProfile) {
      return res.status(404).json({ message: 'Rider profile not found' });
    }

    res.status(200).json({
      success: true,
      profile: riderProfile,
    });
  } catch (error) {
    console.error('Error fetching rider profile:', error);
    res.status(500).json({ error: 'Failed to fetch rider profile' });
  }
};

// Update Rider Profile
const updateRiderProfile = async (req, res) => {
  const riderId = req.user.user_id;
  const { phone_number, vehicle_type, status } = req.body;

  try {
    // Update rider's profile
    const updatedProfile = await riderQueries.updateRiderProfileQuery(riderId, phone_number, vehicle_type, status);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating rider profile:', error);
    res.status(500).json({ error: 'Failed to update rider profile' });
  }
};

// Get available orders
const getAvailableOrders = async (req, res) => {
  try {
    const result = await query(`
      SELECT o.order_id, o.delivery_address, o.order_status, o.delivery_fee, r.name, u.name, u.phone_number
      FROM Orders o
      JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
      JOIN Users u ON o.customer_id = u.user_id
      WHERE o.order_status = 'confirmed'
    `);
    console.log("All available orders are : ", result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching available orders:', error);
    res.status(500).json({ message: 'Error fetching available orders', error });
  }
};

// // Get Accepted orders
// const getAcceptedOrders = async (req, res) => {
//   try {
//     const result = await query(`
//       SELECT o.order_id, o.delivery_address, o.order_status, o.delivery_fee, r.name, u.name, u.phone_number
//       FROM Orders o
//       JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
//       JOIN Users u ON o.customer_id = u.user_id
//       WHERE o.order_status = 'on_the_way'
//     `);
//     console.log("All accepted orders are : ", result.rows);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error('Error fetching available orders:', error);
//     res.status(500).json({ message: 'Error fetching available orders', error });
//   }
// };
// Get Accepted Orders for a specific rider
const getAcceptedOrders = async (req, res) => {
  try {
    const rider_id = req.user.userId; // Assuming rider is authenticated and userId is available

    const result = await query(`
      SELECT o.order_id, o.delivery_address, o.order_status, o.delivery_fee, r.name AS restaurant_name, u.name AS customer_name, u.phone_number
      FROM Orders o
      JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
      JOIN Users u ON o.customer_id = u.user_id
      WHERE o.order_status = 'on_the_way' AND o.rider_id = $1
    `, [rider_id]);

    console.log("All accepted orders for rider:", rider_id, result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching accepted orders:', error);
    res.status(500).json({ message: 'Error fetching accepted orders', error });
  }
};


// // Get Delivered orders
// const getDeliveredOrders = async (req, res) => {
//   try {
//     const result = await query(`
//       SELECT o.order_id, o.delivery_address, o.order_status, o.delivery_fee, r.name, u.name, u.phone_number
//       FROM Orders o
//       JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
//       JOIN Users u ON o.customer_id = u.user_id
//       WHERE o.order_status = 'delivered'
//     `);
//     console.log("All delivered orders are : ", result.rows);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error('Error fetching available orders:', error);
//     res.status(500).json({ message: 'Error fetching available orders', error });
//   }
// };

// Get Delivered Orders for a specific rider
const getDeliveredOrders = async (req, res) => {
  try {
    const rider_id = req.user.userId; // Assuming rider is authenticated and userId is available
    console.log("Rider Id at delivered Orders : ", rider_id);
    const result = await query(`
      SELECT o.order_id, o.delivery_address, o.order_status, o.delivery_fee, r.name AS restaurant_name, u.name AS customer_name, u.phone_number, o.updated_at
      FROM Orders o
      JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
      JOIN Users u ON o.customer_id = u.user_id
      WHERE o.order_status = 'delivered' AND o.rider_id = $1
    `, [rider_id]);

    console.log("All delivered orders for rider:", rider_id, result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching delivered orders:', error);
    res.status(500).json({ message: 'Error fetching delivered orders', error });
  }
};


// Assign order to rider
const assignOrderToRider = async (req, res) => {
  try {
    const { order_id } = req.params;
    const rider_id = req.user.userId; // Get rider ID from the authenticated user

    // Check if the order exists and is confirmed
    const orderExists = await query('SELECT 1 FROM Orders WHERE order_id = $1 AND order_status = $2', [order_id, 'confirmed']);
    
    if (orderExists.rowCount === 0) {
      return res.status(400).json({ message: 'Order does not exist or is not available' });
    }

    // Update the order to assign it to the rider
    await query('UPDATE Orders SET rider_id = $1, order_status = $2 WHERE order_id = $3', ['rider', 'assigned', order_id]);
    
    res.status(200).json({ message: 'Order assigned successfully' });
  } catch (error) {
    console.error('Error assigning order:', error);
    res.status(500).json({ message: 'Error assigning order', error });
  }
};
  
// Accept an order, assign the rider, update order status, and return order details
const acceptOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const rider_id = req.user.userId; // Get rider ID from the authenticated user
    console.log("Rider Id : ", rider_id, "Order id : ", order_id);
    // Check if the order is available (not yet assigned)
    const orderResult = await query(`
      SELECT o.order_id, o.delivery_fee, o.total_price, r.name, u.phone_number
      FROM Orders o
      JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
      JOIN Users u ON r.manager_id = u.user_id
      WHERE o.order_id = $1 AND o.rider_id IS NULL AND o.order_status = $2
    `, [order_id, 'confirmed']); // Only fetch orders that are not yet assigned

    if (orderResult.rowCount === 0) {
      return res.status(400).json({ message: 'Order is either not available or has already been assigned' });
    }

    // Assign the rider and update the order status to 'on_the_way'
    await query('UPDATE Orders SET rider_id = $1, order_status = $2 WHERE order_id = $3', [rider_id, 'on_the_way', order_id]);

    // Return the order details
    const orderDetails = orderResult.rows[0];
    res.status(200).json({
      message: 'Order accepted and assigned to rider',
      order_id: orderDetails.order_id,
      delivery_fee: orderDetails.delivery_fee,
      total_price: orderDetails.total_price,
      name: orderDetails.name,
      phone_number: orderDetails.phone_number
    });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ message: 'Error accepting order', error });
  }
};

// Mark an order as completed
const completeOrder = async (req, res) => {
  try {
    const order_id  = req.params.rider_id;
    const rider_id = req.user.userId; // Get rider ID from the authenticated user
    console.log("OrderId : ", order_id , "rider_id  : ", rider_id);

    // Check if the order is accepted by this rider
    const order = await query('SELECT * FROM Orders WHERE order_id = $1 AND rider_id = $2 AND order_status = $3', [order_id, rider_id, 'on_the_way']);
    
    if (order.rowCount === 0) {
      return res.status(400).json({ message: 'Order is not assigned to you or has not been accepted' });
    }

    // Update the order status to completed
    await query('UPDATE Orders SET order_status = $1 WHERE order_id = $2', ['delivered', order_id]);
    
    res.status(200).json({ message: 'Order completed successfully' });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ message: 'Error completing order', error });
  }
};

// Get orders assigned to the rider
const getAssignedOrders = async (req, res) => {
  try {
    const rider_id = req.user.userId; // Get rider ID from the authenticated user

    const result = await query(`
      SELECT * FROM Orders
      WHERE rider_id = $1 AND order_status = 'accepted'
    `, [rider_id]);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching assigned orders:', error);
    res.status(500).json({ message: 'Error fetching assigned orders', error });
  }
};



module.exports = {
  validateRiderData,
  registerRider,
  getRiderById,
  updateRiderStatus,
  deleteRider,
  getAvailableRiders,
  getRiderLocation,
  updateRiderLocation,
  getRiderProfile,
  updateRiderProfile,
  getAvailableOrders,
  assignOrderToRider,
  acceptOrder,
  completeOrder,
  getAssignedOrders,
  getAcceptedOrders,
  getDeliveredOrders,
  RIDER_STATUS,
  VEHICLE_TYPES
};
