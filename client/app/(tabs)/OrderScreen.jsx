import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styled } from 'nativewind';

// Styled components using nativewind
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledPressable = styled(Pressable);

const OrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const token = await SecureStore.getItemAsync('userToken');
    const customerId = await SecureStore.getItemAsync('userId');

    try {
      const response = await axios.get(`${apiUrl}/order-items/customers/${customerId}`, {
        headers: { Authorization: `${token}` },
      });
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders: ', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Set up automatic refresh every 5 seconds
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 5000); // 5000 milliseconds = 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [fetchOrders]);

  const handlePressOrder = (order) => {
    router.push({
      pathname: '/OrderDetailScreen',
      params: {
        orderId: order.order_id,
        restaurant_name: order.restaurant_name,
        restaurant_image: order.restaurant_image,
        created_at: order.created_at,
        status: order.order_status,
      },
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(); // Fetch latest orders on refresh
    setRefreshing(false);
  };

  if (loading) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ff6347" />
      </StyledView>
    );
  }

  return (
    <StyledView className="flex-1">
      {/* Fixed header */}
      <StyledView className="bg-white p-4" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <StyledText className="text-center text-lg font-semibold mt-4">My Orders</StyledText>
      </StyledView>

      {/* Scrollable content with pull-to-refresh */}
      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#ff6347']} />
        }
      >
        {orders.map((order) => (
          <StyledPressable
            key={order.order_item_id}
            onPress={() => handlePressOrder(order)}
            className="mb-4 flex-row items-center border-b border-gray-300"
          >
            <StyledImage
              source={{ uri: `data:image/jpeg;base64,${order.restaurant_image}` }}
              className="w-14 h-14 rounded-lg mr-3"
            />
            <StyledView className="flex-1 justify-between flex-row">
              <StyledView>
                <StyledText className="text-md mb-4">{order.restaurant_name}</StyledText>
                <StyledText className="text-gray-400 text-sm">
                  {new Date(order.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  {new Date(order.created_at).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </StyledText>
              </StyledView>

              <StyledText className="text-xs text-right mt-4">{order.total_quantity} Item</StyledText>
            </StyledView>
          </StyledPressable>
        ))}
      </ScrollView>
    </StyledView>
  );
};

export default OrderScreen;
