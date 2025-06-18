import { View, Text } from "react-native";

interface MessageBubbleProps {
  text: string;
  timestamp: string;
  isSentByUser: boolean;
  isRead: boolean;
}

const MessageBubble = ({ text, timestamp, isSentByUser, isRead }: MessageBubbleProps) => {
  return (
    <View className={`p-3 rounded-xl max-w-[75%] shadow-lg my-1 ${isSentByUser ? "bg-blue-400 ml-auto" : "bg-gray-300"}`}>
      <Text className={`text-sm ${isSentByUser ? "text-white" : "text-black"}`}>{text}</Text>
      <View className="flex-row justify-end items-center mt-1">
        <Text className="text-xs text-gray-600 mr-1">{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text className={`text-xs ${isRead ? "text-blue-500" : "text-gray-500"}`}>✔✔</Text>
      </View>
    </View>
  );
};

export default MessageBubble;
