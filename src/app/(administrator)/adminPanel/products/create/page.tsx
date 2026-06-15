import type { Metadata } from "next";
import ProductEditor from "@/components/contents/administrator/_products/ProductEditor";

export const metadata: Metadata = {
  title: "Tạo sản phẩm mới | Trang quản trị",
  description: "Tạo mới sản phẩm, bot, app hoặc công cụ showcase",
};

export default function ProductCreatePage() {
  return <ProductEditor mode="create" />;
}
