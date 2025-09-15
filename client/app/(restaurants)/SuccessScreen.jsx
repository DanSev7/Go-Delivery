import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


export default function SuccessScreen() {
  const router = useRouter();
  

  // Animation setup for scaling the checkmark icon
  const scaleValue = new Animated.Value(0);

  useEffect(() => {
    // Start the scaling animation for the checkmark
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 2,
      useNativeDriver: true,
    }).start();

    // Set a timeout to navigate to HomeScreen after 3 seconds
    const timer = setTimeout(() => {
      router.push('/OrderScreen');
    }, 4000); // 3000 milliseconds = 3 seconds

    // Cleanup timeout on component unmount
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Animated Checkmark inside a green circle */}
      <Animated.View style={[styles.checkmarkContainer, { transform: [{ scale: scaleValue }] }]}>
        <MaterialIcons name="check" size={50} color="white" />
      </Animated.View>
      {/* Success message */}
      <Text style={styles.successText}>Payment Successfully Sent!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White background for the screen
  },
  checkmarkContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'green', // Green background color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green', // Green text color for success message
  },
});
