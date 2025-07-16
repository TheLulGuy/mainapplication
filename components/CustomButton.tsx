import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

// const CustomTouchableOpacity = styled(TouchableOpacity);
const CustomButton = ({ title, onPress, containerStyles, textStyles, isLoading }) => {
  return (
    <TouchableOpacity
      className={`bg-secondary min-h-[62px] items-center justify-center rounded-xl ${containerStyles}
      ${isLoading ? 'opacity-50' : ''}`}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text className={`text-center text-lg font-semibold ${textStyles}`}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
