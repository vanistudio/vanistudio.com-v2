import type { Metadata } from "next";
import AdminDenies from "@/components/contents/administrator/_denies/AdminDenies";

export const metadata: Metadata = {
  title: "Quản lý IP Chặn | Trang quản trị",
  description: "Quản lý danh sách địa chỉ IP bị chặn kết nối đến hệ thống",
};

export default function AdminDeniesPage() {
  return <AdminDenies />;
}
