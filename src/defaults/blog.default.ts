import { type NewBlog } from "@/server/db/schemas/blog.schema";

export const DEFAULT_BLOGS: Omit<NewBlog, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "Hướng dẫn tối ưu SEO cho Website Next.js 16",
    slug: "nextjs-16-seo-guide",
    description: "Tìm hiểu các kỹ thuật tối ưu hóa công cụ tìm kiếm (SEO) tốt nhất cho Next.js 16, từ cấu hình metadata đến React Server Components.",
    isActive: true,
    publishedAt: new Date("2026-06-13T09:00:00.000Z"),
    thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-y9vu10y9vu10y9vu-1781432840356.jpg",
    metaTitle: "Hướng dẫn tối ưu SEO cho Website Next.js 16 | Vani Studio",
    metaDescription: "Tìm hiểu các kỹ thuật tối ưu hóa công cụ tìm kiếm (SEO) tốt nhất cho Next.js 16, từ cấu hình metadata đến React Server Components.",
    metaKeywords: "nextjs 16, seo nextjs, toi uu seo, nextjs metadata, react server components",
    content: `# Hướng dẫn tối ưu SEO cho Website Next.js 16

Next.js 16 cung cấp các công cụ mạnh mẽ để xây dựng các trang web nhanh và thân thiện với SEO. Dưới đây là các kỹ thuật cốt lõi giúp bạn đạt điểm tối đa trên các công cụ tìm kiếm.

## 1. Cấu hình Metadata tĩnh và động
Next.js hỗ trợ Metadata API để định nghĩa các thẻ meta một cách dễ dàng:
- **Metadata tĩnh**: Định nghĩa ngay trong file layout hoặc page.
- **Metadata động**: Sử dụng hàm \`generateMetadata\` để fetch dữ liệu từ DB và trả về meta tags phù hợp.

<Separator className="my-6" />

## 2. Sử dụng React Server Components (RSC) hiệu quả
Nhờ RSC, HTML được render sẵn phía máy chủ giúp công cụ tìm kiếm dễ dàng crawl dữ liệu:
- Hạn chế sử dụng \`"use client"\` ở các component chứa thông tin SEO quan trọng.
- Fetch dữ liệu trực tiếp trong Server Components để giảm thời gian tải trang.

<Alert className="border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400">
  <Icon icon="solar:info-circle-line-duotone" className="size-4" />
  <AlertTitle>Mẹo nhỏ</AlertTitle>
  <AlertDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
    Sử dụng công cụ Lighthouse trong Chrome Developer Tools để kiểm tra điểm SEO và hiệu năng của trang web trước khi đưa lên môi trường sản xuất.
  </AlertDescription>
</Alert>
`,
  },
  {
    title: "Xu hướng thiết kế UI/UX nổi bật trong năm 2026",
    slug: "ui-ux-design-trends-2026",
    description: "Khám phá các xu hướng thiết kế giao diện và trải nghiệm người dùng đang làm mưa làm gió trong cộng đồng thiết kế toàn cầu.",
    isActive: true,
    publishedAt: new Date("2026-06-13T09:00:00.000Z"),
    thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-nugixvnugixvnugi-1781432652289.jpg",
    metaTitle: "Xu hướng thiết kế UI/UX nổi bật trong năm 2026 | Vani Studio",
    metaDescription: "Khám phá các xu hướng thiết kế giao diện và trải nghiệm người dùng đang làm mưa làm gió trong cộng đồng thiết kế toàn cầu.",
    metaKeywords: "ui ux, xu huong thiet ke, uiux design, vani studio design",
    content: `# Xu hướng thiết kế UI/UX nổi bật trong năm 2026

Năm 2026 đánh dấu sự lên ngôi của các trải nghiệm cá nhân hóa cao, giao diện tối giản tinh tế kết hợp với các hiệu ứng chuyển động mượt mà.

## 1. Bento Grid Layout
Bố cục dạng lưới Bento tiếp tục thống trị nhờ khả năng sắp xếp thông tin một cách gọn gàng và khoa học:
- Phù hợp hiển thị các tính năng, thống kê dữ liệu hoặc thư viện ảnh.
- Dễ dàng tối ưu hóa responsive trên thiết bị di động.

<Separator className="my-6" />

## 2. Glassmorphism và Sleek Dark Mode
Sự kết hợp giữa hiệu ứng mờ kính (glassmorphism) trên nền tối mang lại cảm giác cực kỳ cao cấp và hiện đại:
- Sử dụng các lớp bóng mờ nhẹ để phân tách thành phần giao diện.
- Đảm bảo tỷ lệ tương phản màu sắc tốt giúp bảo vệ mắt người dùng.
`,
  },
];
