// db.js
const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance with environment variables
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Food_Delivery',
  password: process.env.DB_PASSWORD || 'danaye7',
  port: process.env.DB_PORT || 5432,
});

// Function to execute queries
const query = (text, params) => pool.query(text, params);

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

module.exports = {
  query,
  pool
};
