// Messaging stack main file
// Contains: MessagesList (chat overview), ChatScreen (chat window), Stack navigator
// Uses: Firebase for real conversations, Ionicons for icons, Native stack navigation
import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../FirebaseConfig';
import { collection, getDocs, query, where, addDoc, doc, onSnapshot, updateDoc, orderBy } from 'firebase/firestore';

// --- Types ---
// ChatMessage: single message in a chat
type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: any;
};

// Conversation: Firebase conversation document
type Conversation = {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageTime: any;
  messages: ChatMessage[];
};

// ChatScreenProps: props for ChatScreen
type ChatScreenProps = {
  route: any;
  navigation: any;
};



// --- ChatScreen: Individual chat window ---
// Receives conversationId, partnerName via navigation params
// Handles message sending, real-time updates, Firebase integration
const ChatScreen = ({ route, navigation }: any) => {
  const { conversationId, partnerName } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const flatListRef = React.useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    // Get current user
    const user = auth.currentUser;
    setCurrentUser(user);

    // Set up real-time listener for messages
    const conversationRef = doc(db, 'conversations', conversationId);
    const unsubscribe = onSnapshot(conversationRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setMessages(data.messages || []);
        // Auto-scroll to bottom when new messages arrive
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      }
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Send message handler
  const handleSend = async () => {
    if (input.trim() === '' || !currentUser) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email || 'Anonymous',
      message: input.trim(),
      timestamp: new Date(),
    };

    try {
      // Update conversation with new message
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        messages: [...messages, newMessage],
        lastMessage: newMessage.message,
        lastMessageTime: newMessage.timestamp
      });

      setInput(''); // Clear input after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // UI: header (back, partnerName), messages list, input bar
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white pt-10 pb-20"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Header: back button, chat name */}
      <View className="flex-row items-center px-6 mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#130057" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold flex-1 ml-4">{partnerName}</Text>
        <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center">
          <Text className="text-white font-bold text-lg">{partnerName?.charAt(0)}</Text>
        </View>
      </View>
      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMe = currentUser && item.senderId === currentUser.uid;
          return (
            <View className={`mb-4 px-6 ${isMe ? 'items-end' : 'items-start'}`}>
              <View className={`rounded-2xl px-6 py-4 ${isMe ? 'bg-blue-500' : 'bg-gray-200'}`}>
                <Text className={`${isMe ? 'text-white' : 'text-gray-800'} text-lg`}>{item.message}</Text>
              </View>
              <Text className="text-xs text-gray-400 mt-1">
                {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </Text>
            </View>
          );
        }}
        style={{ flex: 1 }}
      />
      {/* Input bar for sending messages */}
      <View className="flex-row items-center px-6 pb-6">
        <TextInput
          className="flex-1 border border-gray-300 rounded-full px-4 py-3 text-lg mr-3 bg-gray-100"
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-full items-center justify-center"
          onPress={handleSend}
        >
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// --- Stack navigator for messaging screens ---
const Stack = createNativeStackNavigator();

// --- MessagesList: Shows all users for messaging ---
// Displays all users from Firebase database for direct messaging
// Creates conversations on demand when user taps on someone
const MessagesList: React.FC = () => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
      fetchUsers(user.uid);
    }
  }, []);

  const fetchUsers = async (currentUserId: string) => {
    try {
      console.log('Fetching users from Firebase...');
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      const usersList: any[] = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        // Exclude current user from the list
        if (data.userId !== currentUserId) {
          usersList.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      console.log('Fetched users for messaging:', usersList.length);
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = async (user: any) => {
    if (!currentUser) return;

    try {
      // Check if conversation already exists
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUser.uid)
      );
      
      const snapshot = await getDocs(conversationsQuery);
      let existingConversation: any = null;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Check if this conversation includes both users
        if (data.participants.includes(user.userId) || data.participants.includes(user.email)) {
          existingConversation = { id: doc.id, ...data };
        }
      });

      if (existingConversation) {
        // Navigate to existing conversation
        (navigation as any).navigate('Chat', {
          conversationId: existingConversation.id,
          partnerName: user.name
        });
      } else {
        // Create new conversation
        const newConversation = {
          participants: [currentUser.uid, user.userId || user.email],
          participantNames: [currentUser.displayName || currentUser.email, user.name],
          lastMessage: '',
          lastMessageTime: new Date(),
          messages: []
        };

        const docRef = await addDoc(collection(db, 'conversations'), newConversation);
        
        // Navigate to new conversation
        (navigation as any).navigate('Chat', {
          conversationId: docRef.id,
          partnerName: user.name
        });
      }
    } catch (error) {
      console.error('Error creating/finding conversation:', error);
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
          backgroundColor,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 24
        }}
      >
        <Text style={{ color: 'white', fontSize: size * 0.4, fontWeight: 'bold' }}>
          {initials}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white pt-10 justify-center items-center">
        <Text className="text-lg text-gray-500">Loading users...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-10">
      {/* Title */}
      <Text className="text-4xl font-bold mb-8 text-center">Messages</Text>
      {/* List of all users */}
      {users.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="people-outline" size={80} color="#ccc" />
          <Text className="text-2xl text-gray-500 mt-4 text-center font-semibold">No users found</Text>
          <Text className="text-gray-400 text-center mt-2">Users will appear here when they join!</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id || item.userId}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleUserPress(item)}
              activeOpacity={0.7}
            >
              <View
                className="flex-row items-center px-7 py-5 border-b border-gray-200"
                style={{ minHeight: 90 }}
              >
                {/* Avatar */}
                <View className="relative">
                  {item.profileImageURL ? (
                    <Image 
                      source={{ uri: item.profileImageURL }} 
                      className="w-16 h-16 rounded-full mr-6"
                      style={{ width: 64, height: 64 }}
                    />
                  ) : (
                    <ProfileImagePlaceholder name={item.name || 'User'} size={64} />
                  )}
                  <View className="absolute bottom-0 right-3 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                </View>
                {/* User info */}
                <View className="flex-1">
                  <Text className="text-2xl font-semibold">{item.name || 'Unknown User'}</Text>
                  <Text className="text-lg text-gray-500" numberOfLines={1}>
                    {item.age ? `${item.age}` : ''} {item.age && item.distance ? '•' : ''} {item.distance || item.city || ''}
                  </Text>
                </View>
                {/* Message icon */}
                <Ionicons name="chatbubble-outline" size={24} color="#666" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

// --- Messages: Main messaging stack navigator ---
// Entry point for messaging tab
// Contains MessagesList and ChatScreen, both with header hidden
const Messages: React.FC = () => {
  return (
    <Stack.Navigator>
      {/* Chat overview screen */}
      <Stack.Screen name="MessagesList" component={MessagesList} options={{ headerShown: false }} />
      {/* Individual chat window */}
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

// --- Export main messaging stack ---
export default Messages;