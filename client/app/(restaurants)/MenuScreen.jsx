import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Pressable, ImageBackground } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styled } from 'nativewind';
import { useRouter } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; 
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledImageBackground = styled(ImageBackground);

export default function MenuScreen() {
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const { restaurantId, name, image } = useLocalSearchParams();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const router = useRouter();

  useEffect(() => {
    if (restaurantId) {
      fetchMenuItems(restaurantId);
    }
  }, [restaurantId]);

  const fetchMenuItems = async (restaurantId) => {
    try {
      const token = await SecureStore.getItemAsync('userToken'); // Retrieve token securely
      const response = await axios.get(`${apiUrl}/menu-items/restaurant/${restaurantId}`, {
        headers: {
          Authorization: `${token}`, // Pass the token in the Authorization header
        },
      });
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items: ', error.message);
    }
  };

  const handleIncrement = (menuItem) => {
    const newCartItems = { ...cartItems };
    if (!newCartItems[menuItem.menu_item_id]) {
      newCartItems[menuItem.menu_item_id] = { ...menuItem, quantity: 1 };
    } else {
      newCartItems[menuItem.menu_item_id].quantity += 1;
    }
    setCartItems(newCartItems);
    setTotalAmount(totalAmount + parseFloat(menuItem.price));
  };

  const handleDecrement = (menuItem) => {
    const newCartItems = { ...cartItems };
    if (newCartItems[menuItem.menu_item_id] && newCartItems[menuItem.menu_item_id].quantity > 0) {
      newCartItems[menuItem.menu_item_id].quantity -= 1;
      setTotalAmount(totalAmount - parseFloat(menuItem.price));

      if (newCartItems[menuItem.menu_item_id].quantity === 0) {
        delete newCartItems[menuItem.menu_item_id];
      }
    }
    setCartItems(newCartItems);
  };

  const handleAdd = (menuItem) => {
    const newCartItems = { ...cartItems };
    newCartItems[menuItem.menu_item_id] = { ...menuItem, quantity: 1 };
    setCartItems(newCartItems);
    setTotalAmount(totalAmount + parseFloat(menuItem.price));
  };

  const handleClick = () => {
    const cartItemsArray = Object.values(cartItems).map(item => ({
      menu_item_id: item.menu_item_id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
    }));

    router.push({
      pathname: '/CheckoutScreen',
      params: {
        cartItems: JSON.stringify(cartItemsArray), 
        totalAmount: totalAmount.toFixed(2),
      },
    });
  };
   
  const totalItems = Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);

  const handleFoodItemClick = (item) => {
    router.push({
      pathname: '/FoodDetailScreen',
      params: { 
        id: item.menu_item_id, 
        name: item.name, 
        description: item.description, 
        price: item.price, 
        image: item.image,
        rating: item.rating,
      },
    });
  };

  return (
    <StyledView className="flex-1">
      <StyledImageBackground
        source={{ uri: `data:image/jpeg;base64,${image}` }}
        className="w-full h-64 justify-end items-start"
        style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' }}
      >
        <StyledTouchableOpacity
          onPress={() => router.back()}
          className="absolute top-6 left-4 p-2 bg-white rounded-full"
        >
          <Ionicons name="chevron-back" size={26} color="black" />
        </StyledTouchableOpacity>
      </StyledImageBackground>

      {/* Menu Items List */}
      <StyledView
        className="flex-1 p-2 mt-[-60px] bg-white"
        style={{
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          overflow: 'hidden',
          elevation: 3,
        }}
      >
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.menu_item_id.toString()}
          renderItem={({ item }) => (
            <StyledTouchableOpacity
              className="flex-row items-center border-b border-gray-200 rounded-lg p-3"
              onPress={() => handleFoodItemClick(item)}
            >
              <Image source={{ uri: `data:image/jpeg;base64,${item.image}` }} className="w-24 h-24 rounded-lg mr-3" />
              <StyledView className="flex-1">
                <StyledText className="text-lg font-bold">{item.name}</StyledText>
                <StyledText className="text-sm text-gray-600 mb-2">{name}</StyledText>
                <StyledText className="text-sm text-gray-600">{item.price} Br</StyledText>
              </StyledView>
              <StyledView className="flex-row items-center">
                {cartItems[item.menu_item_id] ? (
                  <>
                    <StyledTouchableOpacity
                      className="pl-3 pr-3 pt-1 pb-1 rounded-md border border-gray-300"
                      onPress={() => handleDecrement(item)}
                    >
                      <StyledText className="text-gray-400 text-xl font-semibold">–</StyledText>
                    </StyledTouchableOpacity>
                    <StyledText className="text-gray-700 mx-2">
                      {cartItems[item.menu_item_id]?.quantity || 0}
                    </StyledText>
                    <StyledTouchableOpacity
                      className="pl-3 pr-3 pt-1 pb-1 rounded-md border border-gray-300"
                      onPress={() => handleIncrement(item)}
                    >
                      <StyledText className="text-gray-400 text-xl">+</StyledText>
                    </StyledTouchableOpacity>
                  </>
                ) : (
                  <StyledTouchableOpacity
                    className="pl-4 pr-4 pt-1 pb-1 rounded-md bg-orange-500"
                    onPress={() => handleAdd(item)}
                  >
                    <StyledText className="text-white text-xl">Add</StyledText>
                  </StyledTouchableOpacity>
                )}
              </StyledView>
            </StyledTouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      </StyledView>

      {/* Cart Section Fixed at the Bottom */}
      <StyledView className="absolute bottom-0 left-0 right-0 p-4">
        <StyledTouchableOpacity
          className={`p-4 rounded-full flex flex-row justify-around items-center ${
            totalAmount > 0 ? 'bg-orange-500' : 'bg-gray-300'
          }`}
          disabled={totalAmount === 0}
          onPress={handleClick}
        >
          <StyledView className="relative flex-row items-center">
            <StyledView className="relative mr-2">
              <MaterialIcons name="shopping-cart" size={24} color="white" />
              {totalItems > 0 && (
                <StyledView className="absolute top-[-5px] right-[-5px] w-5 h-5 bg-red-500 rounded-full justify-center items-center">
                  <StyledText className="text-white font-bold text-xs">{totalItems}</StyledText>
                </StyledView>
              )}
            </StyledView>
            <StyledText className="text-xl text-gray-700">Total: {totalAmount} Br</StyledText>
          </StyledView>
          <StyledText className="text-white font-bold text-xl ml-2">Add to Cart</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
}
