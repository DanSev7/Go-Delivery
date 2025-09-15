// import React, { useState } from 'react';
// import { View, Button, ActivityIndicator, StyleSheet, Alert, Linking } from 'react-native';

// const ChapaHome = () => {
//   const [loading, setLoading] = useState(false);

//   const handleClick = async () => {
//     try {
//       setLoading(true);

//       const response = await fetch('http://192.168.68.144:5051/api/pay', {
//         method: 'POST',
//       });

//       if (response.ok) {
//         // Handle successful response
//         const responseData = await response.json();
//         console.log('Payment initiated successfully', responseData);

//         // Assuming the expected structure is responseData.data.checkout_url
//         const checkoutURL = responseData;
//         if (checkoutURL) {
//           // Open the Chapa checkout URL using the Linking API
//           Linking.openURL(checkoutURL);
//           console.log("checkout_url", checkoutURL);
//         } else {
//           console.error('Checkout URL not found in the response data');
//           Alert.alert('Error', 'Checkout URL not found in the response data');
//         }
//       } else {
//         // Handle error response
//         console.error('Payment initiation failed');
//         Alert.alert('Error', 'Payment initiation failed');
//       }
//     } catch (error) {
//       // Handle network or other errors
//       console.error('Errors:', error.message);
//       Alert.alert('Error', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Button
//         onPress={handleClick}
//         title={loading ? 'Initiating payment...' : 'Order Print'}
//         color="#1E90FF"
//         disabled={loading}
//       />
//       {loading && <ActivityIndicator size="large" color="#1E90FF" />}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default ChapaHome;
