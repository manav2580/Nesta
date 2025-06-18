import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  Modal,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import MapView, { Marker } from 'react-native-maps';
import icons from "@/constants/icons";
import images from "@/constants/images";
import { facilities } from "@/constants/data";
import { useAppwrite } from "@/lib/useAppwrite";
import { getPropertyById, getPropertyDetailsById, likeProperty, unlikeProperty, isPropertyLiked, createReview, getReviewsByBuildingId, databases, config } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import ReviewInput from "@/components/ReviewInput";
import { useGlobalContext } from "../../../lib/global-provider";
import FloatingChatButton from "@/components/FloatingChatButton";
import Header from "@/components/Header";
import { Share } from "react-native";
const { width, height } = Dimensions.get("window");
const Property = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useGlobalContext();
  const windowHeight = Dimensions.get("window").height;

  const { data: property } = useAppwrite({
    fn: getPropertyById,
    params: {
      id: id!,
    },
  });

  const [details, setDetails] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  type PricingDetail = {
    amount: number;
    unit: string;
    negotiable?: boolean;
    [key: string]: any;
  };
  const [pricingDetails, setPricingDetails] = useState<PricingDetail[]>([]);
  useEffect(() => {
    if (property?.detail?.$id) {
      getPropertyDetailsById({ detailId: property.detail.$id }).then(setDetails);
    }
  }, [property]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (property?.$id) {
        try {
          const fetchedReviews = await getReviewsByBuildingId(property.$id);
          setReviews(fetchedReviews);
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }
      }
    };

    fetchReviews();
  }, [property?.$id]);
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user?.$id && property?.$id) {
        const liked = await isPropertyLiked(user.$id, property.$id);
        console.log(isLiked);
        setIsLiked(liked);
      }
    };

    checkLikeStatus();
  }, [user?.$id, property?.$id]);
  useEffect(() => {
    const fetchPricingDetails = async () => {
      if (!property?.pricing?.length) return;

      try {
        const fetched = await Promise.all(
          property.pricing.map((id: string) =>
            databases.getDocument(
              config.databaseId!,
              config.pricingsCollectionId!,
              id
            )
          )
        );

        setPricingDetails(fetched);
      } catch (err) {
        console.error("Failed to fetch pricing details:", err);
      }
    };

    fetchPricingDetails();
  }, [property?.pricing]);
  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        await unlikeProperty(user?.$id, property?.$id);
      } else {
        await likeProperty(user?.$id, property?.$id);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like status:", error);
    }
  };
  const handleReviewSubmit = async ({ rating, comment }: { rating: number; comment?: string }) => {
    if (!user) {
      alert("You need to be logged in to submit a review.");
      return;
    }

    const success = await createReview({
      userId: user.$id,
      buildingId: property.$id,
      rating,
      comment,
    });

    if (success) {
      alert("Review submitted successfully!");
    } else {
      alert("Failed to submit review. Please try again.");
    }
  };
  const handleShare = async () => {
    try {
      const shareUrl = `https://yourapp.com/building-details/${property?.$id}`;
      const result = await Share.share({
        message: `Check out this amazing property: ${property?.buildingName}\n${shareUrl}`,
        title: "Property Listing",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type:", result.activityType);
        } else {
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Error sharing property:", error);
      alert("Failed to share property. Try again.");
    }
  };


  return (
    <View className="flex-1 bg-white">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-44 bg-white"
      >
        <View className="relative w-full" style={{ height: windowHeight / 2 }}>
          <FlatList
            data={property?.features_image_url}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ height: undefined, aspectRatio: 1, marginRight: 10 }}
                resizeMode="cover"
              />
            )}
          />

          <Image
            source={images.whiteGradient}
            className="absolute top-0 w-full z-40"
          />

          <View
            className="z-50 absolute inset-x-7"
            style={{
              top: Platform.OS === "ios" ? 70 : 20,
            }}
          >
            <View className="flex-row items-center justify-end w-full absolute top-0 right-0 z-10">
              <View className="flex-row items-center space-x-4 bg-white/90 p-2 rounded-full shadow-md">
                <TouchableOpacity onPress={handleLikeToggle} style={{ marginRight: 10 }}>
                  <Image
                    source={icons.heart}
                    className="size-6"
                    tintColor={isLiked ? "red" : "#191D31"}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare}> {/* Add your share handler */}
                  <Image
                    source={icons.send}
                    className="size-6"
                    tintColor="#191D31"
                  />
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </View>

        <View className="px-5 mt-7 flex gap-2">
          <Text className="text-2xl font-rubik-extrabold">
            {property?.buildingName}
          </Text>

          <View className="flex flex-row items-center gap-3">
            <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
              <Text className="text-xs font-rubik-bold text-primary-300">
                {details?.type}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-2">
              <Image source={icons.star} className="size-5" />
              <Text className="text-black-200 text-sm mt-1 font-rubik-medium">
                {property?.rating} ({reviews?.length} reviews)
              </Text>
            </View>
          </View>
          <View style={{ marginBottom: -35 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
              Interior Views
            </Text>

            <View style={{ height: 120, marginBottom: 16 }}>
              <FlatList
                data={property?.allImages_url}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `interior-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImage(item);
                      setModalVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: item }}
                      style={{
                        height: 100,
                        width: 100,
                        borderRadius: 10,
                        marginRight: 10,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Zoom Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.9)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ScrollView
                  minimumZoomScale={1}
                  maximumZoomScale={5}
                  contentContainerStyle={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: width,
                    height: height,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                  >
                    <Image
                      source={{ uri: selectedImage }}
                      style={{
                        width: width * 0.9,
                        height: width * 0.9,
                        borderRadius: 10,
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </Modal>
          </View>

          <View className="flex flex-row items-center mt-5">
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10">
              <Image source={icons.bed} className="size-4" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {details?.bedrooms} Beds
            </Text>
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
              <Image source={icons.bath} className="size-4" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {details?.bathrooms} Baths
            </Text>
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
              <Image source={icons.area} className="size-4" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {details?.area} sqft
            </Text>
          </View>

          <View className="mt-3">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Overview
            </Text>
            <Text className="text-black-200 text-base font-rubik mt-2">
              {property?.description}
            </Text>
          </View>

          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Facilities
            </Text>

            {details?.facilities.length > 0 && (
              <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-5">
                {details?.facilities.map((item: string, index: number) => {
                  const facility = facilities.find(
                    (facility) => facility.title === item
                  );

                  return (
                    <View
                      key={index}
                      className="flex flex-1 flex-col items-center min-w-16 max-w-20"
                    >
                      <View className="size-14 bg-primary-100 rounded-full flex items-center justify-center">
                        <Image
                          source={facility ? facility.icon : icons.info}
                          className="size-6"
                        />
                      </View>

                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="text-black-300 text-sm text-center font-rubik mt-1.5"
                      >
                        {item}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View className="mt-5">
            <View className="mt-3">
              <Text className="text-black-300 text-xl font-rubik-bold">Location</Text>

              <View className="flex flex-row items-center justify-start mt-4 gap-2">
                <Image source={icons.location} className="w-7 h-7" />
                <Text className="text-black-200 text-sm font-rubik-medium">
                  {property?.address}
                </Text>
              </View>

              {/* Small Map */}
              <MapView
                style={{ width: "100%", height: 200, marginTop: 10 }}
                region={{
                  latitude: property?.latitude ? parseFloat(property?.latitude) : 0,
                  longitude: property?.longitude ? parseFloat(property?.longitude) : 0,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                {property?.latitude && property?.longitude && <Marker coordinate={{ latitude: parseFloat(property?.latitude), longitude: parseFloat(property?.longitude) }} />}
              </MapView>
            </View>

            {/* <Image
              source={images.map}
              className="h-52 w-full mt-5 rounded-xl"
            /> */}
          </View>

          {/* {property?.reviews.length > 0 && ( */}
          <View>
            <View className="mt-2 p-4 bg-white rounded-2xl shadow-lg">
              {/* Rating Summary */}
              <View className="flex flex-row items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                <View className="flex flex-row items-center">
                  <Image source={icons.star} style={{ width: 20, height: 20, tintColor: "#FFD700" }} />
                  <Text className="text-black-800 text-lg font-semibold ml-2">
                    {property?.rating || "N/A"}
                  </Text>
                  <Text className="text-gray-500 text-sm ml-2">({reviews.length} reviews)</Text>
                </View>
              </View>

              {/* Reviews List */}
              <FlatList
                data={reviews}
                keyExtractor={(review) => review.$id}
                renderItem={({ item: review }) => (
                  <View className="bg-white p-3 rounded-2xl mb-3 shadow-sm border border-gray-200">
                    {/* Reviewer Info */}
                    <View className="flex flex-row items-center mb-2">
                      <Image
                        source={{
                          uri: review.user?.profilePic || "https://via.placeholder.com/50",
                        }}
                        style={{ width: 35, height: 35, borderRadius: 17.5 }}
                      />
                      <View className="ml-3 flex-1">
                        <Text className="text-sm font-semibold">
                          {review.user?.name || "Anonymous"}
                        </Text>
                        <Text className="text-gray-400 text-xs">{new Date(review.createdAt).toDateString()}</Text>
                      </View>
                    </View>

                    {/* Comment */}
                    <Text className="text-gray-700 text-sm px-2 py-1 bg-gray-100 rounded-xl">
                      {review.comment || "No comments"}
                    </Text>

                    {/* Star Rating */}
                    <View className="flex flex-row items-center mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Image
                          key={i}
                          source={icons.star}
                          style={{
                            width: 16,
                            height: 16,
                            tintColor: i < review?.rating ? "#FFD700" : "#D3D3D3",
                          }}
                        />
                      ))}
                      <Text className="text-gray-500 text-xs ml-2">
                        ({review?.rating || 0})
                      </Text>
                    </View>
                  </View>
                )}
              />

            </View>




            <View className="mt-5">
              <ReviewInput onSubmit={handleReviewSubmit} />
            </View>
          </View>
          {/* )} */}
        </View>
      </ScrollView>

      <View className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 p-7">
        <View className="flex flex-row items-center justify-between gap-10">
          <View className="flex flex-col items-start space-y-1">
            <Text className="text-black-200 text-xs font-rubik-medium">Starting From</Text>

            {pricingDetails.length > 0 ? (
              <>
                <Text className="text-primary-300 text-start text-2xl font-rubik-bold">
                  ${Math.min(...pricingDetails.map(p => p.amount))}
                  <Text className="text-sm text-gray-400 font-rubik-regular">
                    / {pricingDetails[0]?.unit}
                  </Text>
                </Text>

                <View className="mt-1 space-y-0.5">
                  {pricingDetails.slice(1).map((p, idx) => (
                    <Text key={idx} className="text-gray-500 text-xs font-rubik-medium">
                      ${p.amount} / {p.unit}
                      {p.negotiable && <Text className="text-green-500"> (Negotiable)</Text>}
                    </Text>
                  ))}
                </View>
              </>
            ) : (
              <Text className="text-gray-400 text-sm italic">Loading pricing...</Text>
            )}
          </View>


          <TouchableOpacity
            className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400"
            onPress={() => router.push(`/bookings/${property?.$id}`)}
          >
            <Text className="text-white text-lg text-center font-rubik-bold">
              Book Now
            </Text>
          </TouchableOpacity>

          <FloatingChatButton buildingId={property?.$id} buyerId={user?.$id} />
        </View>
      </View>
    </View>
  );
};

export default Property;