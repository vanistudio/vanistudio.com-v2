import * as fs from "fs";
import * as path from "path";

// 1. Manually parse and load .env file variables to process.env
// This MUST happen before importing any database or schema files
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    const key = parts[0]?.trim();
    const value = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
    if (key && value) {
      process.env[key] = value;
    }
  });
}

if (!process.env.APP_DATABASE_URI_VALUE) {
  console.error("Error: APP_DATABASE_URI_VALUE is not defined in .env");
  process.exit(1);
}

// 2. Main function using dynamic imports to ensure env variables are loaded first
async function main() {
  try {
    console.log("Starting database seeding for products...");

    // Dynamically import database and schemas
    const { db } = await import("../src/server/db");
    const { products } = await import("../src/server/db/schemas/product.schema");
    const { inArray } = await import("drizzle-orm");

    // List of product slugs we will seed
    const productSlugs = [
      "nextjs-premium-saas-boilerplate",
      "auto-social-media-poster",
      "chrome-extension-seo-analyzer"
    ];

    // Clean up existing products with those slugs to prevent unique constraint errors
    console.log("Cleaning up existing matching product records...");
    await db.delete(products).where(inArray(products.slug, productSlugs));

    // Seed data
    const productsData = [
      {
        name: "Next.js Premium SaaS Boilerplate",
        slug: "nextjs-premium-saas-boilerplate",
        description: "Mẫu dự án Next.js 16 hoàn chỉnh tích hợp Better-Auth, Drizzle ORM, Stripe, và TailwindCSS v4 giúp bạn khởi chạy sản phẩm SaaS trong vài giờ.",
        content: `### Next.js Premium SaaS Boilerplate

Giải pháp khởi động SaaS tối ưu được xây dựng với công nghệ hiện đại nhất, giúp bạn bỏ qua phần thiết lập hạ tầng tẻ nhạt và tập trung hoàn toàn vào việc xây dựng tính năng sản phẩm cốt lõi.

#### Các tính năng chính đi kèm:
- **Hệ thống xác thực mạnh mẽ (Better-Auth)**: Google, GitHub, Email/Password, xác thực 2 lớp (MFA), quản lý phiên hoạt động.
- **Tích hợp cổng thanh toán Stripe**: Stripe Checkout, Subscriptions, Webhooks, Customer Portal tích hợp sẵn.
- **Cơ sở dữ liệu (Drizzle ORM & Postgres)**: Schema tối ưu hóa hoàn chỉnh cho người dùng, thanh toán, phân quyền và lịch sử giao dịch.
- **Giao diện đẳng cấp**: TailwindCSS v4 kết hợp thư viện Shadcn UI được thiết kế sang trọng, hỗ trợ Dark/Light mode tự động.

#### Yêu cầu hệ thống / Môi trường:
- Node.js v20 hoặc mới hơn
- PostgreSQL database
- Stripe Account (cho cấu hình thương mại)
`,
        type: "source_code",
        status: "active",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
        ],
        price: 99,
        salePrice: 79,
        currency: "USD",
        badge: "HOT",
        isFeatured: true,
        version: "1.0.0",
        licenseType: "single",
        supportMonths: 6,
        fileSize: "4.5 MB",
        compatibility: ["Next.js 16", "React 19", "TailwindCSS v4", "Better-Auth", "Drizzle ORM"],
        demoUrl: "https://saas-boilerplate.vanistudio.com",
        githubUrl: "https://github.com/vanistudio/nextjs-saas-boilerplate",
        downloadUrl: "https://gumroad.com/l/nextjs-saas-boilerplate",
        salesCount: 45,
        viewsCount: 1250,
        downloadCount: 45,
        features: [
          {
            name: "Xác thực bảo mật",
            description: "Better-Auth cấu hình sẵn đầy đủ social logins và bảo mật phiên.",
            icon: "solar:shield-keyhole-line-duotone"
          },
          {
            name: "Cổng Stripe đồng bộ",
            description: "Hỗ trợ gói định kỳ, thanh toán một lần và xử lý webhook tự động.",
            icon: "solar:card-2-line-duotone"
          },
          {
            name: "Drizzle ORM & Migrations",
            description: "Tạo bảng, quản lý quan hệ và migrate dữ liệu Postgres chỉ bằng 1 câu lệnh.",
            icon: "solar:database-line-duotone"
          }
        ],
        changelog: [
          {
            version: "1.0.0",
            date: "2026-06-15",
            title: "Khởi tạo dự án",
            changes: [
              "Phát hành bộ Boilerplate phiên bản đầu tiên.",
              "Tích hợp Next.js 16 App Router & React 19.",
              "Cấu hình Better Auth Adapter cho Drizzle PostgreSQL.",
              "Thiết lập luồng đăng ký gói dịch vụ qua Stripe Checkout."
            ]
          }
        ],
        metadata: {},
        order: 1
      },
      {
        name: "Auto Social Media Poster",
        slug: "auto-social-media-poster",
        description: "Công cụ lập lịch và đăng bài viết tự động đồng thời lên Facebook, Twitter, LinkedIn và Instagram chỉ từ một bảng điều khiển duy nhất.",
        content: `### Auto Social Media Poster

Công cụ quản trị mạng xã hội mạnh mẽ giúp các Content Creator và Marketing Agency tiết kiệm hàng chục giờ làm việc mỗi tuần bằng cách tự động hóa hoàn toàn quy trình phân phối nội dung.

#### Chức năng nổi bật:
- **Đăng bài đa kênh**: Đăng bài viết kèm hình ảnh/video đồng thời lên nhiều tài khoản mạng xã hội.
- **Lập lịch thông minh**: Lên kế hoạch nội dung chi tiết theo ngày, tuần, tháng với giao diện Calendar trực quan.
- **Báo cáo tương tác**: Tổng hợp lượt thích, chia sẻ và bình luận của các bài viết đã đăng để đánh giá hiệu quả chiến dịch.
- **Quản lý Media Library**: Lưu trữ sẵn kho hình ảnh, video và bài viết mẫu để tái sử dụng nhanh chóng.
`,
        type: "tool",
        status: "active",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
        ],
        price: 49,
        salePrice: 39,
        currency: "USD",
        badge: "SALE",
        isFeatured: false,
        version: "1.2.0",
        licenseType: "single",
        supportMonths: 12,
        fileSize: "18.2 MB",
        compatibility: ["Node.js v20+", "Chrome v120+", "Windows 10/11", "macOS 13+"],
        demoUrl: "https://poster.vanistudio.com",
        githubUrl: "https://github.com/vanistudio/auto-social-poster",
        downloadUrl: "https://gumroad.com/l/auto-social-poster",
        salesCount: 88,
        viewsCount: 2100,
        downloadCount: 88,
        features: [
          {
            name: "Lập lịch trực quan",
            description: "Giao diện kéo thả lịch đăng bài thông minh và tiện lợi.",
            icon: "solar:calendar-line-duotone"
          },
          {
            name: "Đăng tải đa kênh",
            description: "Hỗ trợ các nền tảng lớn Facebook, Instagram, LinkedIn và Twitter.",
            icon: "solar:share-circle-line-duotone"
          }
        ],
        changelog: [
          {
            version: "1.2.0",
            date: "2026-06-10",
            title: "Cập nhật API Facebook v20.0",
            changes: [
              "Nâng cấp SDK lên tương thích API Facebook Graph v20.0 mới nhất.",
              "Sửa lỗi đăng nhiều ảnh cùng lúc bị lỗi trên mạng xã hội Twitter.",
              "Tối ưu bộ nhớ đệm và cải tiến tốc độ đăng tải bài viết lên đến 40%."
            ]
          },
          {
            version: "1.0.0",
            date: "2026-05-01",
            title: "Bản phát hành đầu tiên",
            changes: [
              "Khởi chạy công cụ đăng bài cơ bản cho Facebook và Twitter.",
              "Hỗ trợ soạn thảo nội dung Rich Text và chọn ảnh từ máy tính."
            ]
          }
        ],
        metadata: {},
        order: 2
      },
      {
        name: "Chrome Extension SEO Analyzer",
        slug: "chrome-extension-seo-analyzer",
        description: "Tiện ích mở rộng Chrome giúp phân tích các yếu tố SEO On-page, cấu trúc headings và chỉ số Core Web Vitals trực tiếp trên bất kỳ trang web nào chỉ với 1 click.",
        content: `### Chrome Extension SEO Analyzer

Tiện ích đắc lực dành cho các SEOer và Web Developer giúp kiểm tra, tối ưu hóa các tiêu chí kỹ thuật On-page một cách trực quan, nhanh chóng nhất.

#### Các thông số phân tích:
- **SEO cơ bản**: Tiêu đề (Title), Mô tả (Meta Description), Thẻ Canonical, Robots meta tags.
- **Cấu trúc trang**: Cây sơ đồ Heading (H1 đến H6) giúp kiểm tra tính mạch lạc của nội dung.
- **Hình ảnh**: Quét thuộc tính Alt của tất cả các ảnh trên trang hiện hành.
- **Core Web Vitals**: Kiểm tra trực tiếp các chỉ số tốc độ LCP (Largest Contentful Paint), FID (First Input Delay), và CLS (Cumulative Layout Shift) thực tế.
`,
        type: "extension",
        status: "active",
        thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop",
        gallery: [],
        price: 0,
        salePrice: null,
        currency: "USD",
        badge: "NEW",
        isFeatured: true,
        version: "1.0.5",
        licenseType: "free",
        supportMonths: 0,
        fileSize: "820 KB",
        compatibility: ["Chrome v100+", "Edge v100+", "Opera v90+"],
        demoUrl: "https://seo-analyzer.vanistudio.com",
        githubUrl: "https://github.com/vanistudio/seo-analyzer-extension",
        downloadUrl: "https://chromewebstore.google.com",
        salesCount: 0,
        viewsCount: 3400,
        downloadCount: 1200,
        features: [
          {
            name: "Phân tích 1-Click",
            description: "Chỉ cần nhấn vào biểu tượng extension để nhận báo cáo phân tích toàn diện.",
            icon: "solar:document-text-line-duotone"
          },
          {
            name: "Đo lường Core Web Vitals",
            description: "Kiểm tra tốc độ tải trang thực tế dựa trên các chỉ số của Google.",
            icon: "solar:graph-line-duotone"
          }
        ],
        changelog: [
          {
            version: "1.0.5",
            date: "2026-06-12",
            title: "Sửa lỗi và cải tiến",
            changes: [
              "Sửa lỗi hiển thị sai khi phát hiện các thẻ meta lặp lại.",
              "Thêm tính năng xuất báo cáo SEO On-page ra tệp PDF.",
              "Tối ưu hóa giao diện người dùng theo phong cách Modern Glassmorphism."
            ]
          }
        ],
        metadata: {},
        order: 3
      }
    ];

    // Seed each product record
    for (const productItem of productsData) {
      const [insertedProduct] = await db
        .insert(products)
        .values(productItem)
        .returning();
      console.log(`Seeded product successfully: ${productItem.name} -> ID: ${insertedProduct.id}`);
    }

    console.log("Database seeding completed successfully for all products!");
    process.exit(0);
  } catch (error: any) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
}

main();
