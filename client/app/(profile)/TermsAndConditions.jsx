import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function TermsAndConditions() {
  return (
    <StyledView className="flex-1 bg-white  ">

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} className='p-5 mb-4'>
      <StyledText className="text-2xl font-bold mb-4">Terms and Conditions</StyledText>
        <StyledText className="text-lg font-semibold mb-2">1. Introduction</StyledText>
        <StyledText className="text-gray-600 mb-4">
          Welcome to our online food delivery system. By using our service, you agree to be bound by the following terms and conditions. Please read them carefully.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">2. Account Registration</StyledText>
        <StyledText className="text-gray-600 mb-4">
          To access our services, you must register for an account. You are responsible for maintaining the confidentiality of your account details and for any activities under your account.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">3. Orders and Payments</StyledText>
        <StyledText className="text-gray-600 mb-4">
          Orders placed through our platform are subject to acceptance. Payments must be made through our secure payment gateway. All transactions are final and non-refundable.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">4. Delivery</StyledText>
        <StyledText className="text-gray-600 mb-4">
          We strive to deliver your order within the estimated time. However, delays may occur due to unforeseen circumstances. We are not liable for any delays in delivery.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">5. Cancellation and Refunds</StyledText>
        <StyledText className="text-gray-600 mb-4">
          Orders can be canceled before they are processed. Refunds are issued at our discretion and may take several business days to process.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">6. User Conduct</StyledText>
        <StyledText className="text-gray-600 mb-4">
          You agree to use our service for lawful purposes only. Any misuse of our platform may result in the termination of your account.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">7. Limitation of Liability</StyledText>
        <StyledText className="text-gray-600 mb-4">
          Our liability is limited to the maximum extent permitted by law. We are not responsible for any indirect, incidental, or consequential damages arising from your use of our service.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">8. Changes to Terms</StyledText>
        <StyledText className="text-gray-600 mb-4">
          We reserve the right to modify these terms at any time. Continued use of our service after any changes constitutes your acceptance of the new terms.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">9. Contact Us</StyledText>
        <StyledText className="text-gray-600 mb-12">
          If you have any questions or concerns regarding these terms, please contact our support team. 
        </StyledText>
      </ScrollView>
    </StyledView>
  );
}
