import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function PrivacyPolicy() {
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
        <StyledText className="text-2xl font-bold">Privacy Policy</StyledText>
      </StyledView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <StyledText className="text-md font-pregular mb-4">
          Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our rider application. Please read this policy carefully.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">1. Information We Collect</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          We may collect personal information such as your name, email address, phone number, and location data. We may also collect non-personal information about your device, browsing actions, and usage patterns.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">2. How We Use Your Information</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          We use the information we collect to provide and improve the application, manage your account, process transactions, and communicate with you. We may also use the data for marketing and promotional purposes with your consent.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">3. Sharing Your Information</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          We may share your information with third-party service providers for operational purposes. We will not sell or rent your personal data to third parties without your consent, except where required by law.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">4. Data Security</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          We implement appropriate technical and organizational measures to protect your data. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">5. Your Privacy Choices</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          You may update or delete your account information by accessing your profile settings. You may also contact us to request the deletion of your personal data from our systems.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">6. Changes to This Policy</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          We may update this Privacy Policy from time to time. Any changes will be effective immediately upon posting the revised policy within the application. Your continued use of the app indicates acceptance of the updated terms.
        </StyledText>

        <StyledText className="text-lg font-bold mb-2">7. Contact Us</StyledText>
        <StyledText className="text-md font-pregular mb-4">
          If you have any questions or concerns about this Privacy Policy or the practices of our application, please contact us at privacy@riderapp.com.
        </StyledText>

        <StyledText className="text-md font-pregular mb-4">
          By using our application, you agree to the collection and use of your information as described in this Privacy Policy.
        </StyledText>
      </ScrollView>
    </StyledView>
  );
}
