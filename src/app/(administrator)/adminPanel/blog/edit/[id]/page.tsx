import type { Metadata } from "next";
import BlogEditor from "@/components/contents/administrator/_blog/BlogEditor";

export const metadata: Metadata = {
  title: "Chỉnh sửa bài viết Blog | Trang quản trị",
  description: "Biên tập, chỉnh sửa bài viết blog",
};

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export default async function BlogEditPage({ params }: Props) {
  const resolvedParams = await params;
  return <BlogEditor mode="edit" initialId={resolvedParams.id} />;
}
