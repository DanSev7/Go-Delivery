import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios'; // Make sure to install axios
import * as SecureStore from 'expo-secure-store';


const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;


  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirmation do not match.");
      return;
    }

    try {
      const userId = await SecureStore.getItemAsync('userId', userId);
      console.log("user Id when password change : ", userId);
      
      const response = await axios.post(`${apiUrl}/users/${userId}/change-password`, {
        previousPassword: oldPassword,
        newPassword: newPassword,
      });

      Alert.alert("Success", response.data.message);
      navigation.goBack(); // Navigate back after successful change
    } catch (error) {
      console.error("Password change error: ", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <StyledView className="flex-1 bg-white p-4">
      {/* Back Arrow */}
      <StyledTouchableOpacity onPress={() => navigation.goBack()} className="mt-8 mb-10">
        <FontAwesome6 name="arrow-left-long" size={24} color="black" />
      </StyledTouchableOpacity>

      {/* Title and Description */}
      <StyledText className="text-2xl font-psemibold mb-2">Change Password</StyledText>
      <StyledText className="text-gray-600 font-pmedium mb-8">
        First, enter your previous password and then create a strong one for your account.
      </StyledText>

      {/* Text Fields with Eye Icon */}
      <View className="border border-gray-200 w-full h-14 px-4 bg-white-100 rounded-lg focus:border-secondary items-center flex-row mb-8">
        <StyledTextInput
          placeholder="Previous Password"
          secureTextEntry={!showOldPassword}
          className="flex-1 text-black font-pmedium"
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
          <Ionicons name={showOldPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <View className="border border-gray-200 w-full h-14 px-4 bg-white-100 rounded-lg focus:border-secondary items-center flex-row mb-8">
        <StyledTextInput
          placeholder="New Password"
          secureTextEntry={!showNewPassword}
          className="flex-1 text-black font-pmedium"
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
          <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <View className="border border-gray-200 w-full h-14 px-4 bg-white-100 rounded-lg focus:border-secondary items-center flex-row mb-8">
        <StyledTextInput
          placeholder="Confirm Password"
          secureTextEntry={!showConfirmPassword}
          className="flex-1 text-black font-pmedium"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Change Password Button */}
      <StyledTouchableOpacity
        onPress={handleChangePassword}
        className="bg-orange-500 p-4 mt-60 rounded-full items-center"
      >
        <StyledText className="text-white font-bold text-xl">Change Password</StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
}