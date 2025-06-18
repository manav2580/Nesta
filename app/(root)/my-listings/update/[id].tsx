import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useGlobalContext } from '@/lib/global-provider'; // Custom hook for global context
import PricingInputList from "@/components/PricingInputList";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload"; // Utility for uploading images
import { fetchFeatureVector } from '@/lib/appwrite'; // Utility for fetching feature vector from image
import { useAppwrite } from '@/lib/useAppwrite'; // Custom hook for interacting with Appwrite
import { updateBuildingWithDetails, getBuildingById } from '@/lib/appwrite'; // Service function to update building details // Custom hook for interacting with Appwrite
import { useLocalSearchParams } from 'expo-router';

const UpdateBuilding = () => {
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
  const [exteriorImages, setExteriorImages] = useState<string[]>([]);
  const [interiorImages, setInteriorImages] = useState<string[]>([]);
  const [pricingList, setPricingList] = useState([{ amount: 0, type: '', unit: '', negotiable: true }]);

  const { user } = useGlobalContext();
  const sellerId = user?.$id;
  const { id: buildingId } = useLocalSearchParams(); // Retrieve buildingId from URL parameters

  useEffect(() => {
    const fetchData = async () => {
      try {
        const buildingData = await getBuildingById(buildingId);
        setBuildingName(buildingData.buildingName || "");
        setAddress(buildingData.address || "");
        setCountry(buildingData.country || "");
        setLatitude(buildingData.latitude || 37.7749);
        setLongitude(buildingData.longitude || -122.4194);
        setPrice(buildingData.price || "");
        setDescription(buildingData.description || "");
        setFeatureImages(buildingData.featureImages || []);
        setType(buildingData.type || "House");
        setArea(buildingData.area || "");
        setBedrooms(buildingData.bedrooms || "");
        setBathrooms(buildingData.bathrooms || "");
        setFacilities(buildingData.facilities || []);
        setYearBuilt(buildingData.yearBuilt || "");
        setExteriorImages(buildingData.exteriorImages || []);
        setInteriorImages(buildingData.interiorImages || []);
        setPricingList(buildingData.pricingList || [{ amount: 0, type: '', unit: '', negotiable: true }]);
      } catch (error) {
        console.error("Error fetching building data:", error);
      }
    };

    fetchData();
  }, [buildingId]);

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

  const handleUpdate = async () => {
    try {
      if (!exteriorImages.length || !interiorImages.length) {
        alert("Please select at least one exterior and one interior image.");
        return;
      }

      const exteriorImage_url = await Promise.all(
        exteriorImages.map(async (image: string) => {
          try {
            const uploaded = await uploadToCloudinary(image);
            return uploaded.url;
          } catch (err) {
            return null;
          }
        })
      );

      const allImages_url = await Promise.all(
        interiorImages.map(async (image: string) => {
          try {
            const uploaded = await uploadToCloudinary(image);
            return uploaded.url;
          } catch (err) {
            return null;
          }
        })
      );

      if (exteriorImage_url.includes(null) || allImages_url.includes(null)) {
        alert("Some images failed to upload. Please try again.");
        return;
      }

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
        facilities,
        pricingList,
        sellerId
      };

      await updateBuildingWithDetails(formData);
      alert("Building updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      alert("Update failed. Try again.");
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white p-4"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-2xl font-bold text-center text-blue-600">Update Building</Text>

      <TextInput
        value={buildingName}
        onChangeText={setBuildingName}
        placeholder="Building Name"
        className="mt-4 p-3 border rounded"
      />
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Address"
        className="mt-4 p-3 border rounded"
      />
      <TextInput
        value={country}
        onChangeText={setCountry}
        placeholder="Country"
        className="mt-4 p-3 border rounded"
      />
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="Price"
        keyboardType="numeric"
        className="mt-4 p-3 border rounded"
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        className="mt-4 p-3 border rounded"
      />
      <TextInput
        value={type}
        onChangeText={setType}
        placeholder="Type"
        className="mt-4 p-3 border rounded"
      />
      <TextInput
        value={area}
        onChangeText={setArea}
        placeholder="Area"
        keyboardType="numeric"
        className="mt-4 p-3 border rounded"
      />
      <TextInput
        value={bedrooms}
        onChangeText={setBedrooms}
        placeholder="Bedrooms"
        keyboardType="numeric"
        className="mt-4 p-3 border rounded"
      />
      <TextInput
        value={bathrooms}
        onChangeText={setBathrooms}
        placeholder="Bathrooms"
        keyboardType="numeric"
        className="mt-4 p-3 border rounded"
      />
      <TextInput
        value={yearBuilt}
        onChangeText={setYearBuilt}
        placeholder="Year Built"
        keyboardType="numeric"
        className="mt-4 p-3 border rounded"
      />

      {/* Render image previews */}
      <View>
        <Text className="mt-4 font-bold">Exterior Images</Text>
        {renderImagePreviews(exteriorImages, setExteriorImages)}
        <TouchableOpacity
          onPress={() => pickImage(setExteriorImages, exteriorImages)}
          className="mt-2 bg-gray-300 p-4 rounded-lg"
        >
          <Text className="text-center">Pick Exterior Image</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text className="mt-4 font-bold">Interior Images</Text>
        {renderImagePreviews(interiorImages, setInteriorImages)}
        <TouchableOpacity
          onPress={() => pickImage(setInteriorImages, interiorImages)}
          className="mt-2 bg-gray-300 p-4 rounded-lg"
        >
          <Text className="text-center">Pick Interior Image</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleUpdate}
        disabled={false}
        className="mt-4 bg-blue-500 p-4 rounded-lg"
      >
        <Text className="text-white text-center text-lg">Update Building</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UpdateBuilding;
