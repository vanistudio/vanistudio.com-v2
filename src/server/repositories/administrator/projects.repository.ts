import { db } from "@/server/db";
import {
  projects,
  type Project,
  type NewProject,
} from "@/server/db/schemas/project.schema";
import { services, type Service } from "@/server/db/schemas/service.schema";
import { eq, desc, asc } from "drizzle-orm";

export class ProjectsRepository {
  async getProjects(): Promise<(Project & { service: Service | null })[]> {
    return await db.query.projects.findMany({
      orderBy: [asc(projects.order), desc(projects.createdAt)],
      with: {
        service: true,
      },
    });
  }

  async getProjectById(id: string): Promise<(Project & { service: Service | null }) | null> {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        service: true,
      },
    });
    return project || null;
  }

  async getProjectBySlug(slug: string): Promise<(Project & { service: Service | null }) | null> {
    const project = await db.query.projects.findFirst({
      where: eq(projects.slug, slug),
      with: {
        service: true,
      },
    });
    return project || null;
  }

  async createProject(data: NewProject): Promise<Project & { service: Service | null }> {
    let orderToSet = data.order;
    if (orderToSet === undefined || orderToSet === 0) {
      const allProjects = await db.select({ order: projects.order }).from(projects);
      const maxOrder = allProjects.reduce((max, p) => Math.max(max, p.order || 0), 0);
      orderToSet = maxOrder + 1;
    }
    const [inserted] = await db.insert(projects).values({ ...data, order: orderToSet }).returning();
    if (!inserted) throw new Error("Tạo dự án thất bại");
    const project = await this.getProjectById(inserted.id);
    if (!project) throw new Error("Tải dự án sau khi tạo thất bại");
    return project;
  }

  async updateProject(id: string, data: Partial<Omit<Project, "id" | "createdAt">>): Promise<Project & { service: Service | null }> {
    const [updated] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    if (!updated) throw new Error("Cập nhật dự án thất bại hoặc không tìm thấy");
    const project = await this.getProjectById(updated.id);
    if (!project) throw new Error("Tải dự án sau khi cập nhật thất bại");
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }
}

export const projectsRepository = new ProjectsRepository();
