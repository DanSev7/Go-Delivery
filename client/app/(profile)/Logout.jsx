import {React} from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

export default function Logout() {
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => navigation.navigate("(auth)"), // Directs to the (auth) tabs
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <StyledView className="flex-1 justify-center items-center bg-white p-4">
      <StyledPressable
        onPress={handleLogout}
        className="bg-red-600 p-4 rounded-md items-center"
      >
        <StyledText className="text-white font-bold text-lg">Logout</StyledText>
      </StyledPressable>
    </StyledView>
  );
}
