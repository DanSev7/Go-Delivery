import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Feather from '@expo/vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import { styled } from 'nativewind';
import { useRouter } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store'; // Import SecureStore

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function ProfileScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();


  const handleOptionPress = (page) => {
    router.push(page);
  };

  const handleLogout = () => {
    setModalVisible(true);
  };

  const confirmLogout = async () => {
    setModalVisible(false);
    await SecureStore.deleteItemAsync('userToken'); // Remove token from SecureStorage
    await SecureStore.deleteItemAsync('userEmail');
    await SecureStore.deleteItemAsync('firstName');
    await SecureStore.deleteItemAsync('lastName');
    await SecureStore.deleteItemAsync('userId');
    await SecureStore.deleteItemAsync('phoneNumber');
    router.replace("/SignIn"); 
  };

  const cancelLogout = () => {
    setModalVisible(false);
  };

  const handleEditProfile = () => {
    router.push('EditProfile'); // Navigate to EditProfile page
  };

  return (
    <StyledView className="flex-1 bg-white p-4">
      {/* <StyledTouchableOpacity
        className="absolute right-6 top-6 flex flex-row border-2 border-orange-400 p-1 px-3 rounded-lg items-center justify-center"
        onPress={handleEditProfile}
      >
        <Feather name="edit" size={25} color="orange" />
        <StyledText className='flex flex-row font-pregular text-lg ml-2 text-orange-400'>Edit</StyledText>
      </StyledTouchableOpacity> */}

      <StyledView className="items-center mb-6 mt-10">
        <StyledText className="text-2xl font-bold mt-2">Profile Details</StyledText>
      </StyledView>

      <StyledView className="flex-1">
        {[
          { label: 'Change Password', icon: 'lock', page: 'ChangePassword' },
          { label: 'Terms and Conditions', icon: 'file-text', page: 'TermsAndConditions' },
          { label: 'Privacy Policy', icon: 'shield', page: 'PrivacyPolicy' },
          { label: 'Contact Support', icon: 'envelope', page: 'ContactSupport' },
          { label: 'FAQ', icon: 'question-circle', page: 'FAQ' },
          { label: 'About Us', icon: 'info-circle', page: 'AboutUs' },
          { label: 'Logout', icon: 'sign-out', action: handleLogout }
        ].map((item, index) => (
          <StyledTouchableOpacity
            key={index}
            className="flex-row items-center justify-between p-3 border-b border-gray-200"
            onPress={item.action ? item.action : () => handleOptionPress(item.page)}
          >
            <View className="flex-row items-center">
              <Icon name={item.icon} size={24} color="#333" />
              <StyledText className="ml-3 text-lg">{item.label}</StyledText>
            </View>
            <Feather name="chevron-right" size={24} color="black" />
          </StyledTouchableOpacity>
        ))}
      </StyledView>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
      >
        <StyledView className="flex-1 justify-center items-center bg-black/50">
          <StyledView className="bg-gray-50 p-4 rounded-2xl w-80">
            <StyledView className='items-center justify-center'>
              <Icon name='sign-out' size={40} color="black" />
              <StyledText className='font-psemibold text-xl'>Log Out</StyledText>
            </StyledView>
            <StyledText className="text-md text-center mt-4 font-pregular mb-4">Are you sure you want to logout?</StyledText>
            <StyledView className="flex-row justify-between">
              <StyledTouchableOpacity  
                className="border border-black-200 border-solid py-2 px-8 mr-2 rounded-full"
                onPress={cancelLogout}
              >
                <StyledText className="text-gray-800 font-pregular">Cancel</StyledText>
              </StyledTouchableOpacity>
              <StyledTouchableOpacity 
                className={`bg-red-500 py-2 px-8 rounded-full ${isLoading ? 'opacity-60' : 'opacity-80'}`}
                onPress={confirmLogout}
              >
                <StyledText className="text-black font-pregular active:text-black">Logout</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledView>
      </Modal>
    </StyledView>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    borderWidth: 4,
    borderColor: '#ff6f00',
  },
});
