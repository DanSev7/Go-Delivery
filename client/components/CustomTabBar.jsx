import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeScreen from '../app/(tabs)/HomeScreen';
import ProfileScreen from '../app/(tabs)/ProfileScreen';
import OrderScreen from '../app/(tabs)/OrderScreen';

const Tab = createBottomTabNavigator();
import { styled } from 'nativewind';

const StyledView = styled(View);

export default function CustomTabBar() {
  return (
    <StyledView className="pt-2 pb-4 bg-white border-t border-gray-300">
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'ProfileScreen') {
              iconName = 'user';
            } else if (route.name === 'OrderScreen') {
              iconName = 'list';
            }

            return <Icon name={iconName} size={size} color={focused ? 'orange' : 'gray'} />;
          },
          tabBarActiveTintColor: 'orange',
          tabBarInactiveTintColor: 'gray',
          headerShown: false, // Hide the header if you don't need it
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="OrderScreen" component={OrderScreen} />
        <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
      </Tab.Navigator>
    </StyledView>
  );
}
