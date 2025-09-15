
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import OrderScreen from './OrderScreen';



const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
        <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
                iconName = 'home';
            } else if (route.name === 'Profile') {
                iconName = 'user';
            } else if (route.name === 'Orders') {
                iconName = 'list';
            }

            return <Icon name={iconName} size={30} color={focused ? 'orange' : 'gray'} />;
            },
            tabBarActiveTintColor: 'orange',
            tabBarInactiveTintColor: 'gray',
            headerShown: false, // Hide the header if you don't need it
            tabBarStyle: {
                height: 60, // Increase the height of the tab bar
                paddingBottom: 6, // Add some padding to the bottom
                borderTopWidth: 1,
              },
        })}
        >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Orders" component={OrderScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
  );
}
