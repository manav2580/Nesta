import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { format, addDays, isSameDay } from "date-fns";

type Props = {
  value: Date;
  onChange: (selectedDate: Date) => void;
};

const DateTimePickerComponent = ({ value, onChange }: Props) => {
  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)); // next 14 days

  return (
    <View className="gap-3">
      <Text className="text-base text-blue-800 font-medium">Select a date</Text>

      <FlatList
        horizontal
        data={dates}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.toISOString()}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
        renderItem={({ item }) => {
          const selected = isSameDay(item, value);
          return (
            <TouchableOpacity
              className={`px-4 py-2 rounded-xl border ${
                selected
                  ? "bg-blue-600 border-blue-700"
                  : "bg-white border-blue-200"
              }`}
              onPress={() => onChange(item)}
            >
              <Text
                className={`text-sm text-center ${
                  selected ? "text-white" : "text-blue-700"
                }`}
              >
                {format(item, "EEE")}
              </Text>
              <Text
                className={`text-lg font-semibold text-center ${
                  selected ? "text-white" : "text-blue-900"
                }`}
              >
                {format(item, "d")}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default DateTimePickerComponent;
