import { userData } from 'constants';
import React, { useState, useMemo } from 'react';
import { ImageBackground, Text, View, Button } from 'react-native';
import TinderCard from 'react-tinder-card';

const alreadyRemoved = [];
let charactersState = userData;

const Advanced = () => {
  const [characters, setCharacters] = useState(userData);
  const [lastDirection, setLastDirection] = useState();

  const childRefs = useMemo(() => Array(userData.length).fill(0).map(i => React.createRef()), []);

  const swiped = (direction, nameToDelete) => {
    console.log('removing: ' + nameToDelete + ' to the ' + direction);
    setLastDirection(direction);
    alreadyRemoved.push(nameToDelete);
  };

  const outOfFrame = (name) => {
    console.log(name + ' left the screen!');
    charactersState = charactersState.filter(character => character.name !== name);
    setCharacters(charactersState);
  };

  const swipe = (dir) => {
    const cardsLeft = characters.filter(person => !alreadyRemoved.includes(person.name));
    if (cardsLeft.length) {
      const toBeRemoved = cardsLeft[cardsLeft.length - 1].name;
      const index = userData.map(person => person.name).indexOf(toBeRemoved);
      alreadyRemoved.push(toBeRemoved);
      childRefs[index].current.swipe(dir);
    }
  };

  return (
    <View className="flex items-center justify-center w-full">
      <Text className="text-black text-3xl mb-8">React Native Tinder Card</Text>
      <View className="w-[90%] max-w-[260px] h-[300px]">
        {characters.map((character, index) =>
          <TinderCard 
            ref={childRefs[index]} 
            key={character.name} 
            onSwipe={(dir) => swiped(dir, character.name)} 
            onCardLeftScreen={() => outOfFrame(character.name)}
          >
            <View className="absolute bg-white w-full max-w-[260px] h-[300px] rounded-xl shadow-lg shadow-black/20">
              <ImageBackground 
                className="w-full h-full rounded-xl overflow-hidden" 
                source={character.imgPath}
              >
                <Text className="absolute bottom-0 m-2.5 text-white">{character.name}</Text>
              </ImageBackground>
            </View>
          </TinderCard>
        )}
      </View>
      <View className="m-5 -z-10">
        <Button onPress={() => swipe('left')} title='Swipe left!' />
        <Button onPress={() => swipe('right')} title='Swipe right!' />
      </View>
      {lastDirection ? (
        <Text className="h-7 justify-center flex -z-10" key={lastDirection}>
          You swiped {lastDirection}
        </Text>
      ) : (
        <Text className="h-7 justify-center flex -z-10">
          Swipe a card or press a button to get started!
        </Text>
      )}
    </View>
  );
};

export default Advanced;