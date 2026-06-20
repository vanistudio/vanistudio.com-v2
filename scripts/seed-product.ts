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

    // Clean up existing products completely to make sure only our target product exists
    console.log("Cleaning up all existing product records...");
    await db.delete(products);

    // Seed data
    const productsData = [
      {
        name: "Vani Shop - Mã nguồn Website Bán Quần Áo & Thời Trang Next.js",
        slug: "vani-shop-ecommerce-clothing",
        description: "Mã nguồn website bán hàng thời trang chuyên nghiệp, tích hợp thanh toán tự động qua cổng Momo, VNPAY, giỏ hàng slide-out, quản lý thuộc tính sản phẩm và trang quản trị doanh số trực quan.",
        content: `### 🛍️ Vani Shop - Next.js Fashion E-Commerce Source Code

**Vani Shop** là mã nguồn website thương mại điện tử chuyên nghiệp dành riêng cho ngành thời trang, quần áo và phụ kiện. Được xây dựng trên nền tảng **Next.js 16 App Router**, **React 19** và **TailwindCSS v4**, sản phẩm mang lại trải nghiệm mua sắm mượt mà, tốc độ tải trang vượt trội cùng hệ thống quản trị vận hành tối ưu.

<Alert variant="default" className="border-vanixjnk/20 bg-vanixjnk/5 text-foreground my-4">
  <Icon icon="solar:info-square-line-duotone" className="size-5 text-vanixjnk" />
  <AlertTitle className="text-vanixjnk font-bold">Lưu ý bản quyền thương mại</AlertTitle>
  <AlertDescription>
    Đây là mã nguồn thương mại được cấp phép sử dụng. Mỗi giấy phép (license key) được áp dụng cho một tên miền chạy production chính thức.
  </AlertDescription>
</Alert>

<Tabs defaultValue="features" className="w-full my-6">
  <TabsList className="bg-muted/40 p-1">
    <TabsTrigger value="features">Tính năng nổi bật</TabsTrigger>
    <TabsTrigger value="admin">Trang quản trị (Admin)</TabsTrigger>
    <TabsTrigger value="tech-stack">Kiến trúc & Công nghệ</TabsTrigger>
    <TabsTrigger value="installation">Cài đặt & Tài liệu</TabsTrigger>
  </TabsList>
  
  <TabsContent value="features" className="p-4 border rounded-xl mt-2 space-y-4">
    #### 🚀 Tính năng vượt trội cho Khách hàng
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-bold">
            <Icon icon="solar:filter-line-duotone" className="text-vanixjnk size-5" />
            <span>Bộ lọc biến thể động (Smart Filter)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-[13px] text-muted-foreground leading-relaxed">
          Lọc sản phẩm thông minh không tải lại trang theo size (S, M, L, XL, XXL), màu sắc trực quan (Color Swatches), khoảng giá tùy chọn, danh mục con và nhãn mác sản phẩm.
        </CardContent>
      </Card>
      
      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-bold">
            <Icon icon="solar:cart-large-line-duotone" className="text-vanixjnk size-5" />
            <span>Giỏ hàng Slide-out (Ajax Cart Drawer)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-[13px] text-muted-foreground leading-relaxed">
          Trải nghiệm mua sắm nhanh gọn với giỏ hàng trượt từ bên hông. Hỗ trợ cập nhật số lượng trực tuyến mà không cần tải lại trang thông qua Zustand.
        </CardContent>
      </Card>
      
      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-bold">
            <Icon icon="solar:delivery-line-duotone" className="text-vanixjnk size-5" />
            <span>Giao vận & Vận chuyển thông minh</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-[13px] text-muted-foreground leading-relaxed">
          Tích hợp sẵn API bản đồ Tỉnh/Thành, Quận/Huyện Việt Nam giúp điền địa chỉ giao nhận nhanh chóng, giảm thiểu tối đa sai sót đơn hàng.
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-bold">
            <Icon icon="solar:smartphone-line-duotone" className="text-vanixjnk size-5" />
            <span>Tối ưu hóa thiết bị di động (Mobile-First)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-[13px] text-muted-foreground leading-relaxed">
          Được tối ưu hóa hoàn toàn cho giao diện điện thoại, hỗ trợ thao tác vuốt chạm trượt ảnh sản phẩm cực kỳ mượt mà.
        </CardContent>
      </Card>
    </div>

    #### 💳 Cổng thanh toán tích hợp sẵn
    - **VietQR (Chuyển khoản tự động)**: Tự động phát sinh mã QR ngân hàng (VietQR) tương ứng với số đơn hàng và giá trị tiền. Kiểm tra lịch sử giao dịch tức thời thông qua webhook ngân hàng đối tác.
    - **Cổng ví điện tử MoMo / VNPAY**: Tích hợp các cổng thanh toán hàng đầu Việt Nam giúp người mua thanh toán bằng ATM nội địa, QR-Pay, hoặc thẻ tín dụng quốc tế.
    - **Thanh toán giao hàng (COD)**: Hỗ trợ gửi thông báo đơn hàng qua Email tự động ngay khi khách đặt hàng thành công.
  </TabsContent>
  
  <TabsContent value="admin" className="p-4 border rounded-xl mt-2 space-y-4">
    #### 📊 Hệ thống quản trị doanh nghiệp chuyên nghiệp
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-bold">
            <Icon icon="solar:chart-square-line-duotone" className="text-emerald-500 size-5" />
            <span>Dashboard Thống kê Doanh số</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-[13px] text-muted-foreground leading-relaxed">
          Biểu đồ phân tích doanh thu theo thời gian thực (ngày, tuần, tháng), thống kê đơn hàng thành công, tỉ lệ hủy đơn và bảng xếp hạng các sản phẩm bán chạy nhất.
        </CardContent>
      </Card>
      
      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-bold">
            <Icon icon="solar:box-line-duotone" className="text-emerald-500 size-5" />
            <span>Quản lý biến thể kho hàng (SKU)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-[13px] text-muted-foreground leading-relaxed">
          Quản lý số lượng tồn kho theo từng tùy chọn kích cỡ, màu sắc riêng biệt. Có cảnh báo thông minh khi sản phẩm chạm ngưỡng sắp hết hàng.
        </CardContent>
      </Card>
    </div>
    
    #### ⚙️ Các mô-đun quản trị tích hợp:
    - **Quản lý mã giảm giá (Coupon)**: Tạo mã giảm giá theo phần trăm hoặc số tiền mặt cố định, giới hạn lượt dùng, số tiền tối thiểu để áp dụng.
    - **Quy trình xử lý đơn hàng**: Luồng xử lý đơn tự động thay đổi trạng thái và gửi email thông báo khách hàng (*Chờ duyệt -> Đang giao -> Đã giao -> Hủy đơn*). Tích hợp in hóa đơn PDF.
    - **Quản lý tin tức (CMS Blog)**: Hệ thống đăng bài viết tin tức thời trang chuẩn SEO, tăng lượng truy cập tự nhiên (Organic Traffic).
  </TabsContent>

  <TabsContent value="tech-stack" className="p-4 border rounded-xl mt-2 space-y-4">
    #### 🛠️ Kiến trúc công nghệ Modern & Clean
    
    Mã nguồn tuân thủ các quy tắc lập trình sạch và tối ưu SEO tuyệt đối:
    
    - **Framework**: Next.js 16 (App Router) & React 19 mới nhất.
    - **Styling**: TailwindCSS v4 cho tốc độ dựng CSS vượt trội.
    - **Database & ORM**: PostgreSQL kết hợp Drizzle ORM hỗ trợ migration tự động.
    - **Authentication**: Hệ thống xác thực bảo mật Better-Auth (Google, Email/Password).
    - **State Management**: Zustand lưu trữ giỏ hàng, tRPC đồng bộ dữ liệu Client-Server.
    
    | Công nghệ | Phiên bản | Vai trò |
    | :--- | :--- | :--- |
    | Next.js | v16.x | Framework ứng dụng phía máy chủ |
    | React | v19.x | Thư viện UI cốt lõi |
    | TailwindCSS | v4.x | Thiết kế và giao diện responsive |
    | Drizzle ORM | v0.31.x | Giao tiếp cơ sở dữ liệu PostgreSQL |
    | Better-Auth | v1.6.x | Hệ thống đăng nhập và phân quyền |
    | tRPC | v11.x | API Client-Server đồng bộ Typescript |
  </TabsContent>
  
  <TabsContent value="installation" className="p-4 border rounded-xl mt-2 space-y-4">
    #### ⚙️ Yêu cầu môi trường & Cài đặt nhanh
    
    <Accordion type="single" collapsible className="w-full border border-border/60 rounded-xl px-4 py-2 bg-muted/10">
      <AccordionItem value="req">
        <AccordionTrigger>1. Yêu cầu cấu hình máy chủ</AccordionTrigger>
        <AccordionContent className="space-y-2 text-[13px] text-muted-foreground leading-relaxed">
          - **NodeJS**: Phiên bản v20.x hoặc mới hơn (khuyên dùng v22.x LTS).
          - **Database**: PostgreSQL v15+ hoặc sử dụng các dịch vụ Cloud DB như Neon, Supabase.
          - **Mail Server**: SMTP Mail (Gmail, Resend hoặc SendGrid) để gửi hóa đơn và mã xác nhận đăng ký tài khoản.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="steps">
        <AccordionTrigger>2. Các bước triển khai dưới Local</AccordionTrigger>
        <AccordionContent className="space-y-3 text-[13px] text-muted-foreground leading-relaxed">
          1. **Tải về và cài đặt thư viện**:
             \`\`\`bash
             npm install
             \`\`\`
             
          2. **Cấu hình môi trường**:
             Sao chép tệp \`.env.example\` thành \`.env\` và cập nhật các khóa kết nối cơ sở dữ liệu và API key:
             \`\`\`env
             DATABASE_URL=postgresql://user:pass@localhost:5432/vanishop
             BETTER_AUTH_SECRET=your_auth_secret
             VNPAY_TMN_CODE=your_tmn_code
             VNPAY_HASH_SECRET=your_hash_secret
             \`\`\`
             
          3. **Khởi tạo dữ liệu**:
             \`\`\`bash
             npx drizzle-kit push
             npm run db:seed
             \`\`\`
             
          4. **Khởi động chế độ Development**:
             \`\`\`bash
             npm run dev
             \`\`\`
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="deployment">
        <AccordionTrigger>3. Hướng dẫn Deploy lên Vercel / Docker</AccordionTrigger>
        <AccordionContent className="space-y-2 text-[13px] text-muted-foreground leading-relaxed">
          Mã nguồn được cấu hình sẵn để dễ dàng triển khai lên **Vercel** chỉ với một vài click, hoặc đóng gói qua **Docker Container** để chạy trên các VPS riêng như Ubuntu Server, CentOs.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </TabsContent>
</Tabs>
`,
        type: "source_code",
        status: "active",
        thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-9b2pbi9b2pbi9b2p-1781956741922.jpeg",
        gallery: [
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=800&auto=format&fit=crop"
        ],
        price: 1490000,
        salePrice: 990000,
        currency: "VND",
        badge: "HOT",
        isFeatured: true,
        version: "1.2.0",
        licenseType: "single",
        supportMonths: 6,
        fileSize: "25.8 MB",
        compatibility: ["Next.js 16", "TailwindCSS v4", "PostgreSQL", "Drizzle ORM", "Better-Auth", "TypeScript 5", "VietQR SDK", "VNPAY API", "MoMo API"],
        demoUrl: "https://shop-demo.vanistudio.com",
        githubUrl: null,
        downloadUrl: "https://gumroad.com/l/vani-shop-clothing",
        salesCount: 38,
        viewsCount: 1540,
        downloadCount: 38,
        features: [
          {
            name: "Bộ lọc biến thể động",
            description: "Lọc sản phẩm thời trang theo Size, Màu sắc và Giá cực nhanh.",
            icon: "solar:filter-line-duotone"
          },
          {
            name: "Thanh toán QR tự động",
            description: "Quét mã VietQR chuyển khoản tự động xác nhận đơn hàng qua Webhook.",
            icon: "solar:qr-code-line-duotone"
          },
          {
            name: "Quản lý tồn kho chi tiết",
            description: "Theo dõi số lượng hàng tồn kho theo từng kích cỡ và màu sắc biến thể.",
            icon: "solar:box-line-duotone"
          },
          {
            name: "Giao diện chuẩn SEO & Mobile-First",
            description: "Thiết kế chuẩn UX thời trang hiện đại, đạt điểm tối đa trên Google Lighthouse.",
            icon: "solar:smartphone-line-duotone"
          },
          {
            name: "Quản trị trực quan (Admin Dashboard)",
            description: "Trang Dashboard phân tích doanh thu bằng biểu đồ trực quan, quản lý đơn hàng chuyên nghiệp.",
            icon: "solar:chart-square-line-duotone"
          }
        ],
        changelog: [
          {
            version: "1.2.0",
            date: "2026-06-20",
            title: "Cập nhật tích hợp VietQR & In hóa đơn",
            changes: [
              "Tích hợp API quét mã VietQR tự động nhận diện thanh toán từ ngân hàng đối tác.",
              "Thêm tính năng in hóa đơn đơn hàng ra file PDF cho Admin.",
              "Tối ưu lại tốc độ tải trang bằng kỹ thuật Partial Prerendering (PPR) trên Next.js 16.",
              "Nâng cấp giao diện Dark Mode toàn diện cho trang quản trị."
            ]
          },
          {
            version: "1.1.0",
            date: "2026-06-05",
            title: "Tối ưu hóa giỏ hàng và thanh toán",
            changes: [
              "Cải thiện hiệu năng Cart Drawer sử dụng Zustand state.",
              "Thêm hệ thống Coupon mã giảm giá linh hoạt trong trang thanh toán.",
              "Tích hợp API Tỉnh/Thành Việt Nam cho luồng vận chuyển giao nhận."
            ]
          },
          {
            version: "1.0.0",
            date: "2026-05-15",
            title: "Phát hành phiên bản đầu tiên",
            changes: [
              "Dựng khung dự án với Next.js 16 App Router & TailwindCSS v4.",
              "Tạo các bảng cơ sở dữ liệu qua Drizzle ORM.",
              "Xây dựng trang hiển thị sản phẩm, chi tiết sản phẩm và trang chủ.",
              "Cài đặt hệ thống xác thực Better-Auth."
            ]
          }
        ],
        metadata: {},
        order: 1
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

    console.log("Database seeding completed successfully for products!");
    process.exit(0);
  } catch (error: any) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
}

main();
