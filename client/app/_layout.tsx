import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import 'react-native-reanimated'; // Required reanimated setup — must be imported at root
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Providers } from "../context/Providers";
import { Stack } from 'expo-router';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // Providers wraps the entire app with all context (auth, user, chat, etc.)
    <Providers>
      {/* Applies dark/light navigation theme based on current color scheme */}
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </Providers>
  );
}