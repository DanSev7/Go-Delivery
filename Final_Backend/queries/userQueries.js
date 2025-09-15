// queries/userQueries.js
const { query } = require('../config/db');

const createUser = async (name, email, password, role, phone_number, address, profile_picture) => {
  console.log("phone_number : ", phone_number);
  const result = await query(
    'INSERT INTO Users (name, email, password, role, phone_number, address, profile_picture) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [name, email, password, role, phone_number, address, profile_picture]
  );
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await query('SELECT * FROM Users WHERE email = $1', [email]);
  return result.rows[0];
};

const getUserById = async (user_id) => {
  const result = await query('SELECT * FROM Users WHERE user_id = $1', [user_id]);
  return result.rows[0];
};

// New function to get all users
const getAllUsers = async () => {
  const result = await query('SELECT * FROM Users');
  return result.rows;
};

// New function to delete a user by ID
const deleteUser = async (user_id) => {
  const result = await query('DELETE FROM Users WHERE user_id = $1 RETURNING *', [user_id]);
  return result.rows[0]; // Return the deleted user
};

// Update User
const updateUser = async (user_id, name, email, password, role, phone_number, address, profile_picture) => {
  const result = await query(
    `UPDATE Users 
     SET name = COALESCE($2, name), 
         email = COALESCE($3, email), 
         password = COALESCE($4, password), 
         role = COALESCE($5, role), 
         phone_number = COALESCE($6, phone_number), 
         address = COALESCE($7, address), 
         profile_picture = COALESCE($8, profile_picture) 
     WHERE user_id = $1 
     RETURNING *`,
    [user_id, name, email, password, role, phone_number, address, profile_picture]
  );
  return result.rows[0];
};

const updatePassword = async (user_id, hashedPassword) => {
  const result = await query(
    `UPDATE Users 
     SET password = $2 
     WHERE user_id = $1 
     RETURNING *`,
    [user_id, hashedPassword]
  );
  return result.rows[0];
};
module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getAllUsers, // Export the new function
  deleteUser,  // Export the new function
  updateUser,
  updatePassword
};