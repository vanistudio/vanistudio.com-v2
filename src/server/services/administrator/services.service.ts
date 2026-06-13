import { servicesRepository } from "@/server/repositories/administrator/services.repository";
import {
  type Service,
  type NewService,
  type ServiceType,
  type NewServiceType,
  type ServicePackage,
  type NewServicePackage,
  type ServiceRequest,
} from "@/server/db/schemas/service.schema";

export class ServicesService {
  async getServices(): Promise<(Service & { serviceType: ServiceType | null })[]> {
    return await servicesRepository.getServices();
  }

  async getServiceById(id: string): Promise<(Service & { serviceType: ServiceType | null }) | null> {
    return await servicesRepository.getServiceById(id);
  }

  async getServiceBySlug(slug: string): Promise<(Service & { serviceType: ServiceType | null }) | null> {
    return await servicesRepository.getServiceBySlug(slug);
  }

  async createService(data: Omit<NewService, "id" | "createdAt" | "updatedAt">): Promise<Service & { serviceType: ServiceType | null }> {
    if (!data.name?.trim()) throw new Error("Tên dịch vụ không được để trống");
    if (!data.slug?.trim()) throw new Error("Đường dẫn (slug) không được để trống");
    if (!data.typeId) throw new Error("Loại dịch vụ không được để trống");
    if (!data.content?.trim()) throw new Error("Nội dung không được để trống");

    const existing = await servicesRepository.getServiceBySlug(data.slug);
    if (existing) {
      throw new Error(`Đường dẫn (slug) "${data.slug}" đã tồn tại. Vui lòng chọn đường dẫn khác.`);
    }

    if (data.fieldsConfig && Array.isArray(data.fieldsConfig)) {
      data.fieldsConfig = this.generateFieldsKeys(data.fieldsConfig);
    }

    return await servicesRepository.createService(data);
  }

  private generateFieldsKeys(fields: any[]): any[] {
    const seenKeys = new Set<string>();
    return fields.map((field, index) => {
      let label = field.label || "";
      let key = label
        .toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .trim()
        .replace(/^_+|_+$/g, "");

      if (!key) {
        key = `field_${index + 1}`;
      }

      let finalKey = key;
      let counter = 1;
      while (seenKeys.has(finalKey)) {
        finalKey = `${key}_${counter}`;
        counter++;
      }
      seenKeys.add(finalKey);

      return {
        ...field,
        key: finalKey,
      };
    });
  }

  async updateService(id: string, data: Partial<Omit<Service, "id" | "createdAt" | "updatedAt">>): Promise<Service & { serviceType: ServiceType | null }> {
    const service = await servicesRepository.getServiceById(id);
    if (!service) throw new Error("Không tìm thấy dịch vụ cần cập nhật");

    if (data.name !== undefined && !data.name?.trim()) {
      throw new Error("Tên dịch vụ không được để trống");
    }

    if (data.slug !== undefined) {
      if (!data.slug?.trim()) throw new Error("Đường dẫn (slug) không được để trống");
      const existing = await servicesRepository.getServiceBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new Error(`Đường dẫn (slug) "${data.slug}" đã tồn tại. Vui lòng chọn đường dẫn khác.`);
      }
    }

    if (data.fieldsConfig && Array.isArray(data.fieldsConfig)) {
      data.fieldsConfig = this.generateFieldsKeys(data.fieldsConfig);
    }

    return await servicesRepository.updateService(id, data);
  }

  async deleteService(id: string): Promise<void> {
    const service = await servicesRepository.getServiceById(id);
    if (!service) throw new Error("Không tìm thấy dịch vụ để xóa");
    await servicesRepository.deleteService(id);
  }

  async getTypes() {
    const list = await servicesRepository.getTypes();
    return {
      resultCode: 0,
      message: "Success",
      data: list,
    };
  }

  async createType(data: Omit<NewServiceType, "id" | "createdAt" | "updatedAt">) {
    if (!data.name?.trim()) {
      return { resultCode: -1, message: "Tên loại dịch vụ không được để trống" };
    }
    if (!data.slug?.trim()) {
      return { resultCode: -2, message: "Slug định danh không được để trống" };
    }

    const existing = await servicesRepository.getTypeBySlug(data.slug);
    if (existing) {
      return { resultCode: -3, message: `Slug "${data.slug}" đã tồn tại.` };
    }

    const inserted = await servicesRepository.createType(data);
    return {
      resultCode: 0,
      message: "Tạo phân loại mới thành công!",
      data: inserted,
    };
  }

  async updateType(id: string, data: Partial<Omit<ServiceType, "id" | "createdAt" | "updatedAt">>) {
    const existingType = await servicesRepository.getTypeById(id);
    if (!existingType) {
      return { resultCode: -1, message: "Không tìm thấy phân loại cần cập nhật" };
    }

    if (data.name !== undefined && !data.name?.trim()) {
      return { resultCode: -2, message: "Tên loại dịch vụ không được để trống" };
    }

    if (data.slug !== undefined) {
      const slug = data.slug.trim();
      if (!slug) {
        return { resultCode: -3, message: "Slug định danh không được để trống" };
      }
      const duplicate = await servicesRepository.getTypeBySlug(slug);
      if (duplicate && duplicate.id !== id) {
        return { resultCode: -4, message: `Slug "${slug}" đã tồn tại.` };
      }
    }

    const updated = await servicesRepository.updateType(id, data);
    return {
      resultCode: 0,
      message: "Cập nhật phân loại thành công!",
      data: updated,
    };
  }

  async deleteType(id: string) {
    const existingType = await servicesRepository.getTypeById(id);
    if (!existingType) {
      return { resultCode: -1, message: "Không tìm thấy phân loại cần xóa" };
    }
    await servicesRepository.deleteType(id);
    return {
      resultCode: 0,
      message: "Xóa phân loại thành công!",
      data: existingType,
    };
  }

  async getPackagesByServiceId(serviceId: string): Promise<ServicePackage[]> {
    return await servicesRepository.getPackagesByServiceId(serviceId);
  }

  async createPackage(data: Omit<NewServicePackage, "id" | "createdAt" | "updatedAt">): Promise<ServicePackage> {
    if (!data.name?.trim()) throw new Error("Tên gói dịch vụ không được để trống");
    if (!data.description?.trim()) throw new Error("Mô tả gói dịch vụ không được để trống");
    if (data.price === undefined || data.price < 0) throw new Error("Giá gói dịch vụ không hợp lệ");
    if (!data.deliveryTime || data.deliveryTime <= 0) throw new Error("Thời gian bàn giao không hợp lệ");

    return await servicesRepository.createPackage(data);
  }

  async updatePackage(id: string, data: Partial<Omit<ServicePackage, "id" | "createdAt" | "updatedAt">>): Promise<ServicePackage> {
    if (data.name !== undefined && !data.name?.trim()) throw new Error("Tên gói dịch vụ không được để trống");
    if (data.description !== undefined && !data.description?.trim()) throw new Error("Mô tả gói dịch vụ không được để trống");
    if (data.price !== undefined && data.price < 0) throw new Error("Giá gói dịch vụ không hợp lệ");
    if (data.deliveryTime !== undefined && data.deliveryTime <= 0) throw new Error("Thời gian bàn giao không hợp lệ");

    return await servicesRepository.updatePackage(id, data);
  }

  async deletePackage(id: string): Promise<void> {
    await servicesRepository.deletePackage(id);
  }

  async getRequests() {
    return await servicesRepository.getRequests();
  }

  async getRequestById(id: string) {
    const request = await servicesRepository.getRequestById(id);
    if (!request) throw new Error("Không tìm thấy yêu cầu dịch vụ");
    return request;
  }

  async updateRequest(id: string, data: Partial<Omit<ServiceRequest, "id" | "createdAt" | "updatedAt">>): Promise<ServiceRequest> {
    const request = await servicesRepository.getRequestById(id);
    if (!request) throw new Error("Không tìm thấy yêu cầu dịch vụ");

    return await servicesRepository.updateRequest(id, data);
  }

  async deleteRequest(id: string): Promise<void> {
    await servicesRepository.deleteRequest(id);
  }
}

export const servicesService = new ServicesService();
