import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, removeToken, saveToken } from "../services/token";
import { useRouter } from "expo-router";

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean; // true while checking stored token on app start
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Start true until token check completes

  // On mount — check if a token exists in storage to restore auth session
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (token) {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Persist token and mark user as authenticated
  const login = async (token: string) => {
    await saveToken(token);
    setIsAuthenticated(true);
  };

  // Clear token and mark user as unauthenticated
  const logout = async () => {
    await removeToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};