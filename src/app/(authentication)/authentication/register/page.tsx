import type { Metadata } from "next";
import AuthRegister from "@/components/contents/authentication/AuthRegister";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Đăng ký tài khoản mới tại Vani Studio để sử dụng các dịch vụ thiết kế website và phát triển phần mềm.",
};

export default function RegisterPage() {
  return <AuthRegister />;
}
