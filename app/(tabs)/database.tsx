import { TextInput, TouchableOpacity, Text, SafeAreaView, View, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db } from '../../FirebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { heightPercentageToDP as hp} from 'react-native-responsive-screen';

export default function UserProfileScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [number, setNumber] = useState('');
  const [physicalAttributes, setPhysicalAttributes] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [docId, setDocId] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;
  const usersCollection = collection(db, 'users');

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const q = query(usersCollection, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setDocId(querySnapshot.docs[0].id);
        setName(userData.name || '');
        setAge(userData.age?.toString() || '');
        setNumber(userData.number || '');
        setPhysicalAttributes(userData.physical_attributes || ['', '', '', '', '']);
      }
    } catch (error) {
      console.log("Error fetching user data:", error);
    }
  };

  const handleAttributeChange = (index: number, value: string) => {
    const newAttributes = [...physicalAttributes];
    newAttributes[index] = value;
    setPhysicalAttributes(newAttributes);
  };

  const saveProfile = async () => {
    if (!user) {
      Alert.alert("Error", "No user logged in");
      return;
    }

    if (!name || !age || !number) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name,
        age: parseInt(age),
        number,
        email: user.email,
        physical_attributes: physicalAttributes.filter(attr => attr.trim() !== ''),
        userId: user.uid,
        lastUpdated: new Date()
      };

      if (docId) {
        // Update existing document
        const userDoc = doc(db, 'users', docId);
        await updateDoc(userDoc, userData);
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        // Create new document
        await addDoc(usersCollection, userData);
        Alert.alert("Success", "Profile created successfully!");
      }
      
      fetchUserData(); // Refresh data to get docId if new
    } catch (error) {
      console.log("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-gray-100'>
      <ScrollView className='flex-1 p-5'
            contentContainerStyle={{
              paddingBottom: hp(8),
        }}
      >
        <Text className='text-2xl font-bold mb-6 text-gray-800 text-center'>User Profile</Text>
        
        {/* Email (read-only) */}
        <View className='mb-4'>
          <Text className='text-sm font-medium text-gray-700 mb-1'>Email</Text>
          <TextInput
            value={user?.email || ''}
            editable={false}
            className='bg-gray-200 p-3 rounded-lg text-gray-600'
          />
        </View>

        {/* Name */}
        <View className='mb-4'>
          <Text className='text-sm font-medium text-gray-700 mb-1'>Full Name *</Text>
          <TextInput
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            className='bg-white p-3 rounded-lg border border-gray-300'
          />
        </View>

        {/* Age */}
        <View className='mb-4'>
          <Text className='text-sm font-medium text-gray-700 mb-1'>Age *</Text>
          <TextInput
            placeholder="Enter your age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            className='bg-white p-3 rounded-lg border border-gray-300'
          />
        </View>

        {/* Phone Number */}
        <View className='mb-6'>
          <Text className='text-sm font-medium text-gray-700 mb-1'>Phone Number *</Text>
          <TextInput
            placeholder="Enter your phone number"
            value={number}
            onChangeText={setNumber}
            keyboardType="phone-pad"
            className='bg-white p-3 rounded-lg border border-gray-300'
          />
        </View>

        {/* Physical Attributes (Disabilities) */}
        <View className='mb-6'>
          <Text className='text-sm font-medium text-gray-700 mb-3'>Physical Attributes (Disabilities)</Text>
          {physicalAttributes.map((attribute, index) => (
            <TextInput
              key={index}
              placeholder={`Disability ${index + 1} (optional)`}
              value={attribute}
              onChangeText={(value) => handleAttributeChange(index, value)}
              className='bg-white p-3 rounded-lg border border-gray-300 mb-2'
            />
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          className='bg-blue-500 p-4 rounded-lg items-center shadow-lg'
          onPress={saveProfile}
          disabled={loading}
        >
          <Text className='text-white text-lg font-semibold'>
            {loading ? 'Saving...' : (docId ? 'Update Profile' : 'Create Profile')}
          </Text>
        </TouchableOpacity>

        {/* Current Data Preview */}
        <View className='mt-8 p-4 bg-blue-50 rounded-lg'>
          <Text className='font-medium text-blue-800 mb-2'>Current Data:</Text>
          <Text className='text-blue-700'>Name: {name || 'Not set'}</Text>
          <Text className='text-blue-700'>Age: {age || 'Not set'}</Text>
          <Text className='text-blue-700'>Phone: {number || 'Not set'}</Text>
          <Text className='text-blue-700'>Email: {user?.email || 'Not set'}</Text>
          <Text className='text-blue-700'>
            Disabilities: {physicalAttributes.filter(attr => attr).join(', ') || 'None specified'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}