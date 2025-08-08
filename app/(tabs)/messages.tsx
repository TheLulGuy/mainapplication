// Messaging stack main file
// Contains: MessagesList (chat overview), ChatScreen (chat window), Stack navigator
// Uses: chatData from constants, Ionicons for icons, Native stack navigation
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard, Animated, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { chatData } from '../../constants';

// --- Types ---
// ChatMessage: single message in a chat
type ChatMessage = {
  sender: string;
  message: string;
  timestamp: string;
};

// ChatItem: single chat in the chat list
type ChatItem = {
  id: number;
  name: string;
  imgUrl: any;
  age: number;
  isOnline: boolean;
  lastMessage: string;
  date: string;
  timeSent: string;
  chat: ChatMessage[];
};

// ChatScreenProps: props for ChatScreen (not used directly, navigation params used instead)
type ChatScreenProps = {
  chat: ChatMessage[];
  name: string;
  imgUrl: any;
  onBack: () => void;
};



// --- ChatScreen: Individual chat window ---
// Receives chat, name, imgUrl via navigation params
// Handles message sending, auto-scroll, input bar with dynamic positioning
const ChatScreen = ({ route, navigation }: any) => {
  const { chat, name, imgUrl } = route.params; // navigation params from MessagesList
  const [messages, setMessages] = useState<ChatMessage[]>(chat); // local chat state
  const [input, setInput] = useState(''); // input bar state
  const [keyboardHeight, setKeyboardHeight] = useState(0); // keyboard height state
  const [isInputFocused, setIsInputFocused] = useState(false); // input focus state
  const flatListRef = React.useRef<FlatList<ChatMessage>>(null); // ref for auto-scroll
  const inputBottomPosition = useRef(new Animated.Value(70)).current; // animated bottom position (70px = above nav bar)
  const screenHeight = Dimensions.get('window').height;

  // Dynamic keyboard and focus handling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // When keyboard shows, move input above it with smooth animation
      Animated.spring(inputBottomPosition, {
        toValue: e.endCoordinates.height + 10, // 10px buffer above keyboard
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      // When keyboard hides, position above navigation bar
      Animated.spring(inputBottomPosition, {
        toValue: 70, // Position above the 70px navigation bar
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [isInputFocused]);

  // Handle input focus changes
  const handleInputFocus = () => {
    setIsInputFocused(true);
    // Don't move the input when focusing if keyboard isn't visible
    // Let the keyboard listener handle the positioning
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    // Don't move the input when blurring if keyboard isn't visible
    // Let the keyboard listener handle the positioning
  };

  // Send message handler
  const handleSend = () => {
    if (input.trim() === '') return;
    const newMessage: ChatMessage = {
      sender: 'me',
      message: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => {
      const updated = [...prev, newMessage];
      // Auto-scroll to latest message after sending
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
      return updated;
    });
    setInput('');
  };

  // UI: header (back, name, avatar), messages list, dynamic input bar
  return (
    <View className="flex-1 bg-white pt-10">
      {/* Header: back button, chat name, avatar */}
      <View className="flex-row items-center px-6 mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={28} color="#130057" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold flex-1">{name}</Text>
        <Image source={imgUrl} className="w-16 h-16 rounded-full" />
      </View>
      
      {/* Messages list with dynamic bottom padding */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View className={`mb-4 px-6 ${item.sender === 'me' ? 'items-end' : 'items-start'}`}>
            <View className={`rounded-2xl px-6 py-4 ${item.sender === 'me' ? 'bg-blue-500' : 'bg-gray-200'}`}>
              <Text className={`${item.sender === 'me' ? 'text-white' : 'text-gray-800'} text-lg`}>{item.message}</Text>
            </View>
            <Text className="text-xs text-gray-400 mt-1">{item.timestamp}</Text>
          </View>
        )}
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 140 // Less padding when attached to nav
        }}
      />
      
      {/* Dynamically positioned input bar */}
      <Animated.View 
        className="absolute left-0 right-0 flex-row items-center px-4 py-3"
        style={{ 
          bottom: inputBottomPosition,
          backgroundColor: keyboardHeight > 0 ? '#ffffff' : '#f8fafc', // Slightly different color for visibility
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          borderTopLeftRadius: keyboardHeight > 0 ? 0 : 20,
          borderTopRightRadius: keyboardHeight > 0 ? 0 : 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
          minHeight: 60, // Ensure minimum height
          zIndex: 1000, // Ensure it's above other elements
        }}
      >
        <TextInput
          className="flex-1 rounded-full px-4 py-3 text-lg mr-3"
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          returnKeyType="send"
          multiline={false}
          style={{
            backgroundColor: keyboardHeight > 0 ? '#f3f4f6' : '#ffffff',
            borderColor: isInputFocused ? '#3B82F6' : (keyboardHeight > 0 ? '#D1D5DB' : '#e5e7eb'),
            borderWidth: 1,
            color: keyboardHeight > 0 ? '#000000' : '#130057',
            minHeight: 44, // Ensure minimum height for visibility
          }}
          placeholderTextColor={keyboardHeight > 0 ? '#9CA3AF' : '#6B7280'}
        />
        <TouchableOpacity
          className="px-4 py-3 rounded-full items-center justify-center"
          onPress={handleSend}
          style={{
            backgroundColor: keyboardHeight > 0 ? '#3B82F6' : '#ffffff',
            borderWidth: keyboardHeight > 0 ? 0 : 1,
            borderColor: '#e5e7eb',
            minWidth: 44,
            minHeight: 44, // Ensure minimum size for visibility
            transform: [{ scale: isInputFocused ? 1.05 : 1 }],
          }}
        >
          <Ionicons 
            name="paper-plane" 
            size={20} 
            color={keyboardHeight > 0 ? "#fff" : "#130057"} 
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// --- Stack navigator for messaging screens ---
const Stack = createNativeStackNavigator();

// --- MessagesList: Chat overview screen ---
// Displays all chats from chatData
// Navigates to ChatScreen on chat press
const MessagesList: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View className="flex-1 bg-white pt-10" style={{ paddingBottom: 90 }}>
      {/* Title */}
      <Text className="text-4xl font-bold mb-8 text-center">Messages</Text>
      {/* List of chats */}
      <FlatList
        data={chatData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Chat', { chat: item.chat, name: item.name, imgUrl: item.imgUrl })}
            activeOpacity={0.7}
          >
            <View
              className="flex-row items-center px-7 py-5 border-b border-gray-200"
              style={{ minHeight: 90 }}
            >
              {/* Avatar and online indicator */}
              <View className="relative">
                <Image source={item.imgUrl} className="w-16 h-16 rounded-full mr-6" />
                {item.isOnline && (
                  <View className="absolute bottom-0 right-3 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
              </View>
              {/* Chat name and last message */}
              <View className="flex-1">
                <Text className="text-2xl font-semibold">{item.name}</Text>
                <Text className="text-lg text-gray-500" numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              {/* Time sent */}
              <Text className="text-base text-gray-400 ml-4">{item.timeSent}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
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