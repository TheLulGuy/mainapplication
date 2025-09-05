import { TextInput, TouchableOpacity, Text, SafeAreaView, View, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db } from '../../FirebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';
import { heightPercentageToDP } from 'react-native-responsive-screen';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

// const Stack = createNativeStackNavigator();
// export default function EditProfile() {
//   return (
//     <Stack.Screen 
//       name="EditProfile" 
//       component={EditProfileLogic} 
//       options={{ 
//         title: 'Edit Profile',
//         headerBackTitle: 'Back',
//         headerShown: true
//       }} 
//     />
//   );
// }

export default function EditProfileLogic({ navigation }) {

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [docId, setDocId] = useState(null);

  const handleSave = () => {
    navigation.goBack();
  };

  // Disability options for dropdowns
  const disabilityCategories = {
    mobility: [
        'None', 'Wheelchair user', 'Amputee (upper limb)', 
        'Amputee (lower limb)', 'Cerebral Palsy', 'Muscular Dystrophy',
        'Multiple Sclerosis', 'Spinal Cord Injury', 'Arthritis'
    ],
    visual: [
        'None', 'Blind', 'Low vision', 'Color blindness', 
        'Glaucoma', 'Cataracts'
    ],
    hearing: [
        'None', 'Deaf', 'Hard of hearing', 
        'Hearing aid user', 'Cochlear implant user'
    ],
    neurological: [
        'None', 'Epilepsy', 'Parkinson\'s Disease', 
        'Stroke effects', 'Traumatic Brain Injury'
    ],
    chronic: [
        'None', 'Diabetes', 'Heart condition', 
        'Respiratory condition', 'Chronic pain'
    ]
  };

  const [physicalAttributes, setPhysicalAttributes] = useState({
    mobility: 'None',
    visual: 'None',
    hearing: 'None',
    neurological: 'None',
    chronic: 'None'
  });

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
            
            // Load saved disabilities if they exist
            if (userData.physical_attributes) {
                setPhysicalAttributes(userData.physical_attributes);
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
            physical_attributes: physicalAttributes,
            userId: user.uid,
            lastUpdated: new Date()
        };
        
        if (docId) {
            const userDoc = doc(db, 'users', docId);
            await updateDoc(userDoc, userData);
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

// Filter out "None" selections for display
const getSelectedDisabilities = () => {
    return Object.entries(physicalAttributes)
    .filter(([_, value]) => value !== 'None')
    .map(([_, value]) => value);
};

return (
    <SafeAreaView className='flex-1 bg-gray-100'>
    <ScrollView className='flex-1 p-5'
        contentContainerStyle={{ paddingBottom: heightPercentageToDP(8) }}>
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

        {/* Physical Attributes Dropdowns */}
        <View className='mb-6'>
          <Text className='text-sm font-medium text-gray-700 mb-3'>Physical Attributes</Text>
          
          <View className='mb-4'>
            <Text className='text-xs text-gray-600 mb-1'>Mobility & Physical</Text>
            <View className='bg-white rounded-lg border border-gray-300'>
              <Picker
                selectedValue={physicalAttributes.mobility}
                onValueChange={(value) => setPhysicalAttributes({...physicalAttributes, mobility: value})}
                >
                {disabilityCategories.mobility.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          <View className='mb-4'>
            <Text className='text-xs text-gray-600 mb-1'>Visual Impairments</Text>
            <View className='bg-white rounded-lg border border-gray-300'>
              <Picker
                selectedValue={physicalAttributes.visual}
                onValueChange={(value) => setPhysicalAttributes({...physicalAttributes, visual: value})}
                >
                {disabilityCategories.visual.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          <View className='mb-4'>
            <Text className='text-xs text-gray-600 mb-1'>Hearing Impairments</Text>
            <View className='bg-white rounded-lg border border-gray-300'>
              <Picker
                selectedValue={physicalAttributes.hearing}
                onValueChange={(value) => setPhysicalAttributes({...physicalAttributes, hearing: value})}
                >
                {disabilityCategories.hearing.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          <View className='mb-4'>
            <Text className='text-xs text-gray-600 mb-1'>Neurological Conditions</Text>
            <View className='bg-white rounded-lg border border-gray-300'>
              <Picker
                selectedValue={physicalAttributes.neurological}
                onValueChange={(value) => setPhysicalAttributes({...physicalAttributes, neurological: value})}
                >
                {disabilityCategories.neurological.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          <View className='mb-4'>
            <Text className='text-xs text-gray-600 mb-1'>Chronic Health Conditions</Text>
            <View className='bg-white rounded-lg border border-gray-300'>
              <Picker
                selectedValue={physicalAttributes.chronic}
                onValueChange={(value) => setPhysicalAttributes({...physicalAttributes, chronic: value})}
              >
                {disabilityCategories.chronic.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>
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