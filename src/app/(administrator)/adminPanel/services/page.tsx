import type { Metadata } from "next";
import AdminServicesList from "@/components/contents/administrator/_services/AdminServicesList";

export const metadata: Metadata = {
  title: "Quản lý Dịch vụ | Trang quản trị",
  description: "Cấu hình dịch vụ kỹ thuật, các gói dịch vụ định giá và tiếp nhận xử lý yêu cầu/đơn hàng từ khách hàng",
};

export default function AdminServicesPage() {
  return <AdminServicesList />;
}
