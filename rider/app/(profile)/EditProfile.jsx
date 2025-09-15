import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useRouter } from 'expo-router';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function EditProfile() {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const router = useRouter();

  const handleSave = () => {
    // Implement save functionality here
    router.back();
  };

  return (
    <StyledView className="flex-1 bg-white p-4">
      <StyledText className="text-2xl font-bold mb-6">Edit Profile</StyledText>

      <StyledView className="mb-4">
        <StyledText className="text-lg font-semibold mb-2">Full Name</StyledText>
        <StyledTextInput
          className="border border-gray-300 rounded-lg px-4 py-2"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
        />
      </StyledView>

      <StyledView className="mb-4">
        <StyledText className="text-lg font-semibold mb-2">Gender</StyledText>
        <StyledTextInput
          className="border border-gray-300 rounded-lg px-4 py-2"
          value={gender}
          onChangeText={setGender}
          placeholder="Enter your gender"
        />
      </StyledView>

      <StyledView className="mb-4">
        <StyledText className="text-lg font-semibold mb-2">Date of Birth</StyledText>
        <StyledTextInput
          className="border border-gray-300 rounded-lg px-4 py-2"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
        />
      </StyledView>

      <StyledTouchableOpacity
        className="bg-orange-500 rounded-full py-3 mt-4 items-center"
        onPress={handleSave}
      >
        <StyledText className="text-white text-lg font-semibold">Save</StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
}
