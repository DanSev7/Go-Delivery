// Test script for client-backend connection
// Run this in the client directory to test API connectivity

import api, { endpoints } from './config/api.js';

async function testClientBackendConnection() {
  console.log('🔍 Testing Client-Backend Connection...\n');
  
  try {
    // Test 1: Check API base URL
    console.log('📍 API Base URL:', api.defaults.baseURL);
    console.log('');

    // Test 2: Try to get categories (should fail without auth)
    try {
      const categoriesResponse = await api.get(endpoints.categories.list);
      console.log('❌ Categories should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Categories correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 3: Try to get restaurants (should fail without auth)
    try {
      const restaurantsResponse = await api.get(endpoints.restaurants.list);
      console.log('❌ Restaurants should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Restaurants correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 4: Health check endpoint (should work without auth)
    try {
      const healthResponse = await api.get('/health');
      console.log('✅ Health check endpoint accessible:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }

    console.log('\n✅ Client-Backend connection test completed!');
    console.log('📝 Next steps:');
    console.log('   1. Make sure your backend is running on the correct port');
    console.log('   2. Test login functionality in the app');
    console.log('   3. Verify authenticated API calls work correctly');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

// Run the test
testClientBackendConnection();