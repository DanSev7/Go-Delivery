import React, { useState, useEffect } from 'react';
import { View, Text, Button, Switch } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store'; // Import SecureStore

export default function HomeScreen() {
  const [origin, setOrigin] = useState(null); // User's current location
  const [branches, setBranches] = useState([]); // Store fetched branches
  const [route, setRoute] = useState(null); // Route from OSRM
  const [isActive, setIsActive] = useState(false); // Toggle button state
  const router = useRouter(); // Router for navigation

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  // Get user's current location once when the component mounts
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setOrigin({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${apiUrl}/branches`);
        
        // Convert latitude and longitude from strings to numbers, and filter invalid data
        const validBranches = response.data
          .filter(branch => branch.latitude && branch.longitude) // Ensure latitude and longitude exist
          .map(branch => ({
            ...branch,
            latitude: parseFloat(branch.latitude), // Convert to number
            longitude: parseFloat(branch.longitude), // Convert to number
          }))
          .filter(branch => !isNaN(branch.latitude) && !isNaN(branch.longitude)); // Filter out any NaN values
  
        setBranches(validBranches); // Set the valid branches data
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
  
    fetchBranches();
  }, []);
  

  // Fetch route from OSRM
  const fetchRoute = async (origin, destinationPoint) => {
    const url = `http://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destinationPoint.longitude},${destinationPoint.latitude}?geometries=geojson`;

    try {
      const response = await axios.get(url);
      const coordinates = response.data.routes[0].geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0],
      }));

      setRoute(coordinates); // Store the OSRM route
    } catch (error) {
      console.error("Error fetching route from OSRM:", error);
    }
  };

  // Handle toggle button
  const handleToggle = () => {
    setIsActive(prev => !prev);
  };

  // Handle destination selection
  const handleDestinationSelect = (destinationPoint) => {
    if (origin) {
      fetchRoute(origin, destinationPoint); // Fetch OSRM route
    }
  };

  if (!origin) {
    return <Text>Loading current location...</Text>; // Show loading text until location is fetched
  }

  return (
    <View className="flex-1">
      {/* Toggle button */}
      <View className="flex-row justify-between items-center p-4">
        <Text className="text-lg">Account Active</Text>
        <Switch
          value={isActive}
          onValueChange={handleToggle}
          thumbColor={isActive ? "#4CAF50" : "#FFC107"}
          trackColor={{ false: "#767577", true: "#81C784" }}
        />
      </View>

      {/* Map view */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Marker for Origin (Rider's location) */}
        {origin && (
          <Marker
            coordinate={origin}
            title="Your Location"
            anchor={{ x: 0.5, y: 0.5 }}
            pinColor='red'
          />
        )}

        {/* Markers for Branches (Fetched from Backend) */}
        {branches.map((branch, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: branch.latitude, longitude: branch.longitude }}
            title={branch.title}
            pinColor="#2261FF"
            onPress={() => handleDestinationSelect(branch)} // Select on marker press
          />
        ))}

        {/* Draw the Route using Polyline */}
        {route && (
          <Polyline
            coordinates={route}
            strokeWidth={3}
            strokeColor="hotpink"
          />
        )}
      </MapView>

      {/* Conditional button for Available Deliveries */}
      {isActive && (
        <View className="p-4">
          <Button
            title="Available Deliveries"
            onPress={() => {
              console.log("Passing Origin:", origin); // Log the origin for verification
              router.push({
                pathname: '/AvailableDeliveriesScreen',
                params: { origin }, // Pass the rider's location
              });
            }}
            color="#FF6C22" // Orange color
          />

        </View>
      )}
    </View>
  );
}
