import icons from "@/constants/icons";
import images from "@/constants/images";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Models } from "react-native-appwrite";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
interface Props {
  item: Models.Document;
  onPress?: () => void;
}

export const FeaturedCard = ({ item, onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-72 h-96 rounded-3xl overflow-hidden relative active:opacity-90"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 20,
        elevation: 10,
      }}
    >
      {/* Main Image */}
      <Image
        source={{ uri: item.features_image_url[0] }}
        className="w-full h-full absolute"
        resizeMode="cover"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,50,0.6)', 'rgba(0,0,80,0.8)']}
        className="absolute bottom-0 w-full h-2/3"
      />

      {/* Rating Badge */}
      <View className="absolute top-4 right-4 overflow-hidden rounded-full">
        <BlurView
          intensity={50}
          tint="light"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 122, 255, 0.7)', // blue glass
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
          }}
        >
          <Image source={icons.star} style={{ width: 14, height: 14, tintColor: 'white' }} />
          <Text
            style={{
              color: 'white',
              fontSize: 12,
              fontWeight: 'bold',
              marginLeft: 5,
            }}
          >
            {item.rating}
          </Text>
        </BlurView>
      </View>

      {/* Text Content */}
      <View className="absolute bottom-4 px-5 w-full">
        <Text
          className="text-xl text-white font-extrabold"
          numberOfLines={1}
        >
          {item.buildingName}
        </Text>
        <Text className="text-sm text-white opacity-90" numberOfLines={1}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
};


export const Card = ({ item, onPress }: Props) => {
  // console.log("🧾 Card item:", item);
  // console.log("📊 pricingDetails:", item.pricingDetails);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-1 rounded-2xl bg-white overflow-hidden"
      style={{
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        borderRadius: 16,
        marginHorizontal: 8,
        marginVertical: 12,
        backgroundColor: 'white',
      }}
    >
      {/* Image with Overlay */}
      <View className="relative">
        <Image
          source={{ uri: item.features_image_url?.[0] || "" }}
          className="w-full h-36 rounded-2xl"
          resizeMode="cover"
        />

        {/* Star Rating */}
        <View className="absolute top-2 right-2 bg-blue-500/80 px-2 py-0.5 rounded-full flex-row items-center">
          <Image source={icons.star} className="w-3.5 h-3.5 tint-white" />
          <Text className="text-white text-xs font-bold ml-1">{item.rating}</Text>
        </View>
      </View>

      {/* Text Info */}
      <View className="p-3">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {item.buildingName}
        </Text>
        <Text className="text-xs text-gray-500" numberOfLines={1}>
          {item.address}
        </Text>

        {/* Price or other details */}
        <View className="flex-row flex-wrap gap-2 mt-2">
          {Array.isArray(item.pricingDetails) && item.pricingDetails.length > 0 ? (
            item.pricingDetails.map((price) => {
              const typeLabelMap: Record<string, string> = {
                short_stay: "per day",
                rent_monthly: "per month",
                rent_yearly: "per year",
                hourly: "per hour",
              };

              const typeDisplay = typeLabelMap[price?.type?.toLowerCase?.()] ?? "all included";

              return (
                <View
                  key={price?.$id || Math.random().toString()}
                  className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-1"
                >
                  <Text className="text-blue-800 text-xs font-medium">
                    ₹ {price?.amount?.toLocaleString?.() ?? "?"} <Text className="text-gray-600 font-normal"> {typeDisplay}</Text>
                  </Text>
                </View>
              );
            })
          ) : (
            <Text className="text-sm text-gray-500 italic">No pricing info available</Text>
          )}
        </View>

      </View>
    </TouchableOpacity>
  );
};
