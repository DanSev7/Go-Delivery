import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function TermsAndConditions() {
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
        <StyledText className="text-2xl font-bold">Terms and Conditions</StyledText>
      </StyledView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <StyledText className="text-md font-pregular mb-4">
          Welcome to our Rider Application. Before you use our services, please take a moment to read and understand our terms and conditions.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">1. Acceptance of Terms</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          By accessing and using our application, you agree to be bound by these terms and conditions. If you do not agree to any part of the terms, you should not use the application.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">2. Rider Responsibilities</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          As a rider, you are responsible for the proper and timely delivery of orders. You must ensure that you have valid documentation, follow traffic regulations, and provide excellent customer service.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">3. Account Security</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          You are responsible for maintaining the confidentiality of your account credentials. You should not share your account information with others, and you are responsible for any activities that occur under your account.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">4. Payments and Fees</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          You will be compensated for deliveries based on the agreed-upon terms. Fees may be deducted from your earnings for various reasons, such as cancellations or non-compliance with delivery protocols.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">5. Changes to Terms</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          We reserve the right to modify or update these terms at any time. It is your responsibility to review the terms regularly. Continued use of the app following any changes indicates your acceptance of the revised terms.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">6. Termination</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          We reserve the right to terminate your access to the application at any time if you breach any of these terms or for any other reason, with or without notice.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">7. Governing Law</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          These terms and conditions are governed by and construed in accordance with the laws of [Your Country]. Any disputes arising from these terms will be subject to the jurisdiction of the courts in [Your City].
        </StyledText>

        <StyledText className="text-md font-pregular mb-10">
          Thank you for using our application. We hope you have a great experience as a rider!
        </StyledText>
      </ScrollView>
    </StyledView>
  );
}
