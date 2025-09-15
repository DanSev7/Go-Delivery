import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // Import SecureStore

export default function EarningScreen() {
  const [earnings, setEarnings] = useState(null); // Earnings state
  const [deliveryHistory, setDeliveryHistory] = useState([]); // Delivery history state
  const [loading, setLoading] = useState(true); // Loading state
  const [refreshing, setRefreshing] = useState(false); // Refreshing state
  const router = useRouter();

  // Fetch earnings and delivery history from the backend
  const fetchEarningsData = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL; // Replace with your API URL
      const riderId = await SecureStore.getItemAsync('riderId');
      const token = await SecureStore.getItemAsync('token');

      console.log("Rider Id on earning: ", riderId);
      const earningsResponse = await axios.get(`${apiUrl}/earnings/${riderId}`);
      setEarnings(earningsResponse.data);

      // Fetch delivery history
      const historyResponse = await axios.get(`${apiUrl}/riders/delivered-orders`, {
        headers: { Authorization: token }
      });
      setDeliveryHistory(historyResponse.data);
      
      setLoading(false); // Set loading to false after fetching data
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      setLoading(false); // Set loading to false even in case of error
    } finally {
      setRefreshing(false); // Stop refreshing after data is fetched
    }
  };

  // Use useFocusEffect to fetch data when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchEarningsData();
    }, [])
  );

  // Function to format the delivery date
//   const formatDate = (dateString) => {
//     const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
//     const date = new Date(dateString);
//     return date.toLocaleString('en-US', options);
//   };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF6C22" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Top Container with Wallet Icon, Back Icon, and Total Balance */}
      <View className="p-6 bg-orange-500 relative">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-6 left-4 p-2 bg-slate-200 rounded-full"
        >
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>
        <View className="flex-row justify-around items-center mt-8">
          {/* Wallet Icon */}
          <Entypo name="wallet" size={50} color="white" />
          <View>
            <Text className="text-2xl text-white font-bold">Total Balance</Text>
            <Text className="text-white text-3xl mt-2">${earnings?.all_time_earnings || 0}</Text>
          </View>
        </View>

        {/* Horizontal Alignment for Today, This Week, This Month */}
        <View className="flex-row justify-between mt-6 mb-8">
          <View className="items-center">
            <Text className="text-lg text-white">Today</Text>
            <Text className="text-xl text-white mt-1">${earnings?.today_earnings || 0}</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg text-white">This Week</Text>
            <Text className="text-xl text-white mt-1">${earnings?.week_earnings || 0}</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg text-white">This Month</Text>
            <Text className="text-xl text-white mt-1">${earnings?.month_earnings || 0}</Text>
          </View>
        </View>
      </View>

      {/* White Screen with Rounded Top Border that overlaps */}
      <View className="flex-1 bg-white -mt-8 rounded-t-3xl p-6">
        {/* Delivery History List */}
        <Text className="text-xl font-bold mb-4">Delivery History</Text>

        {/* FlatList to display delivery history */}
        <FlatList
          data={deliveryHistory}
          keyExtractor={(item) => item.order_id} // Changed for consistency
          renderItem={({ item }) => (
            <View className="p-4 bg-gray-100 rounded-lg mb-4">
              <Text className="text-lg font-semibold">Order ID: {item.order_id}</Text>
              <Text>Delivery Price: ${item.delivery_fee}</Text>
              {/* <Text>Delivery Date: {formatDate(item.updated_at)}</Text> Use the formatDate function here */}
              <Text className="text-gray-400 text-sm"> Delivery Date : 
                  {new Date(item.updated_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  {new Date(item.updated_at).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchEarningsData} />
          }
        showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}