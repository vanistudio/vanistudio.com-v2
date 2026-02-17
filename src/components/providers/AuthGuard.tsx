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

export function ConfigGuard({ children }: { children: React.ReactNode }) {
  const { needsSetup, loading } = useAuth();

  if (loading) return null;

  if (needsSetup) {
    return <Navigate to="/configuration" replace />;
  }

  return <>{children}</>;
}

export function SetupGuard({ children }: { children: React.ReactNode }) {
  const { needsSetup, loading } = useAuth();

  if (loading) return null;

  if (!needsSetup) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
