import type { Metadata } from "next";
import AdminTemplates from "@/components/contents/administrator/_templates/AdminTemplates";

export const metadata: Metadata = {
  title: "Cấu hình mẫu thông báo | Trang quản trị",
  description: "Thiết lập nội dung và cấu hình của các mẫu thông báo Email, Telegram, Discord và Slack.",
};

export default function AdminTemplatesPage() {
  return <AdminTemplates />;
}
