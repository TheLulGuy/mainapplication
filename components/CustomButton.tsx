import React from "react";
import { Text, TouchableOpacity } from "react-native";

// const CustomTouchableOpacity = styled(TouchableOpacity);
const CustomButton = ({ title, onPress, containerStyles, textStyles, isLoading }) => {
  return (
    <TouchableOpacity
      className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${containerStyles}
      ${isLoading ? 'opacity-50' : ''}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className={`font-semibold text-center text-lg ${textStyles}`}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;