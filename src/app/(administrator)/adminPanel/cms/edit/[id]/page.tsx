import type { Metadata } from "next";
import CmsPageEditor from "@/components/contents/administrator/_cms/CmsPageEditor";

export const metadata: Metadata = {
  title: "Chỉnh sửa trang CMS | Trang quản trị",
  description: "Biên tập, chỉnh sửa trang CMS tĩnh",
};

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export default async function CmsEditPage({ params }: Props) {
  const resolvedParams = await params;
  return <CmsPageEditor mode="edit" initialId={resolvedParams.id} />;
}
