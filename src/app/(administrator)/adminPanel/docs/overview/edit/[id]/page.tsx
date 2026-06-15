import type { Metadata } from "next";
import OverviewEditor from "@/components/contents/administrator/_docs/OverviewEditor";

export const metadata: Metadata = {
  title: "Chỉnh sửa tài liệu hướng dẫn | Trang quản trị",
  description: "Biên tập, chỉnh sửa tài liệu giới thiệu hoặc hướng dẫn API.",
};

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export default async function OverviewEditPage({ params }: Props) {
  const resolvedParams = await params;
  return <OverviewEditor mode="edit" initialId={resolvedParams.id} />;
}
