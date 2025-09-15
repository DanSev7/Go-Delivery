import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import CustomButton from '../../components/CustomeButton';
import api, { endpoints } from '../../config/api';

// Styled components using nativewind
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledImage = styled(Image);

const ReviewScreen = () => {
  const { itemId, itemName, itemImage, restaurant_id } = useLocalSearchParams(); // itemId, itemName, and image passed via navigation
  const [rating, setRating] = useState(0); // Star rating state
  const [feedback, setFeedback] = useState(''); // Feedback text state
  const router = useRouter();

  // Handle rating change
  const handleRating = (star) => setRating(star);

  // API call to submit the review
  const submitReview = async () => {
    // Perform form validation
    if (rating === 0 || feedback.trim() === '') {
      Alert.alert('Error', 'Please provide a rating and feedback.');
      return;
    }

    try {
      // Make a POST request to submit the review using centralized API
      const response = await api.post(endpoints.reviews.create, {
        menu_item_id: itemId, // The menu item or restaurant ID
        rating, // Rating from customer
        review_text: feedback, // Feedback text (match backend field name)
        restaurant_id,
        // customer_id will be extracted from token in backend
      });

      // Handle response if successful
      if (response.status === 201) {
        Alert.alert('Success', 'Review submitted successfully!');
        router.back(); // Navigate back to the previous screen
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while submitting the review.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <StyledView className="flex-1 p-4">
      
      {/* Item Image and Name */}
      <StyledView className="flex-row items-center mb-10">
        <StyledImage
          source={{ uri: `data:image/jpeg;base64,${itemImage}` }}
          className="w-16 h-16 rounded-lg mr-4"
        />
        <StyledText className="text-lg font-bold">{itemName}</StyledText>
      </StyledView>

      {/* Star Rating */}
      <StyledText className="text-lg font-semibold mb-2">Star Rating</StyledText>
      <StyledView className="flex-row mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={32}
            color={star <= rating ? '#ffd500' : '#C0C0C0'}
            onPress={() => handleRating(star)}
          />
        ))}
      </StyledView>

      {/* Feedback Section */}
      <StyledText className="text-lg font-semibold mb-2">Feedback</StyledText>
      <StyledTextInput
        multiline
        value={feedback}
        onChangeText={setFeedback}
        placeholder="Write your feedback..."
        className="border border-gray-400 rounded-lg p-2 h-32"
        textAlignVertical="top"  // This aligns the text at the top
      />

      {/* Submit Button */}
      <StyledView className="flex-1 justify-center items-center mt-40">
        <CustomButton
          title="Submit Review"
          handlePress={submitReview}  // Trigger the API call when submitting the review
          containerStyle="w-[90%] mt-7"
        />
      </StyledView>
    </StyledView>
  );
};

export default ReviewScreen;
