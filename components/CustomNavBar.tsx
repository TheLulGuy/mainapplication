import { View, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import React from "react";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const PRIMARY_COLOR = "#130057";
const SECONDARY_COLOR = "#fff";

const NAVBAR_HEIGHT = 70;

const CustomNavBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: PRIMARY_COLOR }}>
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
    </SafeAreaView>
  );

  function getIconByRouteName(routeName: string, color: string) {
    switch (routeName) {
      case "Index":
        return <Feather name="home" size={18} color={color} />;
      case "Search":
        return <AntDesign name="search1" size={18} color={color} />;
      case "Analytics":
        return <Feather name="pie-chart" size={18} color={color} />;
      case "Wallet":
        return <Ionicons name="wallet-outline" size={18} color={color} />;
      case "Messages":
        return <Feather name="message-circle" size={18} color={color} />;
      case "Profile":
        return <FontAwesome6 name="circle-user" size={18} color={color} />;
      default:
        return <Feather name="home" size={18} color={color} />;
    }
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: NAVBAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'center', // Changed from 'space-around' to 'center'
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 0, // Reduced from 12 to 0
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  tabItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 13, // Kept original padding
    borderRadius: 30,
    marginHorizontal: 2, // Added small horizontal margin
  },
  text: {
    color: PRIMARY_COLOR,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default CustomNavBar;