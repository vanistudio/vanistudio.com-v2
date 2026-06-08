export interface DefaultMenuItem {
  name: string;
  url?: string;
  icon: string;
  order: number;
  children?: DefaultMenuItem[];
}

export interface DefaultMenuGroup {
  name: string;
  key: string;
  description: string;
  items: DefaultMenuItem[];
}

export const DEFAULT_MENU_GROUPS: DefaultMenuGroup[] = [
  {
    name: "Menu chính",
    key: "header",
    description: "Thanh điều hướng chính ở đầu trang của website.",
    items: [
      { name: "Trang chủ", url: "/", icon: "solar:home-2-line-duotone", order: 1 },
      { name: "Sản phẩm", url: "/products", icon: "solar:box-line-duotone", order: 2 },
      { name: "Dự án", url: "/projects", icon: "solar:folder-open-line-duotone", order: 3 },
      { name: "Dịch vụ", url: "/services", icon: "solar:server-square-line-duotone", order: 4 },
      { name: "Blog", url: "/blog", icon: "solar:document-text-line-duotone", order: 5 },
      { name: "Liên hệ", url: "/contact", icon: "solar:letter-line-duotone", order: 6 },
      {
        name: "Công cụ",
        icon: "solar:widget-3-line-duotone",
        order: 7,
        children: [
          { name: "Lấy mã 2fa", url: "/tools/2fa", icon: "solar:key-minimalistic-line-duotone", order: 1 },
          { name: "Check ID", url: "/tools/check-id", icon: "solar:user-id-line-duotone", order: 2 },
          { name: "Check Live UID", url: "/tools/check-live-uid", icon: "solar:user-rounded-line-duotone", order: 3 },
          { name: "Kiểm tra Domain", url: "/tools/check-domain", icon: "solar:global-line-duotone", order: 4 },
          { name: "Kiểm tra Bản quyền", url: "/tools/check-license", icon: "solar:verified-check-line-duotone", order: 5 },
          { name: "Tạo mã QR", url: "/tools/qr-generator", icon: "solar:qr-code-line-duotone", order: 6 },
          { name: "Phân tích SEO", url: "/tools/seo-audit", icon: "solar:ranking-line-duotone", order: 7 },
        ],
      },
      {
        name: "Chính sách",
        icon: "solar:shield-keyhole-line-duotone",
        order: 8,
        children: [
          { name: "Điều khoản", url: "/terms-of-service", icon: "solar:document-text-line-duotone", order: 1 },
          { name: "Bảo mật", url: "/privacy-policy", icon: "solar:lock-keyhole-line-duotone", order: 2 },
          { name: "Hoàn tiền", url: "/refund-policy", icon: "solar:bill-list-line-duotone", order: 3 },
          { name: "Giao nhận", url: "/delivery-policy", icon: "solar:delivery-line-duotone", order: 4 },
          { name: "Bảo hành", url: "/warranty-policy", icon: "solar:shield-check-line-duotone", order: 5 },
          { name: "Thanh toán", url: "/payment-policy", icon: "solar:card-line-duotone", order: 6 },
        ],
      },
    ],
  },
  {
    name: "Giới thiệu",
    key: "intro",
    description: "Kiến tạo giải pháp công nghệ vượt trội: thiết kế Website chuyên nghiệp, phát triển ứng dụng di động, giải pháp Chatbot AI và giao diện UI/UX tối ưu trải nghiệm.",
    items: [
      { name: "Facebook", url: "#", icon: "solar:globus-line-duotone", order: 1 },
      { name: "GitHub", url: "#", icon: "solar:code-line-duotone", order: 2 },
      { name: "Zalo", url: "#", icon: "solar:chat-round-line-duotone", order: 3 },
    ],
  },
  {
    name: "Dịch vụ chính",
    key: "services",
    description: "Các dịch vụ công nghệ chính",
    items: [
      { name: "Thiết kế Website", url: "/services/website", icon: "solar:monitor-line-duotone", order: 1 },
      { name: "Ứng dụng di động", url: "/services/mobile", icon: "solar:smartphone-line-duotone", order: 2 },
      { name: "Trợ lý ảo AI Chatbot", url: "/services/chatbot", icon: "solar:magic-stick-3-line-duotone", order: 3 },
      { name: "Thiết kế UI/UX", url: "/services/ui-ux", icon: "solar:palette-line-duotone", order: 4 },
    ],
  },
  {
    name: "Khám phá",
    key: "explore",
    description: "Khám phá dự án và tin tức",
    items: [
      { name: "Dự án đã thực hiện", url: "/projects", icon: "solar:folder-open-line-duotone", order: 1 },
      { name: "Sản phẩm phần mềm", url: "/products", icon: "solar:box-line-duotone", order: 2 },
      { name: "Blog & Tin công nghệ", url: "/blog", icon: "solar:document-text-line-duotone", order: 3 },
      { name: "Liên hệ báo giá", url: "/contact", icon: "solar:letter-line-duotone", order: 4 },
    ],
  },
  {
    name: "Kết nối với chúng tôi",
    key: "contact",
    description: "Thông tin liên hệ",
    items: [
      { name: "Email: contact@vanistudio.com", url: "mailto:contact@vanistudio.com", icon: "solar:letter-line-duotone", order: 1 },
      { name: "Hotline: +84 123 456 789", url: "tel:+84123456789", icon: "solar:phone-line-duotone", order: 2 },
      { name: "Địa chỉ: Thủ Đức, TP. Hồ Chí Minh", url: "#", icon: "solar:map-point-line-duotone", order: 3 },
    ],
  },
];
