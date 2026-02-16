import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";

/**
 * GuestGuard — chỉ cho phép user CHƯA đăng nhập.
 * Đã đăng nhập → redirect to / (hoặc /onboarding nếu chưa hoàn tất)
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, needsOnboarding, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to={needsOnboarding ? "/onboarding" : "/"} replace />;
  }

  return <>{children}</>;
}

/**
 * AuthGuard — chỉ cho phép user ĐÃ đăng nhập.
 * Chưa đăng nhập → redirect to /auth/login
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}
