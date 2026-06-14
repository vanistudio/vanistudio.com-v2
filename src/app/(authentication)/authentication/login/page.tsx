import type { Metadata } from "next";
import AuthLogin from "@/components/contents/authentication/AuthLogin";
import { extensionsRepository } from "@/server/repositories/extensions.repository";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập tài khoản của bạn để sử dụng các dịch vụ từ Vani Studio.",
};

export default async function LoginPage() {
  const ext = await extensionsRepository.getExtensionById("user_login_customizer");
  const initialConfig = ext
    ? {
        isEnabled: ext.isEnabled,
        config: ext.config as any,
      }
    : {
        isEnabled: true,
        config: {},
      };

  const regExt = await extensionsRepository.getExtensionById("user_registration_customizer");
  const isRegisterEnabled = regExt ? regExt.isEnabled : true;

  const oauthExt = await extensionsRepository.getExtensionById("oauth_providers");
  const isOauthEnabled = oauthExt ? oauthExt.isEnabled : true;

  return (
    <AuthLogin
      initialConfig={initialConfig}
      isRegisterEnabled={isRegisterEnabled}
      isOauthEnabled={isOauthEnabled}
    />
  );
}
