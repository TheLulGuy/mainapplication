import CustomButton from "../components/CustomButton";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import '../global.css'
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <CustomButton title="Go to HomePage" onPress={() => router.push('/(tabs)/home')}/>
      <CustomButton title="Go to LoginScreen" onPress={() => router.push('/(login)/loginscreen')}/>
    </View>
  );
}
