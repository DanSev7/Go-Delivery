import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

export default function AboutUs() {
  return (
    <StyledScrollView className="flex-1 bg-white p-5">
      {/* <StyledView className="items-center mb-6">
        <Image
          source={}
          className="w-40 h-40"
          resizeMode="contain"
        />
      </StyledView> */}

      <StyledText className="text-3xl font-bold text-center mb-4">About Us</StyledText>

      <StyledText className="text-base text-gray-800 mb-4">
        Welcome to GO Delivery, your number one source for all things food delivery. We're dedicated to providing you the best of online food ordering, with a focus on dependability, customer service, and uniqueness.
      </StyledText>

      <StyledText className="text-base text-gray-800 mb-4">
        Founded in 2024, GO Delivery has come a long way from its beginnings in Gondar. When we first started out, our passion for Online Food Delivery System drove us to start our own business.
      </StyledText>

      <StyledText className="text-base text-gray-800 mb-4">
        We now serve customers all over Gondar, and are thrilled that we're able to turn our passion into our own website.
      </StyledText>

      <StyledText className="text-base text-gray-800 mb-4">
        We hope you enjoy our service as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
      </StyledText>

      <StyledText className="text-base text-gray-800 mb-4">
        Sincerely,
      </StyledText>
      <StyledText className="text-base text-gray-800 mb-4">
        Daniel Ayele, Founder
      </StyledText>
    </StyledScrollView>
  );
}
