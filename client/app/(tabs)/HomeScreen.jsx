import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, Image, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as SecureStore from 'expo-secure-store';
import { styled } from 'nativewind';
import * as Location from 'expo-location';
import api, { endpoints } from '../../config/api';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
    fetchRestaurants();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get(endpoints.categories.list);
      setCategories(response.data);
    } catch (error) {
      setError('Error fetching categories.');
      Alert.alert('Error', 'Failed to load categories. Please try again later.');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await api.get(endpoints.restaurants.list);
      setRestaurants(response.data);
    } catch (error) {
      setError('Error fetching restaurants.');
      Alert.alert('Error', 'Failed to load restaurants. Please try again later.');
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const handleCategoryPress = (category) => {
    const filtered = restaurants.filter((restaurant) => restaurant.category === category);
    setFilteredRestaurants(filtered);
  };

  const storeRestaurantId = async (id) => {
    await SecureStore.setItemAsync('restaurantId', id.toString());
  };

  const handlePressRestaurant = async (restaurant) => {
    await storeRestaurantId(restaurant.restaurant_id);
    router.push({
      pathname: '/MenuScreen',
      params: {
        restaurantId: restaurant.restaurant_id,
        image: restaurant.image, 
        name: restaurant.name, 
      },
    });
  };

  const memoizedFilteredRestaurants = useMemo(() => filteredRestaurants.length ? filteredRestaurants : restaurants, [filteredRestaurants, restaurants]);

  if (loadingCategories || loadingRestaurants) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ff6347" />
      </StyledView>
    );
  }

  return (
    <StyledView className="flex-1 p-4 mt-4">
      {/* Top Navigation */}
      <StyledView className="flex-row justify-between items-center mb-4">
        <Icon name="map" size={25} />
        <Icon name="bell" size={25} />
      </StyledView>

      {/* Search Bar */}
      <StyledTouchableOpacity
        className="flex-row items-center mb-4 border border-gray-300 rounded-full p-3"
        onPress={() => router.push('/SearchScreen')}
      >
        <Icon name="search" size={20} color="gray" />
        <StyledTextInput
          className="flex-1 ml-2 p-0"
          placeholder="Search for food..."
          value={search}
          editable={false} // Navigate to search screen
        />
      </StyledTouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <StyledView className="mb-6">
          <StyledText className="text-lg font-semibold mb-3">Categories</StyledText>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item.category_id.toString()}
            renderItem={({ item }) => (
              <StyledTouchableOpacity
                className="mr-4 items-center"
                onPress={() => handleCategoryPress(item.name)}
              >
                <Image
                  source={{ uri: `data:image/jpeg;base64,${item.image}` }}
                  className="w-16 h-16 rounded-full mb-2"
                />
                <StyledText>{item.name}</StyledText>
              </StyledTouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </StyledView>

        {/* All Restaurants Section */}
        <StyledView>
          <StyledText className="text-lg font-semibold mb-3">All Restaurants</StyledText>
          {memoizedFilteredRestaurants.map((restaurant) => (
            <StyledTouchableOpacity
              key={restaurant.restaurant_id}
              className="mb-4 flex-row items-center border-b border-gray-300 rounded-lg"
              onPress={() => handlePressRestaurant(restaurant)}
            >
              <Image
                source={{ uri: `data:image/jpeg;base64,${restaurant.logo}` }}
                className="w-28 h-28 rounded-lg mr-3"
              />
              <StyledView>
                <StyledText className="text-lg">{restaurant.name}</StyledText>
                <StyledText className="text-sm text-gray-600">
                  Avg {restaurant.average_delivery_time} delivery time
                </StyledText>
              </StyledView>
            </StyledTouchableOpacity>
          ))}
        </StyledView>
      </ScrollView>
    </StyledView>
  );
}




