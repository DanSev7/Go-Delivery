import { useEffect } from 'react';
import { useRouter, SplashScreen, Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import { useFonts } from 'expo-font';
// import {store} from '../app/redux/store'
// import { Provider } from 'react-redux'; 

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const router = useRouter();
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  
  return (
    // <Provider store={store}>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(restaurants)" options={{ headerShown: false }} />
      <Stack.Screen name="(profile)" options={{ headerShown: false }} />
      <Stack.Screen name="(payment)" options={{ headerShown: false }} />
      {/* Add more screens as needed */}
    </Stack>
// </Provider>
  );
}
// useEffect(() => {
  // const handleDeepLink = (event) => {
  //   const { url } = event;
  //   console.log("URL received from deep link: ", url); // Log the full URL

  //   if (url) {
  //     const parsedUrl = Linking.parse(url);
  //     console.log("Parsed URL: ", parsedUrl); // Log the parsed URL object

  //     if (parsedUrl.path === 'SuccessScreen') {
  //       router.push('/(restaurants)/SuccessScreen'); // Adjust the route to your folder structure
  //     } else {
  //       console.warn("Deep link path not recognized: ", parsedUrl.path);
  //     }
  //   } else {
  //     console.warn("Received deep link event with no URL");
  //   }
  // };

  // Add listener for deep links
  // const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

  // Check if the app was opened from a deep link (cold start)
  // Linking.getInitialURL().then((initialUrl) => {
  //   if (initialUrl) {
  //     handleDeepLink({ url: initialUrl });
  //   }
  // });

  // Remove listener on cleanup
//   return () => {
//     linkingSubscription.remove();
//   };
// }, [router]);

// if (!fontsLoaded && !error) return null;
