import { Redirect, Slot } from "expo-router";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "@/lib/global-provider";
import { useEffect, useState } from "react";
import SplashScreen from "../splash";
export default function AppLayout() {
  const { loading, isLogged } = useGlobalContext();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // splash duration

    return () => clearTimeout(timeout);
  }, []);

  if (showSplash) {
    return <SplashScreen />; // ⬅️ render component instead of redirect
  }

  if (loading) {
    return (
      <SafeAreaView className="bg-white h-full flex justify-center items-center">
        <ActivityIndicator className="text-primary-300" size="large" />
      </SafeAreaView>
    );
  }

  if (!isLogged) {
    return <Redirect href="/sign-in" />;
  }

  return <Slot />;
}

// 👇 make sure you import the splash screen
// adjust path if needed
