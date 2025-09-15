// components/Popup.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledModal = styled(Modal);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const Popup = ({ visible, type, message, onClose }) => {
  return (
    <StyledModal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <StyledView className="flex-1 justify-center items-center bg-gray-800 bg-opacity-50">
        <StyledView
          className={`w-80 p-6 rounded-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
        >
          <StyledText className="text-white text-center text-lg">{message}</StyledText>
          <StyledTouchableOpacity
            className="mt-4 bg-white p-2 rounded-lg"
            onPress={onClose}
          >
            <StyledText className="text-center text-gray-800">Close</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledModal>
  );
};
export default Popup;
