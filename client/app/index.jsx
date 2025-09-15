import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import CustomButton from '../components/CustomeButton';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

export default function GetStarted() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/SignIn'); // Navigate to the SignIn page
  };

  return (
    <StyledView className="flex-1 justify-center items-center bg-white">
      <StyledText className="text-2xl font-bold mb-8">Welcome to Food Delivery App</StyledText>
      <CustomButton
            title="Get Started"
            handlePress={handleGetStarted}
            containerStyle="w-[90%] mt-7"
          />
    </StyledView>
  );
}
