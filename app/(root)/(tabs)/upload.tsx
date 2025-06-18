import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Linking, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import { uploadToCloudinary } from "../../../lib/cloudinaryUpload"; // Adjust path if needed
import { useAppwrite } from "@/lib/useAppwrite";
import { createBuildingWithDetails, fetchFeatureVector } from "@/lib/appwrite";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import PricingInputList from "@/components/PricingInputList";
import { useGlobalContext } from "@/lib/global-provider";
import { router } from "expo-router";
import Header from "@/components/Header";
const UploadBuilding = () => {
  const [buildingName, setBuildingName] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [featureImages, setFeatureImages] = useState<string[]>([]);
  const [type, setType] = useState("House");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [facilities, setFacilities] = useState<string[]>([]);
  const [yearBuilt, setYearBuilt] = useState("");
  const [facilitiesOpen, setFacilitiesOpen] = useState(false);
  const facilityOptions = [
    { label: "Parking", value: "Parking" },
    { label: "Gym", value: "Gym" },
    { label: "Swimming Pool", value: "Swimming" },
    { label: "Security", value: "Security" },
    { label: "Elevator", value: "elevator" }
  ];
  const [open, setOpen] = useState(false);
  const typeOptions = ["Apartment", "House", "Office", "Villa"];
  const [exteriorImages, setExteriorImages] = useState<string[]>([]);
  const [interiorImages, setInteriorImages] = useState<string[]>([]);
  const [pricingList, setPricingList] = useState([
    { amount: 0, type: '', unit: '', negotiable: true }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useGlobalContext();
  const sellerId = user?.$id;
  const pickImage = async (setImageFunction: (images: string[]) => void, currentImages: string[]) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageFunction([...currentImages, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number, images: string[], setImages: (images: string[]) => void) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const renderImagePreviews = (images: string[], setImages: (images: string[]) => void) => (
    <View className="flex-row flex-wrap mt-2">
      {images.map((img, index) => (
        <View key={index} className="relative mr-2 mb-2">
          <Image source={{ uri: img }} className="w-16 h-16 rounded-lg" />
          <TouchableOpacity
            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
            onPress={() => removeImage(index, images, setImages)}
          >
            <Ionicons name="close" size={14} color="white" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
  const { postData, loading, error } = useAppwrite({
    fn: createBuildingWithDetails, // Use createBuilding function
    method: "POST", // Specify this is a POST request
    skip: true, // Skip auto-fetching
  });
  const handleUpload = async () => {
    try {
      setIsUploading(true); // ✅ Show loader

      console.log("Starting upload process...");

      if (!exteriorImages.length || !interiorImages.length) {
        alert("Please select at least one exterior and one interior image.");
        console.warn("Image selection is missing.");
        setIsUploading(false);
        return;
      }

      const exteriorImage_url = await Promise.all(
        exteriorImages.map(async (image) => {
          const uploaded = await uploadToCloudinary(image);
          return uploaded.url;
        })
      );

      const allImages_url = await Promise.all(
        interiorImages.map(async (image) => {
          const uploaded = await uploadToCloudinary(image);
          return uploaded.url;
        })
      );

      const features_feature_vector = (await fetchFeatureVector(exteriorImage_url)).map(vector =>
        vector.join(",")
      );

      const formData = {
        latitude: Number(latitude),
        longitude: Number(longitude),
        buildingName,
        address,
        country,
        price: Number(price),
        description,
        type,
        area: Number(area),
        bedrooms: Math.floor(Number(bedrooms)),
        bathrooms: Math.floor(Number(bathrooms)),
        yearBuilt: Math.floor(Number(yearBuilt)),
        exteriorImage_url,
        allImages_url,
        features_image_url: exteriorImage_url,
        features_feature_vector,
        facilities,
        pricingList,
        sellerId,
      };

      await createBuildingWithDetails(formData);
      alert("Building uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Try again.");
    } finally {
      setIsUploading(false); // ✅ Hide loader
    }
  };

  // Open Google Maps Picker
  const openGoogleMaps = async () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const result = await WebBrowser.openBrowserAsync(url);

    if (result.type === "dismiss") {
      // The user manually selected a location; now we need to get the coordinates
      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Always-visible header */}
      <Header title="Upload Building" />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Google Maps Button */}
        <TouchableOpacity onPress={openGoogleMaps} className="bg-blue-600 p-4 rounded-lg items-center mt-4">
          <Text className="text-white font-bold">Pick Location in Google Maps</Text>
        </TouchableOpacity>

        <Text className="mt-4 text-gray-500 text-sm">
          1️⃣ Open Google Maps ➡️ 2️⃣ Long press to drop a pin ➡️ 3️⃣ Copy & paste latitude/longitude below.
        </Text>

        <Text className="mt-4 text-gray-600">Latitude</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mt-2"
          placeholder="Paste latitude here"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
        />

        <Text className="mt-4 text-gray-600">Longitude</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mt-2"
          placeholder="Paste longitude here"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
        />

        <MapView
          style={{ width: "100%", height: 200, marginTop: 10 }}
          region={{
            latitude: latitude ? parseFloat(latitude) : 0,
            longitude: longitude ? parseFloat(longitude) : 0,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {latitude && longitude && (
            <Marker coordinate={{ latitude: parseFloat(latitude), longitude: parseFloat(longitude) }} />
          )}
        </MapView>

        {/* Building Info Inputs */}
        <Text className="mt-4 text-gray-600">Building Name</Text>
        <TextInput className="border border-gray-300 rounded-lg p-3 mt-2" placeholder="Enter building name" value={buildingName} onChangeText={setBuildingName} />

        <Text className="mt-4 text-gray-600">Address</Text>
        <TextInput className="border border-gray-300 rounded-lg p-3 mt-2" placeholder="Enter address" value={address} onChangeText={setAddress} />

        <Text className="mt-4 text-gray-600">Country</Text>
        <TextInput className="border border-gray-300 rounded-lg p-3 mt-2" placeholder="Enter country" value={country} onChangeText={setCountry} />

        <PricingInputList pricingList={pricingList} setPricingList={setPricingList} />

        <Text className="mt-4 text-gray-600">Description</Text>
        <TextInput className="border border-gray-300 rounded-lg p-3 mt-2" placeholder="Enter description" multiline numberOfLines={4} value={description} onChangeText={setDescription} />

        {/* Exterior Images */}
        <Text className="mt-6 text-gray-700 font-semibold">Exterior Images</Text>
        <TouchableOpacity className="border border-dashed border-blue-400 p-10 items-center mt-2 rounded-lg relative" onPress={() => pickImage(setExteriorImages, exteriorImages)}>
          <Text className="text-blue-500">Tap to select images</Text>
        </TouchableOpacity>
        {renderImagePreviews(exteriorImages, setExteriorImages)}

        {/* Interior Images */}
        <Text className="mt-6 text-gray-700 font-semibold">Interior Images</Text>
        <TouchableOpacity className="border border-dashed border-blue-400 p-10 items-center mt-2 rounded-lg relative" onPress={() => pickImage(setInteriorImages, interiorImages)}>
          <Text className="text-blue-500">Tap to select images</Text>
        </TouchableOpacity>
        {renderImagePreviews(interiorImages, setInteriorImages)}

        {/* Building Details */}
        <Text className="mt-6 text-lg font-bold text-gray-700">Building Details</Text>

        <Text className="mt-4 text-gray-600">Type</Text>
        <DropDownPicker
          open={open}
          value={type}
          items={typeOptions.map((option) => ({ label: option, value: option }))}
          setOpen={setOpen}
          setValue={setType}
          style={{ marginTop: 10, borderColor: "#ccc" }}
          dropDownContainerStyle={{ borderColor: "#ccc" }}
        />

        <Text className="mt-4 text-gray-600">Area (sq ft)</Text>
        <TextInput className="border border-gray-300 rounded-lg p-3 mt-2" placeholder="Enter area" keyboardType="numeric" value={area} onChangeText={setArea} />

        <Text className="mt-4 text-gray-600">Bedrooms</Text>
        <TextInput className="border border-gray-300 rounded-lg p-3 mt-2" placeholder="Enter number of bedrooms" keyboardType="numeric" value={bedrooms} onChangeText={setBedrooms} />

        <Text className="mt-4 text-gray-600">Bathrooms</Text>
        <TextInput className="border border-gray-300 rounded-lg p-3 mt-2" placeholder="Enter number of bathrooms" keyboardType="numeric" value={bathrooms} onChangeText={setBathrooms} />

        <Text className="mt-4 text-gray-600">Facilities</Text>
        <DropDownPicker
          open={facilitiesOpen}
          value={facilities}
          items={facilityOptions}
          setOpen={setFacilitiesOpen}
          setValue={setFacilities}
          multiple={true}
          min={1}
          placeholder="Select Facilities"
          style={{ marginTop: 10, borderColor: "#ccc" }}
          dropDownContainerStyle={{ borderColor: "#ccc" }}
          mode="BADGE"
        />

        <Text className="mt-4 text-gray-600">Year Built</Text>
        <TextInput className="border border-gray-300 rounded-lg p-3 mt-2 w-full" placeholder="Enter year" keyboardType="numeric" value={yearBuilt} onChangeText={setYearBuilt} />
        {isUploading && (
          <View className="items-center justify-center mt-6">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-600 mt-2">Uploading building...</Text>
          </View>
        )}

        <TouchableOpacity
          className={`bg-blue-600 p-4 mt-6 rounded-lg items-center ${isUploading ? "opacity-50" : ""}`}
          onPress={handleUpload}
          disabled={isUploading}
        >
          <Text className="text-white font-bold text-lg">Upload</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

};

export default UploadBuilding;
