import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { styled } from 'nativewind';
import { FontAwesome } from '@expo/vector-icons';

// Enable LayoutAnimation for Android
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleFAQ = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);

    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const arrowRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <StyledView className="mb-4">
      <StyledPressable
        onPress={toggleFAQ}
        className="flex-row justify-between items-center p-4 bg-gray-200 rounded-lg"
      >
        <StyledText className="text-lg font-semibold">{question}</StyledText>
        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          <FontAwesome name="chevron-right" size={18} color="#333" />
        </Animated.View>
      </StyledPressable>
      {expanded && (
        <Animated.View className="mt-2 px-4">
          <StyledText className="text-base text-gray-700">{answer}</StyledText>
        </Animated.View>
      )}
    </StyledView>
  );
};

export default function FAQ() {
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "You can place an order by selecting your favorite items and adding them to your cart. Once ready, proceed to checkout."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept various payment methods, including credit/debit cards, mobile payments using Chapa payment gateway"
    },
    {
      question: "Can I cancel or modify my order?",
      answer: "Currently you can't cancel or modify your order but if you didn't go to the checkout process you can cancel and modify your order."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is placed, you can track its status through the 'Orders' section in your profile."
    }
  ];

  return (
    <StyledView className="flex-1 p-5 bg-white">
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </StyledView>
  );
}
