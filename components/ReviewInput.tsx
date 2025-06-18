import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";
import icons from "@/constants/icons";

interface ReviewInputProps {
  onSubmit: (review: { rating: number; comment?: string }) => void;
}

const ReviewInput: React.FC<ReviewInputProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }
    onSubmit({ rating, comment });
    setRating(0);
    setComment("");
  };

  return (
    <View className="flex flex-row items-center bg-white border border-gray-300 rounded-full px-4 py-2 mx-4 my-2 shadow-sm">
      {/* Star Rating */}
      <View className="flex flex-row space-x-1 mr-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
            <Image
              source={icons.star}
              className="w-5 h-5"
              tintColor={star <= rating ? "#facc15" : "#d1d5db"}
            />
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Comment Input */}
      <TextInput
        className="flex-1 px-3 py-1 text-black bg-gray-50 rounded-full"
        placeholder="Write a comment..."
        placeholderTextColor="#6b7280"
        value={comment}
        onChangeText={setComment}
      />
      
      {/* Submit Button */}
      <TouchableOpacity onPress={handleSubmit} className="ml-2">
        <Image source={icons.send} className="w-6 h-6" tintColor="#1D9BF0" />
      </TouchableOpacity>
    </View>
  );
};

export default ReviewInput;
