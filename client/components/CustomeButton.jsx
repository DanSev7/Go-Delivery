import { Pressable, Text } from 'react-native'
import React from 'react'

const CustomButton = ({title, handlePress, containerStyle, textStyles, isLoading}) => {
  return (
    <Pressable 
        onPress={handlePress}
        className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${containerStyle} ${isLoading ? 'opacity-50' : ''}`}
        disabled={isLoading}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : 1,
          }
        ]}
        >
        <Text className={`text-primary font-pbold text-lg ${textStyles}`}>
            {title}
        </Text>
    </Pressable>
  )
}

export default CustomButton;