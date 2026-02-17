import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "@/lib/api";

interface AuthUser {
  id: string;
  username: string | null;
  email: string;
  displayName: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  provider: string;
  role: string;
  createdAt: Date | string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  needsSetup: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  needsOnboarding: false,
  needsSetup: false,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  const fetchAll = async () => {
    try {
      const [authRes, configRes] = await Promise.all([
        api.api.auth.me.get(),
        api.api.config.status.get(),
      ]);

      if (authRes.data?.success && authRes.data.user) {
        setUser(authRes.data.user as AuthUser);
        setNeedsOnboarding(authRes.data.needsOnboarding || !authRes.data.user.username);
      } else {
        setUser(null);
        setNeedsOnboarding(false);
      }

      setNeedsSetup(configRes.data?.needsSetup ?? false);
    } catch {
      setUser(null);
      setNeedsOnboarding(false);
      setNeedsSetup(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.api.auth.logout.post();
    } catch {}
    setUser(null);
    setNeedsOnboarding(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        needsOnboarding,
        needsSetup,
        refresh: fetchAll,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
