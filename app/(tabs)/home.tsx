import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { auth, db } from '../../FirebaseConfig'
import { getAuth, signOut } from 'firebase/auth'
import { router } from 'expo-router'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons'

interface UserData {
  id: string;
  age: number;
  bio: string;
  city: string;
  country: string;
  distance: string;
  email: string;
  hobbies: string[];
  isActive: boolean;
  lastUpdated: any;
  name: string;
  number: string;
  physical_disabilities: string[];
  preferences: {
    ageRange: {
      min: number;
      max: number;
    };
    interests: string[];
  };
  maxDistance: number;
  profileImageURL: string;
  userId: string;
}


const Home = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if(user === null){
        router.replace('/(login)/loginscreen');
        console.log('user is null');
      } else {
        setCurrentUser(user);
        console.log('Current user:', user);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from Firestore...');
      
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      const usersList: UserData[] = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        // Exclude current user from the list
        if (currentUser && data.userId !== currentUser.uid) {
          usersList.push({
            id: doc.id,
            ...data
          } as UserData);
        }
      });
      
      console.log('Fetched users:', usersList.length);
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const ProfileImagePlaceholder = ({ name, size = 64 }: { name: string; size?: number }) => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const backgroundColor = colors[colorIndex];

    return (
      <View 
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        {initials ? (
          <Text 
            style={{ 
              color: 'white', 
              fontSize: size * 0.35, 
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            {initials}
          </Text>
        ) : (
          <Ionicons name="person" size={size * 0.5} color="white" />
        )}
      </View>
    );
  };

  const renderUserCard = (user: UserData, index: number) => (
    <View key={user.id || index} className='bg-white mx-4 mb-4 p-4 rounded-lg shadow-md'>
      {/* Profile Image and Basic Info */}
      <View className='flex-row items-center mb-3'>
        {user.profileImageURL ? (
          <Image 
            source={{ uri: user.profileImageURL }} 
            className='w-16 h-16 rounded-full mr-4'
          />
        ) : (
          <View className='mr-4'>
            <ProfileImagePlaceholder name={user.name || 'User'} size={64} />
          </View>
        )}
        <View className='flex-1'>
          <Text className='text-lg font-bold text-gray-800'>{user.name}, {user.age}</Text>
          <Text className='text-gray-600'>{user.city}, {user.country}</Text>
          <Text className='text-blue-600'>{user.distance}</Text>
        </View>
      </View>

      {/* Bio */}
      {user.bio && (
        <View className='mb-3'>
          <Text className='text-gray-700'>{user.bio}</Text>
        </View>
      )}

      {/* Contact Info */}
      <View className='mb-3'>
        <Text className='text-sm text-gray-600'>📧 {user.email}</Text>
        {user.number && <Text className='text-sm text-gray-600'>📱 {user.number}</Text>}
      </View>

      {/* Hobbies */}
      {user.hobbies && user.hobbies.length > 0 && (
        <View className='mb-3'>
          <Text className='text-sm font-semibold text-gray-800 mb-1'>Interests:</Text>
          <View className='flex-row flex-wrap'>
            {user.hobbies.map((hobby, hobbyIndex) => (
              <View key={hobbyIndex} className='bg-blue-100 rounded-full px-2 py-1 mr-2 mb-1'>
                <Text className='text-blue-800 text-xs'>{hobby}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Physical Disabilities */}
      {user.physical_disabilities && user.physical_disabilities.length > 0 && (
        <View className='mb-3'>
          <Text className='text-sm font-semibold text-gray-800 mb-1'>Accessibility:</Text>
          <View className='flex-row flex-wrap'>
            {user.physical_disabilities.map((disability, disabilityIndex) => (
              <View key={disabilityIndex} className='bg-green-100 rounded-full px-2 py-1 mr-2 mb-1'>
                <Text className='text-green-800 text-xs'>{disability}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Preferences */}
      {user.preferences && (
        <View className='mb-3'>
          <Text className='text-sm font-semibold text-gray-800 mb-1'>Looking for:</Text>
          <Text className='text-sm text-gray-600'>
            Age: {user.preferences.ageRange?.min}-{user.preferences.ageRange?.max}
          </Text>
          <Text className='text-sm text-gray-600'>Max Distance: {user.maxDistance} miles</Text>
          {user.preferences.interests && user.preferences.interests.length > 0 && (
            <View className='flex-row flex-wrap mt-1'>
              {user.preferences.interests.map((interest, interestIndex) => (
                <View key={interestIndex} className='bg-purple-100 rounded-full px-2 py-1 mr-2 mb-1'>
                  <Text className='text-purple-800 text-xs'>{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Status */}
      <View className='flex-row justify-between items-center'>
        <View className={`px-2 py-1 rounded-full ${user.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
          <Text className={`text-xs ${user.isActive ? 'text-green-800' : 'text-red-800'}`}>
            {user.isActive ? '🟢 Active' : '🔴 Inactive'}
          </Text>
        </View>
        <Text className='text-xs text-gray-500'>
          Updated: {user.lastUpdated?.toDate?.()?.toLocaleDateString() || 'Unknown'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className='flex-1 justify-center items-center bg-gray-50'>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className='mt-4 text-lg text-gray-600'>Loading users...</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-50'>
      {/* Header */}
      <View className='bg-white px-4 py-3 border-b border-gray-200'>
        <View className='flex-row justify-between items-center mt-8'>
          <Text className='text-2xl font-bold text-gray-800'>Users ({users.length})</Text>
          <TouchableOpacity onPress={fetchUsers}>
            <Text className='text-blue-600 font-semibold'>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Users List */}
      <ScrollView 
        className='flex-1' 
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {users.length > 0 ? (
          users.map((user, index) => renderUserCard(user, index))
        ) : (
          <View className='flex-1 justify-center items-center mt-20'>
            <Text className='text-xl text-gray-500'>No users found</Text>
            <Text className='text-gray-400 text-center mt-2 px-8'>
              No other users are currently in the system
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})