import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userData, profileData } from '../../constants/index';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const rotate = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const forceSwipe = (direction) => {
    const x = direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction) => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % userData.length);
    position.setValue({ x: 0, y: 0 });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (event, gesture) => {
      if (gesture.dx > 120) {
        forceSwipe('right');
      } else if (gesture.dx < -120) {
        forceSwipe('left');
      } else {
        resetPosition();
      }
    },
  });

  const renderCard = (user, index) => {
    const isCurrentCard = index === currentIndex;
    const isNextCard = index === (currentIndex + 1) % userData.length;

    if (!isCurrentCard && !isNextCard) return null;

    if (isCurrentCard) {
      return (
        <Animated.View
          key={user.id}
          style={[
            {
              position: 'absolute',
              width: screenWidth * 0.85,
              height: screenHeight * 0.6,
              borderRadius: 20,
              backgroundColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              zIndex: 2,
            },
            {
              transform: [...position.getTranslateTransform(), { rotate }],
            },
          ]}
          {...panResponder.panHandlers}>
          <Image
            source={user.imgPath}
            style={{
              width: '100%',
              height: '70%',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
            resizeMode="cover"
          />
          <View className="flex-1 justify-between p-4">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                {user.name}, {user.age}
              </Text>
              <Text className="mt-1 text-gray-600">{user.distance}</Text>
              <View className="mt-2 flex-row flex-wrap">
                {user.hobbies.map((hobby, idx) => (
                  <View key={idx} className="mb-2 mr-2 rounded-full bg-blue-100 px-3 py-1">
                    <Text className="text-sm text-blue-800">{hobby}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      );
    }

    // Next card (background)
    return (
      <Animated.View
        key={user.id}
        style={{
          position: 'absolute',
          width: screenWidth * 0.85,
          height: screenHeight * 0.6,
          borderRadius: 20,
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          zIndex: 1,
          transform: [{ scale: 0.95 }],
        }}>
        <Image
          source={user.imgPath}
          style={{
            width: '100%',
            height: '70%',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          resizeMode="cover"
        />
        <View className="flex-1 justify-between p-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              {user.name}, {user.age}
            </Text>
            <Text className="mt-1 text-gray-600">{user.distance}</Text>
            <View className="mt-2 flex-row flex-wrap">
              {user.hobbies.map((hobby, idx) => (
                <View key={idx} className="mb-2 mr-2 rounded-full bg-blue-100 px-3 py-1">
                  <Text className="text-sm text-blue-800">{hobby}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white p-4">
        {/* Profile Image (Left) */}
        <TouchableOpacity>
          <Image
            source={profileData[0].imgUrl}
            className="h-10 w-10 rounded-full"
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Header Text (Center) */}
        <Text className="text-xl font-bold text-gray-900">HEADER</Text>

        {/* Empty Space (Right) */}
        <View className="w-10" />
      </View>

      {/* Card Stack */}
      <View className="flex-1 items-center justify-center">
        {userData.map((user, index) => renderCard(user, index))}
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center justify-center px-8 pb-8">
        <TouchableOpacity
          className="mx-4 rounded-full bg-red-500 p-4 shadow-lg"
          onPress={() => forceSwipe('left')}>
          <Text className="text-2xl text-white">✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mx-4 rounded-full bg-green-500 p-4 shadow-lg"
          onPress={() => forceSwipe('right')}>
          <Text className="text-2xl text-white">♥</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Home;
