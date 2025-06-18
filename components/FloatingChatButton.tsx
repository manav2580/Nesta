import { useRouter } from "expo-router";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { MessageCircle } from "lucide-react-native";
import { getChatByUsers, getUserChats, sendMessage, startChatWithSeller } from "@/lib/appwrite";
import { useState } from "react";

const FloatingChatButton = ({ buildingId, buyerId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChatPress = async () => {
    try {
      setLoading(true);
      const chat = await startChatWithSeller(buyerId, buildingId);
      
      if (!chat) {
        Alert.alert("Error", "Failed to start chat. Please try again.");
        return;
      }

      // Navigate to the chat screen using chatId
      router.push(`/chats/${chat.$id}`);
    } catch (error) {
      console.error("❌ Chat initiation failed:", error);
      Alert.alert("Error", "Could not start chat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ position: "absolute", bottom: 70, right: 5 }}>
      <TouchableOpacity
        onPress={handleChatPress}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#0056b3" : "#007bff",
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 30,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 4,
          elevation: 5,
          opacity: loading ? 0.7 : 1,
        }}
      >
        <MessageCircle size={24} color="white" />
        <Text style={{ color: "white", fontSize: 16, marginLeft: 8 }}>
          {loading ? "Starting chat..." : "Chat"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FloatingChatButton;
