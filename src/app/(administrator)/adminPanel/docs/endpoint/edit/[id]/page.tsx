import type { Metadata } from "next";
import EndpointEditor from "@/components/contents/administrator/_docs/EndpointEditor";

export const metadata: Metadata = {
  title: "Chỉnh sửa API Endpoint | Trang quản trị",
  description: "Biên tập, chỉnh sửa cấu hình đặc tả cho API Endpoint.",
};

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EndpointEditPage({ params }: Props) {
  const resolvedParams = await params;
  return <EndpointEditor mode="edit" initialId={resolvedParams.id} />;
}
