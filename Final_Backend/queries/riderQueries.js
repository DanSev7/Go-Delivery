const { query } = require('../config/db');

// Create or register a new rider
const createRider = async (riderId, vehicle_type, status, location) => {
  const result = await query(
    `INSERT INTO Riders (rider_id, vehicle_type, status, location, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
     RETURNING *`,
    [riderId, vehicle_type, status, location]
  );
  return result.rows[0];
};

// Get rider details by rider ID
const getRiderById = async (riderId) => {
  const result = await query(`
    SELECT r.*, u.name AS rider_name, u.phone_number AS rider_phone
    FROM Riders r
    JOIN Users u ON r.rider_id = u.user_id
    WHERE r.rider_id = $1 AND u.role = 'rider'
  `, [riderId]);
  
  return result.rows[0];
};


// Update rider's status and current orders
const updateRiderStatus = async (riderId, status, current_orders = 0) => {
  const result = await query(
    `UPDATE Riders SET status = $1, current_orders = $2, updated_at = CURRENT_TIMESTAMP 
     WHERE rider_id = $3 RETURNING *`,
    [status, current_orders, riderId]
  );
  return result.rows[0];
};

// Delete rider
const deleteRider = async (riderId) => {
  await query('DELETE FROM Riders WHERE rider_id = $1', [riderId]);
};

// Get all available riders
const getAvailableRiders = async () => {
  const result = await query("SELECT * FROM Riders WHERE status = 'available'");
  return result.rows;
};

// Get one available rider
const getAvailableRider = async () => {
  const result = await query("SELECT * FROM Riders WHERE status = 'available' LIMIT 1");
  return result.rows[0];
};

// Query to get the Rider's location from the database
const getRiderLocationQuery = async (riderId) => {
  try {
    const result = await query(
      `SELECT location, status FROM Riders WHERE rider_id = $1`,
      [riderId]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching rider location:', error);
    throw error;
  }
};

// Query to update the Rider's location
const updateRiderLocationQuery = async (riderId, location) => {
  try {
    await query(
      `UPDATE Riders SET location = $1, updated_at = NOW() WHERE rider_id = $2`,
      [location, riderId]
    );
  } catch (error) {
    console.error('Error updating rider location:', error);
    throw error;
  }
};

// Fetch rider's profile
const getRiderProfileQuery = async (riderId) => {
  try {
    const result = await query(
      `SELECT user_id, name, phone_number, profile_picture, vehicle_type, status, location
       FROM Users
       INNER JOIN Riders ON Users.user_id = Riders.rider_id
       WHERE rider_id = $1`,
      [riderId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching rider profile:', error);
    throw error;
  }
};

// Update rider's profile
const updateRiderProfileQuery = async (riderId, vehicle_type, status) => {
  try {
    const result = await query(
      `UPDATE Riders
       SET vehicle_type = $1, status = $2, updated_at = CURRENT_TIMESTAMP
       WHERE rider_id = $3
       RETURNING *`,
      [vehicle_type, status, riderId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating rider profile:', error);
    throw error;
  }
};


module.exports = {
  createRider,
  getRiderById,
  updateRiderStatus,
  deleteRider,
  getAvailableRiders,
  getAvailableRider,
  getRiderLocationQuery,
  updateRiderLocationQuery,
  getRiderProfileQuery,
  updateRiderProfileQuery
};
