/**
 * Tất cả permission keys trong hệ thống.
 * Wildcard "*" = toàn quyền (admin).
 * Format: "module.action"
 */

export const PERMISSIONS = {
  // Toàn quyền
  ALL: "*",

  // Dashboard
  DASHBOARD_VIEW: "dashboard.view",

  // Users
  USERS_VIEW: "users.view",
  USERS_TOGGLE_ACTIVE: "users.toggle_active",
  USERS_UPDATE_ROLE: "users.update_role",
  USERS_DELETE: "users.delete",

  // Roles
  ROLES_VIEW: "roles.view",
  ROLES_CREATE: "roles.create",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",

  // Categories
  CATEGORIES_VIEW: "categories.view",
  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_UPDATE: "categories.update",
  CATEGORIES_REORDER: "categories.reorder",
  CATEGORIES_DELETE: "categories.delete",

  // Products
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_UPDATE: "products.update",
  PRODUCTS_DELETE: "products.delete",

  // Blog
  BLOG_VIEW: "blog.view",
  BLOG_CREATE: "blog.create",
  BLOG_UPDATE: "blog.update",
  BLOG_DELETE: "blog.delete",

  // Projects
  PROJECTS_VIEW: "projects.view",
  PROJECTS_CREATE: "projects.create",
  PROJECTS_UPDATE: "projects.update",
  PROJECTS_DELETE: "projects.delete",

  // Services
  SERVICES_VIEW: "services.view",
  SERVICES_CREATE: "services.create",
  SERVICES_UPDATE: "services.update",
  SERVICES_DELETE: "services.delete",

  // Licenses
  LICENSES_VIEW: "licenses.view",
  LICENSES_CREATE: "licenses.create",
  LICENSES_UPDATE: "licenses.update",
  LICENSES_REVOKE: "licenses.revoke",
  LICENSES_DELETE: "licenses.delete",

  // Contacts
  CONTACTS_VIEW: "contacts.view",
  CONTACTS_READ: "contacts.read",
  CONTACTS_DELETE: "contacts.delete",

  // Settings
  SETTINGS_VIEW: "settings.view",
  SETTINGS_UPDATE: "settings.update",

  // Uploads
  UPLOADS_CREATE: "uploads.create",

  // Database
  DATABASE_VIEW: "database.view",

  // Request Logs
  REQUESTS_VIEW: "requests.view",
  REQUESTS_CLEAR: "requests.clear",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Danh sách permission nhóm theo module, dùng cho UI checkbox.
 */
export const PERMISSION_GROUPS = [
  {
    module: "Dashboard",
    icon: "solar:chart-2-bold-duotone",
    permissions: [
      { key: PERMISSIONS.DASHBOARD_VIEW, label: "Xem tổng quan" },
    ],
  },
  {
    module: "Người dùng",
    icon: "solar:users-group-rounded-bold-duotone",
    permissions: [
      { key: PERMISSIONS.USERS_VIEW, label: "Xem danh sách" },
      { key: PERMISSIONS.USERS_TOGGLE_ACTIVE, label: "Khóa / mở user" },
      { key: PERMISSIONS.USERS_UPDATE_ROLE, label: "Đổi role" },
      { key: PERMISSIONS.USERS_DELETE, label: "Xóa user" },
    ],
  },
  {
    module: "Phân quyền",
    icon: "solar:shield-keyhole-bold-duotone",
    permissions: [
      { key: PERMISSIONS.ROLES_VIEW, label: "Xem danh sách role" },
      { key: PERMISSIONS.ROLES_CREATE, label: "Tạo role" },
      { key: PERMISSIONS.ROLES_UPDATE, label: "Sửa role" },
      { key: PERMISSIONS.ROLES_DELETE, label: "Xóa role" },
    ],
  },
  {
    module: "Danh mục",
    icon: "solar:layers-bold-duotone",
    permissions: [
      { key: PERMISSIONS.CATEGORIES_VIEW, label: "Xem danh sách" },
      { key: PERMISSIONS.CATEGORIES_CREATE, label: "Tạo mới" },
      { key: PERMISSIONS.CATEGORIES_UPDATE, label: "Cập nhật" },
      { key: PERMISSIONS.CATEGORIES_REORDER, label: "Sắp xếp" },
      { key: PERMISSIONS.CATEGORIES_DELETE, label: "Xóa" },
    ],
  },
  {
    module: "Sản phẩm",
    icon: "solar:box-bold-duotone",
    permissions: [
      { key: PERMISSIONS.PRODUCTS_VIEW, label: "Xem danh sách" },
      { key: PERMISSIONS.PRODUCTS_CREATE, label: "Tạo mới" },
      { key: PERMISSIONS.PRODUCTS_UPDATE, label: "Cập nhật" },
      { key: PERMISSIONS.PRODUCTS_DELETE, label: "Xóa" },
    ],
  },
  {
    module: "Blog",
    icon: "solar:document-text-bold-duotone",
    permissions: [
      { key: PERMISSIONS.BLOG_VIEW, label: "Xem danh sách" },
      { key: PERMISSIONS.BLOG_CREATE, label: "Tạo bài" },
      { key: PERMISSIONS.BLOG_UPDATE, label: "Sửa bài" },
      { key: PERMISSIONS.BLOG_DELETE, label: "Xóa bài" },
    ],
  },
  {
    module: "Dự án",
    icon: "solar:case-round-bold-duotone",
    permissions: [
      { key: PERMISSIONS.PROJECTS_VIEW, label: "Xem danh sách" },
      { key: PERMISSIONS.PROJECTS_CREATE, label: "Tạo mới" },
      { key: PERMISSIONS.PROJECTS_UPDATE, label: "Cập nhật" },
      { key: PERMISSIONS.PROJECTS_DELETE, label: "Xóa" },
    ],
  },
  {
    module: "Dịch vụ",
    icon: "solar:widget-5-bold-duotone",
    permissions: [
      { key: PERMISSIONS.SERVICES_VIEW, label: "Xem danh sách" },
      { key: PERMISSIONS.SERVICES_CREATE, label: "Tạo mới" },
      { key: PERMISSIONS.SERVICES_UPDATE, label: "Cập nhật" },
      { key: PERMISSIONS.SERVICES_DELETE, label: "Xóa" },
    ],
  },
  {
    module: "Giấy phép",
    icon: "solar:key-bold-duotone",
    permissions: [
      { key: PERMISSIONS.LICENSES_VIEW, label: "Xem danh sách" },
      { key: PERMISSIONS.LICENSES_CREATE, label: "Tạo mới" },
      { key: PERMISSIONS.LICENSES_UPDATE, label: "Cập nhật" },
      { key: PERMISSIONS.LICENSES_REVOKE, label: "Thu hồi" },
      { key: PERMISSIONS.LICENSES_DELETE, label: "Xóa" },
    ],
  },
  {
    module: "Liên hệ",
    icon: "solar:letter-bold-duotone",
    permissions: [
      { key: PERMISSIONS.CONTACTS_VIEW, label: "Xem danh sách" },
      { key: PERMISSIONS.CONTACTS_READ, label: "Đánh dấu đã đọc" },
      { key: PERMISSIONS.CONTACTS_DELETE, label: "Xóa" },
    ],
  },
  {
    module: "Cài đặt",
    icon: "solar:settings-bold-duotone",
    permissions: [
      { key: PERMISSIONS.SETTINGS_VIEW, label: "Xem cài đặt" },
      { key: PERMISSIONS.SETTINGS_UPDATE, label: "Cập nhật cài đặt" },
    ],
  },
  {
    module: "Upload",
    icon: "solar:cloud-upload-bold-duotone",
    permissions: [
      { key: PERMISSIONS.UPLOADS_CREATE, label: "Upload file" },
    ],
  },
  {
    module: "Database",
    icon: "solar:database-bold-duotone",
    permissions: [
      { key: PERMISSIONS.DATABASE_VIEW, label: "Xem bảng DB" },
    ],
  },
  {
    module: "Request Logs",
    icon: "solar:chart-2-bold-duotone",
    permissions: [
      { key: PERMISSIONS.REQUESTS_VIEW, label: "Xem logs" },
      { key: PERMISSIONS.REQUESTS_CLEAR, label: "Xóa logs" },
    ],
  },
];

/**
 * Check xem danh sách permissions có bao gồm quyền cần thiết không.
 */
export function hasPermission(userPermissions: string[], required: string): boolean {
  if (userPermissions.includes("*")) return true;
  return userPermissions.includes(required);
}
