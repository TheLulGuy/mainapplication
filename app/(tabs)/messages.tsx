import React, { useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { chatData } from '../../constants';

type ChatMessage = {
  sender: string;
  message: string;
  timestamp: string;
};

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

type ChatScreenProps = {
  chat: ChatMessage[];
  name: string;
  imgUrl: any;
  onBack: () => void;
};


const ChatScreen: React.FC<ChatScreenProps> = ({ chat, name, imgUrl, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(chat);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    const newMessage: ChatMessage = {
      sender: 'me',
      message: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white pt-10"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View className="flex-row items-center px-6 mb-6">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={28} color="#130057" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold flex-1 ml-4">{name}</Text>
        <Image source={imgUrl} className="w-16 h-16 rounded-full ml-4" />
      </View>
      <FlatList
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
      />
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
          className="bg-blue-500 px-6 py-3 rounded-full"
          onPress={handleSend}
        >
          <Text className="text-white text-lg font-semibold">Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const Messages: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);

  if (selectedChat) {
    return (
      <ChatScreen
        chat={selectedChat.chat}
        name={selectedChat.name}
        imgUrl={selectedChat.imgUrl}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <View className="flex-1 bg-white pt-10">
      <Text className="text-4xl font-bold mb-8 text-center">Messages</Text>
      <FlatList
        data={chatData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedChat(item)}
            activeOpacity={0.7}
          >
            <View
              className="flex-row items-center px-7 py-5 border-b border-gray-200"
              style={{ minHeight: 90 }}
            >
              <View className="relative">
                <Image source={item.imgUrl} className="w-16 h-16 rounded-full mr-6" />
                {item.isOnline && (
                  <View className="absolute bottom-0 right-3 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-semibold">{item.name}</Text>
                <Text className="text-lg text-gray-500" numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              <Text className="text-base text-gray-400 ml-4">{item.timeSent}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Messages;