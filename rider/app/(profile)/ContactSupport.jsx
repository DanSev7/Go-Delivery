import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function ContactSupportScreen() {
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Go back to the previous screen
  };

  const handleSubmit = () => {
    if (message.trim()) {
      Alert.alert('Support Request', 'Your message has been sent to support!', [{ text: 'OK' }]);
      setMessage(''); // Clear the message input
    } else {
      Alert.alert('Error', 'Please enter a message before submitting.');
    }
  };

  return (
    <StyledView className="flex-1 bg-white p-4">
      <StyledTouchableOpacity onPress={handleBack} className="flex-row items-center mb-4">
        <Feather name="arrow-left" size={24} color="black" />
        <StyledText className="text-lg font-pregular ml-2">Back</StyledText>
      </StyledTouchableOpacity>

      <StyledView className="mb-4">
        <StyledText className="text-2xl font-bold">Contact Support</StyledText>
      </StyledView>

      <StyledText className="text-md font-pregular mb-4">
        If you have any questions or need assistance, please write your message below and we will get back to you as soon as possible.
      </StyledText>

      <StyledTextInput
        multiline
        numberOfLines={6}
        value={message}
        onChangeText={setMessage}
        placeholder="Enter your message here..."
        className="border border-gray-300 p-3 rounded-lg mb-4"
      />

      <StyledTouchableOpacity
        onPress={handleSubmit}
        className="bg-blue-500 py-2 px-6 rounded-full"
      >
        <StyledText className="text-white text-lg font-pregular">Send Message</StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
}
