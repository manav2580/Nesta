import React, { useCallback, useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import Slider from "@react-native-community/slider";
import { filterBuildingsWithDetails } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";

type FilterType = {
  type: string[];
  negotiable: boolean;
  bedrooms?: number | null;
  bathrooms?: number | null;
  priceRange: [number, number];
  areaRange: [number, number];
  rating?: number | null;
};

type FiltersProps = {
  visible: boolean;
  onClose: () => void;
  filters: FilterType;
  setFilters: (filters: FilterType) => void;
  onApply: () => void;
  onReset: () => void;
  setBuildings: (buildings: any[]) => void; // add this to update UI with results
};

const types = ["Apartment", "Villa", "House", "Condo", "Townhouse"];
const numberOptions = [1, 2, 3, 4, 5];

const Filters = ({
  visible,
  onClose,
  filters,
  setFilters,
  onApply,
  onReset,
  setBuildings,
}: FiltersProps) => {
  const {
    postData: fetchFilteredBuildings,
    loading: filterLoading,
    error: filterError,
  } = useAppwrite({
    fn: filterBuildingsWithDetails,
    method: "POST",
    skip: true,
  });

  const toggleType = useCallback(
    (type: string) => {
      const currentTypes = Array.isArray(filters.type) ? filters.type : [];
      const updated = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];
      setFilters({ ...filters, type: updated });
    },
    [filters, setFilters]
  );

  const toggleValue = useCallback(
    (field: "bedrooms" | "bathrooms" | "rating", value: number) => {
      const currentVal = filters[field] ?? null;
      setFilters({ ...filters, [field]: currentVal === value ? null : value });
    },
    [filters, setFilters]
  );

  const updateRange = useCallback(
    (field: "priceRange" | "areaRange", index: 0 | 1, value: number) => {
      const current = [...filters[field]];
      current[index] = value;
      setFilters({ ...filters, [field]: current as [number, number] });
    },
    [filters, setFilters]
  );

  const handleApplyFilters = async () => {
    try {
      const results = await fetchFilteredBuildings(filters);
      if (Array.isArray(results)) {
        setBuildings(results);
      } else {
        setBuildings([]);
      }
      onApply();
      onClose();
    } catch (err) {
      console.error("Filter error:", err);
      setBuildings([]);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-white px-6 pt-6">
        <Text className="text-2xl font-bold mb-4">Filters</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Property Type */}
          <Text className="text-base font-semibold mb-2">Property Type</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {types.map((type) => {
              const selected = (filters.type ?? []).includes(type);
              return (
                <TouchableOpacity
                  key={type}
                  className={`px-4 py-2 rounded-full shadow-sm ${
                    selected ? "bg-blue-600" : "bg-gray-100"
                  }`}
                  onPress={() => toggleType(type)}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selected ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Negotiable */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-semibold">Negotiable</Text>
            <Switch
              value={filters.negotiable}
              onValueChange={(val) =>
                setFilters({ ...filters, negotiable: val })
              }
            />
          </View>

          {/* Bedrooms */}
          <Text className="text-base font-semibold mb-2">Min Bedrooms</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {numberOptions.map((val) => (
              <TouchableOpacity
                key={`bed-${val}`}
                className={`px-3 py-1.5 rounded-full ${
                  filters.bedrooms === val ? "bg-blue-600" : "bg-gray-100"
                }`}
                onPress={() => toggleValue("bedrooms", val)}
              >
                <Text
                  className={`text-sm font-medium ${
                    filters.bedrooms === val ? "text-white" : "text-gray-800"
                  }`}
                >
                  {val}+
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bathrooms */}
          <Text className="text-base font-semibold mb-2">Min Bathrooms</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {numberOptions.map((val) => (
              <TouchableOpacity
                key={`bath-${val}`}
                className={`px-3 py-1.5 rounded-full ${
                  filters.bathrooms === val ? "bg-blue-600" : "bg-gray-100"
                }`}
                onPress={() => toggleValue("bathrooms", val)}
              >
                <Text
                  className={`text-sm font-medium ${
                    filters.bathrooms === val ? "text-white" : "text-gray-800"
                  }`}
                >
                  {val}+
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price Range */}
          <Text className="text-base font-semibold mb-2">Price Range (₹)</Text>
          <View className="mb-2">
            <Text className="text-sm text-gray-600 mb-1">
              ₹{filters.priceRange[0]?.toLocaleString()} - ₹
              {filters.priceRange[1]?.toLocaleString()}
            </Text>
            <Slider
              minimumValue={0}
              maximumValue={200000}
              step={5000}
              value={filters.priceRange[0]}
              onValueChange={(val) => updateRange("priceRange", 0, val)}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#2563EB"
            />
            <Slider
              minimumValue={0}
              maximumValue={200000}
              step={5000}
              value={filters.priceRange[1]}
              onValueChange={(val) => updateRange("priceRange", 1, val)}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#2563EB"
            />
          </View>

          {/* Area Range */}
          <Text className="text-base font-semibold mt-4 mb-2">
            Area Range (sq ft)
          </Text>
          <Text className="text-sm text-gray-600 mb-1">
            {filters.areaRange[0]} - {filters.areaRange[1]} sqft
          </Text>
          <Slider
            minimumValue={0}
            maximumValue={10000}
            step={100}
            value={filters.areaRange[0]}
            onValueChange={(val) => updateRange("areaRange", 0, val)}
            minimumTrackTintColor="#2563EB"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#2563EB"
          />
          <Slider
            minimumValue={0}
            maximumValue={10000}
            step={100}
            value={filters.areaRange[1]}
            onValueChange={(val) => updateRange("areaRange", 1, val)}
            minimumTrackTintColor="#2563EB"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#2563EB"
          />

          {/* Rating */}
          <Text className="text-base font-semibold mt-4 mb-2">Min Rating</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((val) => (
              <TouchableOpacity
                key={`rating-${val}`}
                className={`px-3 py-1.5 rounded-full ${
                  filters.rating === val ? "bg-yellow-400" : "bg-gray-100"
                }`}
                onPress={() => toggleValue("rating", val)}
              >
                <Text
                  className={`text-sm font-medium ${
                    filters.rating === val ? "text-white" : "text-gray-800"
                  }`}
                >
                  {val}★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View className="flex-row justify-between items-center py-4 border-t border-gray-200 mt-3">
          <TouchableOpacity onPress={onReset}>
            <Text className="text-base text-gray-500">Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleApplyFilters}
            className="bg-blue-600 px-5 py-2 rounded-full"
          >
            <Text className="text-white font-semibold">
              {filterLoading ? "Loading..." : "Apply Filters"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default Filters;
