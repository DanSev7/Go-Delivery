// Script to fix password for restaurant manager user
const bcrypt = require('bcrypt');
const { query } = require('./config/db');
require('dotenv').config();

async function fixRestaurantPassword() {
  try {
    const email = 'res@gmail.com'; // The email you're trying to login with
    const newPassword = 'Rest777'; // The password you want to use
    
    console.log('🔧 Fixing password for restaurant manager:', email);
    
    // Check if user exists
    const userResult = await query('SELECT * FROM Users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found with email:', email);
      console.log('Creating new restaurant manager user...');
      
      // Create new restaurant manager user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const result = await query(
        'INSERT INTO Users (name, email, password, role, phone_number, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        ['Restaurant Manager', email, hashedPassword, 'restaurant_manager', '+1234567891', '456 Manager Avenue']
      );
      
      console.log('✅ New restaurant manager user created successfully!');
      console.log('📋 Login credentials:');
      console.log('   Email:', email);
      console.log('   Password:', newPassword);
      console.log('   Role: restaurant_manager');
      
    } else {
      const user = userResult.rows[0];
      console.log('✅ User found:', user.name, '- Role:', user.role);
      
      // Hash the new password properly with bcrypt
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log('🔐 Hashing new password with bcrypt...');
      
      // Update the password in database
      await query('UPDATE Users SET password = $1 WHERE email = $2', [hashedPassword, email]);
      
      console.log('✅ Password updated successfully!');
      console.log('📋 Updated login credentials:');
      console.log('   Email:', email);
      console.log('   Password:', newPassword);
      console.log('   Role:', user.role);
      
      // Ensure user has restaurant_manager role
      if (user.role !== 'restaurant_manager') {
        await query('UPDATE Users SET role = $1 WHERE email = $2', ['restaurant_manager', email]);
        console.log('🔄 Role updated to restaurant_manager');
      }
    }
    
    console.log('\\n🎯 You can now login to the restaurant panel with these credentials.');
    console.log('🌐 Restaurant Panel URL: http://localhost:5174');
    
  } catch (error) {
    console.error('❌ Error fixing password:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure PostgreSQL is running');
    }
  } finally {
    process.exit();
  }
}

fixRestaurantPassword();