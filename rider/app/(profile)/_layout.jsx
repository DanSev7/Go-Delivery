import { Stack } from 'expo-router';

export default function AuthLayout() {
//   return <Stack />;
return (
    <Stack>
        <Stack.Screen
          name='AboutUs'
          options={{
            // title: 'About Us',
            headerShown:false
          }}
        />
        <Stack.Screen
          name='ChangePassword'
          options={{
            headerShown:false
          }}
        />
        <Stack.Screen
          name='ContactSupport'
          options={{
            // title: 'Contact Support',
            headerShown:false
          }}
        />
        <Stack.Screen
          name='FAQ'
          options={{
            // title: 'FAQ',
            headerShown:false
          }}
        />
        <Stack.Screen
          name='EditProfile'
          options={{
            // title: 'Edit Profile',
            headerShown:false
          }}
        />
        <Stack.Screen
          // name='PrivacyPolicy'
          options={{
            title: 'Privacy Policy',
            headerShown:false
          }}
        />
        <Stack.Screen
          name='TermsAndConditions'
          options={{
            // title: 'Terms and Conditions',
            headerShown:false
          }}
        />
      </Stack>
)
}
