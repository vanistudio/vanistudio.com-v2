import type { Metadata } from "next";
import AdminProjectsList from "@/components/contents/administrator/_projects/AdminProjectsList";

export const metadata: Metadata = {
  title: "Quản lý Dự án | Trang quản trị",
  description: "Cấu hình dự án showcase, thông tin công nghệ, hình ảnh/video demo và các số liệu hiệu quả",
};

export default function AdminProjectsPage() {
  return <AdminProjectsList />;
}
