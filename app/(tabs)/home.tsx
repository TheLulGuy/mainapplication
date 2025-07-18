import React, { useState, useMemo, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import TinderCard from 'react-tinder-card';
import { userData } from '../../constants';

const { width: windowWidth } = Dimensions.get('window');

// Main Tinder card component
function Advanced() {
  // Track the index of the current top card (starts at 0 for first card)
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track the last swipe direction for display
  const [lastDirection, setLastDirection] = useState();
  // Ref to keep currentIndex in sync for async operations
  const currentIndexRef = useRef(currentIndex);

  // Create refs for each card to control swipe/restore animations
  const childRefs = useMemo(
    () =>
      Array(userData.length)
        .fill(0)
        .map((i) => React.createRef()),
    []
  );

  // Update currentIndex and keep ref in sync
  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  // Check if we can go back (if we've swiped at least one card)
  const canGoBack = currentIndex > 0;
  // Check if we can swipe (if there are still cards left)
  const canSwipe = currentIndex < userData.length;

  // Called when a card is swiped (either manually or by button)
  const swiped = (direction, nameToDelete, index) => {
    setLastDirection(direction);
    // Move to the next card (increment index)
    updateCurrentIndex(currentIndex + 1);
  };

  // Called when a card animation finishes and leaves the screen
  const outOfFrame = (name, idx) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
  };

  // Programmatically trigger swipe animation (keeps existing animation)
  const swipe = async (dir) => {
    if (canSwipe && currentIndex < userData.length) {
      // Trigger the swipe animation on the current top card
      await childRefs[currentIndex].current.swipe(dir);
    }
  };

  // Undo the last swipe (restore previous card)
  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex - 1;
    updateCurrentIndex(newIndex);
    // Restore the card that was previously swiped
    await childRefs[newIndex].current.restoreCard();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>React Tinder Card</Text>
      
      {/* Card stack: only show cards from currentIndex onward */}
      <View style={styles.cardContainer}>
        {userData.map((character, index) => (
          // Only render cards that haven't been swiped yet
          index >= currentIndex && (
            <View 
              key={`${character.id}-${index}`}
              style={[
                styles.cardWrapper,
                // Stack cards with proper z-index (top card has highest z-index)
                { zIndex: userData.length - index }
              ]}
            >
              <TinderCard
                ref={childRefs[index]}
                onSwipe={(dir) => swiped(dir, character.name, index)}
                onCardLeftScreen={() => outOfFrame(character.name, index)}
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
          )
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
    position: 'relative', // This is crucial
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
    margin: 10,
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