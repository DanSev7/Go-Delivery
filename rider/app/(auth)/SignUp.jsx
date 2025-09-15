import { View, Text, ScrollView, Image } from 'react-native'
import {React, useState} from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {images} from '../../constants'
import FormField from '../../components/FormField'
import CustomeButton from '../../components/CustomeButton'
import {Link} from 'expo-router'
const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })

  const [isSubmitting, setisSubmitting] = useState(false)
  const submit = ()=> {

  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[87vh] px-4 my-6">
          <Image
           source={images.logo}
           resizeMode='contain'
           className="w-[115px] h-[35px]"
          />

          <Text className="text-2xl text-white texxt-semibold mt-8 font-psemibold">Sign up to Aora</Text>

          <FormField
            title="username"
            value={form.username}
            handleChangeText={(e)=> setForm({ ...form, username: e})}
            otherStyles="mt-5"
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e)=> setForm({ ...form, email: e})}
            otherStyles="mt-5"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e)=> setForm({ ...form, password: e})}
            otherStyles="mt-5"
          />

          <CustomeButton 
            title="Sign Up"
            handlePress={submit}
            containerStyle="mt-7"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Have an account already?
            </Text>
            <Link href="/sign-in" className='text-lg font-psemibold text-secondary'>
              Sign In
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp