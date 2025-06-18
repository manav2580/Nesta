import React, { useEffect, useRef } from "react";
import { Animated, View, Image } from "react-native";
import images from "@/constants/images";

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1.3,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 7,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white relative">
      <Animated.View
        style={{
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#60A5FA", // primary blue ripple
          transform: [{ scale: rippleScale }],
          opacity: rippleOpacity,
        }}
      />
      <Animated.Image
        source={images.logo}
        resizeMode="contain"
        style={{
          width: 100,
          height: 100,
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
        }}
      />
    </View>
  );
}
