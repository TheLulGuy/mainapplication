import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chatData } from '../../constants/index';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState({});

  const initializeChatMessages = () => {
    const initialMessages = {};
    chatData.forEach((chat) => {
      initialMessages[chat.id] = [...chat.chat];
    });
    return initialMessages;
  };

  React.useEffect(() => {
    setChatMessages(initializeChatMessages());
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const currentTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const message = {
        sender: 'me',
        message: newMessage.trim(),
        timestamp: currentTime,
      };

      setChatMessages((prev) => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), message],
      }));

      setNewMessage('');
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center border-b border-gray-200 p-4"
      onPress={() => setSelectedChat(item)}>
      <Image source={item.imgUrl} className="mr-3 h-12 w-12 rounded-full" resizeMode="cover" />
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
          <Text className="text-sm text-gray-500">{item.timeSent}</Text>
        </View>
        <Text className="mt-1 text-gray-600" numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      {item.isOnline && <View className="ml-2 h-3 w-3 rounded-full bg-green-500" />}
    </TouchableOpacity>
  );

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    return (
      <View className={`mb-3 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
        <View
          className={`rounded-2xl px-4 py-2 ${
            isMe ? 'rounded-br-sm bg-blue-500' : 'rounded-bl-sm bg-gray-200'
          }`}>
          <Text className={`${isMe ? 'text-white' : 'text-gray-900'}`}>{item.message}</Text>
        </View>
        <Text className={`mt-1 text-xs text-gray-500 ${isMe ? 'text-right' : 'text-left'}`}>
          {item.timestamp}
        </Text>
      </View>
    );
  };

  if (selectedChat) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Chat Header */}
        <View className="flex-row items-center border-b border-gray-200 bg-white p-4">
          <TouchableOpacity onPress={() => setSelectedChat(null)} className="mr-3">
            <Text className="text-lg text-blue-500">← Back</Text>
          </TouchableOpacity>
          <Image
            source={selectedChat.imgUrl}
            className="mr-3 h-8 w-8 rounded-full"
            resizeMode="cover"
          />
          <View>
            <Text className="text-lg font-semibold">{selectedChat.name}</Text>
            {selectedChat.isOnline && <Text className="text-sm text-green-500">Online</Text>}
          </View>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1">
          <ScrollView className="flex-1 px-4 py-2" contentContainerStyle={{ flexGrow: 1 }}>
            <FlatList
              data={chatMessages[selectedChat.id] || []}
              renderItem={renderMessage}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
            />
          </ScrollView>

          {/* Message Input */}
          <View className="flex-row items-center border-t border-gray-200 bg-white p-4">
            <TextInput
              className="mr-2 flex-1 rounded-full border border-gray-300 px-4 py-2"
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <TouchableOpacity onPress={sendMessage} className="rounded-full bg-blue-500 p-2">
              <Text className="px-2 font-semibold text-white">Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white p-4">
        <Text className="text-2xl font-bold text-gray-900">Messages</Text>
      </View>

      {/* Chat List */}
      <FlatList
        data={chatData}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Messages;
