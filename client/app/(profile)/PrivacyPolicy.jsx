import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function PrivacyPolicy() {
  return (
    <StyledView className="flex-1 bg-white ">

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} className='p-5 mb-4'>
      <StyledText className="text-2xl font-bold mb-4">Privacy Policy</StyledText>
        <StyledText className="text-lg font-semibold mb-2">1. Introduction</StyledText>
        <StyledText className="text-gray-600 mb-4">
          This Privacy Policy outlines how we collect, use, and protect your personal information when you use our online food delivery system. By using our service, you agree to the collection and use of your information in accordance with this policy.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">2. Information We Collect</StyledText>
        <StyledText className="text-gray-600 mb-4">
          We may collect various types of information, including:
        </StyledText>
        <StyledText className="text-gray-600 mb-4">
          - Personal Information: Such as your name, email address, phone number, and delivery address.
        </StyledText>
        <StyledText className="text-gray-600 mb-4">
          - Payment Information: Including credit card details, which are processed securely by our payment gateway.
        </StyledText>
        <StyledText className="text-gray-600 mb-4">
          - Usage Data: Information about how you use our service, including your IP address, browser type, and device information.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">3. How We Use Your Information</StyledText>
        <StyledText className="text-gray-600 mb-4">
          We use the information we collect for the following purposes:
        </StyledText>
        <StyledText className="text-gray-600 mb-4">
          - To process and fulfill your orders.
        </StyledText>
        <StyledText className="text-gray-600 mb-4">
          - To communicate with you about your account or orders.
        </StyledText>
        <StyledText className="text-gray-600 mb-4">
          - To improve our service and provide a better user experience.
        </StyledText>
        <StyledText className="text-gray-600 mb-4">
          - To detect and prevent fraud and other security issues.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">4. How We Protect Your Information</StyledText>
        <StyledText className="text-gray-600 mb-4">
          We implement various security measures to protect your personal information. These include encryption, secure servers, and restricted access to your information.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">5. Sharing Your Information</StyledText>
        <StyledText className="text-gray-600 mb-4">
          We do not sell, trade, or otherwise transfer your personal information to third parties, except:
        </StyledText>
        <StyledText className="text-gray-600 mb-4">
          - To trusted service providers who assist us in operating our service, as long as they agree to keep your information confidential.
        </StyledText>
        <StyledText className="text-gray-600 mb-4">
          - When required by law or to protect our rights, property, or safety.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">6. Cookies</StyledText>
        <StyledText className="text-gray-600 mb-4">
          We use cookies to enhance your experience on our platform. Cookies are small files that a site or its service provider transfers to your device's storage through your web browser that enables the site’s or service provider’s systems to recognize your browser and capture certain information.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">7. Your Choices</StyledText>
        <StyledText className="text-gray-600 mb-4">
          You can choose to disable cookies through your browser settings, and you can opt-out of receiving marketing communications from us at any time.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">8. Changes to This Privacy Policy</StyledText>
        <StyledText className="text-gray-600 mb-4">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page, and your continued use of our service after any changes have been made will constitute your acceptance of the new policy.
        </StyledText>

        <StyledText className="text-lg font-semibold mb-2">9. Contact Us</StyledText>
        <StyledText className="text-gray-600 mb-6">
          If you have any questions or concerns about this Privacy Policy, please contact us at danielayele077@gmail.com & 0940685349.
        </StyledText>
      </ScrollView>
    </StyledView>
  );
}
