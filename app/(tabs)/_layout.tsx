import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomNavBar from '../../components/CustomNavBar';
import Home from './home';
import Messages from './messages';
import Profile from './profile';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomNavBar {...props} />}
      screenOptions={{
        headerShown: false, // Hide headers for all tabs
      }}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
