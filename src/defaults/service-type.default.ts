export interface DefaultServiceType {
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  order: number;
}

export const DEFAULT_SERVICE_TYPES: DefaultServiceType[] = [
  {
    name: "Website",
    slug: "website",
    icon: "solar:window-frame-line-duotone",
    description: "Thiết kế và lập trình website chuẩn SEO, landing page, quản trị doanh nghiệp.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    order: 1,
  },
  {
    name: "Ứng dụng (App)",
    slug: "app",
    icon: "solar:smartphone-line-duotone",
    description: "Xây dựng ứng dụng di động đa nền tảng iOS và Android mượt mà.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    order: 2,
  },
  {
    name: "Bot AI / Discord / Telegram",
    slug: "bot",
    icon: "solar:cpu-line-duotone",
    description: "Tích hợp trợ lý AI thông minh và công cụ tự động hóa trên Discord & Telegram.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    order: 3,
  },
  {
    name: "Minecraft Plugin",
    slug: "minecraft_plugin",
    icon: "solar:gamepad-line-duotone",
    description: "Phát triển plugin và tính năng đặc thù cho các máy chủ Minecraft.",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    order: 4,
  },
  {
    name: "Thiết kế đồ họa",
    slug: "design",
    icon: "solar:palette-line-duotone",
    description: "Thiết kế giao diện UI/UX đẹp mắt, logo, ấn phẩm truyền thông thương hiệu.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    order: 5,
  },
  {
    name: "Dịch thuật",
    slug: "translation",
    icon: "solar:translation-line-duotone",
    description: "Dịch thuật và bản địa hóa nội dung đa ngôn ngữ chính xác, tự nhiên.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    order: 6,
  },
  {
    name: "Dịch vụ khác",
    slug: "other",
    icon: "solar:menu-dots-square-line-duotone",
    description: "Các giải pháp kỹ thuật, tích hợp API và tối ưu hóa hệ thống đặc thù.",
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
    order: 7,
  },
];
