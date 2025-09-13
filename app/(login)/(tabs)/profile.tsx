import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { profileData } from "../../../constants";

export default function ProfileScreen() {
  const data = profileData[0];
  return (
    <ScrollView
      className="relative bg-white flex-1"
      contentContainerStyle={{
        paddingBottom: hp(8),
      }}
    >
      {/* Image */}
      <View className="mb-2">
        <Image
          source={data.imgUrl}
          style={{
            width: wp(100),
            height: hp(60),
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }}
        />
      </View>

      {/* Header */}
      <View className="w-full absolute flex-row justify-end items-center pt-12 px-5">
        <View className="p-3 rounded-full bg-black/40">
          {/* <BeakerIcon size={hp(3.5)} color="white" strokeWidth={1.5} /> */}
        </View>
      </View>

      {/* Bio */}
      <View className="w-full justify-start items-start px-6 space-y-6 mt-8">
        {/* User name and age */}
        <View className="flex-row space-x-2 justify-between w-full items-center mb-4">
          <View className="flex-row space-x-1">
            <Text className="text-black text-center font-bold text-2xl">
              {data.name}
              {" "}
            </Text>
            <Text className="text-black text-center font-bold text-2xl ">
              {data.age}
            </Text>
          </View>

          <Text className="text-blue-500 text-lg">Edit</Text>
        </View>

        {/* User hobbies */}
        <View className="mb-6">
          <View className="flex-row flex-wrap gap-2">
            {data.hobbies?.map((hobby, index) => (
              <View
                key={index}
                style={{
                  borderRadius: 20,
                  padding: 5,
                  paddingHorizontal: 10,
                  marginRight: 5,
                }}
                className="bg-[#d3d3d3] rounded-full px-4 py-2"
              >
                <Text className="text-black ">{hobby}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* User Bio */}
        <View className="space-y-3">
          <Text className="uppercase font-semibold text-neutral-500 text-lg tracking-wider mb-2">
            BIO
          </Text>

          <Text className="text-black/80 text-base leading-6 text-justify">
            {data.bio}
          </Text>
        </View>

        {/*  */}
      </View>
    </ScrollView>
  );
}