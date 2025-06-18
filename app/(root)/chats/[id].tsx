import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getMessagesByChatId, getUserProfileById, sendMessage, subscribeToMessages } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import MessageBubble from "@/components/MessageBubble";
import DateSeparator from "@/components/DateSeparator";
import icons from "@/constants/icons";
import Header from "@/components/Header";
import React from "react";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

const ChatScreen = () => {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const { user } = useGlobalContext();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [otherUserInfo, setOtherUserInfo] = useState<{ name: string; profilePic: string } | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const fetchedMessages: Message[] = await getMessagesByChatId(chatId);
        setMessages(fetchedMessages);

        // Identify the other user from the first message not sent by the logged-in user
        const otherMsg = fetchedMessages.find(msg => msg.senderId !== user?.$id);

        if (otherMsg) {
          const profile = await getUserProfileById(otherMsg.senderId);
          setOtherUserInfo({
            name: profile.name,
            profilePic: profile.profilePic || "https://via.placeholder.com/50",
          });
        }
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const unsubscribe = subscribeToMessages(chatId, async (newMsg: Message) => {
      setMessages((prev) => [...prev, newMsg]);

      if (!otherUserInfo && newMsg.senderId !== user?.$id) {
        const profile = await getUserProfileById(newMsg.senderId);
        setOtherUserInfo({
          name: profile.name,
          profilePic: profile.profilePic || "https://via.placeholder.com/50",
        });
      }
    });

    return () => unsubscribe();
  }, [chatId]);


  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const message: Message | null = await sendMessage(chatId, user?.$id!, newMessage);
      if (message) {
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    }
  };

  const groupedMessages = useMemo(() => {
    return messages.reduce((acc, msg) => {
      const date = new Date(msg.timestamp).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    }, {} as { [date: string]: Message[] });
  }, [messages]);

  return (
    <View className="flex-1 bg-white">
      {/* Always-visible header */}
      <Header title={otherUserInfo?.name || "Chat"} />
      <ImageBackground className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >

          {/* Messages */}
          <View className="flex-1 p-4">
            {loading ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
              <FlatList
                data={Object.entries(groupedMessages)}
                keyExtractor={([date]) => date}
                renderItem={({ item: [date, messages] }) => (
                  <React.Fragment key={date}>
                    <DateSeparator date={date} />
                    {messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        text={msg.text}
                        timestamp={msg.timestamp}
                        isSentByUser={msg.senderId === user?.$id}
                        isRead={msg.isRead}
                      />
                    ))}
                  </React.Fragment>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}

            {/* Input Bar */}
            <View className="flex-row items-center border-t bg-white p-2 shadow-md rounded-lg">
              <TextInput
                className="flex-1 border rounded-full px-4 py-2 bg-gray-100"
                placeholder="Type a message..."
                value={newMessage}
                onChangeText={setNewMessage}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                className="bg-blue-500 p-3 rounded-full ml-2 active:scale-95"
              >
                <Text className="text-white font-bold">Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>

  );
};

export default ChatScreen;
