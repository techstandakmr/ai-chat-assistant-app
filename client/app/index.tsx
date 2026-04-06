import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Image, Linking, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { useChat } from "../context/ChatContext";
import api from "@/services/apiClient";
import { getProfileAPI } from "@/services/user.api";
import { getConversationsAPI } from "@/services/conversation.api";
import { showError } from "@/utils/toast";
import Toast from "react-native-toast-message";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useNetwork } from "@/context/NetworkContext";
import * as Application from 'expo-application';
// Animated loading indicator — three dots bouncing in sequence
function BouncingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    // Each dot is staggered by 160ms to create a wave effect
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: -8, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(480),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop()); // Cleanup on unmount
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { transform: [{ translateY: dot }] }]}
        />
      ))}
    </View>
  );
}

// Splash/index screen — resolves auth state then redirects to the correct route
export default function Index() {
  const { isConnected } = useNetwork();
  const { isAuthenticated, loading } = useAuth();
  const { setUser } = useUser();
  const { setConversations } = useChat();
  const router = useRouter();
  const checkForUpdate = async () => {
    const isNewerVersion = (current: string, latest: string) => {
      const c = current.split('.').map(Number);
      const l = latest.split('.').map(Number);

      for (let i = 0; i < l.length; i++) {
        if ((l[i] || 0) > (c[i] || 0)) return true;
        if ((l[i] || 0) < (c[i] || 0)) return false;
      }

      return false;
    };
    try {
      const res = await api.get("/app-version");

      const currentVersion = Application.nativeApplicationVersion || "1.0.0";
      const latestVersion = res.data.latestVersion;

      if (isNewerVersion(currentVersion, latestVersion)) {

        if (res.data.forceUpdate) {
          Alert.alert(
            "Update Required",
            "You must update to continue",
            [
              {
                text: "Update",
                onPress: () => Linking.openURL(res.data.apkUrl),
              },
            ],
            { cancelable: false }
          );

          return true;
        }

        // optional update 
        Alert.alert(
          "Update Available",
          "A new version is available",
          [
            { text: "Later" },
            {
              text: "Update",
              onPress: () => Linking.openURL(res.data.apkUrl),
            },
          ]
        );

        return false; // allow app if not forced
      }

      return false;
    } catch (err) {
      console.log("Update check failed", err);
      return false;
    }
  };
  useEffect(() => {
    async function initApp() {
      let hasUpdate = await checkForUpdate();
      if (hasUpdate) return;
      if (!isConnected) {
        showError("Please check your connection");
        return;
      }

      if (loading) return; // Wait for auth state to resolve before routing
      if (isAuthenticated) {
        try {
          // Fetch profile and conversations in sequence, then enter the app
          const userProfile = await getProfileAPI();
          setUser(userProfile?.data?.user);
          setConversations([]); // Clear stale conversations before refetching
          const res = await getConversationsAPI({ userID: userProfile?.data?.user?.id });
          setConversations(res.data);
          router.replace("/(chat)");
        } catch (err: any) {
          showError(err?.response?.data?.message || "Something went wrong");
        }
      } else {
        router.replace("/(auth)/login");
      }
    }

    initApp();
  }, [isAuthenticated, loading]);

  return (
    <>
      <View style={styles.container}>
        {/* Logo */}
        <Image source={require("../assets/images/app-logo.png")} style={styles.logo} resizeMode="contain" />

        {/* App name + tagline */}
        <ThemedText style={styles.appName}>AI Chat Assistant</ThemedText>
        <ThemedText style={styles.tagline}>Your intelligent companion</ThemedText>

        {/* Loading indicator shown while auth + data fetching completes */}
        <BouncingDots />

        {/* Offline banner — shown on top of splash if network is unavailable */}
        {!isConnected && (
          <View style={{
            backgroundColor: "red",
            padding: 6,
            alignItems: "center"
          }}>
            <Text style={{ color: "#fff" }}>No Internet Connection</Text>
          </View>
        )}
      </View>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 180,
    height: 180,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.primary,
    opacity: 0.85,
  },
});