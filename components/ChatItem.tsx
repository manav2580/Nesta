import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";

const ChatItem = ({ chat }: { chat: any }) => {
  const { user } = useGlobalContext();
  const router = useRouter();

  const isBuyer = chat.buyerId === user?.$id;
  const otherUser = chat.otherUserDetails?.name || "Unknown User";
  const otherUserAvatar = chat.otherUserDetails?.profilePic || "https://avatar.iran.liara.run/public/boy?username=Ash";

  // Format timestamp (e.g., "23 Mar 2025")
  // Safe timestamp formatting
  let formattedDate = "—";
  if (chat.lastMessageTimestamp) {
    const timestamp = new Date(chat.lastMessageTimestamp);
    if (!isNaN(timestamp.getTime())) {
      formattedDate = timestamp.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }


  return (
    <TouchableOpacity
      className="flex-row items-center p-3 bg-white mb-2 rounded-lg shadow-sm border-b border-gray-200"
      onPress={() => router.push(`/chats/${chat.$id}`)}
    >
      {/* User Avatar */}
      <Image
        source={{ uri: otherUserAvatar }}
        className="w-12 h-12 rounded-full mr-3 border border-gray-300"
      />

      {/* Chat Info */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">{otherUser}</Text>
        <Text className="text-gray-600 text-sm truncate">
          {chat.lastMessage || "Tap to start chatting..."}
        </Text>
      </View>

      {/* Timestamp */}
      <Text className="text-xs text-gray-500">{formattedDate}</Text>
    </TouchableOpacity>
  );
};

export default ChatItem;
