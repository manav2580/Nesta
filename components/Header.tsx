// components/Header.tsx

import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import icons from "@/constants/icons";
import images from "@/constants/images";

const Header = ({ title = "Search for Your Ideal Home", showBack = true }) => {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between bg-white border-b border-gray-200 h-16 px-4 mt-10 mr-5 ">
      {/* Left: Back button or placeholder */}
      {showBack ? (
        <TouchableOpacity
          onPress={() => router.back()}
          className="items-center justify-center rounded-full w-10 h-10 bg-primary-200"
        >
          <Image source={icons.backArrow} className="w-5 h-5" />
        </TouchableOpacity>
      ) : (
        <View className="w-10 h-10" />
      )}

      {/* Center: Title */}
      <Text className="flex-1 text-center text-base font-rubik-medium text-black-300">
        {title}
      </Text>

      {/* Right: Logo */}
      <View className="w-10 h-10 items-center justify-center">
        <Image
          source={images.logo}
          style={{
            width: 80,
            height: 80,
            resizeMode: "contain",
          }}
        />
      </View>
    </View>
  );
};

export default Header;
