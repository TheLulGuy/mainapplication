import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { profileData } from '../../constants';

export default function ProfileScreen() {
  const data = profileData[0];
  return (
    <ScrollView
      className="relative flex-1 bg-white"
      contentContainerStyle={{
        paddingBottom: hp(12),
      }}>
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
      <View className="absolute w-full flex-row items-center justify-end px-5 pt-12">
        <View className="rounded-full bg-black/40 p-3">
          {/* <BeakerIcon size={hp(3.5)} color="white" strokeWidth={1.5} /> */}
        </View>
      </View>

      {/* Bio */}
      <View className="mt-8 w-full items-start justify-start space-y-6 px-6">
        {/* User name and age */}
        <View className="mb-4 w-full flex-row items-center justify-between space-x-2">
          <View className="flex-row space-x-1">
            <Text className="text-center text-2xl font-bold text-black">{data.name} </Text>
            <Text className="text-center text-2xl font-bold text-black ">{data.age}</Text>
          </View>

          <Text className="text-lg text-blue-500">Edit</Text>
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
                className="rounded-full bg-[#d3d3d3] px-4 py-2">
                <Text className="text-black ">{hobby}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* User Bio */}
        <View className="space-y-3">
          <Text className="mb-2 text-lg font-semibold uppercase tracking-wider text-neutral-500">
            BIO
          </Text>

          <Text className="text-justify text-base leading-6 text-black/80">{data.bio}</Text>
        </View>

        {/*  */}
      </View>
    </ScrollView>
  );
}
