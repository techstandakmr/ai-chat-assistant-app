/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  // light: {
  //   text: '#11181C',
  //   background: '#fff',
  //   tint: tintColorLight,
  //   icon: '#687076',
  //   tabIconDefault: '#687076',
  //   tabIconSelected: tintColorLight,
  // },
  // dark: {
  //   text: '#ECEDEE',
  //   background: '#151718',
  //   tint: tintColorDark,
  //   icon: '#9BA1A6',
  //   tabIconDefault: '#9BA1A6',
  //   tabIconSelected: tintColorDark,
  // },
  light: {
    text: '#11181C',
    background: "#e9eaeb",
    surface: "#FFFFFF",
    card: "#F3F4F6",
    input: "#E5E7EB",
    border: "#D1D5DB",

    primary: "rgb(0,149,248)",
    secondary: "#7C3AED",
    danger: "#DC2626",

    userBubble: "rgb(0,149,248)",
    aiBubble: "#E5E7EB",

    textPrimary: "#111827",
    textSecondary: "#374151",
    textMuted: "#6B7280",
    placeholder: "#9CA3AF",

    success: "#16A34A",
    warning: "#CA8A04",
    info: "#0891B2",
  },

  dark: {
    text: '#ECEDEE',
    background: "#0F1115",
    surface: "#151821",
    card: "#1C2030",
    input: "#e4e4e4",
    border: "rgb(159, 160, 163)",

    primary: "rgb(0,149,248)",
    secondary: "#8B5CF6",
    danger: "#EF4444",

    userBubble: "rgb(0,149,248)",
    aiBubble: "#1F2937",

    textPrimary: "#FFFFFF",
    textSecondary: "#9CA3AF",
    textMuted: "#6B7280",
    placeholder: "#728094",

    success: "#22C55E",
    warning: "#FACC15",
    info: "#06B6D4",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
