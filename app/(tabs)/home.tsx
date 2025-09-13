import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { auth } from 'FirebaseConfig'
import { getAuth, signOut } from 'firebase/auth'
import { router } from 'expo-router'
// signOut


const Home = () => {

  getAuth().onAuthStateChanged((user) => {
    if(user === null){
      // If the user has successfully signed out, go to the login screen
      router.replace('/(login)/loginscreen');
      console.log('user is null');
    }
    else{
      console.log(user);
    }
  });

  return (
    <View className='flex-1 items-center justify-center'>
      <Text className='text-3xl'>Home</Text>
      <TouchableOpacity
        className='w-3/4 bg-red-500 p-3 rounded-md mb-4 items-center'
        onPress={() => {
          // Sign out logic here
          // auth.signOut()
          signOut(auth);
          console.log('Successfully signed out')
        }}
      >
        <Text className='text-white'>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})