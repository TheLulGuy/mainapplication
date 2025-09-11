// app/(tabs)/profile.tsx
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db, storage } from '../../FirebaseConfig';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ref, getDownloadURL, getMetadata } from 'firebase/storage';
import EditProfileLogic from './editprofile';
import EditProfilePictureLogic from './editprofilepicture';

const Stack = createNativeStackNavigator();

// This function handles the STACK NAVIGATION only
export default function ProfileScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreenLogic} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileLogic}
        options={{ 
          title: 'Edit Profile',
          headerBackTitle: 'Back',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="EditProfilePicture" 
        component={EditProfilePictureLogic}
        options={{ 
          title: 'Edit Profile Picture',
          headerBackTitle: 'Back',
          headerShown: true
        }} 
      />
    </Stack.Navigator>
  );
}

function ProfileScreenLogic({ navigation }: { navigation: any }) {
  const [userData, setUserData] = useState<any>(null);
  const [profileImage,  setProfileImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { onGoBack: refreshData });
  };
  
  const handleEditProfileImage = () => {
    navigation.navigate('EditProfilePicture', { onGoBack: refreshData });
  }

  const refreshData = () => {
    if (user) {
      fetchUserProfile();
      fetchProfileImage();
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchProfileImage();
    }
  }, [user]);

  // Refresh data whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchUserProfile();
        fetchProfileImage();
      }
    }, [user])
  );

  const fetchProfileImage = async () => {
    if (!user) return;
    
    setImageLoading(true);
    try {
      const profileImageRef = ref(storage, `profile-pictures/${user.uid}/profile.jpg`);
      
      // Check if profile image exists
      try {
        await getMetadata(profileImageRef);
        // Add timestamp to prevent caching issues
        const url = await getDownloadURL(profileImageRef);
        const timestamp = new Date().getTime();
        setProfileImage(`${url}&timestamp=${timestamp}`);
      } catch (error) {
        // File doesn't exist, which is fine
        setProfileImage(null);
      }
    } catch (error) {
      console.error("Error fetching profile image: ", error);
      setProfileImage(null);
    } finally {
      setImageLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where("email", "==", user?.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setUserData(data);
      } else {
        // User exists in auth but hasn't created a profile yet
        setUserData({
          name: 'Not set',
          age: 'Not set',
          number: 'Not set',
          physical_disabilities: []
        });
      }
    } catch (error) {
      console.log("Error fetching profile:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("Logout error:", error);
      Alert.alert("Error", "Failed to logout");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSelectedDisabilities = () => {
    if (!userData?.physical_disabilities || userData.physical_disabilities.length === 0) {
      return 'None specified';
    }
    
    return userData.physical_disabilities.join(', ');
  };

  if (loading) {
    return (
      <SafeAreaView className='flex-1 bg-gray-100 justify-center items-center'>
        <Text className='text-gray-600'>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-100'>
      <ScrollView className='flex-1 p-5'>
        {/* Header */}
        <View className='flex-row justify-between items-center mb-8'>
          <Text className='text-2xl font-bold text-gray-800'>My Profile</Text>
          <TouchableOpacity onPress={handleEditProfileImage}>
            <Text className='text-blue-500 font-semibold'>Edit Profile Image</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View className='bg-white rounded-2xl p-6 shadow-sm mb-6'>
          {/* Profile Header */}
          <View className='items-center mb-6'>
            <TouchableOpacity onPress={handleEditProfileImage} className='items-center'>
              {imageLoading ? (
                <View className='w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-3'>
                  <ActivityIndicator size="small" color="#3b82f6" />
                </View>
              ) : profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  className='w-20 h-20 rounded-full mb-3 border-4 border-white shadow-lg'
                />
              ) : (
                <View className='w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-3'>
                  <Text className='text-white text-3xl font-bold'>
                    {getInitials(userData?.name)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <Text className='text-xl font-bold text-gray-800'>{userData?.name || 'Not set'}</Text>
            <Text className='text-gray-500'>{user?.email}</Text>
          </View>

          {/* Personal Information */}
          <View className='space-y-4'>
            <Text className='text-lg font-semibold text-gray-800 mb-3'>Personal Information</Text>
            
            <View className='flex-row justify-between py-2 border-b border-gray-100'>
              <Text className='text-gray-600'>Age</Text>
              <Text className='text-gray-800 font-medium'>{userData?.age || 'Not set'}</Text>
            </View>

            <View className='flex-row justify-between py-2 border-b border-gray-100'>
              <Text className='text-gray-600'>Phone</Text>
              <Text className='text-gray-800 font-medium'>{userData?.number || 'Not set'}</Text>
            </View>

            <View className='flex-row justify-between py-2 border-b border-gray-100'>
              <Text className='text-gray-600'>User ID</Text>
              <Text className='text-gray-800 font-medium text-xs' numberOfLines={1} ellipsizeMode='middle'>
                {user?.uid?.slice(0, 10)}...{user?.uid?.slice(-8)}
              </Text>
            </View>
          </View>

          {/* Physical Disabilities */}
          <View className='mt-6'>
            <Text className='text-lg font-semibold text-gray-800 mb-3'>Physical Disabilities</Text>
            <View className='bg-blue-50 p-4 rounded-lg'>
              <Text className='text-blue-800'>{getSelectedDisabilities()}</Text>
            </View>
          </View>
        </View>

        {/* Account Status */}
        <View className='bg-white rounded-2xl p-6 shadow-sm mb-6'>
          <Text className='text-lg font-semibold text-gray-800 mb-4'>Account Status</Text>
          <View className='flex-row items-center justify-between py-2'>
            <Text className='text-gray-600'>Email Verified</Text>
            <View className={`px-3 py-1 rounded-full ${user?.emailVerified ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <Text className={`text-xs font-medium ${user?.emailVerified ? 'text-green-800' : 'text-yellow-800'}`}>
                {user?.emailVerified ? 'Verified' : 'Not Verified'}
              </Text>
            </View>
          </View>
          <View className='flex-row items-center justify-between py-2'>
            <Text className='text-gray-600'>Profile Complete</Text>
            <View className={`px-3 py-1 rounded-full ${userData?.name && userData?.age && userData?.number ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <Text className={`text-xs font-medium ${userData?.name && userData?.age && userData?.number ? 'text-green-800' : 'text-yellow-800'}`}>
                {userData?.name && userData?.age && userData?.number ? 'Complete' : 'Incomplete'}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className='bg-white rounded-2xl p-6 shadow-sm'>
          <Text className='text-lg font-semibold text-gray-800 mb-4'>Actions</Text>
          
          <TouchableOpacity 
            className='bg-blue-500 p-4 rounded-lg items-center mb-3'
            onPress={handleEditProfile}
          >
            <Text className='text-white font-semibold'>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className='bg-red-500 p-4 rounded-lg items-center'
            onPress={handleLogout}
          >
            <Text className='text-white font-semibold'>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Last Updated */}
        {userData?.lastUpdated && (
          <View className='mt-6 items-center'>
            <Text className='text-xs text-gray-400'>
              Last updated: {userData.lastUpdated.toDate().toLocaleDateString()}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}