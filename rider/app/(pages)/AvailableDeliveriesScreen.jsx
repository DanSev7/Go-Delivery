import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function AvailableDeliveriesScreen() {
  const [modalVisible, setModalVisible] = useState(false); // State to control the modal visibility
  const [selectedOrder, setSelectedOrder] = useState(null); // Selected order details
  const [deliveries, setDeliveries] = useState([]); // State for deliveries
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh
  const router = useRouter();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL; // Replace with your actual API URL

  // Function to fetch deliveries
  const fetchDeliveries = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${apiUrl}/riders/available-orders`, {
        headers: { Authorization: `${token}` }
      });
      setDeliveries(response.data); // Update state with the fetched data
      setRefreshing(false); // Stop refreshing
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setRefreshing(false); // Stop refreshing
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // Function to handle order selection and modal visibility
  const handleOrderSelect = (order) => {
    setSelectedOrder(order); // Set the selected order
    setModalVisible(true);   // Show the modal
  };

  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false);  // Hide the modal
    setSelectedOrder(null);  // Clear the selected order
  };

  // Function to accept the order
  const acceptOrder = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      await axios.put(`${apiUrl}/riders/accept-order/${selectedOrder.order_id}`, {}, {
        headers: { Authorization: `${token}` }
      });
      closeModal();
      fetchDeliveries(); // Refresh deliveries after accepting
    } catch (error) {
      console.error('Error accepting order:', error.message);
    }
  };

  // Function for pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDeliveries();
  }, [fetchDeliveries]);

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Available Deliveries</Text>
      <Button
  title="View Accepted Orders"
  onPress={() => router.push('/AcceptedOrdersScreen')}
  color="#FF5722"
/>

      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.order_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleOrderSelect(item)}
            className="p-4 bg-gray-100 rounded-lg mb-4"
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-semibold">Order ID: {item.order_id}</Text>
                {/* <Text>Source: {item.source}</Text> */}
                <Text>Destination: {item.delivery_address}</Text>
                <Text>Total Price: ${item.delivery_fee}</Text>
                <Text>Status : {item.order_status}</Text>
              </View>
              <FontAwesome name="angle-right" size={24} color="black" />
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />

      {selectedOrder && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white w-11/12 p-6 rounded-lg shadow-lg">
              <TouchableOpacity onPress={closeModal} className="absolute top-4 right-4">
                <MaterialCommunityIcons name="close" size={24} color="black" />
              </TouchableOpacity>

              <View className="mb-6">
                <Text className="text-xl font-bold">Order ID</Text>
                <Text className="text-lg">{selectedOrder.order_id}</Text>
              </View>

              <View className="mb-6">
                <Text className="text-xl font-bold">Location</Text>
                {/* <Text>Source: {selectedOrder.source}</Text> */}
                <Text>Destination: {selectedOrder.delivery_address}</Text>
              </View>

              <View className="mb-6">
                <Text className="text-xl font-bold">Customer</Text>
                <Text>Name: {selectedOrder.name}</Text>
                <Text>Phone: {selectedOrder.phone_number}</Text>
              </View>

              <Button
                title="Accept Delivery"
                onPress={acceptOrder}
                color="#FF5722"
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
