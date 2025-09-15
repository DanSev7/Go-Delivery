// import React from 'react';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import WebView from 'react-native-webview';

// const ChapaPaymentScreen = ({ route, navigation }) => {
//   const { amount, email, firstName, lastName, txRef } = route.params;

//   // Construct the payment URL with necessary parameters
//   const chapaUrl = `https://chapa.co/checkout/payment?amount=${amount}&email=${email}&first_name=${firstName}&last_name=${lastName}&tx_ref=${txRef}&callback_url=https://your-website.com/callback`;

//   return (
//     <View style={styles.container}>
//       <WebView
//         source={{ uri: chapaUrl }}
//         onNavigationStateChange={(navState) => {
//           if (navState.url.includes('your-website.com/callback')) {
//             // Handle successful payment here
//             navigation.navigate('PaymentSuccess');
//           }
//         }}
//         startInLoadingState={true}
//         renderLoading={() => <ActivityIndicator color="#00ff00" />}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//   },
// });

// export default ChapaPaymentScreen;
