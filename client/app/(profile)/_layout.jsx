import { Stack } from 'expo-router';

export default function AuthLayout() {
//   return <Stack />;
return (
    <Stack>
        <Stack.Screen
          name='AboutUs'
          options={{
            title: 'About Us',
            headerShown:true
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
            title: 'Contact Support',
            headerShown:true
          }}
        />
        <Stack.Screen
          name='FAQ'
          options={{
            title: 'FAQ',
            headerShown:true
          }}
        />
        <Stack.Screen
          name='EditProfile'
          options={{
            title: 'Edit Profile',
            headerShown:true
          }}
        />
        <Stack.Screen
          name='PrivacyPolicy'
          options={{
            title: 'Privacy Policy',
            headerShown:true
          }}
        />
        <Stack.Screen
          name='TermsAndConditions'
          options={{
            title: 'Terms and Conditions',
            headerShown:true
          }}
        />
      </Stack>
)
}
