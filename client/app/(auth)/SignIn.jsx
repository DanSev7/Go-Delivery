import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { styled } from 'nativewind';
import * as SecureStore from 'expo-secure-store'; // Import SecureStore
import CustomButton from '../../components/CustomeButton';
import FormField from '../../components/FormField';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function SignIn() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/users/login`, { // it returns token, user object(user_id, name, email,password ...)
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();
      console.log("Data received : ", data);
      const fullName = data.user.name;
      console.log("Full Name on the login screen : ", fullName);
      if (response.ok) {
        // console.log("User Name is : ", form.name);
        // console.log("Email is also : ", data.email);
        const [first_name, last_name] = fullName.split(' ');
        // console.log("First Name  AND Last Name Is : ", first_name, last_name);
        const userId = String(data.user.user_id);
        console.log("User Id is:", data.user.user_id);
        
        // Store the JWT token and user info securely
        await SecureStore.setItemAsync('userToken', data.token);
        await SecureStore.setItemAsync('userEmail', form.email);
        await SecureStore.setItemAsync('firstName', first_name );
        await SecureStore.setItemAsync('lastName', last_name );
        await SecureStore.setItemAsync('userId', userId);
        await SecureStore.setItemAsync('phoneNumber', data.user.phone_number)
        

        // Navigate to the main screen
        router.push('/HomeScreen');
      } else {
        console.log('Sign-in failed:', data.error);
      }
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledView className="flex-1 justify-center p-4 bg-white">
      <StyledText className="text-2xl font-bold mb-8 text-center">
        Log in to <StyledText className="text-secondary-200">GO Delivery</StyledText>
      </StyledText>

      <FormField
        title="email"
        value={form.email}
        handleChangeText={(e) => setForm({ ...form, email: e })}
        otherStyles="mt-5"
        // keyboardType="default"
      />

      <FormField
        title="Password"
        value={form.password}
        handleChangeText={(e) => setForm({ ...form, password: e })}
        otherStyles="mt-5"
      />

      <CustomButton
        title="Sign In"
        handlePress={handleSignIn}
        containerStyle="mt-7"
        isLoading={isSubmitting}
      />

      <View className="justify-center pt-5 flex-row gap-2">
        <Text className="text-lg text-gray-100">
          Don't have an account?
        </Text>
        <Link href="/SignUp" className="text-lg text-secondary">
          Sign Up
        </Link>
      </View>
    </StyledView>
  );
}
