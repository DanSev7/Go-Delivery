import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function FAQ() {
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Go back to the previous screen
  };

  return (
    <StyledView className="flex-1 bg-white p-4">
      <StyledTouchableOpacity onPress={handleBack} className="flex-row items-center mb-4">
        <Feather name="arrow-left" size={24} color="black" />
        <StyledText className="text-lg font-pregular ml-2">Back</StyledText>
      </StyledTouchableOpacity>

      <StyledView className="mb-4">
        <StyledText className="text-2xl font-bold">FAQ</StyledText>
      </StyledView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <StyledText className="text-lg font-bold mb-2">Q1: How do I reset my password?</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          To reset your password, go to the login screen and click on "Forgot Password." Follow the instructions to reset your password.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">Q2: How can I contact support?</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          You can contact support by navigating to the "Contact Support" page within the app and submitting your message.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">Q3: What should I do if I encounter an error?</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          If you encounter an error, please try restarting the app. If the issue persists, contact support for assistance.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">Q4: How can I update my profile information?</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          To update your profile information, go to the "Profile" screen and select "Edit Profile" to make changes.
        </StyledText>
      </ScrollView>
    </StyledView>
  );
}
