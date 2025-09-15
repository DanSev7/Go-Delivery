// Script to fix password for existing user
const bcrypt = require('bcrypt');
const { query } = require('./config/db');
require('dotenv').config();

async function fixUserPassword() {
  try {
    const email = 'danaye@gmail.com'; // The email you're trying to login with
    const newPassword = 'Danaye7'; // The password you want to use
    
    console.log('🔧 Fixing password for user:', email);
    
    // Check if user exists
    const userResult = await query('SELECT * FROM Users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found with email:', email);
      console.log('Creating new admin user...');
      
      // Create new admin user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const result = await query(
        'INSERT INTO Users (name, email, password, role, phone_number, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        ['Admin User', email, hashedPassword, 'admin', '+1234567890', '123 Admin Street']
      );
      
      console.log('✅ New admin user created successfully!');
      console.log('📋 Login credentials:');
      console.log('   Email:', email);
      console.log('   Password:', newPassword);
      console.log('   Role: admin');
      
    } else {
      const user = userResult.rows[0];
      console.log('✅ User found:', user.name, '- Role:', user.role);
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log('🔐 Hashing new password...');
      
      // Update the password
      await query('UPDATE Users SET password = $1 WHERE email = $2', [hashedPassword, email]);
      
      console.log('✅ Password updated successfully!');
      console.log('📋 Updated login credentials:');
      console.log('   Email:', email);
      console.log('   Password:', newPassword);
      console.log('   Role:', user.role);
      
      // If user is not admin, update role to admin
      if (user.role !== 'admin') {
        await query('UPDATE Users SET role = $1 WHERE email = $2', ['admin', email]);
        console.log('🔄 Role updated to admin');
      }
    }
    
    console.log('\\n🎯 You can now login to the admin panel with these credentials.');
    
  } catch (error) {
    console.error('❌ Error fixing password:', error.message);
  } finally {
    process.exit();
  }
}

fixUserPassword();