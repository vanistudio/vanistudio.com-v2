import type { Metadata } from "next";
import AdminLicensesList from "@/components/contents/administrator/_licenses/AdminLicensesList";

export const metadata: Metadata = {
  title: "Quản lý Bản quyền | Trang quản trị",
  description: "Cấp phát và cấu hình khóa bản quyền phần mềm, giới hạn kích hoạt, tên miền và địa chỉ IP được phê duyệt",
};

export default function AdminLicensesPage() {
  return <AdminLicensesList />;
}
