// Script to create an admin user with proper password hashing
const bcrypt = require('bcrypt');
const { query } = require('./config/db');
require('dotenv').config();

async function createAdminUser() {
  try {
    console.log('Creating admin user...\n');

    const adminData = {
      name: 'Admin User',
      email: 'admin@fooddelivery.com',
      password: 'Admin123!', // You can change this password
      role: 'admin',
      phone_number: '+1234567890',
      address: '123 Admin Street'
    };

    // Check if admin already exists
    const existingAdmin = await query('SELECT * FROM Users WHERE email = $1', [adminData.email]);
    
    if (existingAdmin.rows.length > 0) {
      console.log('❌ Admin user already exists with email:', adminData.email);
      console.log('If you need to reset the password, please delete the existing user first.');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    console.log('✅ Password hashed successfully');

    // Insert admin user
    const result = await query(
      'INSERT INTO Users (name, email, password, role, phone_number, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [adminData.name, adminData.email, hashedPassword, adminData.role, adminData.phone_number, adminData.address]
    );

    console.log('✅ Admin user created successfully!');
    console.log('📋 Admin credentials:');
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);
    console.log('   Role:', adminData.role);
    console.log('\n🎯 You can now login to the admin panel with these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure your PostgreSQL database is running and accessible.');
    }
    
    if (error.code === '42P01') {
      console.log('💡 Make sure you have run the database schema first (database_schema.sql).');
    }
  } finally {
    process.exit();
  }
}

// Also create a restaurant manager for testing
async function createRestaurantManager() {
  try {
    const managerData = {
      name: 'Restaurant Manager',
      email: 'manager@restaurant.com',
      password: 'Manager123!',
      role: 'restaurant_manager',
      phone_number: '+1234567891',
      address: '456 Manager Avenue'
    };

    // Check if manager already exists
    const existingManager = await query('SELECT * FROM Users WHERE email = $1', [managerData.email]);
    
    if (existingManager.rows.length > 0) {
      console.log('⚠️ Restaurant manager already exists with email:', managerData.email);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(managerData.password, 10);

    // Insert manager user
    await query(
      'INSERT INTO Users (name, email, password, role, phone_number, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [managerData.name, managerData.email, hashedPassword, managerData.role, managerData.phone_number, managerData.address]
    );

    console.log('✅ Restaurant manager created successfully!');
    console.log('📋 Manager credentials:');
    console.log('   Email:', managerData.email);
    console.log('   Password:', managerData.password);
    console.log('   Role:', managerData.role);

  } catch (error) {
    console.error('❌ Error creating restaurant manager:', error.message);
  }
}

async function main() {
  await createAdminUser();
  await createRestaurantManager();
}

main();