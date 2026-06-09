import type { Metadata } from "next";
import AdminMedia from "@/components/contents/administrator/_media/AdminMedia";

export const metadata: Metadata = {
  title: "Thư viện ảnh & Media | Trang quản trị",
  description: "Quản lý hình ảnh và các tệp tin phương tiện dùng trên toàn hệ thống",
};

export default function AdminMediaPage() {
  return <AdminMedia />;
}
