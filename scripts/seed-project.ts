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
    console.log("Starting database seeding for multiple high-quality projects...");

    // Dynamically import database and schemas
    const { db } = await import("../src/server/db");
    const { projects } = await import("../src/server/db/schemas/project.schema");
    const { services, serviceTypes } = await import("../src/server/db/schemas/service.schema");
    const { eq, inArray } = await import("drizzle-orm");

    // Fetch or create a default service and service type so the project has a dynamic reference
    let serviceId: string | null = null;
    const existingServices = await db.select().from(services).limit(1);

    if (existingServices.length > 0) {
      serviceId = existingServices[0].id;
      console.log(`Found existing service. Linking project to service ID: ${serviceId}`);
    } else {
      console.log("No services found in database. Creating default service type & service...");
      // Create a dummy service type first
      const [newType] = await db
        .insert(serviceTypes)
        .values({
          name: "Phát triển Web",
          icon: "solar:monitor-line-duotone",
          description: "Thiết kế và phát triển website chuyên nghiệp",
          color: "text-blue-500",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          order: 1,
        })
        .returning();

      // Create a dummy service
      const [newService] = await db
        .insert(services)
        .values({
          name: "Thiết kế Website E-Commerce",
          slug: "thiet-ke-website-ecommerce",
          type: "web",
          typeId: newType.id,
          description: "Giải pháp bán hàng trực tuyến toàn diện, tối ưu tỷ lệ chuyển đổi.",
          content: "### Thiết kế Website E-Commerce chuyên nghiệp\n\nChúng tôi mang đến giải pháp tối ưu cho doanh nghiệp bán lẻ trực tuyến.",
          thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
          gallery: [
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
          ],
          features: [
            { name: "Thanh toán tự động", description: "Tích hợp ví điện tử, thẻ ngân hàng", icon: "solar:card-2-line-duotone" }
          ],
          technologies: ["Next.js", "Tailwind CSS", "PostgreSQL"],
          basePrice: 15000000,
          priceType: "starting_at",
          deliveryTime: 30,
          status: "active",
          order: 1,
        })
        .returning();

      serviceId = newService.id;
      console.log(`Created default service type & service. Linked service ID: ${serviceId}`);
    }

    // List of project slugs we will seed
    const projectSlugs = [
      "fashionhub-ecommerce-platform",
      "kalpha-learning-management-system",
      "ecoglow-organic-cosmetics-brand",
      "vanistudio-internal-analytics-tool"
    ];

    // Clean up existing projects with those slugs to prevent unique constraint errors
    console.log("Cleaning up existing matching project records...");
    await db.delete(projects).where(inArray(projects.slug, projectSlugs));

    // Seed data
    const projectsData = [
      {
        name: "FashionHub - Nền tảng Thương mại Điện tử Thế hệ Mới",
        slug: "fashionhub-ecommerce-platform",
        description: "Dự án phát triển nền tảng thương mại điện tử chuyên nghiệp cho ngành hàng thời trang cao cấp, tích hợp AI đề xuất sản phẩm và hệ thống thanh toán tự động.",
        content: `### Giới thiệu dự án FashionHub

FashionHub là một giải pháp thương mại điện tử đột phá được xây dựng riêng cho thương hiệu thời trang cao cấp. Với mục tiêu tái cấu trúc trải nghiệm mua sắm trực tuyến, hệ thống tập trung vào giao diện thời thượng, tốc độ phản hồi tức thì và quy trình thanh toán một chạm mượt mà.

#### Mục tiêu & Thách thức
1. **Trải nghiệm di động tối đa**: Hơn 85% khách hàng mua sắm qua điện thoại, vì thế giao diện mobile-first được chăm chút kỹ lưỡng.
2. **Hiệu suất vượt trội**: Sử dụng kỹ thuật tối ưu hóa Next.js Server Components giúp tải trang chi tiết sản phẩm chỉ dưới 0.5 giây.
3. **Độc đáo và Sang trọng**: Ngôn ngữ thiết kế tối giản, tinh tế nhưng đầy sinh động với hiệu ứng micro-animations mượt mà.

#### Công nghệ cốt lõi
* **Frontend**: Next.js (App Router), React 19, Framer Motion, Tailwind CSS v4.
* **Backend & Database**: Drizzle ORM, PostgreSQL kết hợp hệ thống caching nâng cao.
* **Hạ tầng**: Lưu trữ hình ảnh tối ưu trên Cloudinary CDN thế hệ mới.`,
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
        mediaGallery: [
          {
            url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
            caption: "Dashboard phân tích và thống kê doanh thu thời gian thực",
            type: "image" as const
          },
          {
            url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop",
            caption: "Giao diện hiển thị sản phẩm trên thiết bị di động",
            type: "image" as const
          },
          {
            url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop",
            caption: "Hệ thống Design System nhất quán cho toàn bộ ứng dụng",
            type: "image" as const
          }
        ],
        projectType: "client",
        role: "Full-stack Development & UI/UX Lead",
        difficulty: 5,
        metrics: [
          {
            label: "Tốc độ tải trang",
            value: "0.4s",
            icon: "solar:bolt-line-duotone"
          },
          {
            label: "Điểm Lighthouse",
            value: "100/100",
            icon: "solar:star-line-duotone"
          },
          {
            label: "Tỷ lệ chuyển đổi",
            value: "+35%",
            icon: "solar:graph-up-line-duotone"
          }
        ],
        highlights: [
          {
            title: "Trải nghiệm Mobile vượt trội",
            description: "Giao diện cảm ứng được thiết kế chuẩn xác, nâng cao sự thoải mái của người tiêu dùng khi mua sắm.",
            image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=500&auto=format&fit=crop"
          },
          {
            title: "Bộ lọc thông minh",
            description: "Lọc theo danh mục, kích cỡ, màu sắc, khoảng giá mà không cần tải lại toàn bộ trang web.",
            image: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=500&auto=format&fit=crop"
          }
        ],
        clientName: "FashionHub Group International",
        clientUrl: "https://fashionhub.example.com",
        links: [
          {
            label: "Trải nghiệm phiên bản Demo trực tiếp",
            url: "https://fashionhub.example.com",
            type: "live" as const
          },
          {
            label: "Khám phá mã nguồn GitHub",
            url: "https://github.com/example/fashionhub",
            type: "github" as const
          },
          {
            label: "Xem bản thiết kế chi tiết trên Figma",
            url: "https://figma.com/example/fashionhub",
            type: "figma" as const
          }
        ],
        team: [
          {
            name: "John Doe",
            role: "Lead Fullstack Developer",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
            profileUrl: "https://github.com/johndoe"
          },
          {
            name: "Jane Smith",
            role: "UI/UX & Brand Designer",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
            profileUrl: "https://figma.com/@janesmith"
          }
        ],
        testimonials: [
          {
            content: "VaniStudio đã biến tầm nhìn của chúng tôi thành hiện thực với một sản phẩm hoàn hảo vượt ngoài mong đợi. Đội ngũ làm việc chuyên nghiệp, chu đáo và hỗ trợ kỹ thuật rất tận tình.",
            author: "Nguyễn Văn A",
            role: "CEO tại FashionHub Vietnam",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop"
          }
        ],
        status: "completed",
        startDate: new Date("2026-01-15T00:00:00Z"),
        endDate: new Date("2026-05-30T00:00:00Z"),
        featured: true,
        order: 1,
        viewsCount: 1250,
        likesCount: 348,
        serviceId: serviceId,
        metadata: {
          industry: "Retail & E-Commerce",
          mainColor: "#7c3aed"
        }
      },
      {
        name: "Kalpha LMS - Hệ thống Quản trị Học tập trực tuyến",
        slug: "kalpha-learning-management-system",
        description: "Nền tảng e-learning quy mô lớn hỗ trợ các lớp học ảo, tương tác thời gian thực, quản lý bài kiểm tra tự động và cá nhân hóa lộ trình học của từng học viên.",
        content: `### Giới thiệu hệ thống Kalpha LMS

Kalpha LMS được xây dựng nhằm phục vụ nhu cầu đào tạo nội bộ và giảng dạy trực tuyến quy mô lớn. Dự án chú trọng vào tính tương tác trực quan của bài học, hỗ trợ bảng tương tác ảo và phòng học video độ phân giải cao.

#### Các tính năng trọng tâm
1. **Interactive Virtual Classroom**: Bảng viết vẽ trực tuyến tích hợp ghi hình trực tiếp buổi học với độ trễ cực thấp.
2. **AI-Driven Pathfinding**: Phân tích lịch sử làm bài để đưa ra đề xuất khóa học tiếp theo phù hợp nhất cho học viên.
3. **Admin Comprehensive Portal**: Quản lý hàng vạn học viên cùng lúc, hệ thống xuất báo cáo Excel/PDF tự động nhanh gọn.

#### Công nghệ sử dụng
* **WebRTC & WebSocket**: Thiết lập phòng học trực tuyến và đồng bộ hóa bảng viết vẽ.
* **Tech Stack**: Next.js 16, Tailwind CSS, PostgreSQL, Redis Caching.`,
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
        mediaGallery: [
          {
            url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
            caption: "Giao diện bài học trực quan và sinh động",
            type: "image" as const
          },
          {
            url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
            caption: "Bảng điều khiển kết quả học tập cá nhân hóa",
            type: "image" as const
          },
          {
            url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
            caption: "Tính năng học nhóm trực tuyến và thảo luận chung",
            type: "image" as const
          }
        ],
        projectType: "client",
        role: "Frontend Architect & Lead Engineer",
        difficulty: 4,
        metrics: [
          {
            label: "Học viên Active",
            value: "50,000+",
            icon: "solar:users-group-rounded-line-duotone"
          },
          {
            label: "Thời gian Uptime",
            value: "99.99%",
            icon: "solar:shield-check-line-duotone"
          },
          {
            label: "Đánh giá tích cực",
            value: "4.9/5.0",
            icon: "solar:like-line-duotone"
          }
        ],
        highlights: [
          {
            title: "Học tập tương tác thông minh",
            description: "Bảng viết số tương tác trực tiếp với độ trễ phản hồi dưới 100ms.",
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500&auto=format&fit=crop"
          },
          {
            title: "Lộ trình học AI",
            description: "Tự động phân tích điểm yếu và gợi ý các bài ôn tập bám sát thực tế.",
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=500&auto=format&fit=crop"
          }
        ],
        clientName: "Kalpha Academy Ltd",
        clientUrl: "https://kalpha.example.com",
        links: [
          {
            label: "Trải nghiệm học thử",
            url: "https://kalpha.example.com",
            type: "live" as const
          },
          {
            label: "Xem tài liệu hệ thống",
            url: "https://docs.example.com/kalpha",
            type: "docs" as const
          }
        ],
        team: [
          {
            name: "John Doe",
            role: "Software Architect",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop"
          },
          {
            name: "Jane Smith",
            role: "Lead UI Designer",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
          }
        ],
        testimonials: [
          {
            content: "Hệ thống LMS này giúp chúng tôi tiết kiệm hơn 60% chi phí vận hành giảng dạy và gia tăng rõ rệt mức độ hài lòng của học viên toàn cầu.",
            author: "Nguyễn Thị B",
            role: "COO tại Kalpha Academy",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"
          }
        ],
        status: "completed",
        startDate: new Date("2025-06-01T00:00:00Z"),
        endDate: new Date("2025-12-15T00:00:00Z"),
        featured: true,
        order: 2,
        viewsCount: 940,
        likesCount: 212,
        serviceId: serviceId,
        metadata: {
          industry: "EdTech & Education",
          mainColor: "#0284c7"
        }
      },
      {
        name: "EcoGlow - Website Thương hiệu Mỹ phẩm Thiên nhiên",
        slug: "ecoglow-organic-cosmetics-brand",
        description: "Thiết kế nhận diện thương hiệu và website bán hàng tối giản, organic cho thương hiệu mỹ phẩm thuần chay EcoGlow Cosmetics.",
        content: `### Dự án định vị thương hiệu EcoGlow

EcoGlow hướng tới phong cách tối giản, bảo vệ môi trường và tôn vinh vẻ đẹp tự nhiên. Toàn bộ thiết kế trang web được tinh chỉnh tỉ mỉ về khoảng trắng, typography và hiệu ứng cuộn trang mượt mà.

#### Đặc trưng dự án
1. **Thiết kế Organic**: Chọn tông màu xanh olive và be ấm tạo thiện cảm về sự sạch sẽ, an lành.
2. **Product Storytelling**: Trải nghiệm xem sản phẩm đi kèm với câu chuyện xuất xứ nguồn nguyên liệu đầy sinh động.
3. **Tối ưu hóa hình ảnh**: Chuyển đổi toàn bộ ảnh sang định dạng WebP/AVIF và ứng dụng công nghệ Progressive Loading tránh làm chậm trang web.`,
        thumbnail: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=800&auto=format&fit=crop",
        mediaGallery: [
          {
            url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=800&auto=format&fit=crop",
            caption: "Giao diện trang sản phẩm chi tiết",
            type: "image" as const
          },
          {
            url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop",
            caption: "Bộ nhận diện bao bì sinh thái tự nhiên",
            type: "image" as const
          }
        ],
        projectType: "personal",
        role: "UI/UX Designer & Frontend Developer",
        difficulty: 3,
        metrics: [
          {
            label: "Điểm di động",
            value: "95+",
            icon: "solar:iphone-line-duotone"
          },
          {
            label: "Tăng trưởng traffic",
            value: "+120%",
            icon: "solar:plain-line-duotone"
          }
        ],
        highlights: [
          {
            title: "Trải nghiệm mộc mạc & Thân thiện",
            description: "Màu sắc nhẹ nhàng kết hợp các font chữ Serif tinh tế tạo cảm giác thư giãn tuyệt đối cho người xem.",
            image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=500&auto=format&fit=crop"
          }
        ],
        clientName: "EcoGlow Cosmetics",
        clientUrl: "https://ecoglow.example.com",
        links: [
          {
            label: "Trang Web chính thức",
            url: "https://ecoglow.example.com",
            type: "live" as const
          }
        ],
        team: [
          {
            name: "Jane Smith",
            role: "Lead Creative Designer",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
          }
        ],
        testimonials: [
          {
            content: "Thiết kế trang web giúp EcoGlow truyền tải hoàn hảo giá trị cốt lõi của thương hiệu đến khách hàng ngay từ cái nhìn đầu tiên.",
            author: "David Evans",
            role: "Founder tại EcoGlow",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
          }
        ],
        status: "developing",
        startDate: new Date("2026-04-10T00:00:00Z"),
        endDate: null,
        featured: false,
        order: 3,
        viewsCount: 520,
        likesCount: 104,
        serviceId: serviceId,
        metadata: {
          industry: "Beauty & Branding",
          mainColor: "#15803d"
        }
      },
      {
        name: "VaniStudio Suite - Công cụ Phân tích Dữ liệu Nội bộ",
        slug: "vanistudio-internal-analytics-tool",
        description: "Hệ thống phần mềm quản lý nội bộ, tổng hợp báo cáo tự động và đo lường hiệu năng các dự án trong VaniStudio.",
        content: `### VaniStudio Suite - Internal Dashboard

Được thiết kế phục vụ tối đa hoạt động quản trị dòng việc và tối ưu quy trình phân phối sản phẩm phần mềm nội bộ tại VaniStudio.

#### Chức năng cốt lõi
1. **Performance Tracking**: Đồng bộ chỉ số trực tiếp từ VPS và hệ thống CI/CD để chấm điểm tốc độ ứng dụng liên tục.
2. **Automatic Reporting**: Xuất file Excel chấm công và doanh số tự động theo tuần.
3. **Dark Mode Premium**: Trải nghiệm xem biểu đồ đêm mượt mà, giúp mắt giảm mỏi mệt khi làm việc khuya.`,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
        mediaGallery: [
          {
            url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
            caption: "Bảng hiển thị biểu đồ thống kê nội bộ",
            type: "image" as const
          },
          {
            url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
            caption: "Giao diện quản lý tác vụ công việc nhóm",
            type: "image" as const
          }
        ],
        projectType: "internal",
        role: "Developer",
        difficulty: 4,
        metrics: [
          {
            label: "Giảm thời gian truy vấn",
            value: "-60%",
            icon: "solar:timer-line-duotone"
          },
          {
            label: "Tích hợp API",
            value: "12+ Hệ thống",
            icon: "solar:link-round-line-duotone"
          }
        ],
        highlights: [
          {
            title: "Trải nghiệm phân tích đỉnh cao",
            description: "Các biểu đồ trực quan sử dụng thư viện chuyên sâu giúp phân tích dữ liệu chỉ trong nháy mắt.",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=500&auto=format&fit=crop"
          }
        ],
        clientName: "VaniStudio Group",
        clientUrl: "https://vanistudio.com",
        links: [
          {
            label: "Bản thử nghiệm nội bộ",
            url: "https://admin.vanistudio.com",
            type: "live" as const
          }
        ],
        team: [
          {
            name: "John Doe",
            role: "Developer",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop"
          }
        ],
        testimonials: [
          {
            content: "Nền tảng giúp tối ưu 50% thời gian họp báo cáo tuần của công ty.",
            author: "Vani Admin Team",
            role: "Operations Manager",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
          }
        ],
        status: "developing",
        startDate: new Date("2026-05-01T00:00:00Z"),
        endDate: null,
        featured: true,
        order: 4,
        viewsCount: 150,
        likesCount: 38,
        serviceId: serviceId,
        metadata: {
          industry: "Internal Operations",
          mainColor: "#1e293b"
        }
      }
    ];

    // Seed each project record
    for (const projectItem of projectsData) {
      const [insertedProject] = await db
        .insert(projects)
        .values(projectItem)
        .returning();
      console.log(`Seeded project successfully: ${projectItem.name} -> ID: ${insertedProject.id}`);
    }

    console.log("Database seeding completed successfully for all projects!");
    process.exit(0);
  } catch (error: any) {
    console.error("Error seeding project:", error);
    process.exit(1);
  }
}

main();
