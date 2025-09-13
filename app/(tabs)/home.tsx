import { Text, TouchableOpacity, View, ScrollView, Image, ActivityIndicator, Alert, Dimensions, Modal } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { StatusBar } from 'expo-status-bar'
import { auth, db } from '../../FirebaseConfig'
import { getAuth, signOut } from 'firebase/auth'
import { router } from 'expo-router'
import { collection, getDocs, query, where, addDoc, doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons'
import Swiper from 'react-native-deck-swiper'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

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
  const [cardIndex, setCardIndex] = useState(0);
  
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalUser, setModalUser] = useState<UserData | null>(null);
  
  const swiperRef = useRef<Swiper<UserData>>(null);

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

  // Swipe handling functions with database storage
  const onSwipedLeft = async (cardIndex: number) => {
    const swipedUser = users[cardIndex];
    if (!swipedUser || !currentUser) return;
    
    console.log('Swiped LEFT (Pass) on:', swipedUser.name);
    
    try {
      // Store the rejection in database
      await addDoc(collection(db, 'swipes'), {
        swiperId: currentUser.uid,
        swipedUserId: swipedUser.id,
        action: 'left', // rejection
        timestamp: new Date(),
        swiperName: currentUser.displayName || currentUser.email,
        swipedUserName: swipedUser.name
      });
      
      console.log('Left swipe stored successfully');
    } catch (error) {
      console.error('Error storing left swipe:', error);
    }
  };

  const onSwipedRight = async (cardIndex: number) => {
    const swipedUser = users[cardIndex];
    if (!swipedUser || !currentUser) return;
    
    console.log('Swiped RIGHT (Like) on:', swipedUser.name);
    
    try {
      // Store the like in database
      await addDoc(collection(db, 'swipes'), {
        swiperId: currentUser.uid,
        swipedUserId: swipedUser.id,
        action: 'right', // like
        timestamp: new Date(),
        swiperName: currentUser.displayName || currentUser.email,
        swipedUserName: swipedUser.name
      });
      
      // Check if this creates a match
      await checkForMatch(currentUser.uid, swipedUser.id, currentUser.displayName || currentUser.email, swipedUser.name);
      
      console.log('Right swipe stored successfully');
    } catch (error) {
      console.error('Error storing right swipe:', error);
    }
  };

  const onSwipedTop = async (cardIndex: number) => {
    const swipedUser = users[cardIndex];
    if (!swipedUser || !currentUser) return;
    
    console.log('Swiped UP (Super Like) on:', swipedUser.name);
    
    try {
      // Store the super like in database
      await addDoc(collection(db, 'swipes'), {
        swiperId: currentUser.uid,
        swipedUserId: swipedUser.id,
        action: 'super', // super like
        timestamp: new Date(),
        swiperName: currentUser.displayName || currentUser.email,
        swipedUserName: swipedUser.name
      });
      
      // Check if this creates a match (super like always shows interest)
      await checkForMatch(currentUser.uid, swipedUser.id, currentUser.displayName || currentUser.email, swipedUser.name);
      
      console.log('Super like stored successfully');
    } catch (error) {
      console.error('Error storing super like:', error);
    }
  };

  // Check if a mutual match has occurred
  const checkForMatch = async (swiperId: string, swipedUserId: string, swiperName: string, swipedUserName: string) => {
    try {
      // Query to see if the swiped user has also swiped right on the swiper
      const mutualSwipeQuery = query(
        collection(db, 'swipes'),
        where('swiperId', '==', swipedUserId),
        where('swipedUserId', '==', swiperId),
        where('action', 'in', ['right', 'super'])
      );
      
      const mutualSwipeSnapshot = await getDocs(mutualSwipeQuery);
      
      if (!mutualSwipeSnapshot.empty) {
        // It's a match! Create match document
        const matchId = `${swiperId}_${swipedUserId}`;
        const reverseMatchId = `${swipedUserId}_${swiperId}`;
        
        // Check if match already exists
        const existingMatch = await getDoc(doc(db, 'matches', matchId));
        const existingReverseMatch = await getDoc(doc(db, 'matches', reverseMatchId));
        
        if (!existingMatch.exists() && !existingReverseMatch.exists()) {
          // Create new match
          await setDoc(doc(db, 'matches', matchId), {
            user1Id: swiperId,
            user2Id: swipedUserId,
            user1Name: swiperName,
            user2Name: swipedUserName,
            matchDate: new Date(),
            conversationId: matchId
          });
          
          // Create conversation document
          await setDoc(doc(db, 'conversations', matchId), {
            participants: [swiperId, swipedUserId],
            participantNames: [swiperName, swipedUserName],
            lastMessage: '',
            lastMessageTime: new Date(),
            messages: []
          });
          
          // Show match notification
          Alert.alert(
            '🎉 It\'s a Match!',
            `You and ${swipedUserName} liked each other! Start chatting now.`,
            [{ text: 'Great!', style: 'default' }]
          );
          
          console.log('Match created between:', swiperName, 'and', swipedUserName);
        }
      }
    } catch (error) {
      console.error('Error checking for match:', error);
    }
  };

  const onSwipedBottom = (cardIndex: number) => {
    console.log('Swiped DOWN (Info) on:', users[cardIndex]?.name);
    showUserModal(users[cardIndex]);
  };

  // Modal helper functions
  const showUserModal = (user: UserData) => {
    if (user) {
      setModalUser(user);
      setIsModalVisible(true);
      // Restore the card after showing modal
      setTimeout(() => {
        if (swiperRef.current) {
          swiperRef.current.swipeBack();
        }
      }, 100);
    }
  };

  const hideUserModal = () => {
    setIsModalVisible(false);
    setModalUser(null);
  };

  const onSwipedAll = () => {
    console.log('No more cards!');
    Alert.alert('No more profiles', 'You have seen all available profiles!');
  };

  const renderCard = (user: UserData, index: number) => {
    if (!user) return null;

    return (
      <View className="bg-white rounded-3xl shadow-2xl overflow-hidden" 
        style={{ 
          height: screenHeight * 0.68, 
          width: screenWidth * 0.9,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 8,
        }}>
        {/* Profile Image Section */}
        <View className="relative" style={{ height: '55%' }}>
          {user.profileImageURL ? (
            <Image 
              source={{ uri: user.profileImageURL }} 
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full justify-center items-center bg-gray-100">
              <ProfileImagePlaceholder name={user.name || 'User'} size={120} />
            </View>
          )}
          
          {/* Overlay with basic info */}
          <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-5">
            <Text className="text-white text-3xl font-bold mb-1">{user.name}, {user.age}</Text>
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={16} color="white" />
              <Text className="text-white text-base ml-1">{user.city}, {user.country}</Text>
              <Text className="text-white text-base ml-2 opacity-90">• {user.distance}</Text>
            </View>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
          {/* Bio */}
          {user.bio && (
            <View className="mb-5">
              <Text className="text-lg font-bold text-gray-800 mb-2">About</Text>
              <Text className="text-base text-gray-600 leading-6">{user.bio}</Text>
            </View>
          )}

          {/* Contact Info */}
          <View className="mb-5">
            <Text className="text-lg font-bold text-gray-800 mb-2">Contact</Text>
            <Text className="text-gray-600 text-base mb-1">📧 {user.email}</Text>
            {user.number && <Text className="text-gray-600 text-base mb-1">📱 {user.number}</Text>}
          </View>

          {/* Hobbies */}
          {user.hobbies && user.hobbies.length > 0 && (
            <View className="mb-5">
              <Text className="text-lg font-bold text-gray-800 mb-2">Interests</Text>
              <View className="flex-row flex-wrap mt-2">
                {user.hobbies.map((hobby, hobbyIndex) => (
                  <View key={hobbyIndex} className="bg-blue-50 rounded-2xl px-3 py-2 mr-2 mb-2">
                    <Text className="text-blue-600 text-sm font-medium">{hobby}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Accessibility Info */}
          {user.physical_disabilities && user.physical_disabilities.length > 0 && (
            <View className="mb-5">
              <Text className="text-lg font-bold text-gray-800 mb-2">Accessibility</Text>
              <View className="flex-row flex-wrap mt-2">
                {user.physical_disabilities.map((disability, disabilityIndex) => (
                  <View key={disabilityIndex} className="bg-green-50 rounded-2xl px-3 py-2 mr-2 mb-2">
                    <Text className="text-green-600 text-sm font-medium">{disability}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Preferences */}
          {user.preferences && (
            <View className="mb-5">
              <Text className="text-lg font-bold text-gray-800 mb-2">Looking For</Text>
              <Text className="text-gray-600 text-base mb-1">
                Age: {user.preferences.ageRange?.min}-{user.preferences.ageRange?.max} years
              </Text>
              <Text className="text-gray-600 text-base mb-2">
                Distance: Within {user.maxDistance} miles
              </Text>
              {user.preferences.interests && user.preferences.interests.length > 0 && (
                <View className="flex-row flex-wrap mt-2">
                  {user.preferences.interests.map((interest, interestIndex) => (
                    <View key={interestIndex} className="bg-purple-50 rounded-2xl px-3 py-2 mr-2 mb-2">
                      <Text className="text-purple-600 text-sm font-medium">{interest}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text className="mt-4 text-lg text-gray-600 font-medium">Loading profiles...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-200 shadow-sm">
        <View className="flex-row justify-between items-center" style={{ marginTop: 35 }}>
          <Text className="text-3xl font-bold text-gray-800">Discover</Text>
          <TouchableOpacity onPress={fetchUsers} className="p-2">
            <Ionicons name="refresh" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Stack */}
      <View className="flex-1 pt-3 pb-5">
        {users.length > 0 ? (
          <Swiper
            ref={swiperRef}
            cards={users}
            renderCard={renderCard}
            onSwipedLeft={onSwipedLeft}
            onSwipedRight={onSwipedRight}
            onSwipedTop={onSwipedTop}
            onSwipedBottom={onSwipedBottom}
            onSwipedAll={onSwipedAll}
            cardIndex={cardIndex}
            backgroundColor="transparent"
            stackSize={3}
            stackSeparation={15}
            animateOverlayLabelsOpacity
            animateCardOpacity
            swipeBackCard
            verticalSwipe={true}
            verticalThreshold={120}
            horizontalThreshold={120}
            disableBottomSwipe={false}
            disableTopSwipe={false}
            overlayLabels={{
              left: {
                title: 'PASS',
                style: {
                  label: {
                    backgroundColor: '#FF4458',
                    borderColor: '#FF4458',
                    color: 'white',
                    borderWidth: 1,
                    fontSize: 28,
                    fontWeight: 'bold',
                    borderRadius: 15,
                    overflow: 'hidden',
                    padding: 10,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 50,
                    marginLeft: -50,
                    transform: [{ rotate: '-30deg' }],
                  },
                },
              },
              right: {
                title: 'LIKE',
                style: {
                  label: {
                    backgroundColor: '#4CCC93',
                    borderColor: '#4CCC93',
                    color: 'white',
                    borderWidth: 1,
                    fontSize: 28,
                    fontWeight: 'bold',
                    borderRadius: 15,
                    overflow: 'hidden',
                    padding: 10,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 50,
                    marginLeft: 50,
                    transform: [{ rotate: '30deg' }],
                  },
                },
              },
              top: {
                title: 'SUPER LIKE',
                style: {
                  label: {
                    backgroundColor: '#42A5F5',
                    borderColor: '#42A5F5',
                    color: 'white',
                    borderWidth: 1,
                    fontSize: 20,
                    fontWeight: 'bold',
                    borderRadius: 12,
                    overflow: 'hidden',
                    padding: 8,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    marginBottom: -30,
                  },
                },
              },
              bottom: {
                title: 'INFO',
                style: {
                  label: {
                    backgroundColor: '#9C27B0',
                    borderColor: '#9C27B0',
                    color: 'white',
                    borderWidth: 1,
                    fontSize: 20,
                    fontWeight: 'bold',
                    borderRadius: 12,
                    overflow: 'hidden',
                    padding: 8,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginTop: -30,
                  },
                },
              },
            }}
          />
        ) : (
          <View className="flex-1 justify-center items-center px-10">
            <Ionicons name="heart-outline" size={80} color="#ccc" />
            <Text className="text-2xl text-gray-600 mt-5 font-bold">No more profiles</Text>
            <Text className="text-base text-gray-500 text-center mt-2 leading-6">
              You've seen all available profiles! Check back later for new matches.
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {users.length > 0 && (
        <View className="flex-row justify-center items-center pb-5 pt-1 px-10 bg-gray-50">
          <TouchableOpacity 
            className="bg-red-500 rounded-full p-4 mx-3 shadow-lg"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 6,
            }}
            onPress={() => {
              onSwipedLeft(cardIndex);
              swiperRef.current?.swipeLeft();
            }}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-purple-500 rounded-full p-4 mx-3 shadow-lg"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 6,
            }}
            onPress={() => {
              if (users[cardIndex]) {
                showUserModal(users[cardIndex]);
              }
            }}
          >
            <Ionicons name="information" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-blue-500 rounded-full p-3 mx-3 shadow-lg"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 6,
            }}
            onPress={() => {
              onSwipedTop(cardIndex);
              swiperRef.current?.swipeTop();
            }}
          >
            <Ionicons name="star" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-green-500 rounded-full p-4 mx-3 shadow-lg"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 6,
            }}
            onPress={() => {
              onSwipedRight(cardIndex);
              swiperRef.current?.swipeRight();
            }}
          >
            <Ionicons name="heart" size={28} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* User Info Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={hideUserModal}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <TouchableOpacity 
            className="flex-1"
            activeOpacity={1}
            onPress={hideUserModal}
          />
          <View className="bg-white rounded-t-3xl max-h-4/5">
            {/* Modal Handle */}
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center my-3"></View>
            
            {modalUser && (
              <ScrollView className="px-6 pb-6" showsVerticalScrollIndicator={false}>
                {/* User Header */}
                <View className="items-center mb-6">
                  <Image 
                    source={{ uri: modalUser.profileImageURL }}
                    className="w-32 h-32 rounded-full mb-4"
                  />
                  <Text className="text-2xl font-bold text-gray-800">
                    {modalUser.name}, {modalUser.age}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text className="text-gray-600 ml-1">
                      {modalUser.city}, {modalUser.country}
                    </Text>
                    {modalUser.distance && (
                      <Text className="text-gray-500 ml-2">• {modalUser.distance}</Text>
                    )}
                  </View>
                </View>

                {/* Bio Section */}
                {modalUser.bio && (
                  <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-800 mb-2">About</Text>
                    <Text className="text-gray-600 leading-6">{modalUser.bio}</Text>
                  </View>
                )}

                {/* Hobbies Section */}
                {modalUser.hobbies && modalUser.hobbies.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-800 mb-2">Interests</Text>
                    <View className="flex-row flex-wrap">
                      {modalUser.hobbies.map((hobby, index) => (
                        <View key={index} className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2">
                          <Text className="text-blue-700 text-sm">{hobby}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Contact Section */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-800 mb-2">Contact</Text>
                  <Text className="text-gray-600 mb-1">📧 {modalUser.email}</Text>
                  {modalUser.number && (
                    <Text className="text-gray-600">📱 {modalUser.number}</Text>
                  )}
                </View>

                {/* Action Buttons */}
                <View className="flex-row justify-around pt-4 border-t border-gray-200">
                  <TouchableOpacity
                    className="bg-red-500 rounded-full p-4 flex-1 mx-2"
                    onPress={() => {
                      hideUserModal();
                      // Find the current user's index for proper swipe handling
                      const userIndex = users.findIndex(u => u.id === modalUser?.id);
                      if (userIndex !== -1) {
                        onSwipedLeft(userIndex);
                        swiperRef.current?.swipeLeft();
                      }
                    }}
                  >
                    <View className="items-center">
                      <Ionicons name="close" size={24} color="white" />
                      <Text className="text-white text-xs mt-1 font-medium">Pass</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-blue-500 rounded-full p-4 flex-1 mx-2"
                    onPress={() => {
                      hideUserModal();
                      // Find the current user's index for proper swipe handling
                      const userIndex = users.findIndex(u => u.id === modalUser?.id);
                      if (userIndex !== -1) {
                        onSwipedTop(userIndex);
                        swiperRef.current?.swipeTop();
                      }
                    }}
                  >
                    <View className="items-center">
                      <Ionicons name="star" size={20} color="white" />
                      <Text className="text-white text-xs mt-1 font-medium">Super</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-green-500 rounded-full p-4 flex-1 mx-2"
                    onPress={() => {
                      hideUserModal();
                      // Find the current user's index for proper swipe handling
                      const userIndex = users.findIndex(u => u.id === modalUser?.id);
                      if (userIndex !== -1) {
                        onSwipedRight(userIndex);
                        swiperRef.current?.swipeRight();
                      }
                    }}
                  >
                    <View className="items-center">
                      <Ionicons name="heart" size={24} color="white" />
                      <Text className="text-white text-xs mt-1 font-medium">Like</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </View>
  )
}

export default Home;