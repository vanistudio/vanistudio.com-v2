import { db } from "@/server/db";
import { projects } from "@/server/db/schemas/project.schema";
import { ne, desc, asc } from "drizzle-orm";
import PubProjectsList from "@/components/contents/public/_projects/PubProjectsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dự Án Nổi Bật & Sản Phẩm Thực Tế | Vani Studio",
  description: "Tổng hợp các dự án, sản phẩm phần mềm, website, app di động và plugin do Vani Studio thiết kế & lập trình.",
};

export default async function ProjectsPage() {
  const activeProjects = await db.query.projects.findMany({
    where: ne(projects.status, "draft"),
    orderBy: [asc(projects.order), desc(projects.createdAt)],
    with: {
      service: true,
    },
  });

  return <PubProjectsList initialProjects={activeProjects as any} />;
}
