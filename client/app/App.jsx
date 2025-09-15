// // App.jsx
// import React from 'react';
// import { useAuthRequest } from 'expo-auth-session';
// import { useRouter } from 'expo-router';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import Layout from './_layout';
// import SuccessScreen from './(restaurants)/SuccessScreen'; // Make sure you create this screen

// const Stack = createStackNavigator();

// export default function App() {
//   const router = useRouter();
//   const [request, response, promptAsync] = useAuthRequest();

//   React.useEffect(() => {
//     if (response?.type === 'success') {
//       const { url } = response;
//       if (url.includes('Food_Delivery://SuccessScreen')) {
//         router.push('/SuccessScreen');
//       }
//     }
//   }, [response]);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen name="Layout" component={Layout} options={{ headerShown: false }} />
//         <Stack.Screen name="SuccessScreen" component={SuccessScreen} options={{ headerShown: false }} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
