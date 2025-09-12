import '../global.css';
import TabLayout from './(tabs)/_layout'; // Import your tab layout
import LoginScreen from './(login)/loginscreen';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { router } from 'expo-router';
import { auth } from 'FirebaseConfig';



const Stack = createNativeStackNavigator();

export default function RootLayout() {

  return (
      <Stack.Navigator>
        {/* Index screen without tabs */}
        {/* <Stack.Screen 
          name="index" 
          component={Index} 
          options={{ headerShown: false }}
        /> */}
        
        {/* Main app with tabs */}
        <Stack.Screen
          name="(login)"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(tabs)"
          component={TabLayout}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
  );
}