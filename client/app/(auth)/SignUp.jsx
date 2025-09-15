import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import * as SecureStore from 'expo-secure-store'; // Import SecureStore
import { Link, useRouter } from 'expo-router';
import CustomButton from '../../components/CustomeButton';
import FormField from '../../components/FormField';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function SignUp() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
  });
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const [isSubmitting, setisSubmitting] = useState(false);

  const router = useRouter();

  const handleSignUp = async () => {
    setisSubmitting(true);
    try {
      const role = 'customer';
      const response = await fetch(`${apiUrl}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: role,
          phone_number: form.phone_number,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Store the JWT token or any other string data securely
        // await SecureStore.setItemAsync('userToken', data.token); // Assuming `data.token` is the JWT token
        // await SecureStore.setItemAsync('userEmail', form.email);
  
        // Navigate to the sign-in page or home screen
        router.push('/SignIn'); // Navigate to sign-in page
      } else {
        console.log('Sign-up failed:', data);
      }
    } catch (error) {
      console.error('Error signing up:', error);
    } finally {
      setisSubmitting(false);
    }
  };
  

  return (
    <StyledView className="flex-1 justify-center p-4 bg-white">
      <StyledText className="text-2xl font-bold mb-8 text-center">Sign Up</StyledText>

      <FormField
        title="Full Name"
        value={form.name}
        handleChangeText={(e) => setForm({ ...form, name: e })}
        otherStyles="mt-5"
      />

      <FormField
        title="Email"
        value={form.email}
        handleChangeText={(e) => setForm({ ...form, email: e })}
        otherStyles="mt-5"
        keyboardType="email-address"
      />

      <FormField
        title="Phone Number"
        value={form.phone_number}
        handleChangeText={(e) => setForm({ ...form, phone_number: e })}
        otherStyles="mt-5"
        keyboardType="email-address"
      />

      <FormField
        title="Password"
        value={form.password}
        handleChangeText={(e) => setForm({ ...form, password: e })}
        otherStyles="mt-5"
      />

      <CustomButton
        title="Sign Up"
        handlePress={handleSignUp}
        containerStyle="mt-7"
        isLoading={isSubmitting}
      />

      <View className="justify-center pt-5 flex-row gap-2">
        <Text className="text-lg text-gray-100">
          Have an account already?
        </Text>
        <Link href="/SignIn" className="text-lg text-secondary">
          Sign In
        </Link>
      </View>
    </StyledView>
  );
}
