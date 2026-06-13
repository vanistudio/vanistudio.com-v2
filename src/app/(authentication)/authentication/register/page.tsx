import type { Metadata } from "next";
import AuthRegister from "@/components/contents/authentication/AuthRegister";
import { extensionsRepository } from "@/server/repositories/administrator/extensions.repository";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Đăng ký tài khoản mới tại Vani Studio để sử dụng các dịch vụ thiết kế website và phát triển phần mềm.",
};

export default async function RegisterPage() {
  const ext = await extensionsRepository.getExtensionById("user_registration_customizer");
  const initialConfig = ext
    ? {
        isEnabled: ext.isEnabled,
        config: ext.config as any,
      }
    : {
        isEnabled: true,
        config: {},
      };

  return <AuthRegister initialConfig={initialConfig} />;
}
