import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getUserChats } from "@/lib/appwrite";
import ChatItem from "@/components/ChatItem";
import DateSeparator from "@/components/DateSeparator";
import { useGlobalContext } from "@/lib/global-provider";
import { useRouter } from "expo-router";
import Header from "@/components/Header";

const Messages = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useGlobalContext();
  const [activeTab, setActiveTab] = useState("All");
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.$id) {
        setChats([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const chatList = await getUserChats(user.$id);
      console.log("Fetched chats:", chatList[0]);
      setChats(chatList);
      setLoading(false);
    };

    fetchChats();
  }, []);

  const buyingChats = chats.filter((chat) => chat.buyerId === user?.$id);
  const sellingChats = chats.filter((chat) => chat.sellerId === user?.$id);

  const relevantChats =
    activeTab === "Buying"
      ? buyingChats
      : activeTab === "Selling"
      ? sellingChats
      : chats;

  return (
    <View className="flex-1 bg-[#f8f9fa]">
      {/* Header */}
      <Header title={"Messages"} />
      <View className="flex-row items-center justify-between px-4 py-5 bg-white shadow-sm border-b border-gray-200">
        <View className="w-10" />
      </View>

      {/* Tabs */}
      <View className="flex-row justify-around bg-white px-4 py-2 border-b border-gray-200">
        {["All", "Buying", "Selling"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              className={`text-base font-medium ${
                activeTab === tab ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loader or Empty */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : relevantChats.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-center text-gray-500 text-base">
            No chats found. Try switching tabs.
          </Text>
        </View>
      ) : (
        <FlatList
          data={relevantChats}
          keyExtractor={(item) => item.documentId}
          renderItem={({ item, index }) => (
            <>
              {index === 0 ||
              new Date(relevantChats[index - 1].lastMessageTimestamp).toDateString() !==
                new Date(item.lastMessageTimestamp).toDateString() ? (
                <DateSeparator date={item.lastMessageTimestamp} />
              ) : null}

              <ChatItem chat={item} />
            </>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default Messages;
