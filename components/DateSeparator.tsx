import { View, Text } from "react-native";

interface DateSeparatorProps {
  date: string;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
};

const DateSeparator = ({ date }: DateSeparatorProps) => {
  return (
    <View className="my-3 items-center">
      <View className="bg-gray-300 px-4 py-1 rounded-full opacity-80">
        <Text className="text-gray-800 text-xs font-semibold">{formatDate(date)}</Text>
      </View>
    </View>
  );
};

export default DateSeparator;
