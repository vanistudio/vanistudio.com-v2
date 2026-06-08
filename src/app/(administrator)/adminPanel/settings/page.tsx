import type { Metadata } from "next";
import AdminSettings from "@/components/contents/administrator/_settings/AdminSettings";

export const metadata: Metadata = {
  title: "Cấu hình hệ thống | Trang quản trị",
  description: "Thiết lập các thông tin cơ bản, SEO, ngôn ngữ và giao diện của trang web",
};

export default function AdminSettingsPage() {
  return <AdminSettings />;
}
