import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

export default function ContactSupport() {
  const navigation = useNavigation();

  const handleCallSupport = () => {
    // Handle calling support logic here
  };

  return (
    <StyledView className="flex-1 bg-white p-5">
      

      {/* Title */}
      <StyledText className="text-2xl font-bold mb-4">Contact Support</StyledText>

      {/* Support Information */}
      <StyledText className="text-base text-gray-600 mb-6">
        If you have any issues or need assistance, feel free to reach out to our support team.
      </StyledText>

      {/* Phone Number */}
      <StyledView className="flex-row items-center mb-4">
        <Icon name="phone" size={20} color="#ff6f00" />
        <StyledText className="text-xl font-bold text-orange-500 ml-3">+251-123-456-789</StyledText>
      </StyledView>

      {/* Call Support Button */}
      <StyledPressable
        onPress={handleCallSupport}
        className="bg-orange-500 p-4 rounded-md items-center"
      >
        <StyledText className="text-white font-bold text-lg">Call Support</StyledText>
      </StyledPressable>
    </StyledView>
  );
}
