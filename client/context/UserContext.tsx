import React, { createContext, useContext, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  username: string;
  joined: string;
  profilePicURL?: string; // Remote image URL
  publicId?: string;      // Cloudinary public ID for image management
};

type UserContextType = {
  user: User | null; // null means no user is logged in
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUserField: (fields: Partial<User>) => void; // Patch specific fields without replacing the whole user
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  const setUser = (user: User) => setUserState(user);

  // Clears user state on logout or account deletion
  const clearUser = () => setUserState(null);

  // Merges partial updates into existing user
  const updateUserField = (fields: Partial<User>) =>
    setUserState((prev) => (prev ? { ...prev, ...fields } : prev));

  return (
    <UserContext.Provider value={{ user, setUser, clearUser, updateUserField }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};