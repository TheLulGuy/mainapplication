import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./loginscreen";

const Stack = createNativeStackNavigator();

export default function LoginLayout() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
      name="Login" 
      component={LoginScreen} 
      options={{headerShown: false}}/>
    </Stack.Navigator>
  );
}
