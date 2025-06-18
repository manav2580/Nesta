import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { router, useLocalSearchParams } from "expo-router";

import Search from "@/components/Search";
import { Card } from "@/components/Cards";
import NoResults from "@/components/NoResults";
import Header from "@/components/Header";

import Filters from "@/components/Filters";  // Your filter modal UI component
import { getProperties } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import { SVGPriceMarker } from '@/components/PriceMarker'; // Import your SVG marker component



const Explore = () => {
  // Get query and filter from URL params (stringified JSON for filter)
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();

  // Show map if we have results and a query/filter (you can customize this)
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters state object - parse from URL or use default values
  const [filters, setFilters] = useState(() => {
    try {
      return params.filter ? JSON.parse(params.filter) : {
        type: [] as string[],
        negotiable: false,
        bedrooms: null as number | null,
        bathrooms: null as number | null,
        priceRange: [0, 100000] as [number, number],
        areaRange: [0, 5000] as [number, number],
        rating: null as number | null,
      };
    } catch {
      return {
        type: [] as string[],
        negotiable: false,
        bedrooms: null,
        bathrooms: null,
        priceRange: [0, 100000],
        areaRange: [0, 5000],
        rating: null,
      };
    }
  });

  // Your useAppwrite hook - initially skip fetch because we'll call refetch manually with proper params
  const { data: properties, refetch, loading } = useAppwrite({
    fn: getProperties,
    params: {
      filter: params.filter || "",
      query: params.query || "",
    },
    skip: true,
  });

  // On mount or when URL params change, fetch properties and set map visibility
  useEffect(() => {
    refetch({
      filter: params.filter || "",
      query: params.query || "",
    });
    setShowMap(!!(params.query || params.filter));
  }, [params.query, params.filter]);

  // When filters or search query change, update URL params and refetch properties
  // This lets you keep URL in sync with filters/search, making the page sharable/bookmarkable
  const applyFiltersAndSearch = (newFilters: typeof filters, newQuery: string) => {
    // Update URL params (push new state)
    router.push({
      pathname: "/explore", // or whatever route
      query: {
        query: newQuery,
        filter: JSON.stringify(newFilters),
      },
    });

    // Fetch with new filters and query
    refetch({
      filter: JSON.stringify(newFilters),
      query: newQuery,
    });

    setShowMap(true); // show map on search or filter
  };

  // Handle search from Search component (pass current filters along)
  const handleSearch = (q: string) => {
    applyFiltersAndSearch(filters, q);
  };

  // Handle apply filters from Filters modal (pass current search query along)
  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    applyFiltersAndSearch(newFilters, params.query || "");
    setShowFilters(false);
  };

  // Reset filters to defaults and clear search query
  const handleResetFilters = () => {
    const defaultFilters = {
      type: [] as string[],
      negotiable: false,
      bedrooms: null,
      bathrooms: null,
      priceRange: [0, 100000] as [number, number],
      areaRange: [0, 5000] as [number, number],
      rating: null,
    };
    setFilters(defaultFilters);
    applyFiltersAndSearch(defaultFilters, "");
    setShowFilters(false);
  };

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  const initialRegion = {
    latitude: properties?.[0]?.latitude || 19.076,
    longitude: properties?.[0]?.longitude || 72.8777,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const [buildings, setBuildings] = useState<any[]>([]);


  return (
    <View className="flex-1 bg-white">
      <Header title="Explore Properties" />
      <SafeAreaView className="h-full bg-white">
        <View className="px-5">
          <Search
            openFilterModal={() => setShowFilters(true)}
            onSearch={handleSearch}
            // Optionally pass current search query to Search component if needed
          />

          {showMap && (
            <View
              className="mt-5 mb-4 rounded-2xl overflow-hidden"
              style={{ height: 300 }}
            >
              <MapView
                style={{ width: "100%", height: "100%" }}
                initialRegion={initialRegion}
                
              >
                {properties?.map((item) => (
                  <Marker
                    key={item.$id}
                    coordinate={{
                      latitude: item.latitude,
                      longitude: item.longitude,
                    }}
                    onPress={() => handleCardPress(item.$id)}
                  >
                    <SVGPriceMarker
                      price={
                        item.pricingDetails?.[0]?.amount
                          ? item.pricingDetails[0].amount.toLocaleString()
                          : "-"
                      }
                    />
                  </Marker>
                ))}
              </MapView>
            </View>
          )}

          <Text className="text-xl font-rubik-bold text-black-300 mt-3 mb-1">
            Found {properties?.length ?? 0} Properties in{" "}
            {params.query || "your area"}
          </Text>
        </View>

        <FlatList
          data={properties}
          numColumns={2}
          renderItem={({ item }) => (
            <Card item={item} onPress={() => handleCardPress(item.$id)} />
          )}
          keyExtractor={(item) => item.$id}
          contentContainerClassName="pb-32"
          columnWrapperClassName="flex gap-5 px-5"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator size="large" className="text-primary-300 mt-5" />
            ) : (
              <NoResults />
            )
          }
        />

        {showFilters && (
          <Filters
            visible={showFilters}
            filters={filters}
            setFilters={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            onClose={() => setShowFilters(false)}
            setBuildings={setBuildings}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default Explore;
