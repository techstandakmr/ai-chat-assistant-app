import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

// Layout guard for all chat routes — only authenticated users can access
export default function ChatLayout() {
  const { isAuthenticated, loading } = useAuth();

  // Wait for auth state to resolve before making routing decisions
  if (loading) {
    return <Loader visible={true} message="Checking auth..." />;
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Render chat stack without headers (each screen manages its own UI)
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}