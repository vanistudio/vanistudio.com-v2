import type { Metadata } from "next";
import AdminProductsList from "@/components/contents/administrator/_products/AdminProductsList";

export const metadata: Metadata = {
  title: "Quản lý Sản phẩm | Trang quản trị",
  description: "Cấu hình danh sách sản phẩm, giá bán, phiên bản, changelog và thông tin giấy phép bản quyền.",
};

export default function AdminProductsPage() {
  return <AdminProductsList />;
}
