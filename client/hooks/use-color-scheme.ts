import { useColorScheme as _useColorScheme } from "react-native";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

let globalTheme: ThemeMode = "system";
let listeners: Function[] = [];

export const setAppTheme = (theme: ThemeMode) => {
  globalTheme = theme;
  listeners.forEach((l) => l(theme));
};

export const useColorScheme = () => {
  const systemScheme = _useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>(globalTheme);

  useEffect(() => {
    const listener = (t: ThemeMode) => setTheme(t);
    listeners.push(listener);

    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  if (theme === "system") return systemScheme ?? "light";
  return theme;
};
