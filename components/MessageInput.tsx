import { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";

interface MessageInputProps {
  onSend: (message: string) => void;
}

const MessageInput = ({ onSend }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState<string>("");

  const handleSend = () => {
    if (newMessage.trim()) {
      onSend(newMessage);
      setNewMessage(""); // Clear input after sending
    }
  };

  return (
    <View className="flex-row items-center border-t p-2">
      <TextInput
        className="flex-1 border rounded-lg p-2"
        placeholder="Type a message..."
        value={newMessage}
        onChangeText={setNewMessage}
      />
      <TouchableOpacity onPress={handleSend} className="bg-blue-500 p-2 rounded-lg ml-2">
        <Text className="text-white">Send</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MessageInput;
