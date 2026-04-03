import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

// Layout guard for all settings screens — blocks unauthenticated access
export default function SettingLayout() {
  const { isAuthenticated, loading } = useAuth();

  // Wait for auth state to resolve before rendering anything
  if (loading) {
    return <Loader visible={true} message="Checking auth..." />;
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Render settings stack without headers (each screen manages its own UI)
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}