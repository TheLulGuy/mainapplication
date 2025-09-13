import { TextInput, TouchableOpacity, Text, SafeAreaView, View, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db } from '../../../FirebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function EditProfileLogic({ navigation, route }: { navigation: any, route?: any }) {

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);

  const handleSave = () => {
    // Call the refresh callback if provided
    if (route?.params?.onGoBack) {
      route.params.onGoBack();
    }
    navigation.goBack();
  };

  // Physical disability options for multiple selection
  const physicalDisabilities = [
    'Upper limb amputee',
    'Lower limb amputee',
    'Bilateral upper limb amputee',
    'Bilateral lower limb amputee',
    'Quadruple amputee',
    'Cerebral Palsy',
    'Muscular Dystrophy',
    'Multiple Sclerosis',
    'Spinal Cord Injury (Paraplegia)',
    'Spinal Cord Injury (Quadriplegia)',
    'Spina Bifida',
    'Arthritis (severe mobility impact)',
    'Joint replacement/reconstruction',
    'Limb deformities',
    'Chronic back/spine conditions',
    'Mobility device user (wheelchair)',
    'Mobility device user (walker/crutches)',
    'Balance/coordination disorders',
    'Muscle weakness disorders',
    'Bone disorders (brittle bones, etc.)'
  ];

  const [selectedDisabilities, setSelectedDisabilities] = useState<string[]>([]);

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
        if (!user?.email) return;
        
        const q = query(usersCollection, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setDocId(querySnapshot.docs[0].id);
            setName(userData.name || '');
            setAge(userData.age?.toString() || '');
            setNumber(userData.number || '');
            
            // Load saved disabilities if they exist
            if (userData.physical_disabilities) {
                setSelectedDisabilities(userData.physical_disabilities);
            }
        }
    } catch (error) {
        console.log("Error fetching user data:", error);
    }
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
            physical_disabilities: selectedDisabilities,
            userId: user.uid,
            lastUpdated: new Date()
        };
        
        if (docId) {
            const userDoc = doc(db, 'users', docId);
            await setDoc(userDoc, userData, { merge: true });
            Alert.alert("Success", "Profile updated successfully!");
            handleSave();
        } else {
            await addDoc(usersCollection, userData);
            Alert.alert("Success", "Profile created successfully!");
            handleSave();
        }
        
        fetchUserData();
    } catch (error) {
      console.log("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile");
    } finally {
        setLoading(false);
    }
};

  // Toggle disability selection
  const toggleDisability = (disability: string) => {
    if (selectedDisabilities.includes(disability)) {
      setSelectedDisabilities(selectedDisabilities.filter(d => d !== disability));
    } else {
      setSelectedDisabilities([...selectedDisabilities, disability]);
    }
  };

// Filter out "None" selections for display
const getSelectedDisabilities = () => {
    return selectedDisabilities;
};

return (
    <SafeAreaView className='flex-1 bg-gray-100'>
    <ScrollView className='flex-1 p-5'
        contentContainerStyle={{ paddingBottom: heightPercentageToDP(8) }}>
        <View className='flex-row items-center px-6 mb-6'>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#130057" />
          </TouchableOpacity>
          <Text className='text-2xl font-bold mb-6 text-gray-800 text-center'>User Profile</Text>

        </View>
        
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

      {/* Disability Selection */}
      <Text className="text-lg font-medium text-black mb-2">Physical Disabilities</Text>
      <View className="bg-gray-100 p-4 rounded-lg mb-4">
        {physicalDisabilities.map((disability) => (
          <TouchableOpacity
            key={disability}
            onPress={() => toggleDisability(disability)}
            className={`flex-row items-center justify-between p-3 mb-2 rounded-lg ${
              selectedDisabilities.includes(disability) 
                ? 'bg-gray-300' 
                : 'bg-white border border-gray-200'
            }`}
          >
            <Text 
              className={`text-base ${
                selectedDisabilities.includes(disability) 
                  ? 'text-gray-500' 
                  : 'text-black'
              }`}
            >
              {disability}
            </Text>
            <View 
              className={`w-5 h-5 border-2 rounded ${
                selectedDisabilities.includes(disability)
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              }`}
            >
              {selectedDisabilities.includes(disability) && (
                <Text className="text-white text-xs text-center">✓</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

        {/* Save Button */}
        <TouchableOpacity 
          className='bg-blue-500 p-4 rounded-lg items-center shadow-lg mb-6'
          onPress={saveProfile}
          disabled={loading}
          >
          <Text className='text-white text-lg font-semibold'>
            {loading ? 'Saving...' : (docId ? 'Update Profile' : 'Create Profile')}
          </Text>
        </TouchableOpacity>

        {/* Current Data Preview */}
        <View className='p-4 bg-blue-50 rounded-lg'>
          <Text className='font-medium text-blue-800 mb-2'>Profile Summary:</Text>
          <Text className='text-blue-700'>Name: {name || 'Not set'}</Text>
          <Text className='text-blue-700'>Age: {age || 'Not set'}</Text>
          <Text className='text-blue-700'>Phone: {number || 'Not set'}</Text>
          <Text className='text-blue-700'>Email: {user?.email || 'Not set'}</Text>
          <Text className='text-blue-700 mt-2'>
            Disabilities: {getSelectedDisabilities().join(', ') || 'None selected'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
);
}