import React from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

const SearchResults = () => {
  const params = useLocalSearchParams<{ matches?: string }>();
  const matches = params.matches ? JSON.parse(params.matches) : [];

  const goToProperty = (propertyId: string) => {
    router.push(`/properties/${propertyId}`);
  };

  return (
    <View className="flex-1 bg-white px-5 py-6">
      <Text className="text-xl font-bold text-blue-600 mb-4">🏠 Top Matches</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.predicted_id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="flex-row items-center bg-blue-50 border border-blue-200 rounded-lg shadow-md mb-3 p-3"
            onPress={() => goToProperty(item.predicted_id)}
            activeOpacity={0.7}
          >
            <Image 
              source={{ uri: item.image_url }} 
              className="w-24 h-24 rounded-lg shadow-sm mr-4" 
            />
            <View>
              <Text className="text-lg font-semibold text-blue-800">{item.predicted_building}</Text>
              <Text className="text-sm text-gray-600">Match Score: <Text className="font-semibold text-blue-700">{Math.round(item.match_score * 100)}%</Text></Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default SearchResults;
