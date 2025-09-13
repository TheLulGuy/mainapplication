import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { auth } from 'FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import { router } from 'expo-router';

const LoginScreen = () => {

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const signIn = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      //? If the user logs in, route them to the homepage
      if (user){
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      console.error(error);
      alert('Sign in failed: ' + error.message);
    }
  }

  const signUp = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);
      //? If the user signs up, route them to the homepage
      if (user) {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      console.error(error);
      alert('Sign up failed: ' + error.message);
    }
  }

  return (
    <View className='flex-1 items-center justify-center'>
      <Text className='text-3xl'>LoginScreen</Text>
      <TextInput
        className='w-3/4 p-3 border border-gray-300 rounded-md mb-4'
        placeholder='Email'
        value={email}
        onChangeText={setEmail}
        keyboardType='email-address'
        autoCapitalize='none'
      />
      <TextInput
        className='w-3/4 p-3 border border-gray-300 rounded-md mb-4'
        placeholder='Password'
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        className='w-3/4 bg-blue-500 p-3 rounded-md mb-4 items-center'
        onPress={signIn}
      >
        <Text className='text-white'>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className='w-3/4 bg-green-500 p-3 rounded-md mb-4 items-center'
        onPress={signUp}
      >
        <Text className='text-white'>Sign Up</Text>
      </TouchableOpacity>
    </View>
  )
}

export default LoginScreen

const styles = StyleSheet.create({})