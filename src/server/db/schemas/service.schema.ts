import { pgTable, text, timestamp, boolean, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { users } from "./user.schema";

// Cấu hình trường nhập liệu động (Dynamic Form Field Config)
// Dùng để tạo các form yêu cầu đặc thù cho từng loại dịch vụ (ví dụ: Màu sắc cho thiết kế, Ngôn ngữ cho dịch thuật, Phiên bản cho plugin...)
export interface FormFieldConfig {
  key: string;       // Khóa định danh trường (e.g. 'minecraft_version', 'accent_color')
  label: string;     // Nhãn hiển thị cho khách hàng (e.g. 'Phiên bản Minecraft', 'Màu sắc chủ đạo')
  type: "text" | "textarea" | "select" | "multiselect" | "checkbox" | "number" | "file"; // Kiểu nhập liệu
  required: boolean; // Bắt buộc hay không
  placeholder?: string | null;
  options?: string[] | null;
  defaultValue?: any;
}

// 0. Bảng phân loại dịch vụ (Service Types)
export const serviceTypes = pgTable("service_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // Tên loại dịch vụ (e.g. "Website", "Ứng dụng")
  slug: text("slug").notNull().unique(), // Slug định danh (e.g. "website", "app")
  icon: text("icon"), // Icon biểu tượng
  description: text("description"), // Mô tả ngắn
  color: text("color"), // Mã màu text Tailwind
  bg: text("bg"), // Mã màu background Tailwind
  border: text("border"), // Mã màu border Tailwind
  order: integer("order").default(0).notNull(), // Thứ tự hiển thị
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 1. Bảng dịch vụ chính (Services)
export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type"), // Giữ tạm để phục vụ migration dữ liệu cũ nếu cần
  typeId: uuid("type_id").references(() => serviceTypes.id, { onDelete: "set null" }), // Loại dịch vụ quan hệ (null nếu loại bị xóa)
  description: text("description"),
  content: text("content").notNull(), // Mô tả chi tiết (hỗ trợ MDX/Markdown)
  thumbnail: text("thumbnail"),
  gallery: jsonb("gallery").$type<string[]>().default([]).notNull(), // Bộ sưu tập hình ảnh demo/portfolio
  features: jsonb("features").$type<{ name: string; description?: string | null; icon?: string | null }[]>().default([]).notNull(), // Các đặc quyền / tính năng nổi bật đi kèm
  technologies: jsonb("technologies").$type<string[]>().default([]).notNull(), // Công cụ, ngôn ngữ, công nghệ (React, Photoshop, Java, Figma...)
  basePrice: integer("base_price").default(0).notNull(), // Giá khởi điểm
  priceType: text("price_type").default("starting_at").notNull(), // 'starting_at' (Giá từ) | 'fixed' (Cố định) | 'contact' (Liên hệ)
  deliveryTime: integer("delivery_time"), // Thời gian bàn giao trung bình (ngày)
  status: text("status").default("active").notNull(), // Trạng thái: 'active' (Hoạt động) | 'draft' (Nháp) | 'disabled' (Tắt)
  
  // Lưu trữ cấu hình form khảo sát đặc thù khi khách hàng order dịch vụ này
  fieldsConfig: jsonb("fields_config").$type<FormFieldConfig[]>().default([]).notNull(),
  
  // Metadata chung phục vụ cho cấu hình kỹ thuật động (không hardcode loại dịch vụ nào)
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}).notNull(),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Bảng các gói dịch vụ (Tiers: ví dụ: Gói Basic, Standard, Premium)
export const servicePackages = pgTable("service_packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Tên gói (e.g. "Gói Cơ Bản", "Gói Nâng Cao")
  description: text("description").notNull(), // Mô tả chi tiết gói
  price: integer("price").notNull(), // Giá của gói
  deliveryTime: integer("delivery_time").notNull(), // Thời gian bàn giao (ngày)
  featuresIncluded: jsonb("features_included").$type<Record<string, any>>().default({}).notNull(), // Quyền lợi trong gói (e.g. {"revisions": 3, "source_code": true})
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Bảng yêu cầu / đơn hàng dịch vụ (Service Requests)
export const serviceRequests = pgTable("service_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }), // ID tài khoản khách hàng (nếu có)
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  packageId: uuid("package_id").references(() => servicePackages.id, { onDelete: "set null" }), // Gói lựa chọn
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerSocial: text("customer_social").notNull(), // Kênh liên hệ ưu tiên (Link FB, Zalo SĐT, Discord Tag)
  requirements: text("requirements"), // Mô tả / ghi chú yêu cầu thêm từ khách hàng
  
  // Lưu trữ các câu trả lời tương ứng với fieldsConfig của dịch vụ này
  // Cấu trúc: { [field_key]: value_entered_by_customer }
  specifications: jsonb("specifications").$type<Record<string, any>>().default({}).notNull(),
  
  status: text("status").default("pending").notNull(), // Trạng thái đơn: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
  price: integer("price"), // Giá tiền đã thỏa thuận sau khi duyệt
  note: text("note"), // Ghi chú nội bộ của Quản trị viên
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type ServiceType = typeof serviceTypes.$inferSelect;
export type NewServiceType = typeof serviceTypes.$inferInsert;

export type ServicePackage = typeof servicePackages.$inferSelect;
export type NewServicePackage = typeof servicePackages.$inferInsert;

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;
