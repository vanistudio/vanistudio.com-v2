import type { Metadata } from "next";
import AuthLogin from "@/components/contents/authentication/AuthLogin";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập tài khoản của bạn để sử dụng các dịch vụ từ Vani Studio.",
};

export default function LoginPage() {
  return <AuthLogin />;
}
