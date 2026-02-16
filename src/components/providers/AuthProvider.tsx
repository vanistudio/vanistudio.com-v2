import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi, type AuthUser } from "@/services/authentication.service";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  needsOnboarding: false,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fetchUser = async () => {
    try {
      const data = await authApi.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        setNeedsOnboarding(data.needsOnboarding || !data.user.username);
      } else {
        setUser(null);
        setNeedsOnboarding(false);
      }
    } catch {
      setUser(null);
      setNeedsOnboarding(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {}
    setUser(null);
    setNeedsOnboarding(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        needsOnboarding,
        refresh: fetchUser,
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
