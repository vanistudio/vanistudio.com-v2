import { db } from "@/server/db";
import {
  services,
  servicePackages,
  serviceRequests,
  serviceTypes,
  type Service,
  type NewService,
  type ServiceType,
  type NewServiceType,
  type ServicePackage,
  type NewServicePackage,
  type ServiceRequest,
  type NewServiceRequest,
} from "@/server/db/schemas/service.schema";
import { eq, desc } from "drizzle-orm";

export class ServicesRepository {
  async getServices(): Promise<(Service & { serviceType: ServiceType | null })[]> {
    return await db.query.services.findMany({
      orderBy: [desc(services.createdAt)],
      with: {
        serviceType: true,
      },
    });
  }

  async getServiceById(id: string): Promise<(Service & { serviceType: ServiceType | null }) | null> {
    const service = await db.query.services.findFirst({
      where: eq(services.id, id),
      with: {
        serviceType: true,
      },
    });
    return service || null;
  }

  async getServiceBySlug(slug: string): Promise<(Service & { serviceType: ServiceType | null }) | null> {
    const service = await db.query.services.findFirst({
      where: eq(services.slug, slug),
      with: {
        serviceType: true,
      },
    });
    return service || null;
  }

  async createService(data: NewService): Promise<Service & { serviceType: ServiceType | null }> {
    const [inserted] = await db.insert(services).values(data).returning();
    if (!inserted) throw new Error("Tạo dịch vụ thất bại");
    const service = await this.getServiceById(inserted.id);
    if (!service) throw new Error("Tải dịch vụ sau khi tạo thất bại");
    return service;
  }

  async updateService(id: string, data: Partial<Omit<Service, "id" | "createdAt">>): Promise<Service & { serviceType: ServiceType | null }> {
    const [updated] = await db
      .update(services)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    if (!updated) throw new Error("Cập nhật dịch vụ thất bại hoặc không tìm thấy");
    const service = await this.getServiceById(updated.id);
    if (!service) throw new Error("Tải dịch vụ sau khi cập nhật thất bại");
    return service;
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  async getTypes(): Promise<ServiceType[]> {
    return await db.select().from(serviceTypes).orderBy(serviceTypes.order);
  }

  async seedDefaultTypes(customTypes?: any[]): Promise<void> {
    const typesToInsert = customTypes && customTypes.length > 0
      ? customTypes
      : (await import("@/defaults/service-type.default")).DEFAULT_SERVICE_TYPES;
    await db.insert(serviceTypes).values(typesToInsert);
  }

  async getTypeById(id: string): Promise<ServiceType | null> {
    const [item] = await db.select().from(serviceTypes).where(eq(serviceTypes.id, id)).limit(1);
    return item || null;
  }


  async createType(data: NewServiceType): Promise<ServiceType> {
    const [inserted] = await db.insert(serviceTypes).values(data).returning();
    if (!inserted) throw new Error("Tạo phân loại dịch vụ thất bại");
    return inserted;
  }

  async updateType(id: string, data: Partial<Omit<ServiceType, "id" | "createdAt">>): Promise<ServiceType> {
    const [updated] = await db
      .update(serviceTypes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(serviceTypes.id, id))
      .returning();
    if (!updated) throw new Error("Cập nhật phân loại dịch vụ thất bại hoặc không tìm thấy");
    return updated;
  }

  async deleteType(id: string): Promise<void> {
    await db.delete(serviceTypes).where(eq(serviceTypes.id, id));
  }

  async getPackagesByServiceId(serviceId: string): Promise<ServicePackage[]> {
    return await db.select().from(servicePackages).where(eq(servicePackages.serviceId, serviceId)).orderBy(servicePackages.price);
  }

  async createPackage(data: NewServicePackage): Promise<ServicePackage> {
    const [inserted] = await db.insert(servicePackages).values(data).returning();
    if (!inserted) throw new Error("Tạo gói dịch vụ thất bại");
    return inserted;
  }

  async updatePackage(id: string, data: Partial<Omit<ServicePackage, "id" | "createdAt">>): Promise<ServicePackage> {
    const [updated] = await db
      .update(servicePackages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(servicePackages.id, id))
      .returning();
    if (!updated) throw new Error("Cập nhật gói dịch vụ thất bại hoặc không tìm thấy");
    return updated;
  }

  async deletePackage(id: string): Promise<void> {
    await db.delete(servicePackages).where(eq(servicePackages.id, id));
  }

  async getRequests() {
    return await db.query.serviceRequests.findMany({
      orderBy: [desc(serviceRequests.createdAt)],
      with: {
        user: true,
        service: true,
        package: true,
      },
    });
  }

  async getRequestById(id: string) {
    return await db.query.serviceRequests.findFirst({
      where: eq(serviceRequests.id, id),
      with: {
        user: true,
        service: true,
        package: true,
      },
    });
  }

  async updateRequest(id: string, data: Partial<Omit<ServiceRequest, "id" | "createdAt">>): Promise<ServiceRequest> {
    const [updated] = await db
      .update(serviceRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(serviceRequests.id, id))
      .returning();
    if (!updated) throw new Error("Cập nhật yêu cầu dịch vụ thất bại");
    return updated;
  }

  async createRequest(data: NewServiceRequest): Promise<ServiceRequest> {
    const [inserted] = await db.insert(serviceRequests).values(data).returning();
    if (!inserted) throw new Error("Gửi yêu cầu dịch vụ thất bại");
    return inserted;
  }

  async deleteRequest(id: string): Promise<void> {
    await db.delete(serviceRequests).where(eq(serviceRequests.id, id));
  }
}

export const servicesRepository = new ServicesRepository();
