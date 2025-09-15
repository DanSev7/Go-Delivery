import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function AboutUs() {
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
        <StyledText className="text-2xl font-bold">About Us</StyledText>
      </StyledView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <StyledText className="text-md font-pregular mb-4">
          Welcome to our application! We are committed to providing the best service to our users. Our team is dedicated to ensuring a seamless experience in managing your orders and deliveries.
        </StyledText>

        <StyledText className="text-md font-pregular mb-4">
          Our mission is to connect customers with local restaurants and reliable delivery riders to make your dining experience enjoyable and efficient. We strive to offer an intuitive platform and excellent support to meet your needs.
        </StyledText>

        <StyledText className="text-md font-pregular mb-4">
          If you have any questions or feedback, please feel free to reach out to our support team through the "Contact Support" page. We value your input and are here to assist you.
        </StyledText>
      </ScrollView>
    </StyledView>
  );
}
