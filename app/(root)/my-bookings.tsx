import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { Calendar } from "react-native-calendars";
import { useGlobalContext } from "@/lib/global-provider";
import { getPropertyById, getUserBookings } from "@/lib/appwrite";
import DateSeparator from "@/components/DateSeparator";
import { format } from "date-fns";
import Header from "@/components/Header";
import { router } from "expo-router";
import { ActivityIndicator } from "react-native";

const UserBookingsCalendar = () => {
  const { user } = useGlobalContext();
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBookings, setSelectedBookings] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await getUserBookings(user.$id);
        if (!response || typeof response !== "object") {
          console.error("❌ Invalid bookings response:", response);
          return;
        }

        const mergedMap = new Map();
        [...(response.buyerBookings || []), ...(response.sellerBookings || [])].forEach((b) => {
          mergedMap.set(b.$id, b);
        });
        const merged = Array.from(mergedMap.values());

        const buildingCache = new Map();

        const bookingsWithNames = await Promise.all(
          merged.map(async (b) => {
            const role = b.userId === user.$id ? "buyer" : "seller";

            let buildingName = "Building";
            if (b.buildingId) {
              if (buildingCache.has(b.buildingId)) {
                buildingName = buildingCache.get(b.buildingId);
              } else {
                try {
                  const building = await getPropertyById({ id: b.buildingId });
                  buildingName = building?.buildingName || "Building";
                  buildingCache.set(b.buildingId, buildingName);
                } catch (err) {
                  console.warn("Could not fetch building", b.buildingId, err);
                }
              }
            }

            return { ...b, role, buildingName };
          })
        );

        setBookings(bookingsWithNames);
      } catch (error) {
        console.error("❌ Error fetching bookings:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };


    fetchBookings();
  }, []);

  const isTourJoinable = (booking: any) => {
    if (!booking?.date || !booking?.timeSlot) return false;

    const now = new Date();
    const bookingDate = new Date(booking.date);
    const [start] = booking.timeSlot.split(" - ");
    const [hourStr, minutePart] = start.trim().split(":");
    const minutes = parseInt(minutePart);
    const isPM = start.toLowerCase().includes("pm");
    const hour = parseInt(hourStr);
    const finalHour = isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;

    bookingDate.setHours(finalHour, minutes, 0, 0);
    const diffMins = (bookingDate.getTime() - now.getTime()) / (60 * 1000);

    return diffMins <= 10 && diffMins >= -30;
  };

  const groupedBookings = bookings.reduce((acc, booking) => {
    const formattedDate = format(new Date(booking.date), "yyyy-MM-dd");
    if (!acc[formattedDate]) acc[formattedDate] = [];
    acc[formattedDate].push(booking);
    return acc;
  }, {} as Record<string, any[]>);

  const markedDates = Object.keys(groupedBookings).reduce((acc, date) => {
    acc[date] = { marked: true, dotColor: "blue" };
    return acc;
  }, {} as Record<string, any>);

  return (
    <View className="flex-1 p-4 bg-white">
      <Header title="My Bookings" />
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" /> {/* Blue-600 */}
          <Text className="mt-2 text-gray-500">Loading bookings...</Text>
        </View>
      ) : (
        <>
          <Calendar
            markedDates={markedDates}
            onDayPress={(day) => {
              if (groupedBookings[day.dateString]) {
                setSelectedBookings(groupedBookings[day.dateString]);
                setModalVisible(true);
              }
            }}
          />
        </>
      )}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg w-80">
            <Text className="text-lg font-bold mb-2">Bookings for this date</Text>

            {selectedBookings.length > 0 && <DateSeparator date={selectedBookings[0].date} />}

            <FlatList
              data={selectedBookings}
              keyExtractor={(item) => item.$id}
              renderItem={({ item }) => (
                <View className="border-b border-gray-200 py-2">
                  <Text className="text-base font-semibold">{item.buildingName || "Building"}</Text>
                  <Text className="text-base">🕒 Time Slot: {item.timeSlot}</Text>
                  <Text className="text-base font-semibold" style={{ color: item.status === "confirmed" ? "green" : "orange" }}>
                    Status: {item.status}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    {item.role === "buyer"
                      ? "You have booked this building."
                      : `${item.buyerName || "A user"} is visiting your building.`}
                  </Text>

                  {item.booking_type === "live_tour" && isTourJoinable(item) && (
                    <TouchableOpacity
                      className="mt-2 bg-blue-600 px-4 py-2 rounded-lg"
                      onPress={() => {
                        router.push(`/meetings/${item.buildingId}`);
                      }}
                    >
                      <Text className="text-white text-center">Join Live Tour</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />

            <TouchableOpacity
              className="mt-4 bg-blue-600 py-2 rounded-lg"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-center text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View >
  );
};

export default UserBookingsCalendar;
