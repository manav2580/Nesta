import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import { databases } from "@/lib/appwrite";
import { config } from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import { requestCameraAndMic } from "@/lib/permissions";

export default function LiveTourMeetingScreen() {
  const { id: buildingId } = useLocalSearchParams();
  const [jitsiLink, setJitsiLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [canJoin, setCanJoin] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);

  useEffect(() => {
    const intervalRefs: NodeJS.Timeout[] = [];

    const init = async () => {
      await requestCameraAndMic();

      try {
        const res = await databases.listDocuments(
          config.databaseId!,
          config.bookingsCollectionId!,
          [
            Query.equal("buildingId", buildingId as string),
            Query.equal("booking_type", "live_tour"),
            Query.equal("status", ["pending", "confirmed"]),
            Query.orderDesc("$createdAt"),
            Query.limit(1),
          ]
        );

        if (res.documents.length > 0) {
          const booking = res.documents[0];
          setJitsiLink(booking.jitsiLink);

          const date = new Date(booking.date);
          const [startTime] = booking.timeSlot.split(" - ");
          const [hourStr, minutePart] = startTime.trim().split(":");
          const minute = parseInt(minutePart);
          const isPM = startTime.toLowerCase().includes("pm");

          const hour = parseInt(hourStr);
          const finalHour = isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;

          date.setHours(finalHour, minute, 0, 0);

          const updateCountdown = () => {
            const now = new Date();
            const diffMs = date.getTime() - now.getTime();
            if (diffMs <= 0) {
              setCanJoin(true);
              setMinutesLeft(null);
              intervalRefs.forEach(clearInterval);
            } else {
              setMinutesLeft(Math.ceil(diffMs / (60 * 1000)));
            }
          };

          updateCountdown(); // first run
          const interval = setInterval(updateCountdown, 30000); // every 30s
          intervalRefs.push(interval);
        } else {
          setJitsiLink(null);
        }
      } catch (error) {
        console.error("❌ Failed to fetch live tour booking:", error);
        setJitsiLink(null);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      intervalRefs.forEach(clearInterval);
    };
  }, [buildingId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-blue-700 text-lg">Loading meeting...</Text>
      </View>
    );
  }

  if (!jitsiLink) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-red-600 text-center text-lg">
          Live tour not found or has expired.
        </Text>
      </View>
    );
  }

  if (!canJoin && minutesLeft !== null) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-yellow-700 text-center text-lg">
          Your live tour will begin in {minutesLeft} minute{minutesLeft > 1 ? "s" : ""}.
        </Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: `${jitsiLink}#config.disableModeratorIndicator=true` }}
      style={{ flex: 1 }}
      javaScriptEnabled
      domStorageEnabled
      startInLoadingState
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback={true}
    />
  );
}
