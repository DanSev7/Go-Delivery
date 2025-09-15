import React, { useState } from 'react';
import { View, Text, Image, Pressable, ImageBackground } from 'react-native';
import { styled } from 'nativewind';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; 
import Ionicons from '@expo/vector-icons/Ionicons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledImageBackground = styled(ImageBackground);

export default function FoodDetailScreen() {
  const { id, name, description, price, image } = useLocalSearchParams(); // Also include 'id' from params
  // console.log("ID, Name : , description : , Price : Image", id, name, description, price);
  const [quantity, setQuantity] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const router = useRouter();

  const handleIncrement = () => {
    setQuantity(quantity + 1);
    setTotalAmount(totalAmount + parseFloat(price));
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
      setTotalAmount(totalAmount - parseFloat(price));
    }
  };

  const handleClick = () => {
    // Create a cartItems object with the current item and quantity
    const cartItems = {
      [id]: {
        id,
        name,
        description,
        price,
        image,
        quantity,
      },
    };
    console.log("CartItems : ", cartItems);
    router.push({
      pathname: '/CheckoutScreen',
      params: {
        cartItems: JSON.stringify(cartItems), // Serialize cartItems to a JSON string
        totalAmount: totalAmount.toFixed(2), // Ensure totalAmount is a string
        // image, // Pass the image directly to CheckoutScreen
      },
    });
  };

  return (
    <StyledView className="flex-1 bg-white">
      {/* Food Image */}
      <StyledImageBackground
        source={{ uri: `data:image/jpeg;base64,${image}` }}
        className="w-full h-64 justify-end items-start"
      >
        {/* Back Button Positioned on Top of the Image */}
        <StyledTouchableOpacity
          onPress={() => router.back()}
          className="absolute top-6 left-4 p-2 bg-white rounded-full"
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </StyledTouchableOpacity>
      </StyledImageBackground>

      {/* Food Details */}
      <StyledView 
        className="flex-1 p-4 mt-[-60px] bg-white" 
        style={{
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          overflow: 'hidden',
        }}
      >
        <StyledView className="flex flex-row gap-4 justify-center">
          <StyledText className="text-xl font-bold mb-6">{name}</StyledText>
          <StyledText className="text-2xl text-secondary-200 font-bold mb-4">{price} Br</StyledText>
        </StyledView>
        <StyledText className="font-bold text-xl">Description</StyledText>
        <StyledText className="text-lg text-gray-700 mb-2">{description}</StyledText>
        
        {/* Quantity Control */}
        <StyledView className="flex-row items-center justify-end mr-6 mt-4">
          <StyledTouchableOpacity
            className="pl-4 pr-4 pt-2 pb-2 rounded-md border border-gray-300"
            onPress={handleDecrement}
            disabled={quantity === 0}
          >
            <StyledText className="text-xl text-gray-400">–</StyledText>
          </StyledTouchableOpacity>
          <StyledText className="text-xl mx-4">{quantity}</StyledText>
          <StyledTouchableOpacity
            className="pl-4 pr-4 pt-2 pb-2 rounded-md border border-gray-300"
            onPress={handleIncrement}
          >
            <StyledText className="text-xl text-gray-400">+</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>

      {/* Cart Section Fixed at the Bottom */}
      <StyledView className="absolute bottom-0 left-0 right-0 p-4">
        <StyledTouchableOpacity
          className={`p-4 rounded-full flex flex-row justify-around items-center ${totalAmount > 0 ? 'bg-orange-500' : 'bg-gray-300'}`}
          disabled={totalAmount === 0}
          onPress={handleClick}
        >
          {/* Cart Icon with Count */}
          <StyledView className="relative flex-row items-center">
            <StyledView className="relative mr-2">
              {/* Using MaterialIcons for the cart icon */}
              <MaterialIcons name="shopping-cart" size={24} color="white" />
              {quantity > 0 && (
                <StyledView className="absolute top-[-5px] right-[-5px] w-5 h-5 bg-red-500 rounded-full justify-center items-center">
                  <StyledText className="text-white font-bold text-xs">{quantity}</StyledText>
                </StyledView>
              )}
            </StyledView>
            {/* Total Amount Text */}
            <StyledText className="text-xl text-white">Total: {totalAmount} Br</StyledText>
          </StyledView>
          <StyledText className="text-white font-bold text-xl ml-2">Buy Now</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
}
