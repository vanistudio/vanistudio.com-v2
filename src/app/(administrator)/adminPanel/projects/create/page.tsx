import type { Metadata } from "next";
import ProjectEditor from "@/components/contents/administrator/_projects/ProjectEditor";

export const metadata: Metadata = {
  title: "Tạo dự án mới | Trang quản trị",
  description: "Tạo mới dự án showcase",
};

export default function ProjectCreatePage() {
  return <ProjectEditor mode="create" />;
}
