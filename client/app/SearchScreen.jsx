import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]); // For displaying filtered results
  const [allRestaurants, setAllRestaurants] = useState([]); // To store all restaurant data
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const response = await axios.get(`${apiUrl}/restaurants`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        setAllRestaurants(response.data); // Store all restaurants
        setSearchResults(response.data);  // Initially display all restaurants
      } catch (error) {
        setError('Error fetching restaurants.');
        console.error('Error fetching restaurants:', error); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleSearch = (text) => {
    setQuery(text); // Update the query state
    if (text === '') {
      // If the input is empty, display all restaurants
      setSearchResults(allRestaurants);
    } else {
      // Filter restaurants based on the query
      const filteredRestaurants = allRestaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(filteredRestaurants);
    }
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

  return (
    <StyledView className="flex-1 p-4 mt-4">
      {/* Search Input */}
      <StyledView className="flex-row items-center mb-4 border border-gray-300 rounded-full p-3">
        <Icon name="search" size={20} color="gray" />
        <StyledTextInput
          className="flex-1 ml-2 p-0"
          placeholder="Search for food..."
          value={query}
          onChangeText={(text) => handleSearch(text)} // Call handleSearch on every input change
        />
      </StyledView>

      {/* Search Results */}
      {isLoading ? (
        <StyledView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff6347" />
        </StyledView>
      ) : error ? (
        <StyledView className="flex-1 justify-center items-center">
          <StyledText>{error}</StyledText>
        </StyledView>
      ) : (
        <FlatList
          data={searchResults} // Use filtered results
          keyExtractor={(item) => item.restaurant_id.toString()}
          renderItem={({ item }) => (
            <StyledPressable
              className="mb-4 flex-row items-center border-b border-gray-300 rounded-lg"
              onPress={() => handlePressRestaurant(item)}
            >
              <Image
                source={{ uri: `data:image/jpeg;base64,${item.logo}` }}
                className="w-28 h-28 rounded-lg mr-3"
              />
              <StyledView>
                <StyledText className="text-lg">{item.name}</StyledText>
                <StyledText className="text-sm text-gray-600">
                  Avg {item.average_delivery_time} delivery time
                </StyledText>
              </StyledView>
            </StyledPressable>
          )}
        />
      )}
    </StyledView>
  );
}
