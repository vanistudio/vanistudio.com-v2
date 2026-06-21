import type { Metadata } from "next";
import AdminUsers from "@/components/contents/administrator/_users/AdminUsers";

export const metadata: Metadata = {
  title: "Quản lý thành viên | Trang quản trị",
  description: "Bảng quản lý phân quyền thành viên, trạng thái hoạt động và khóa tài khoản",
};

export default function AdminUsersPage() {
  return <AdminUsers />;
}
