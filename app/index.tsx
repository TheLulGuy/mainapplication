import CustomButton from '../components/CustomButton';
import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import '../global.css';
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <CustomButton title="Click me" onPress={() => router.push('/(tabs)/home')} />
    </View>
  );
}
