import type { Metadata } from "next";
import ProjectEditor from "@/components/contents/administrator/_projects/ProjectEditor";

export const metadata: Metadata = {
  title: "Chỉnh sửa dự án | Trang quản trị",
  description: "Cấu hình chi tiết dự án showcase",
};

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ProjectEditPage({ params }: Props) {
  const resolvedParams = await params;
  return <ProjectEditor mode="edit" initialId={resolvedParams.id} />;
}
