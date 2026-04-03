import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button, Divider } from "@/components/ui/";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { updateUserAPI } from "@/services/user.api";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../../context/UserContext";
import { showError, showSuccess } from "@/utils/toast";
import Toast from "react-native-toast-message";
import Loader from "@/components/Loader";
import { useNetwork } from "@/context/NetworkContext";

// Returns "Month Year · X years/months ago" 
function formatJoinedDate(dateStr?: string) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  const diffMs = Date.now() - date.getTime();
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  const diffYears = Math.floor(diffMonths / 12);
  const ago =
    diffYears >= 1
      ? `${diffYears} year${diffYears > 1 ? "s" : ""} ago`
      : diffMonths >= 1
        ? `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`
        : "this month";
  return `${month} ${year} · ${ago}`;
}

// Reusable row for displaying a labeled account field with a colored icon
function InfoRow({
  icon, iconBg, iconColor, label, value,
}: {
  icon: string; iconBg: string; iconColor: string; label: string; value?: string;
}) {
  return (
    <ThemedView style={styles.infoRow}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={16} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <ThemedText style={styles.rowKey}>{label}</ThemedText>
        <ThemedText style={styles.rowVal}>{value || "—"}</ThemedText>
      </View>
    </ThemedView>
  );
}

export default function Profile() {
  const { isConnected } = useNetwork();
  const { user, updateUserField } = useUser();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [uploading, setUploading] = useState(false);

  // Fallback initials shown when no profile picture is set
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleAvatarPress = async () => {
    // Request media library permission before opening picker
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showError("Allow photo access to change your avatar.");
      return;
    }

    // Open image picker — cropped to square, low quality to reduce payload size
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,  // Needed to send image directly without a file upload endpoint
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      showError("Could not read image data.");
      return;
    }

    // Construct a base64 data URI for the API
    const mimeType = asset.mimeType ?? "image/jpeg";
    const base64Payload = `data:${mimeType};base64,${asset.base64}`;

    try {
      if (!isConnected) {
        showError("Please check your connection");
        return;
      }
      setUploading(true);
      const res = await updateUserAPI({ profilePic: base64Payload });
      // Update only the avatar field in context without a full user refetch
      updateUserField({ profilePicURL: res.data.user.profilePicURL });
      showSuccess("Profile pic updated successfully");
    } catch (err: any) {
      showError(err.response?.data?.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Loader visible={uploading} message="Profile uploading..." />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDark ? Colors.dark.text : Colors.light.text}
            />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        </ThemedView>

        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Avatar card — tap avatar to change profile picture */}
          <ThemedView style={styles.avatarCard}>
            <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  {/* Show profile picture if available, otherwise show initials */}
                  {user?.profilePicURL ? (
                    <Image source={{ uri: user.profilePicURL }} style={styles.avatarImage} />
                  ) : (
                    <ThemedText style={styles.avatarText}>{initials}</ThemedText>
                  )}
                </View>
              </View>
              {/* Camera badge overlaid on bottom-right of avatar */}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            </TouchableOpacity>

            <ThemedText style={styles.userName}>{user?.name}</ThemedText>
            <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
            <Button title="Edit Profile" onPress={() => router.push("/(profile)/edit")} />
          </ThemedView>

          {/* Account info card — read-only display of user fields */}
          <ThemedView style={styles.infoCard}>
            <ThemedText style={styles.infoLabel}>Account Information</ThemedText>
            <InfoRow
              icon="person-outline"
              iconBg="rgba(88,86,214,0.15)"
              iconColor="#5856d6"
              label="Full name"
              value={user?.name}
            />
            <Divider />
            <InfoRow
              icon="mail-outline"
              iconBg="rgba(52,199,89,0.15)"
              iconColor="#34c759"
              label="Email address"
              value={user?.email}
            />
            <Divider />
            <InfoRow
              icon="at-outline"
              iconBg="rgba(255,159,10,0.15)"
              iconColor="#ff9f0a"
              label="Username"
              value={user?.username ? `@${user.username}` : undefined}
            />
            <Divider />
            <InfoRow
              icon="calendar-outline"
              iconBg="rgba(100,210,255,0.15)"
              iconColor="#64d2ff"
              label="Member since"
              value={formatJoinedDate(user?.joined)}
            />
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 20, gap: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "transparent",
    marginBottom: 4,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  avatarCard: {
    borderRadius: 20, padding: 24,
    alignItems: "center", gap: 6, marginBottom: 20,
  },
  avatarRing: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 2, borderColor: Colors.dark.primary,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.dark.primary,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  cameraBadge: {
    position: "absolute",
    bottom: 4, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.dark.primary,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#000",
  },
  userName: { fontSize: 18, fontWeight: "700" },
  userEmail: { fontSize: 13, color: Colors.dark.textSecondary, marginBottom: 4 },
  infoCard: { borderRadius: 16, overflow: "hidden" },
  infoLabel: {
    fontSize: 11, fontWeight: "600", letterSpacing: 0.8,
    color: Colors.dark.textSecondary, textTransform: "uppercase",
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6,
  },
  infoRow: {
    flexDirection: "row", alignItems: "center",
    gap: 12, paddingHorizontal: 16, paddingVertical: 11,
    backgroundColor: "transparent",
  },
  rowIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  rowContent: { flex: 1 },
  rowKey: { fontSize: 11, color: Colors.dark.textSecondary, marginBottom: 2 },
  rowVal: { fontSize: 14, fontWeight: "500" },
});