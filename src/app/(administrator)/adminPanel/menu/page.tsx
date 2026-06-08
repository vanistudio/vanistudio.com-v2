import type { Metadata } from "next";
import AdminMenu from "@/components/contents/administrator/_menu/AdminMenu";

export const metadata: Metadata = {
  title: "Quản lý Menu | Trang quản trị",
  description: "Quản lý các nhóm menu và cây điều hướng hệ thống",
};

export default function AdminMenuPage() {
  return <AdminMenu />;
}
