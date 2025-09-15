// Test database connection and check existing users
const { query } = require('./config/db');
require('dotenv').config();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...\n');

    // Test basic connection
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('   Current time:', result.rows[0].current_time);

    // Check if Users table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Users table exists');
      
      // Check existing users
      const users = await query('SELECT user_id, name, email, role FROM Users');
      console.log(`📊 Found ${users.rows.length} users in database:`);
      
      if (users.rows.length === 0) {
        console.log('   📝 No users found. You need to create an admin user first.');
      } else {
        users.rows.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
        });
        
        // Check for admin user
        const adminUsers = users.rows.filter(user => user.role === 'admin');
        if (adminUsers.length === 0) {
          console.log('⚠️  No admin users found. You need to create an admin user to access the admin panel.');
        } else {
          console.log(`✅ Found ${adminUsers.length} admin user(s)`);
        }
      }
    } else {
      console.log('❌ Users table does not exist!');
      console.log('💡 You need to run the database schema first (database_schema.sql)');
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure PostgreSQL is running');
      console.log('💡 Check your database credentials in .env file');
    }
    
    if (error.code === '3D000') {
      console.log('💡 Database does not exist. Create the "Food_Delivery" database first');
    }
  } finally {
    process.exit();
  }
}

testDatabase();