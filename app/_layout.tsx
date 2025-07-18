import '../global.css';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from '@react-navigation/native';
import TabLayout from './(tabs)/_layout'; // Import your tab layout
import Index from './index';

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
      <Stack.Navigator>
        {/* Index screen without tabs
        <Stack.Screen 
          name="index" 
          component={Index} 
          options={{ headerShown: false }}
        />
         */}
        {/* Main app with tabs */}
        <Stack.Screen
          name="(tabs)"
          component={TabLayout}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
  );
}