import type { Metadata } from "next";
import AdminExtensions from "@/components/contents/administrator/_extensions/AdminExtensions";

export const metadata: Metadata = {
  title: "Gói mở rộng | Trang quản trị",
  description: "Thiết lập và quản lý các gói mở rộng của hệ thống",
};

export default function AdminExtensionsPage() {
  return <AdminExtensions />;
}
