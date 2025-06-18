import { FlatList } from "react-native";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
  }[];
  userId: string;
}

const MessageList = ({ messages, userId }: MessageListProps) => {
  return (
    <FlatList
      data={messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MessageBubble message={item} isSender={item.senderId === userId} />
      )}
    />
  );
};

export default MessageList;
