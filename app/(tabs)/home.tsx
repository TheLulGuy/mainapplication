import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Animated,
  PanResponder
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { userData } from '../../constants';

const { width: screenWidth } = Dimensions.get('window');

// Custom Tinder Card Component
function TinderCard() {
  // Track current card index (starts at 0)
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track last swipe direction
  const [lastDirection, setLastDirection] = useState('');
  // Array to store swiped cards for undo functionality
  const [swipedCards, setSwipedCards] = useState<any[]>([]);
  
  // Animation values for card position and rotation
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Get current card data
  const currentCard = userData[currentIndex];
  const hasCards = currentIndex < userData.length;
  const canUndo = swipedCards.length > 0;

  // Create PanResponder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      // Allow the pan responder to become active
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      // Handle pan gesture movement
      onPanResponderMove: (evt, gestureState) => {
        // Update card position based on finger movement
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
        
        // Calculate rotation based on horizontal movement
        const rotationValue = gestureState.dx * 0.1; // Adjust sensitivity
        rotate.setValue(rotationValue);
      },

      // Handle end of pan gesture
      onPanResponderRelease: (evt, gestureState) => {
        const threshold = screenWidth * 0.25; // 25% of screen width
        const velocityThreshold = 0.7;

        // Determine if card should be swiped or snapped back
        if (
          Math.abs(gestureState.dx) > threshold || 
          Math.abs(gestureState.vx) > velocityThreshold
        ) {
          // Determine swipe direction
          const direction = gestureState.dx > 0 ? 'right' : 'left';
          swipeCard(direction);
        } else {
          // Snap back to center
          snapBack();
        }
      },
    })
  ).current;

  // Animate card swipe
  const swipeCard = (direction: 'left' | 'right') => {
    if (!hasCards) return;

    const toValue = direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5;
    
    // Set rotation based on direction
    const rotateValue = direction === 'right' ? 15 : -15;

    // Animate card off screen
    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotate, {
        toValue: rotateValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // After animation, update state and reset values
      setSwipedCards(prev => [...prev, { ...currentCard, direction }]);
      setCurrentIndex(prev => prev + 1);
      setLastDirection(direction);
      resetCardPosition();
    });
  };

  // Snap card back to center if not swiped far enough
  const snapBack = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(rotate, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  };

  // Reset card position for new card
  const resetCardPosition = () => {
    translateX.setValue(0);
    translateY.setValue(0);
    rotate.setValue(0);
    opacity.setValue(1);
  };

  // Button swipe functions
  const swipeLeft = () => {
    if (hasCards) swipeCard('left');
  };

  const swipeRight = () => {
    if (hasCards) swipeCard('right');
  };

  // Undo last swipe
  const undoSwipe = () => {
    if (!canUndo) return;

    setSwipedCards(prev => prev.slice(0, -1));
    setCurrentIndex(prev => prev - 1);
    setLastDirection('');
    resetCardPosition();
  };

  // Calculate rotation interpolation for smooth rotation
  const rotateInterpolate = rotate.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-30deg', '0deg', '30deg'],
    extrapolate: 'clamp',
  });

  // Calculate opacity based on horizontal movement for visual feedback
  const likeOpacity = translateX.interpolate({
    inputRange: [0, screenWidth * 0.5],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = translateX.interpolate({
    inputRange: [-screenWidth * 0.5, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Swipe Cards</Text>

      {/* Card Container */}
      <View style={styles.cardContainer}>
        {hasCards ? (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { rotate: rotateInterpolate },
                ],
                opacity,
              },
            ]}
          >
            <Image
              source={currentCard.imgPath}
              style={styles.cardImage}
              resizeMode="cover"
            />
            
            {/* Like overlay - shows when swiping right */}
            <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]}>
              <Text style={styles.overlayText}>LIKE</Text>
            </Animated.View>
            
            {/* Nope overlay - shows when swiping left */}
            <Animated.View style={[styles.overlay, styles.nopeOverlay, { opacity: nopeOpacity }]}>
              <Text style={styles.overlayText}>NOPE</Text>
            </Animated.View>

            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{currentCard.name}, {currentCard.age}</Text>
              <Text style={styles.cardDistance}>{currentCard.distance}</Text>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.noCardsContainer}>
            <Text style={styles.noCardsText}>No more cards!</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* Swipe Left Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton, !hasCards && styles.disabledButton]}
          onPress={swipeLeft}
          disabled={!hasCards}
        >
          <Ionicons name="close" size={30} color="#fff" />
        </TouchableOpacity>

        {/* Undo Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.undoButton, !canUndo && styles.disabledButton]}
          onPress={undoSwipe}
          disabled={!canUndo}
        >
          <Ionicons name="refresh" size={25} color="#fff" />
        </TouchableOpacity>

        {/* Swipe Right Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton, !hasCards && styles.disabledButton]}
          onPress={swipeRight}
          disabled={!hasCards}
        >
          <Ionicons name="heart" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Status Text */}
      <View style={styles.statusContainer}>
        {lastDirection ? (
          <Text style={styles.statusText}>
            You swiped {lastDirection === 'right' ? '❤️ right' : '❌ left'}
          </Text>
        ) : (
          <Text style={styles.statusText}>
            Drag cards or use buttons to swipe left/right
          </Text>
        )}
        <Text style={styles.cardCounter}>
          {hasCards ? `${currentIndex + 1} / ${userData.length}` : `${userData.length} / ${userData.length}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2c3e50',
  },
  cardContainer: {
    width: screenWidth * 0.85,
    height: 500,
    marginBottom: 30,
    position: 'relative',
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: '75%',
  },
  cardInfo: {
    padding: 20,
    height: '25%',
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  cardDistance: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  noCardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
  },
  noCardsText: {
    fontSize: 20,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    maxWidth: 250,
    marginBottom: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  likeButton: {
    backgroundColor: '#2ecc71',
  },
  undoButton: {
    backgroundColor: '#f39c12',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  statusText: {
    fontSize: 18,
    color: '#34495e',
    marginBottom: 5,
    textAlign: 'center',
  },
  cardCounter: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 50,
    right: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderRadius: 10,
    padding: 10,
  },
  likeOverlay: {
    borderColor: '#2ecc71',
    transform: [{ rotate: '-30deg' }],
  },
  nopeOverlay: {
    borderColor: '#e74c3c',
    transform: [{ rotate: '30deg' }],
  },
  overlayText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
});

export default TinderCard;