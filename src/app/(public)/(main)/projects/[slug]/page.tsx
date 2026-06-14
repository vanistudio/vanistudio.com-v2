import { notFound } from "next/navigation";
import { projectsRepository } from "@/server/repositories/projects.repository";
import PubProjectDetail from "@/components/contents/public/_projects/PubProjectDetail";
import type { Metadata } from "next";

export const dynamicParams = true;

export async function generateStaticParams() {
  const allProjects = await projectsRepository.getProjects();
  return allProjects
    .filter((p) => p.status !== "draft")
    .map((p) => ({
      slug: p.slug,
    }));
}

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await projectsRepository.getProjectBySlug(resolvedParams.slug);

  if (!project || project.status === "draft") {
    return {
      title: "Dự án không tồn tại | Vani Studio",
    };
  }

  const metaTitle = `${project.name} | Vani Studio`;
  const metaDesc = project.description || "Chi tiết sản phẩm, dự án do Vani Studio thiết kế & phát triển.";

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      images: project.thumbnail ? [{ url: project.thumbnail }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const project = await projectsRepository.getProjectBySlug(resolvedParams.slug);

  if (!project || project.status === "draft") {
    notFound();
  }

  return <PubProjectDetail project={project} />;
}
