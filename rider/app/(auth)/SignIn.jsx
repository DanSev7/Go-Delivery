import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomeButton from '../../components/CustomeButton';
import { Link, useRouter } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing token
import * as SecureStore from 'expo-secure-store'; // Import SecureStore


const SignIn = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  console.log("ApiUrl : ", apiUrl);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/users/login`, {
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
      setIsSubmitting(false);

      if (response.ok) {
        // Save the token in AsyncStorage
        // await AsyncStorage.setItem('token', data.token);
        const userId = String(data.user.user_id);
        console.log("User Id is:", data.user.user_id);
        await SecureStore.setItemAsync('token', data.token);
        await SecureStore.setItemAsync('riderId', userId);
        console.log("Rider Id : ", userId)

        // Redirect to HomeScreen
        router.push('/HomeScreen');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center p-4 bg-white">
      <ScrollView>
        <View className="w-full justify-center min-h-[87vh] px-4 my-6">
            <Text className="text-2xl font-bold mb-8 text-center">
                Log in to <Text className="text-secondary-200">GO Delivery</Text>
            </Text>

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-5"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-5"
            secureTextEntry // To hide the password
          />

          <CustomeButton
            title="Sign In"
            handlePress={submit}
            containerStyle="mt-7"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link href="/sign-up" className="text-lg font-psemibold text-secondary">
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
