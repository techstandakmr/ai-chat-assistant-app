import { AuthProvider } from "./AuthContext";
import { UserProvider } from "./UserContext";
import { ChatProvider } from "./ChatContext";
import { NetworkProvider } from "./NetworkContext";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NetworkProvider>
        <AuthProvider>
          <UserProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </UserProvider>
        </AuthProvider>
    </NetworkProvider>
  );
};
