import { View, TouchableOpacity, StyleSheet, Image, Text } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Feather, FontAwesome6, AntDesign, Ionicons, FontAwesome } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import React, { useState, useEffect } from "react";
import { auth, db } from "../FirebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const PRIMARY_COLOR = "#130057";
const SECONDARY_COLOR = "#fff";

const CustomNavBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Listen to user's profile data changes
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setUserProfileImage(userData.profileImageURL || null);
          setUserName(userData.name || user.displayName || user.email || "User");
        }
      });

      return unsubscribe;
    }
  }, []);

  const ProfileIcon = ({ color, size = 18 }: { color: string; size?: number }) => {
    if (userProfileImage) {
      return (
        <Image 
          source={{ uri: userProfileImage }} 
          style={{ 
            width: size + 4, 
            height: size + 4, 
            borderRadius: (size + 4) / 2,
            borderWidth: 1,
            borderColor: color === "#130057" ? "#130057" : "transparent"
          }}
        />
      );
    } else if (userName) {
      const initials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      return (
        <View 
          style={{
            width: size + 4,
            height: size + 4,
            borderRadius: (size + 4) / 2,
            backgroundColor: color === "#130057" ? "#130057" : "rgba(255, 255, 255, 0.3)",
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: color === "#130057" ? "#fff" : color
          }}
        >
          <Text style={{ 
            color: color === "#130057" ? "#fff" : color, 
            fontSize: (size + 4) * 0.4, 
            fontWeight: 'bold' 
          }}>
            {initials}
          </Text>
        </View>
      );
    } else {
      return <FontAwesome6 name="circle-user" size={size} color={color} />;
    }
  };
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        if (["_sitemap", "+not-found"].includes(route.name)) return null;

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <AnimatedTouchableOpacity
            layout={LinearTransition.springify().mass(0.5)}
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabItem,
              { backgroundColor: isFocused ? SECONDARY_COLOR : "transparent" },
            ]}
          >
            {getIconByRouteName(
              route.name,
              isFocused ? PRIMARY_COLOR : SECONDARY_COLOR
            )}
            {isFocused && (
              <Animated.Text
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={styles.text}
              >
                {label as string}
              </Animated.Text>
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );

  function getIconByRouteName(routeName: string, color: string) {
    console.log("Route name:", routeName); // Debug log
    switch (routeName) {
      case "Home":
        return <Feather name="home" size={18} color={color} />;
      case "Messages":
        return <Feather name="message-circle" size={18} color={color} />;
      case "Profile":
        return <ProfileIcon color={color} size={18} />;
      default:
        console.log("Using default icon for route:", routeName); // Debug log
        return <Feather name="help-circle" size={18} color={color} />;
    }
  }
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  tabItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 30,
  },
  text: {
    color: PRIMARY_COLOR,
    marginLeft: 8,
    fontWeight: "500",
  },
});

export default CustomNavBar;