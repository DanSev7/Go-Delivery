import { Stack } from 'expo-router';
// import {store} from '../redux/store'
// import { Provider } from 'react-redux'; 

export default function AuthLayout() {
  // return <Stack />;
return (
  <Stack>
  <Stack.Screen
          name='MenuScreen'
          options={{
            headerShown:false
          }}
        />
  <Stack.Screen
          name='FoodDetailScreen'
          options={{
            headerShown:false
          }}
          />
  <Stack.Screen
          name='CheckoutScreen'
          options={{
            headerShown:false
          }}
          />
  <Stack.Screen
          name='SuccessScreen'
          options={{
            headerShown:false
          }}
          />
  <Stack.Screen
          name='ReviewScreen'
          options={{
            title: 'Rate & Review',
            headerShown:true
          }}
          />
  <Stack.Screen
          name='OrderDetailScreen'
          options={{
            title: 'Order Details',
            headerShown:true
          }}
        />
</Stack>
)
}
