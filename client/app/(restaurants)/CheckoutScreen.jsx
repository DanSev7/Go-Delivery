import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Image, Pressable, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { styled } from 'nativewind';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledTextInput = styled(TextInput);

export default function CheckoutScreen() {
  const { cartItems: rawCartItems, totalAmount } = useLocalSearchParams();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const router = useRouter();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const cartItems = rawCartItems ? JSON.parse(rawCartItems) : {};

  useEffect(() => {
    const fetchUserDetails = async () => {
      const firstName = await SecureStore.getItemAsync('firstName');
      const lastName = await SecureStore.getItemAsync('lastName');
      const email = await SecureStore.getItemAsync('userEmail');
      const userId = await SecureStore.getItemAsync('userId');
      const restaurantId = await SecureStore.getItemAsync('restaurantId');
      const token = await SecureStore.getItemAsync('userToken');
      console.log("Token : ", token);
      console.log("User Id: " + userId, "Restaurant Id: " + restaurantId);
      console.log("First Name : ", firstName, "Last Name : ", lastName, "Email : ", email);

      setUserDetails({ first_name: firstName, last_name: lastName, email, userId, restaurantId, token: token });
    };

    fetchUserDetails();
  }, []);

  const handlePlaceOrder = async () => {
    try {
      const response = await axios.post(`${apiUrl}/chapa/initiate-payment`, {
        amount: totalAmount,
        currency: 'ETB',
        email: userDetails.email,
        first_name: userDetails.first_name,
        last_name: userDetails.last_name,
        // delivery_address: deliveryAddress,
      });

      if (response.status === 200) {
        const { checkout_url } = response.data;
        console.log("Response data : ", checkout_url);
        if (checkout_url) {
          setCheckoutUrl(checkout_url);
        }
      } else {
        Alert.alert('Error', 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error placing order: ', error.message);
      Alert.alert('Error', 'Failed to place the order');
    }
  };

  const renderItem = ({ item }) => (
    <StyledView className="flex-row items-center border-b border-gray-200 rounded-lg p-3">
      <Image source={{ uri: `data:image/jpeg;base64,${item.image}` }} className="w-24 h-24 rounded-lg mr-3" />
      <StyledText className="text-lg font-bold flex-1">{item.name}</StyledText>
      <StyledText className="text-lg text-gray-600">x{item.quantity}</StyledText>
      <StyledText className="text-lg font-bold ml-4">{item.price * item.quantity} Br</StyledText>
    </StyledView>
  );

  const handleWebViewNavigationStateChange = (newNavState) => {
    const { url } = newNavState;
    console.log("New Nav State : ", url);

    if (url.includes('success')) {
      setCheckoutUrl(null);
      // Create Order and OrderItems here
      createOrder();
      router.push('/SuccessScreen');
    } else if (url.includes('cancel')) {
      Alert.alert('Payment Canceled', 'Your payment was canceled.');
      setCheckoutUrl(null);
    }
  };
  // const deliveryFee = Int(2);
  const grandTotal = totalAmount ;
  console.log("Grand total cost is : ", grandTotal);

// const createOrder = async () => {
//   try {
//     const orderStatus = 'pending'; // Default order status
//     const paymentStatus = 'pending'; // Default payment status
//     const orderTime = new Date().toISOString(); // Current time as order time

//     // 1. Create Order with all required fields
//     console.log("User Id inside create Order is: ", userDetails.userId);
//     console.log("Restaurant Id on Order is : ", userDetails.restaurantId);
//     const token = await SecureStore.getItemAsync('userToken');

//     const {restaurantId} = userDetails;
//     const orderResponse = await axios.post(`${apiUrl}/orders/${restaurantId}`
//       , {
//         headers: {
//           Authorization: `${token}`,
//         },
//       },
//       {
//       // customer_id: userDetails.userId, // Replace with actual user ID
//       // restaurantId: userDetails.restaurantId, // Replace with actual restaurant ID
//       totalPrice: totalAmount,
//       orderStatus: orderStatus,
//       paymentStatus: paymentStatus,
//       // items: cartItems, // Pass the cart items as JSONB
//       // order_time: orderTime,
//       delivery_address: deliveryAddress,
//       deliveryFee: 25,
//     });

//     const orderID = orderResponse.data.order_id; // Assuming your API returns the new order ID
//     console.log("Order ID : ", orderID);

//     // 2. Create OrderItems for each item in the cart
//     for (const item of Object.values(cartItems)) {
//       console.log("MENU ITEM ID : ", item.menu_item_id);
//       await axios.post(`${apiUrl}/order-items/${orderID}/${item.menu_item_id}`, {
//         headers: {
//           Authorization: `${token}`,
//         },
//       },{
//         // order_id: orderID,
//         // food_id: item.id,
//         quantity: item.quantity,
//         price: item.price,
//         // image: item.image, // Assuming you're storing the image in base64 or a URL
//       });
//     }

//     console.log("Order and order items created successfully!");
//   } catch (error) {
//     console.error('Error creating order:', error.message);
//     Alert.alert('Error', 'Failed to create the order');
//   }
// };
const createOrder = async () => {
  try {
    const orderStatus = 'pending'; 
    const paymentStatus = 'pending'; 
    const orderTime = new Date().toISOString(); 

    const token = await userDetails.token;  // Ensure you get the token properly
    console.log("Token: ", token);

    // 1. Create Order with all required fields
    const orderResponse = await axios.post(
      `${apiUrl}/orders/${userDetails.restaurantId}`,
      {
        // Data payload
        totalPrice: totalAmount,
        orderStatus: orderStatus,
        paymentStatus: paymentStatus,
        // items: cartItems, // Pass the cart items as JSONB
        // order_time: orderTime,
        deliveryAddress: deliveryAddress,
        deliveryFee: 25,
      },
      {
        headers: {
          Authorization: `${token}`,  // Fix the token header format
        },
      }
    );

    const orderID = orderResponse.data.order_id; 

    // 2. Create OrderItems for each item in the cart
    for (const item of cartItems) { // Assuming cartItems is an array
      await axios.post(
        `${apiUrl}/order-items/${orderID}/${item.menu_item_id}`,
        {
          // Data payload for order items
          quantity: item.quantity,
          price: item.price,
          // image: item.image, // Include image if needed
        },
        {
          headers: {
            Authorization: `${token}`,  // Fix the token header format
          },
        }
      );
    }

    console.log("Order and order items created successfully!");
  } catch (error) {
    console.error('Error creating order:', error.message);
    Alert.alert('Error', 'Failed to create the order. Please try again.');
  }
};

  if (checkoutUrl) {
    return (
      <WebView
        source={{ uri: checkoutUrl }}
        style={{ flex: 1 }}
        onNavigationStateChange={handleWebViewNavigationStateChange}
      />
    );
  }

  return (
    <StyledView className="flex-1 bg-white p-4">
      <StyledPressable onPress={() => router.back()} className="mb-4 mt-4">
        <MaterialIcons name="arrow-back" size={30} color="black" />
      </StyledPressable>

      <StyledText className="text-2xl font-bold mb-4">Order Summary</StyledText>

      <StyledView className="flex-1 h-80">
        <FlatList
          data={Object.values(cartItems)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </StyledView>

      <StyledView className="flex-1 justify-around">
        <StyledView className="bg-white p-4 rounded-lg" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <StyledText className="text-lg font-bold mb-2">Delivery Address</StyledText>
          <StyledTextInput
            className="border border-gray-300 rounded p-2 mb-4"
            placeholder="Enter delivery address"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
          />
          <StyledView className="flex-row justify-between items-center">
            <StyledText className="text-lg font-bold">Total:</StyledText>
            <StyledText className="text-lg font-bold">{totalAmount} Br</StyledText>
          </StyledView>
        </StyledView>
      </StyledView>

      <StyledView className="absolute bottom-0 left-0 right-0 p-4">
        <StyledPressable
          className={`p-4 rounded-full flex flex-row justify-center items-center ${totalAmount > 0 ? 'bg-orange-500' : 'bg-gray-300'}`}
          disabled={totalAmount === 0}
          onPress={handlePlaceOrder}
        >
          <StyledText className="text-white font-bold text-xl">Place Order</StyledText>
        </StyledPressable>
      </StyledView>
    </StyledView>
  );
}