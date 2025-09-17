import { Image, Alert, TouchableOpacity, SafeAreaView, Text, View, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { storage, auth, db } from '../../FirebaseConfig';
import { getDownloadURL, ref, uploadBytes, getMetadata, deleteObject } from 'firebase/storage';
import { doc, setDoc, deleteField, updateDoc, getDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { User, onAuthStateChanged } from 'firebase/auth';

export default function EditProfilePictureLogic({ navigation, route }: { navigation?: any, route?: any }) {
  const [image, setImage] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProfileImage(currentUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  const fetchProfileImage = async (userId: string) => {
    try {
      const profileImageRef = ref(storage, `profile-pictures/${userId}.jpg`);
      
      // Check if profile image exists
      try {
        await getMetadata(profileImageRef); // This will throw if file doesn't exist
        const url = await getDownloadURL(profileImageRef);
        setProfileImage(url);
      } catch (error) {
        // File doesn't exist, which is fine
        setProfileImage(null);
      }
    } catch (error) {
      console.error("Error fetching profile image from storage: ", error);
      setProfileImage(null);
    }
  };

  const pickImage = async () => {
    if (profileImage) {
      Alert.alert('Info', 'You already have a profile picture. Please delete it first to upload a new one.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
    }
  };

  const uploadProfilePicture = async () => {
    if (!user || !image) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    if (profileImage) {
      Alert.alert('Error', 'You can only have one profile picture');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(image);
      const blob = await response.blob();

      // Store all profile pictures in a single folder using userId as filename
      const storageRef = ref(storage, `profile-pictures/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);

      const url = await getDownloadURL(storageRef);
      
      // Find existing user document instead of creating new one
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // Update existing document
        await updateDoc(userDocRef, {
          profileImageURL: url
        });
      } else {
        // Create new document only if none exists (but this shouldn't happen in normal flow)
        await setDoc(userDocRef, {
          profileImageURL: url,
          userId: user.uid,
          email: user.email,
          lastUpdated: new Date()
        });
      }
      
      setProfileImage(url);
      setImage(null);
      Alert.alert('Success', 'Profile picture uploaded and saved to your account successfully!');
      
      // Call refresh callback if provided
      if (route?.params?.onGoBack) {
        route.params.onGoBack();
      }
    } catch (error: any) {
      console.error("Error uploading profile picture to storage: ", error);
      Alert.alert('Upload Failed', `Failed to upload profile picture: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteProfilePicture = async () => {
    if (!user || !profileImage) {
      Alert.alert('Error', 'No profile picture to delete');
      return;
    }

    setDeleting(true);
    try {
      const storageRef = ref(storage, `profile-pictures/${user.uid}.jpg`);
      await deleteObject(storageRef);
      
      // Remove profileImageURL from user's Firestore document (only if document exists)
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        await updateDoc(userDocRef, {
          profileImageURL: deleteField()
        });
      }
      // If document doesn't exist, no need to remove the field
      
      setProfileImage(null);
      Alert.alert('Success', 'Profile picture deleted and removed from your account successfully!');
      
      // Call refresh callback if provided
      if (route?.params?.onGoBack) {
        route.params.onGoBack();
      }
    } catch (error: any) {
      console.error("Error deleting profile picture from storage: ", error);
      Alert.alert('Delete Failed', `Failed to delete profile picture: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <View className='flex-1 p-6 items-center'>
        <Text className='text-3xl font-bold text-center text-gray-800 mb-8'>
          Profile Picture
        </Text>

        {/* Profile Image Display */}
        <View className='items-center mb-8'>
          {profileImage ? (
            <Image 
              source={{ uri: profileImage }} 
              className='w-48 h-48 rounded-full mb-6 border-4 border-white shadow-xl shadow-gray-400'
            />
          ) : image ? (
            <Image 
              source={{ uri: image }} 
              className='w-48 h-48 rounded-full mb-6 border-4 border-gray-200'
            />
          ) : (
            <View className='w-48 h-48 rounded-full bg-gray-200 mb-6 items-center justify-center border-4 border-gray-300'>
              <Text className='text-gray-500 text-lg text-center'>
                No profile picture{'\n'}selected
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className='w-full max-w-md space-y-4'>
          {!profileImage ? (
            <>
              <TouchableOpacity 
                onPress={pickImage}
                disabled={uploading}
                className='bg-blue-500 px-6 py-4 rounded-xl items-center shadow-lg shadow-blue-500/30'
              >
                <Text className='text-white text-xl font-semibold'>
                  {image ? 'Change Selection' : 'Select Profile Picture'}
                </Text>
              </TouchableOpacity>

              {image && (
                <TouchableOpacity 
                  onPress={uploadProfilePicture}
                  disabled={uploading}
                  className={`px-6 py-4 rounded-xl items-center ${
                    uploading ? 'bg-gray-400' : 'bg-green-500'
                  } shadow-lg ${uploading ? 'shadow-gray-400/30' : 'shadow-green-500/30'}`}
                >
                  {uploading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className='text-white text-xl font-semibold'>
                      Upload Profile Picture
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <TouchableOpacity 
              onPress={deleteProfilePicture}
              disabled={deleting}
              className={`px-6 py-4 rounded-xl items-center ${
                deleting ? 'bg-gray-400' : 'bg-red-500'
              } shadow-lg ${deleting ? 'shadow-gray-400/30' : 'shadow-red-500/30'}`}
            >
              {deleting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className='text-white text-xl font-semibold'>
                  Delete Profile Picture
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Status Message */}
        <Text className='text-lg text-gray-600 text-center mt-8'>
          {profileImage 
            ? 'Your profile picture is set successfully!'
            : image
            ? 'Ready to upload your profile picture'
            : 'Select a profile picture from your gallery'
          }
        </Text>
      </View>
    </SafeAreaView>
  );
}