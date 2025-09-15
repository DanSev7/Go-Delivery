import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Modal, Button } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function AcceptedOrdersScreen() {
  const [acceptedOrders, setAcceptedOrders] = useState([]); // State for accepted orders
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility
  const [selectedOrder, setSelectedOrder] = useState(null); // Selected order for modal
  const apiUrl = process.env.EXPO_PUBLIC_API_URL; // Replace with your actual API URL

  // Function to fetch accepted orders
  const fetchAcceptedOrders = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${apiUrl}/riders/accepted-orders`, {
        headers: { Authorization: `${token}` }
      });
      setAcceptedOrders(response.data); // Update state with the fetched data
      setRefreshing(false); // Stop refreshing
    } catch (error) {
      console.error('Error fetching accepted orders:', error);
      setRefreshing(false); // Stop refreshing
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchAcceptedOrders();
  }, [fetchAcceptedOrders]);

  // Function for pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAcceptedOrders();
  }, [fetchAcceptedOrders]);

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

  // Function to update the order status to "Delivered"
  const markAsDelivered = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      await axios.put(`${apiUrl}/riders/mark-delivered/${selectedOrder.order_id}`, {}, {
        headers: { Authorization: `${token}` }
      });
      closeModal();
      fetchAcceptedOrders(); // Refresh accepted orders after marking as delivered
    } catch (error) {
      console.error('Error updating order to delivered:', error.message);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Accepted Deliveries</Text>

      <FlatList
        data={acceptedOrders}
        keyExtractor={(item) => item.order_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleOrderSelect(item)}
            className="p-4 bg-gray-100 rounded-lg mb-4"
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-semibold">Order ID: {item.order_id}</Text>
                <Text>Destination: {item.delivery_address}</Text>
                <Text>Total Price: ${item.delivery_fee}</Text>
                <Text>Status: {item.order_status}</Text>
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

      {/* Modal for updating the order status to "Delivered" */}
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
                <Text>Destination: {selectedOrder.delivery_address}</Text>
              </View>

              <View className="mb-6">
                <Text className="text-xl font-bold">Customer</Text>
                <Text>Name: {selectedOrder.name}</Text>
                <Text>Phone: {selectedOrder.phone_number}</Text>
              </View>

              <Button
                title="Mark as Delivered"
                onPress={markAsDelivered}
                color="#FF5722"
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
