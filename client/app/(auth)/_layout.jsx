import { Stack } from 'expo-router';

export default function AuthLayout() {
  // return <Stack />;
return <Stack>
  <Stack.Screen
          name='SignIn'
          options={{
            headerShown:false
          }}
        />
  <Stack.Screen
          name='SignUp'
          options={{
            headerShown:false
          }}
        />
</Stack>
}
