import type { Metadata } from "next";
import AdminDatabase from "@/components/contents/administrator/_database/AdminDatabase";

export const metadata: Metadata = {
  title: "Quản lý Database | Trang quản trị",
  description: "Theo dõi trạng thái, dung lượng và số lượng bản ghi của các bảng cơ sở dữ liệu",
};

export default function AdminDatabasePage() {
  return <AdminDatabase />;
}
