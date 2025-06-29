// import { View, Text, Dimensions, TouchableOpacity, Image, Platform } from "react-native";
// import React from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   BellIcon,
// } from "react-native-heroicons/outline";
// import { user1, user2 } from "../../assets/images";
// import { heightPercentageToDP as hp } from "react-native-responsive-screen";
// // import TinderCard from "react-tinder-card";


// const android = Platform.OS === "android";
// const { width, height } = Dimensions.get("window");


// export default function HomeScreen() {

//   return (
//     <SafeAreaView
//       className="bg-white flex-1 justify-between"
//       style={{
//         paddingTop: android ? hp(2) : 0,
//       }}
//     >
//       {/* Header */}
//       <View className="w-full flex-row justify-between items-center px-4 mb-8">
//         <View className="rounded-full items-center justify-center">
//           <Image
//             source={user1}
//             style={{
//               width: hp(4.5),
//               height: hp(4.5),
//               resizeMode: "cover",
//             }}
//             className="rounded-full"
//           />
//         </View>

//         <View>
//           <Text className="text-xl font-semibold text-center uppercase">
//             STACKS Dates
//           </Text>
//         </View>

//         {/* Heart Icon */}
//         <View className="bg-black/10 p-2 rounded-full items-center justify-center">
//           <TouchableOpacity>
//             <BellIcon size={25} strokeWidth={2} color="black" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <View className="pb-4">
//         <View className="mx-4 mb-4">
//           <Text className="text-2xl font-semibold text-center uppercase">
//             Find your love
//           </Text>
//         </View>


//         <View>
//           {/* <Carousel /> */}
//           {/* <DatesCard item={user2}/> */}

//         </View>
//       </View>
      
//     </SafeAreaView>
//   );
// }
// import React, { useState } from 'react';
// import { View, Text, ScrollView, ImageBackground } from 'react-native';
// import { userData } from '../../constants'; // Import your data file
// import TinderCard from 'react-tinder-card';

// function Simple() {
//   const characters = userData
//   const [lastDirection, setLastDirection] = useState()

//   const swiped = (direction, nameToDelete) => {
//     console.log('removing: ' + nameToDelete)
//     setLastDirection(direction)
//   }

//   const outOfFrame = (name) => {
//     console.log(name + ' left the screen!')
//   }

//   return (
//     <View>
//       <Text>React Native Tinder Card</Text>
//       <View>
//         {characters.map((character) =>
//           <TinderCard key={character.name} onSwipe={(dir) => swiped(dir, character.name)} onCardLeftScreen={() => outOfFrame(character.name)}>
//             <View>
//               <ImageBackground source={character.imgPath}>
//                 <Text>{character.name}</Text>
//               </ImageBackground>
//             </View>
//           </TinderCard>
//         )}
//       </View>
//       {lastDirection ? <Text>You swiped {lastDirection}</Text> : <Text/>}
//     </View>
//   )
// }

// export default Simple

import { userData } from 'constants'
import React, { useState, useMemo } from 'react'
import { ImageBackground, Text, View, Button } from 'react-native'
import TinderCard from 'react-tinder-card'

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  header: {
    color: '#000',
    fontSize: 30,
    marginBottom: 30,
  },
  cardContainer: {
    width: '90%',
    maxWidth: 260,
    height: 300,
  },
  card: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 260,
    height: 300,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 20,
  },
  cardTitle: {
    position: 'absolute',
    bottom: 0,
    margin: 10,
    color: '#fff',
  },
  buttons: {
    margin: 20,
    zIndex: -100,
  },
  infoText: {
    height: 28,
    justifyContent: 'center',
    display: 'flex',
    zIndex: -100,
  }
}


const alreadyRemoved = []
let charactersState = userData // This fixes issues with updating characters state forcing it to use the current state and not the state that was active when the card was created.

const Advanced = () => {
  const [characters, setCharacters] = useState(userData)
  const [lastDirection, setLastDirection] = useState()

  const childRefs = useMemo(() => Array(userData.length).fill(0).map(i => React.createRef()), [])

  const swiped = (direction, nameToDelete) => {
    console.log('removing: ' + nameToDelete + ' to the ' + direction)
    setLastDirection(direction)
    alreadyRemoved.push(nameToDelete)
  }

  const outOfFrame = (name) => {
    console.log(name + ' left the screen!')
    charactersState = charactersState.filter(character => character.name !== name)
    setCharacters(charactersState)
  }

  const swipe = (dir) => {
    const cardsLeft = characters.filter(person => !alreadyRemoved.includes(person.name))
    if (cardsLeft.length) {
      const toBeRemoved = cardsLeft[cardsLeft.length - 1].name // Find the card object to be removed
      const index = userData.map(person => person.name).indexOf(toBeRemoved) // Find the index of which to make the reference to
      alreadyRemoved.push(toBeRemoved) // Make sure the next card gets removed next time if this card do not have time to exit the screen
      childRefs[index].current.swipe(dir) // Swipe the card!
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>React Native Tinder Card</Text>
      <View style={styles.cardContainer}>
        {characters.map((character, index) =>
          <TinderCard ref={childRefs[index]} key={character.name} onSwipe={(dir) => swiped(dir, character.name)} onCardLeftScreen={() => outOfFrame(character.name)}>
            <View style={styles.card}>
              <ImageBackground style={styles.cardImage} source={character.imgPath}>
                <Text style={styles.cardTitle}>{character.name}</Text>
              </ImageBackground>
            </View>
          </TinderCard>
        )}
      </View>
      <View style={styles.buttons}>
        <Button onPress={() => swipe('left')} title='Swipe left!' />
        <Button onPress={() => swipe('right')} title='Swipe right!' />
      </View>
      {lastDirection ? <Text style={styles.infoText} key={lastDirection}>You swiped {lastDirection}</Text> : <Text style={styles.infoText}>Swipe a card or press a button to get started!</Text>}
    </View>
  )
}

export default Advanced