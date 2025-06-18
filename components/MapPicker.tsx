import React, { useState } from "react";
import { View, Text } from "react-native";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';

const MapPicker = ({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) => {
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    onLocationSelect(latitude, longitude);
  };

  return (
    <View className="flex-1">
      <MapView
        className="w-full h-full"
        initialRegion={{
          latitude: 37.7749, // Default: San Francisco
          longitude: -122.4194,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
      >
        {selectedLocation && <Marker coordinate={selectedLocation} title="Selected Location" />}
      </MapView>
    </View>
  );
};

export default MapPicker;
