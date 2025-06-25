// import { Dimensions, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
// import React from 'react-native';
// import { Image } from 'react-native';
// import { datesData } from '@/constants';
// import DatesCard from '@/components/DatesCard';

// const Home = () => {
  //   return (
    
  //     <SafeAreaView className='bg-white flex-1 justify-between' style={{
    //       paddingTop: android ? hp(2) : 0,
    //     }}>
    
    //       {/* Header */}
    //       <View className='w-full flex-row items-center justify-between px-4 mb-8'>
    
    //         {/* Image */}
    //         <View className='rounded-full items-center justify-center'>
    //           {/* <Image
    //             source={require('@/assets/images/profile.png')} 
    //             style={{ width: hp(4.5), height: hp(4.5), resizeMode: 'cover' }}
    //           /> */}
    //           <Image 
    //             source={require('@/assets/images/profile.jpg')}
    //             style={{
      //               width: hp(4.5),
      //               height: hp(4.5),
      //               resizeMode: 'cover'              
      //             }}
      //             className='rounded-full'
      //           />
      //         </View>
      
      //         <View>
      //           <Text className="text-xl font-semibold text-center uppercase">
      //             STACKS Dates
      //           </Text>
      //         </View>
      
      //         {/* Bell Icon */}
      //         <View className="bg-black/10 p-2 rounded-full items-center justify-center">
      //           <TouchableOpacity>
      //             <Feather name="bell" size={24} color="black" />          
      //           </TouchableOpacity>
      //         </View>
      
      //       </View>
      
      //         {/* Carousal */}
      
      //       <View className='pb-4'>
      //         <View className="mx-4 mb-4">
      //           <Text className="capitalize text-2xl font-semibold">
      //             Find your love
      //           </Text>
      //         </View>
      
      //         <View className="">
      //           <Carousel
      //             data={datesData}
      //             renderItem={({ item }) => <DatesCard item={item} handleClick={undefined} />}
      //             firstItem={1}
      //             inactiveSlideScale={0.86}
      //             inactiveSlideOpacity={0.6}
//             sliderWidth={width}
//             itemWidth={width * 0.8}
//             slideStyle={{ display: "flex", alignItems: "center" }}
//           />
//         </View>
//       </View>
//     </SafeAreaView>
//   )
// }

// // export default Home
// export default Home;

// const styles = StyleSheet.create({})


import { Dimensions, Platform, SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native'
import React from 'react'
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import Feather from '@expo/vector-icons/Feather';
import {Carousel} from 'react-native-snap-carousel';
import DatesCard from '@/components/DatesCard';
import { datesData } from '@/constants';

const { width, height } = Dimensions.get("window");
const android = Platform.OS === 'android';

const Home = () => {
  return (
    <SafeAreaView className='bg-white flex-1 justify-between' style={{
      paddingTop: android ? hp(2) : 0,
    }}>
      {/* Header */}
      <View className='w-full flex-row items-center justify-between px-4 mb-8'>

        {/* Image */}
        <View className='rounded-full items-center justify-center'>
          <Image 
            source={require('@/assets/images/profile.jpg')}
            style={{
              width: hp(4.5),
              height: hp(4.5),
              resizeMode: 'cover'              
            }}
            className='rounded-full'
          />
        </View>

        <View>
          <Text className="text-xl font-semibold text-center uppercase">
            STACKS Dates
          </Text>
        </View>

        <View className="bg-black/10 p-2 rounded-full items-center justify-center">
          <TouchableOpacity>
            <Feather name='bell' size={25} color="black" />
          </TouchableOpacity>
        </View>

      </View>

      {/* <View className=" pb-4">
        <View className="mx-4 mb-4">
          <Text className="capitalize text-2xl font-semibold">
            Find your love
          </Text>
        </View> */}

        {/* <View className="">
          <Carousel
            data={datesData}
            renderItem={({ item }) => <DatesCard item={item} handleClick={undefined} />}
            firstItem={1}
            inactiveSlideScale={0.86}
            inactiveSlideOpacity={0.6}
            sliderWidth={width}
            itemWidth={width * 0.8}
            slideStyle={{ display: "flex", alignItems: "center" }}
          />
        </View>
      </View> */}
      <View>
        
        {/* <Carousel 
        data={datesData}
        renderItem={({item}) => <DatesCard item={item} handleClick={undefined} />}
        firstItem={1}
        inactiveSlideScale={0.86}
        inactiveSlideOpacity={0.6}
        /> */}

      </View>
    </SafeAreaView>
  )
}

export default Home;

const styles = StyleSheet.create({})