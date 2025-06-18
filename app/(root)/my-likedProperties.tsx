import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { getAllLikedBuildings } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import icons from "@/constants/icons";
import images from "@/constants/images";
import Header from "@/components/Header";

const LikedProperties = () => {
  const { user } = useGlobalContext();
  const [likedBuildings, setLikedBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiked = async () => {
      const buildings = await getAllLikedBuildings(user?.$id);
      setLikedBuildings(buildings);
      setLoading(false);
    };

    fetchLiked();
  }, []);

  const goToProperty = (propertyId: string) => {
    router.push(`/properties/${propertyId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header title="Liked Properties" />
      <View className="flex-1 px-5 pt-2">
        {likedBuildings.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 text-base">No liked properties yet.</Text>
          </View>
        ) : (
          <FlatList
            data={likedBuildings}
            keyExtractor={(item) => item.$id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center bg-white border border-gray-100 rounded-2xl shadow-sm mb-4 p-3"
                onPress={() => goToProperty(item.$id)}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri: item.exteriorImage_url?.[0] || images.placeholder,
                  }}
                  className="w-28 h-28 rounded-xl mr-4 bg-gray-100"
                />
                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-lg font-rubik-medium text-primary-900"
                  >
                    {item.buildingName}
                  </Text>
                  <Text
                    numberOfLines={2}
                    className="text-sm text-gray-600 mt-1"
                  >
                    {item.address}, {item.country}
                  </Text>
                  <Text className="text-xs text-primary-500 font-rubik-medium mt-2">
                    Tap to view details →
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default LikedProperties;
