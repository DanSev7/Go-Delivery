import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SecureStore from 'expo-secure-store';

// Styled components using nativewind
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledPressable = styled(Pressable);

const OrderDetailScreen = () => {
  const { orderId, restaurant_name, restaurant_image, created_at, status } = useLocalSearchParams();
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh
  const [orderStatus, setOrderStatus] = useState(""); // State for order status
  const router = useRouter();

  // Fetch order items function
  const fetchOrderItems = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      
      const response = await axios.get(`${apiUrl}/order-items/${orderId}`, {
        headers: { Authorization: `${token}` },
      });

      setOrderItems(response.data);
      setOrderStatus(response.data.order_status); // Assuming status comes with response
      setLoading(false);
      setRefreshing(false); // Stop refreshing when done
    } catch (error) {
      console.error("Error fetching order items: ", error);
      setLoading(false);
      setRefreshing(false); // Stop refreshing on error
    }
  };

  useEffect(() => {
    // Fetch order items on component mount
    fetchOrderItems();

    // Set up auto-refresh to run every 5 seconds
    const interval = setInterval(() => {
      fetchOrderItems();
    }, 5000); // 5-second interval

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [orderId]);

  // Function to handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true); // Start the refreshing animation
    fetchOrderItems(); // Refetch data
  };

  if (loading) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ff6347" />
      </StyledView>
    );
  }

  const handleReviewPress = (item) => {
    router.push({
      pathname: '/ReviewScreen',
      params: {
        itemId: item.menu_item_id,
        itemName: item.name,
        itemImage: item.image,
        restaurant_id: item.restaurant_id
      },
    });
  };

  return (
    <StyledView className="flex-1">
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Add pull-to-refresh
        }
      >

        {/* <StyledText className="mt-6 text-center text-2xl font-bold mb-4">Order Details</StyledText> */}

        <StyledImage
          source={{ uri: `data:image/jpeg;base64,${restaurant_image}` }}
          className="w-full h-60 rounded-lg mb-4"
        />

        <StyledText className="text-left text-sm font-bold mb-4">
          Order Status: 
          <StyledText>
             { status || " Unknown"}
          </StyledText> 
        </StyledText>
        <StyledView className="mb-4">
          <StyledText className="text-lg font-bold">Restaurant: {restaurant_name}</StyledText>
          <StyledText className="text-gray-500">Ordered on: {new Date(created_at).toLocaleString()}</StyledText>
        </StyledView>

        <StyledText className="text-lg font-bold mb-4">Order Items</StyledText>
        {orderItems.map(item => (
          <StyledView key={item.order_item_id} className="mb-4 flex-row items-center">
            <StyledImage
              source={{ uri: `data:image/jpeg;base64,${item.image}` }}
              className="w-16 h-16 rounded-lg mr-4"
            />
            <StyledView>
              <StyledText className="font-bold">{item.name}</StyledText>
              <StyledText className="text-gray-500">Quantity: {item.quantity}</StyledText>
              <StyledText className="text-gray-500">Price: {item.price}</StyledText>
              <StyledTouchableOpacity
                onPress={() => handleReviewPress(item)}
                className="bg-secondary-100 rounded-lg p-2 mt-2"
              >
                <StyledText className="text-black text-center font-bold">Review Item</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        ))}
      </ScrollView>

      {/* Spacer at the bottom */}
      <StyledView className="h-6" />
    </StyledView>
  );
};

export default OrderDetailScreen;
