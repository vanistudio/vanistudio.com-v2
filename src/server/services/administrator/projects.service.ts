import { projectsRepository } from "@/server/repositories/administrator/projects.repository";
import {
  type Project,
  type NewProject,
} from "@/server/db/schemas/project.schema";
import { type Service } from "@/server/db/schemas/service.schema";

export class ProjectsService {
  async getProjects(): Promise<(Project & { service: Service | null })[]> {
    return await projectsRepository.getProjects();
  }

  async getProjectById(id: string): Promise<(Project & { service: Service | null }) | null> {
    return await projectsRepository.getProjectById(id);
  }

  async getProjectBySlug(slug: string): Promise<(Project & { service: Service | null }) | null> {
    return await projectsRepository.getProjectBySlug(slug);
  }

  async createProject(data: Omit<NewProject, "id" | "createdAt" | "updatedAt">): Promise<Project & { service: Service | null }> {
    if (!data.name?.trim()) throw new Error("Tên dự án không được để trống");
    if (!data.slug?.trim()) throw new Error("Đường dẫn (slug) không được để trống");
    if (!data.content?.trim()) throw new Error("Nội dung giới thiệu không được để trống");

    const existing = await projectsRepository.getProjectBySlug(data.slug);
    if (existing) {
      throw new Error(`Đường dẫn (slug) "${data.slug}" đã tồn tại. Vui lòng chọn đường dẫn khác.`);
    }

    return await projectsRepository.createProject(data);
  }

  async updateProject(id: string, data: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>): Promise<Project & { service: Service | null }> {
    const project = await projectsRepository.getProjectById(id);
    if (!project) throw new Error("Không tìm thấy dự án cần cập nhật");

    if (data.name !== undefined && !data.name?.trim()) {
      throw new Error("Tên dự án không được để trống");
    }

    if (data.slug !== undefined) {
      if (!data.slug?.trim()) throw new Error("Đường dẫn (slug) không được để trống");
      const existing = await projectsRepository.getProjectBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new Error(`Đường dẫn (slug) "${data.slug}" đã tồn tại. Vui lòng chọn đường dẫn khác.`);
      }
    }

    return await projectsRepository.updateProject(id, data);
  }

  async deleteProject(id: string): Promise<void> {
    const project = await projectsRepository.getProjectById(id);
    if (!project) throw new Error("Không tìm thấy dự án để xóa");
    await projectsRepository.deleteProject(id);
  }

  async reorderProjects(orders: { id: string; order: number }[]) {
    for (const item of orders) {
      await projectsRepository.updateProject(item.id, { order: item.order });
    }
  }
}

export const projectsService = new ProjectsService();
