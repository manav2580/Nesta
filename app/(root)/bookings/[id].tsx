import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useGlobalContext } from "@/lib/global-provider";
import {
  checkExistingBooking,
  createBooking,
  getAvailableTimeSlots,
} from "@/lib/appwrite";
import DateTimePickerComponent from "@/components/DateTimePickerComponent";
import Header from "@/components/Header";

export default function BookingPage() {
  const { id: buildingId } = useLocalSearchParams();
  const { user } = useGlobalContext();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 🆕 Booking type toggle: "physical" or "live_tour"
  const [bookingType, setBookingType] = useState<"physical" | "live_tour">("physical");

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const slots = await getAvailableTimeSlots({
        buildingId: buildingId as string,
        date: selectedDate,
      });
      setAvailableSlots(slots);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [selectedDate]);

  const handleBooking = async () => {
    if (!selectedSlot) return alert("Please select a time slot");

    const existingBooking = await checkExistingBooking({
      userId: user?.$id,
      buildingId: buildingId as string,
    });

    if (existingBooking) {
      return alert("⚠️ You already have an active booking for this building.");
    }

    const bookingData = {
      userId: user?.$id,
      buildingId: buildingId as string,
      date: selectedDate,
      timeSlot: selectedSlot,
      booking_type: bookingType, // 🆕 important
      status: "pending",
    };

    const result = await createBooking(bookingData);
    if (result) {
      alert(`✅ ${bookingType === "live_tour" ? "Live Tour" : "Physical"} booking created!`);
      setSelectedSlot(null);
      fetchAvailability();
    } else {
      alert("❌ Failed to book. Try again.");
    }
    if (bookingType === "live_tour") {
      router.push(`/meetings/${buildingId}`);
    }
  };

  return (
    <View className="flex-1 bg-white mb-3">
      <Header title="My Bookings" />
      <ScrollView className="p-4 bg-white h-full">
        <Text className="text-2xl font-bold mb-4 text-blue-800">Book a Slot</Text>

        <DateTimePickerComponent
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
        />

        {/* 🆕 Booking type selector */}
        <View className="flex-row justify-center gap-4 my-4">
          <TouchableOpacity
            onPress={() => setBookingType("physical")}
            className={`px-4 py-2 rounded-xl border ${
              bookingType === "physical" ? "bg-blue-600 border-blue-700" : "bg-blue-50 border-blue-300"
            }`}
          >
            <Text className={bookingType === "physical" ? "text-white font-medium" : "text-blue-700 font-medium"}>
              Physical Meet
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setBookingType("live_tour")}
            className={`px-4 py-2 rounded-xl border ${
              bookingType === "live_tour" ? "bg-blue-600 border-blue-700" : "bg-blue-50 border-blue-300"
            }`}
          >
            <Text className={bookingType === "live_tour" ? "text-white font-medium" : "text-blue-700 font-medium"}>
              Live Tour
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-base font-medium mt-2 mb-2 text-blue-700">
          Available Time Slots
        </Text>

        {loading ? (
          <Text className="text-blue-500">Loading...</Text>
        ) : availableSlots.length === 0 ? (
          <Text className="text-blue-400">No slots available on this day.</Text>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            {availableSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                onPress={() => setSelectedSlot(slot)}
                className={`px-4 py-3 rounded-xl border min-w-[100px] ${
                  selectedSlot === slot
                    ? "bg-blue-600 border-blue-700"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    selectedSlot === slot ? "text-white" : "text-blue-700"
                  }`}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedSlot && (
          <TouchableOpacity
            onPress={handleBooking}
            className="mt-6 bg-blue-600 py-4 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">
              Confirm {bookingType === "live_tour" ? "Live Tour" : "Physical"} at {selectedSlot}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
