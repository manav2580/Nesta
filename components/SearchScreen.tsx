import React, { useState } from "react";
import { View } from "react-native";
import Search from "./Search";
import Filters from "./Filters";

const SearchScreen = () => {
  const [filters, setFilters] = useState({
    type: [],
    negotiable: false,
    bedrooms: null,
    bathrooms: null,
    priceRange: [0, 100000],
    areaRange: [0, 5000],
    rating: null,
  });

  const [filtersVisible, setFiltersVisible] = useState(false);

  const openFilterModal = () => setFiltersVisible(true);
  const closeFilterModal = () => setFiltersVisible(false);

  const onApplyFilters = () => {
    // You can run your search with applied filters here
    // For example, re-fetch data or update query params
    setFiltersVisible(false);
  };

  const onResetFilters = () => {
    setFilters({
      type: [],
      negotiable: false,
      bedrooms: null,
      bathrooms: null,
      priceRange: [0, 100000],
      areaRange: [0, 5000],
      rating: null,
    });
  };

  return (
    <View className="flex-1">
      <Search openFilterModal={openFilterModal} />
      <Filters
        visible={filtersVisible}
        onClose={closeFilterModal}
        filters={filters}
        setFilters={setFilters}
        onApply={onApplyFilters}
        onReset={onResetFilters}
      />
    </View>
  );
};

export default SearchScreen;
