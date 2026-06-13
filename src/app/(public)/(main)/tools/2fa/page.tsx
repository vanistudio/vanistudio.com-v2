import PubTwoFactor from "@/components/contents/public/_tools/PubTwoFactor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trình Tạo 2FA (TOTP) | Vani Studio",
  description: "Trình tạo mã xác thực 2 bước (2FA/TOTP) bảo mật trực tuyến, hoạt động offline trực tiếp trên trình duyệt của bạn.",
};

export default function TwoFactorPage() {
  return <PubTwoFactor />;
}
