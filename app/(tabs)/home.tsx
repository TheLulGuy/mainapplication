import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, ActivityIndicator, Alert, Dimensions } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { StatusBar } from 'expo-status-bar'
import { auth, db } from '../../FirebaseConfig'
import { getAuth, signOut } from 'firebase/auth'
import { router } from 'expo-router'
import { collection, getDocs, query, where } from 'firebase/firestore'
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

  const onSwipedLeft = (cardIndex: number) => {
    console.log('Swiped LEFT (Pass) on:', users[cardIndex]?.name);
  };

  const onSwipedRight = (cardIndex: number) => {
    console.log('Swiped RIGHT (Like) on:', users[cardIndex]?.name);
  };

  const onSwipedTop = (cardIndex: number) => {
    console.log('Swiped UP (Super Like) on:', users[cardIndex]?.name);
  };

  const onSwipedBottom = (cardIndex: number) => {
    console.log('Swiped DOWN (Info) on:', users[cardIndex]?.name);
  };

  const onSwipedAll = () => {
    console.log('No more cards!');
    Alert.alert('No more profiles', 'You have seen all available profiles!');
  };

  const renderCard = (user: UserData, index: number) => {
    if (!user) return null;

    return (
      <View style={styles.card}>
        {/* Profile Image Section */}
        <View style={styles.imageContainer}>
          {user.profileImageURL ? (
            <Image 
              source={{ uri: user.profileImageURL }} 
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <ProfileImagePlaceholder name={user.name || 'User'} size={120} />
            </View>
          )}
          
          {/* Overlay with basic info */}
          <View style={styles.imageOverlay}>
            <Text style={styles.nameText}>{user.name}, {user.age}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="white" />
              <Text style={styles.locationText}>{user.city}, {user.country}</Text>
              <Text style={styles.distanceText}>• {user.distance}</Text>
            </View>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Bio */}
          {user.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{user.bio}</Text>
            </View>
          )}

          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.contactText}>📧 {user.email}</Text>
            {user.number && <Text style={styles.contactText}>📱 {user.number}</Text>}
          </View>

          {/* Interests */}
          {user.hobbies && user.hobbies.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.tagsContainer}>
                {user.hobbies.map((hobby, hobbyIndex) => (
                  <View key={hobbyIndex} style={styles.hobbyTag}>
                    <Text style={styles.hobbyText}>{hobby}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Accessibility Info */}
          {user.physical_disabilities && user.physical_disabilities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Accessibility</Text>
              <View style={styles.tagsContainer}>
                {user.physical_disabilities.map((disability, disabilityIndex) => (
                  <View key={disabilityIndex} style={styles.disabilityTag}>
                    <Text style={styles.disabilityText}>{disability}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Preferences */}
          {user.preferences && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Looking For</Text>
              <Text style={styles.preferenceText}>
                Age: {user.preferences.ageRange?.min}-{user.preferences.ageRange?.max} years
              </Text>
              <Text style={styles.preferenceText}>
                Distance: Within {user.maxDistance} miles
              </Text>
              {user.preferences.interests && user.preferences.interests.length > 0 && (
                <View style={styles.tagsContainer}>
                  {user.preferences.interests.map((interest, interestIndex) => (
                    <View key={interestIndex} style={styles.preferenceTag}>
                      <Text style={styles.preferenceTagText}>{interest}</Text>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Discover</Text>
          <TouchableOpacity onPress={fetchUsers} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Stack */}
      <View style={styles.swiperContainer}>
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
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No more profiles</Text>
            <Text style={styles.emptyStateText}>
              You've seen all available profiles! Check back later for new matches.
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {users.length > 0 && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.passButton]}
            onPress={() => swiperRef.current?.swipeLeft()}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.superLikeButton]}
            onPress={() => swiperRef.current?.swipeTop()}
          >
            <Ionicons name="star" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => swiperRef.current?.swipeRight()}
          >
            <Ionicons name="heart" size={28} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 35,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  swiperContainer: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 20,
  },
  card: {
    height: screenHeight * 0.68, // Reduced height to leave room for buttons
    width: screenWidth * 0.9,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    height: '55%',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  nameText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
  distanceText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    opacity: 0.9,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  contactText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  preferenceText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  hobbyTag: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  hobbyText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  disabilityTag: {
    backgroundColor: '#e8f5e8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  disabilityText: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '500',
  },
  preferenceTag: {
    backgroundColor: '#f3e5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  preferenceTagText: {
    color: '#7b1fa2',
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 10,
    paddingHorizontal: 40,
    backgroundColor: '#f8f9fa',
  },
  actionButton: {
    borderRadius: 35,
    padding: 18,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  passButton: {
    backgroundColor: '#FF4458',
  },
  superLikeButton: {
    backgroundColor: '#42A5F5',
    padding: 15,
  },
  likeButton: {
    backgroundColor: '#4CCC93',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    color: '#666',
    marginTop: 20,
    fontWeight: 'bold',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
})