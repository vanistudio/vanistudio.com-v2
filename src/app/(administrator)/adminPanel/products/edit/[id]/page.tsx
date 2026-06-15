import type { Metadata } from "next";
import ProductEditor from "@/components/contents/administrator/_products/ProductEditor";

export const metadata: Metadata = {
  title: "Chỉnh sửa sản phẩm | Trang quản trị",
  description: "Cấu hình chi tiết sản phẩm, công cụ thương mại",
};

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ProductEditPage({ params }: Props) {
  const resolvedParams = await params;
  return <ProductEditor mode="edit" initialId={resolvedParams.id} />;
}
