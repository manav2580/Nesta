import { useEffect, useState } from "react";
import { getUserChats } from "@/lib/appwrite"; // API function
import { useRouter } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";

// Define the Chat type
type Chat = {
  id: string;
  buyerId: string;
  sellerId: string;
  lastMessage: string;
  lastMessageTimestamp: string;
};

const ChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();
  const { user } = useGlobalContext();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userId = user?.$id;
        const response = await getUserChats(userId);
        setChats(response);
      } catch (error) {
        console.error("Failed to fetch chats", error);
      }
    };

    fetchChats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-xl font-semibold mb-4">Your Chats</h1>
      <div className="bg-white shadow-lg rounded-lg p-4">
        {chats.length === 0 ? (
          <p className="text-gray-500">No chats available.</p>
        ) : (
          <ul>
            {chats.map((chat) => (
              <li
                key={chat.id}
                className="p-3 border-b cursor-pointer hover:bg-gray-200 rounded-md transition"
                onClick={() => router.push(`/chats/${chat.id}`)}
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-lg font-medium">
                      Chat with {chat.sellerId === user?.$id
                        ? chat.buyerId
                        : chat.sellerId}
                    </p>
                    <p className="text-gray-600 text-sm">{chat.lastMessage}</p>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {new Date(chat.lastMessageTimestamp).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatList;
