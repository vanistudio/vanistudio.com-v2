import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, needsOnboarding, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to={needsOnboarding ? "/onboarding" : "/"} replace />;
  }

  return <>{children}</>;
}
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}
