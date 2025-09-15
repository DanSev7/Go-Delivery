import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; // Import the food icon
import axios from 'axios'; // For API requests
import * as SecureStore from 'expo-secure-store'; // For getting token

// API URL from your environment variables
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export default function HistoryScreen() {
  const [orderHistory, setOrderHistory] = useState([]); // State for order history
  const [refreshing, setRefreshing] = useState(false); // State for manual refresh

  // Function to fetch order history from the API
  const fetchOrderHistory = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${apiUrl}/riders/delivered-orders`, {
        headers: { Authorization: `${token}` }
      });
      setOrderHistory(response.data); // Update state with the fetched data
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setRefreshing(false); // Stop refreshing
    }
  }, [apiUrl]);

  // Manual pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  // Set up automatic refresh every 5 seconds
  useEffect(() => {
    fetchOrderHistory(); // Initial fetch when component mounts

    const interval = setInterval(() => {
      fetchOrderHistory(); // Fetch new data every 5 seconds
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [fetchOrderHistory]);

  return (
    <View className="flex-1 bg-white p-6">
      {/* Title */}
      <View className="bg-white shadow-md p-3">
        <Text className="text-center text-lg font-semibold mt-2">Delivered History</Text>
      </View>

      {/* FlatList to display order history */}
      <FlatList
        data={orderHistory}
        keyExtractor={(item) => item.order_id}
        renderItem={({ item }) => (
          <View className="flex-row items-center py-4">
            {/* Food Icon on the left */}
            <FontAwesome5 name="hamburger" size={30} color="#000" />

            {/* Order Details on the right */}
            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold">Order ID: {item.order_id}</Text>
              <Text>Total Payment: ${item.delivery_fee}</Text>
              <Text className="text-red-500 font-semibold">Status: {item.order_status}</Text>
            </View>
          </View>
        )}
        // Adding line separator after each order item
        ItemSeparatorComponent={() => (
          <View className="border-b border-gray-300 my-2" />
        )}
        // Refresh control for pull-to-refresh
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
