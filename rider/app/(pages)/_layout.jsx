import { Stack } from 'expo-router';

export default function PagesLayout() {
  return (
    <Stack>
      <Stack.Screen name="AvailableDeliveriesScreen" options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetailScreen" options={{ headerShown: false }} />
      <Stack.Screen name="AcceptedOrdersScreen" options={{ headerShown: false }} />
    </Stack>
  );
}
