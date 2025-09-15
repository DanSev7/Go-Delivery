import { Stack } from 'expo-router';

export default function AuthLayout() {
  // return <Stack />;
return <Stack>
  <Stack.Screen
          name='ChapaHome'
          options={{
            headerShown:false
          }}
        />
</Stack>
}
