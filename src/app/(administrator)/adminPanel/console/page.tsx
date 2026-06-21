import type { Metadata } from "next";
import AdminConsole from "@/components/contents/administrator/_console/AdminConsole";

export const metadata: Metadata = {
  title: "Console hệ thống | Trang quản trị",
  description: "Bảng điều khiển chạy lệnh console, kiểm tra hệ thống và theo dõi nhật ký",
};

export default function AdminConsolePage() {
  return <AdminConsole />;
}
