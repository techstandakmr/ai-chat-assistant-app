import { Stack, Redirect, useSegments } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

export default function ProfileLayout() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments(); // Current route segments for path inspection

  if (loading) {
    return <Loader visible={true} message="Checking auth..." />;
  }

  // Allow unauthenticated access to forgot-password without redirecting to login
  const isForgotPassword = segments.at(-1) === "forgot-password";

  if (!isAuthenticated && !isForgotPassword) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}