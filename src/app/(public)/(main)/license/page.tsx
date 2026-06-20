import PubLicense from "@/components/contents/public/_license/PubLicense";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiểm tra Bản quyền | Vani Studio",
  description: "Trình kiểm tra thông tin và thời hạn mã bản quyền (license key) chính thức của Vani Studio.",
};

export default function LicensePage() {
  return <PubLicense />;
}
