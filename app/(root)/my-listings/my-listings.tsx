import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { getMyListedBuildings } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import icons from "@/constants/icons";
import Header from "@/components/Header";

const MyListings = () => {
  const { user } = useGlobalContext();
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      if (user?.$id) {
        const results = await getMyListedBuildings(user.$id);
        setBuildings(results);
      }
      setLoading(false);
    };

    fetchMyListings();
  }, []);

  const goToProperty = (buildingId: string) => {
    router.push(`/my-listings/update/${buildingId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header title="My Listings" />
      {buildings.length === 0 ? (
        <Text className="text-center text-gray-500 text-base mt-10">
          You haven’t listed any properties yet.
        </Text>
      ) : (
        <FlatList
          data={buildings}
          keyExtractor={(item) => item.$id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row bg-blue-50 border border-blue-100 rounded-2xl shadow-sm mb-5 p-4"
              onPress={() => goToProperty(item.$id)}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: item.exteriorImage_url?.[0] }}
                className="w-28 h-28 rounded-xl mr-4"
              />
              <View className="flex-1 justify-between">
                <Text className="text-lg font-semibold text-blue-800" numberOfLines={1}>
                  {item.buildingName}
                </Text>
                <Text className="text-sm text-gray-600" numberOfLines={2}>
                  {item.address}, {item.country}
                </Text>
                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-base font-bold text-blue-600">
                    ${item.price?.toLocaleString()}
                  </Text>
                  <View className="bg-blue-200 px-2 py-0.5 rounded-full">
                    <Text className="text-xs text-blue-800 font-medium capitalize">
                      {item.type}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default MyListings;
