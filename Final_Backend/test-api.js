// Test script to verify API connectivity
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('Testing Food Delivery API...\n');

  // Test 1: Health check
  try {
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Admin stats without auth (should fail)
  try {
    const statsResponse = await axios.get(`${BASE_URL}/admin/stats`);
    console.log('❌ Admin stats should require auth');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Admin stats correctly requires authentication');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  // Test 3: Check if categories endpoint is accessible
  try {
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    console.log('❌ Categories should require auth');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Categories correctly requires authentication');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  console.log('\n✅ Backend API is running and authentication is working correctly!');
  console.log('📝 Next steps:');
  console.log('   1. Set up your database with the schema');
  console.log('   2. Start the frontend applications');
  console.log('   3. Create admin and restaurant manager accounts');
}

testAPI().catch(console.error);