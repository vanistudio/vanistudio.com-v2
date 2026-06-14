import type { Metadata } from "next";
import ServiceEditor from "@/components/contents/administrator/_services/ServiceEditor";

export const metadata: Metadata = {
  title: "Chỉnh sửa dịch vụ | Trang quản trị",
  description: "Cấu hình chi tiết dịch vụ kỹ thuật",
};

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ServiceEditPage({ params }: Props) {
  const resolvedParams = await params;
  return <ServiceEditor mode="edit" initialId={resolvedParams.id} />;
}
