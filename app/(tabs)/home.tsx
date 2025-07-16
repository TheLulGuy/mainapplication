import React, { useState, useMemo, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import TinderCard from 'react-tinder-card';
import { userData } from '../../constants';


function Advanced () {
  const [currentIndex, setCurrentIndex] = useState(userData.length - 1);
  const [lastDirection, setLastDirection] = useState();
  const currentIndexRef = useRef(currentIndex);

  const childRefs = useMemo(
    () =>
      Array(userData.length)
        .fill(0)
        .map((i) => React.createRef()),
    []
  );

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < userData.length - 1;
  const canSwipe = currentIndex >= 0;

  const swiped = (direction, nameToDelete, index) => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
  };

  const outOfFrame = (name, idx) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
  };

  const swipe = async (dir) => {
    if (canSwipe && currentIndex < userData.length) {
      await childRefs[currentIndex].current.swipe(dir);
    }
  };

  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    await childRefs[newIndex].current.restoreCard();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>React Tinder Card</Text>
      
      <View style={styles.cardContainer}>
        {userData.map((character, index) => (
          <View 
            key={character.name}
            style={[
              styles.cardWrapper,
              { zIndex: userData.length - index }
            ]}
          >
            <TinderCard
              ref={childRefs[index]}
              onSwipe={(dir) => swiped(dir, character.name, index)}
              onCardLeftScreen={() => outOfFrame(character.name, index)}
              preventSwipe={['up', 'down']}
            >
              <View style={styles.card}>
                <Image 
                  source={character.imgPath} 
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardFooter}>
                  <Text style={styles.cardTitle}>{character.name}</Text>
                </View>
              </View>
            </TinderCard>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, !canSwipe && styles.disabledButton]}
          onPress={() => swipe('left')}
          disabled={!canSwipe}
        >
          <Text style={styles.buttonText}>Swipe left!</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, !canGoBack && styles.disabledButton]}
          onPress={goBack}
          disabled={!canGoBack}
        >
          <Text style={styles.buttonText}>Undo swipe!</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, !canSwipe && styles.disabledButton]}
          onPress={() => swipe('right')}
          disabled={!canSwipe}
        >
          <Text style={styles.buttonText}>Swipe right!</Text>
        </TouchableOpacity>
      </View>

      {lastDirection ? (
        <Text style={styles.infoText}>You swiped {lastDirection}</Text>
      ) : (
        <Text style={styles.infoText}>
          Swipe a card or press a button to get Restore Card button visible!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000',
  },
  cardContainer: {
    width: '90%',
    maxWidth: 260,
    height: 300,
    position: 'relative',
  },
  cardWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttons: {
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 260,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#c3c4d3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  infoText: {
    height: 28,
    justifyContent: 'center',
    color: '#666',
  },
});

export default Advanced;