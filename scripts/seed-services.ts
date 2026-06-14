import * as fs from 'fs';
import * as path from 'path';
import postgres from 'postgres';

const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
let databaseUri = '';

envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  const key = parts[0]?.trim();
  const value = parts.slice(1).join('=').trim();
  if (key === 'APP_DATABASE_URI_VALUE') {
    databaseUri = value;
  }
});

if (!databaseUri) {
  console.error('APP_DATABASE_URI_VALUE not found in .env');
  process.exit(1);
}

const sql = postgres(databaseUri, { max: 1, connect_timeout: 10 });

async function seed() {
  try {
    console.log('Fetching service types from database...');
    const serviceTypes = await sql`SELECT id, name FROM service_types`;
    
    const appType = serviceTypes.find(t => t.name.includes('Ứng dụng') || t.name.includes('App'));
    const webType = serviceTypes.find(t => t.name.includes('Website'));
    const otherType = serviceTypes.find(t => t.name.includes('khác') || t.name.includes('Khác'));
    const designType = serviceTypes.find(t => t.name.includes('Thiết kế đồ họa') || t.name.includes('Đồ họa') || t.name.includes('Design'));
    const botType = serviceTypes.find(t => t.name.includes('Bot AI') || t.name.includes('Bot') || t.name.includes('Discord'));
    
    if (!appType || !webType || !otherType || !designType || !botType) {
      console.error('Required service types not found. Available types:', serviceTypes);
      process.exit(1);
    }
    
    console.log(`Found categories - App: ${appType.id}, Web: ${webType.id}, Other: ${otherType.id}, Design: ${designType.id}, Bot: ${botType.id}`);

    // 1. Desktop App Development
    const desktopSlug = 'desktop-app-development';
    console.log(`Seeding service: ${desktopSlug}...`);
    await sql`DELETE FROM services WHERE slug = ${desktopSlug}`;
    
    const desktopFeatures = [
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Đa nền tảng mượt mà',
        description: 'Ứng dụng hoạt động hoàn hảo trên Windows, macOS và Linux với giao diện đồng nhất.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Hiệu năng tối ưu',
        description: 'Tối ưu hóa dung lượng cài đặt, thời gian khởi động và mức độ tiêu thụ tài nguyên RAM/CPU.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Bảo mật & Mã hóa dữ liệu',
        description: 'Mã hóa dữ liệu lưu trữ cục bộ, bảo vệ mã nguồn chống dịch ngược và kết nối API an toàn.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Hoạt động Offline',
        description: 'Khả năng xử lý và lưu trữ dữ liệu offline, tự động đồng bộ khi có kết nối internet trở lại.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Tích hợp phần cứng',
        description: 'Hỗ trợ tương tác với phần cứng thiết bị, hệ thống file cục bộ, máy in hoặc cổng USB.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Tự động cập nhật',
        description: 'Hệ thống tự động kiểm tra và cập nhật phiên bản mới mượt mà không gián đoạn.'
      }
    ];

    const desktopTechs = ['devicon:electron', 'devicon:tauri', 'devicon:csharp', 'devicon:dotnet', 'devicon:rust'];
    
    const [desktopService] = await sql`
      INSERT INTO services (
        name, slug, type_id, description, content, thumbnail, gallery, features, technologies, base_price, price_type, delivery_time, status, fields_config, metadata
      ) VALUES (
        'Phát triển ứng dụng Desktop',
        ${desktopSlug},
        ${appType.id},
        'Thiết kế và phát triển ứng dụng chạy trên máy tính (Windows, macOS, Linux) hiệu năng cao, giao diện mượt mà và bảo mật tối đa.',
        '# Phát triển ứng dụng Desktop chuyên nghiệp

Biến ý tưởng của bạn thành những phần mềm máy tính mạnh mẽ, ổn định và mượt mà.

Chúng tôi cung cấp dịch vụ phát triển ứng dụng Desktop chuyên nghiệp chạy trên máy tính cá nhân (**Windows**, **macOS**, **Linux**), tập trung tối đa vào **hiệu năng**, **bảo mật** và **trải nghiệm người dùng**.

## Các loại ứng dụng Desktop chúng tôi thực hiện

### Phần mềm quản lý & Vận doanh
* Hệ thống quản lý bán hàng (POS)
* Quản lý nhân sự, chấm công nâng cao
* Phần mềm quản lý kho bãi, logitics và vận chuyển
* Hệ thống ERP thu nhỏ được may đo cho doanh nghiệp

### Công cụ tự động hóa & Tooling
* Tool thu thập dữ liệu (crawling/scraping) tự động
* Công cụ tự động hóa quy trình nghiệp vụ (RPA)
* Tool hỗ trợ tương tác mạng xã hội, lên lịch và gửi tin nhắn tự động
* Phần mềm xử lý file, tối ưu hình ảnh, video hàng loạt

### Ứng dụng tích hợp phần cứng & IoT
* Phần mềm kết nối máy in hóa đơn, máy quét mã vạch chuyên dụng
* Ứng dụng giám sát các thiết bị ngoại vi, cảm biến thông minh
* Hệ thống điều khiển thiết bị thông qua các cổng COM/USB

## Công nghệ sử dụng hàng đầu

Chúng tôi lựa chọn công nghệ dựa trên yêu cầu cụ thể của từng dự án để đảm bảo tính tối ưu:
* **Tauri + React/Vite**: Tạo ra ứng dụng siêu nhẹ (chỉ từ 5-10MB), hiệu năng cực cao bằng backend Rust và giao diện HTML/CSS.
* **Electron**: Phù hợp cho các ứng dụng quy mô lớn, giàu tính năng và cần tích hợp sâu với hệ sinh thái Node.js phong phú.
* **C# / .NET / WPF**: Giải pháp tối ưu nhất cho hệ thống thuần Windows, tận dụng tối đa sức mạnh phần cứng của hệ điều hành Microsoft.

## Cam kết chất lượng dịch vụ

* **Không gây lag máy**: Ứng dụng được tối ưu hóa tài nguyên RAM/CPU, không gây suy giảm hiệu năng thiết bị của bạn.
* **Mã nguồn sạch sẽ**: Bàn giao đầy đủ source code sạch, được đóng gói và cấu trúc chuẩn hóa, dễ dàng bảo trì hoặc bàn giao.
* **Đóng gói chuyên nghiệp**: Cung cấp file cài đặt (.exe cho Windows, .dmg cho macOS, .deb/.appimage cho Linux) đi kèm ký số (Code Signing) nếu có yêu cầu.
* **Bảo mật tuyệt đối**: Dữ liệu lưu trữ nội bộ được mã hóa và bảo vệ trước các cuộc tấn công khai thác cơ bản.',
        'https://storage.vanistudio.com/uploads/Gemini-Generated-Image-xppd5pxppd5pxppd-1781421692927.jpg',
        '[]'::jsonb,
        ${JSON.stringify(desktopFeatures)}::jsonb,
        ${JSON.stringify(desktopTechs)}::jsonb,
        5000000,
        'starting_at',
        10,
        'active',
        '[]'::jsonb,
        '{}'::jsonb
      ) RETURNING id
    `;
    
    const pkg1Features = {
      'Lần sửa đổi': '3 lần',
      'Mã nguồn đi kèm': true,
      'Hỗ trợ kỹ thuật': 'Sửa lỗi miễn phí trong 1 tháng',
      'Hỗ trợ đa nền tảng': 'Chỉ dành cho Windows'
    };

    const pkg2Features = {
      'Lần sửa đổi': 'Vô hạn',
      'Mã nguồn đi kèm': true,
      'Hỗ trợ kỹ thuật': 'Sửa lỗi miễn phí trong 3 tháng',
      'Hỗ trợ đa nền tảng': 'Windows & macOS'
    };

    await sql`
      INSERT INTO service_packages (service_id, name, description, price, delivery_time, features_included)
      VALUES 
        (
          ${desktopService.id},
          'Gói Tool Tự Động Hóa',
          'Thích hợp cho các tool tự động hóa quy trình, crawl dữ liệu cơ bản hoặc tiện ích nhỏ chạy ẩn trên khay hệ thống.',
          5000000,
          10,
          ${JSON.stringify(pkg1Features)}::jsonb
        ),
        (
          ${desktopService.id},
          'Gói Quản Lý Doanh Nghiệp',
          'Dành cho phần mềm quản lý nội bộ (POS, CRM, ERP mini) có kết nối cơ sở dữ liệu và bảo mật cao.',
          15000000,
          20,
          ${JSON.stringify(pkg2Features)}::jsonb
        )
    `;
    
    console.log('Desktop App Development seeded successfully.');

    // 2. Web Design Services
    const webSlug = 'web-design-services';
    console.log(`Seeding service: ${webSlug}...`);
    await sql`DELETE FROM services WHERE slug = ${webSlug}`;
    
    const webFeatures = [
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Thiết kế UI/UX độc bản',
        description: 'Giao diện được thiết kế riêng biệt theo bộ nhận diện thương hiệu, không sử dụng template có sẵn.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Tương thích di động (Responsive)',
        description: 'Trải nghiệm mượt mà, hiển thị chuẩn xác trên mọi kích thước màn hình điện thoại, tablet và desktop.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Tối ưu hóa chuyển đổi',
        description: 'Bố cục CTA, luồng trải nghiệm khách hàng được tính toán khoa học nhằm gia tăng tỷ lệ liên hệ mua hàng.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Hệ thống Grid & Style Guide',
        description: 'Bàn giao file Figma thiết kế chuẩn lưới, đầy đủ component, màu sắc, font chữ để lập trình viên dễ dàng phát triển.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Chuẩn SEO & Tốc độ',
        description: 'Thiết kế tối ưu dung lượng ảnh, cấu trúc giao diện gọn gàng hỗ trợ việc tối ưu hóa SEO on-page sau này.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Hỗ trợ bàn giao tận tình',
        description: 'Hướng dẫn sử dụng file Figma, xuất các tài nguyên hình ảnh chất lượng cao cần thiết cho việc code.'
      }
    ];

    const webTechs = ['devicon:figma', 'devicon:photoshop', 'devicon:illustrator', 'devicon:react', 'devicon:tailwindcss'];

    const [webService] = await sql`
      INSERT INTO services (
        name, slug, type_id, description, content, thumbnail, gallery, features, technologies, base_price, price_type, delivery_time, status, fields_config, metadata
      ) VALUES (
        'Thiết kế Web (Web Design)',
        ${webSlug},
        ${webType.id},
        'Thiết kế giao diện UI/UX trang web hiện đại, tinh tế và tối ưu trải nghiệm người dùng, giúp doanh nghiệp tạo ấn tượng mạnh mẽ với khách hàng.',
        '# Dịch vụ Thiết kế Web & UI/UX chuyên nghiệp

Một trang web đẹp là bộ mặt số của doanh nghiệp. Chúng tôi mang đến giải pháp thiết kế giao diện độc bản, tinh tế, bắt kịp xu hướng hiện đại và tối ưu hóa tối đa hành vi người dùng (UI/UX).

## Những gì chúng tôi mang lại trong dịch vụ thiết kế

### Thiết kế Landing Page bán hàng
* Thiết kế trang giới thiệu sản phẩm đơn lẻ hoặc dịch vụ đặc thù chuyên biệt
* Tối ưu hóa luồng tâm lý khách hàng theo mô hình chuyển đổi AIDA
* Thiết kế các nút kêu gọi hành động (CTA) nổi bật, gia tăng tỷ lệ chuyển đổi đơn hàng

### Thiết kế Website Doanh nghiệp & Tin tức
* Thiết kế Trang chủ sang trọng, nâng tầm bộ nhận diện thương hiệu doanh nghiệp
* Các trang con chi tiết: Giới thiệu, dịch vụ, dự án, tin tức, liên hệ
* Bố cục thông tin rõ ràng, dễ đọc, cấu trúc trực quan dễ tìm kiếm

### Thiết kế Web App & Dashboard quản lý
* Thiết kế giao diện cho các ứng dụng web quản lý nội bộ phức tạp
* Tối ưu hóa các bảng biểu dữ liệu lớn, biểu đồ thống kê trực quan sinh động
* Xây dựng luồng trải nghiệm đa tác vụ tối giản giúp nhân viên làm việc hiệu suất cao nhất

## Quy trình thiết kế chuẩn chỉnh tại VaniStudio

1. **Nghiên cứu & Định hướng**: Phân tích lĩnh vực kinh doanh, khách hàng mục tiêu và sở thích phong cách thẩm mỹ của doanh nghiệp bạn.
2. **Wireframe (Sơ đồ khung xương)**: Xây dựng cấu trúc thông tin của từng trang để chốt luồng tương tác trước khi lên giao diện màu sắc chi tiết.
3. **Thiết kế UI Chi tiết**: Hoàn thiện giao diện sắc nét trên phần mềm Figma với màu sắc, hình ảnh và bộ icon đồng nhất.
4. **Prototype (Mô phỏng tương tác)**: Tạo hiệu ứng click, hover ảo trên Figma để bạn có thể trải nghiệm thực tế website trước khi lập trình.
5. **Bàn giao**: Giao toàn quyền sở hữu file Figma thiết kế gốc, style guide chi tiết kèm các asset hình ảnh chất lượng cao.',
        'https://storage.vanistudio.com/uploads/Gemini-Generated-Image-2lg0oa2lg0oa2lg0-1781421925231.jpg',
        '[]'::jsonb,
        ${JSON.stringify(webFeatures)}::jsonb,
        ${JSON.stringify(webTechs)}::jsonb,
        4000000,
        'starting_at',
        5,
        'active',
        '[]'::jsonb,
        '{}'::jsonb
      ) RETURNING id
    `;
    
    const webPkg1Features = {
      'Số lượng trang': '1 trang Landing Page',
      'Lần chỉnh sửa': '3 lần',
      'Bàn giao file Figma': true,
      'Tương thích di động (Responsive)': true
    };

    const webPkg2Features = {
      'Số lượng trang': '5 trang chi tiết',
      'Lần chỉnh sửa': '5 lần',
      'Bàn giao file Figma': true,
      'Responsive & Grid System': true,
      'Bàn giao Style Guide / Component': true
    };

    await sql`
      INSERT INTO service_packages (service_id, name, description, price, delivery_time, features_included)
      VALUES 
        (
          ${webService.id},
          'Gói Landing Page',
          'Thiết kế 1 trang Landing Page giới thiệu dịch vụ hoặc sản phẩm đơn lẻ, tối ưu CTA và UI/UX trên mobile.',
          4000000,
          5,
          ${JSON.stringify(webPkg1Features)}::jsonb
        ),
        (
          ${webService.id},
          'Gói Multi-Page Thương Hiệu',
          'Thiết kế giao diện toàn diện gồm Trang chủ, Giới thiệu, 2 trang dịch vụ và trang Liên hệ chi tiết.',
          10000000,
          12,
          ${JSON.stringify(webPkg2Features)}::jsonb
        )
    `;
    
    console.log('Web Design Services seeded successfully.');

    // 3. Software Architecture Consulting & Mentoring
    const archSlug = 'software-architecture-consulting';
    console.log(`Seeding service: ${archSlug}...`);
    await sql`DELETE FROM services WHERE slug = ${archSlug}`;
    
    const archFeatures = [
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Tư vấn & Thiết kế hệ thống',
        description: 'Xây dựng sơ đồ kiến trúc, chọn công nghệ phù hợp và lập lộ trình triển khai chi tiết.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Review Code & Tối ưu hóa',
        description: 'Rà soát lỗi bảo mật, phát hiện thắt nút cổ chai hiệu năng và đề xuất giải pháp refactor.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Mentoring 1-1 chuyên sâu',
        description: 'Đồng hành trực tiếp giúp bạn giải quyết các bài toán kỹ thuật phức tạp hoặc thăng tiến sự nghiệp.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Tối ưu hóa hạ tầng & CI/CD',
        description: 'Tư vấn tự động hóa quy trình deploy, quản lý container, tối ưu chi phí Cloud (AWS/GCP/Azure).'
      }
    ];

    const archTechs = ['devicon:amazonwebservices', 'devicon:kubernetes', 'devicon:docker', 'devicon:postgresql', 'devicon:redis'];

    const [archService] = await sql`
      INSERT INTO services (
        name, slug, type_id, description, content, thumbnail, gallery, features, technologies, base_price, price_type, delivery_time, status, fields_config, metadata
      ) VALUES (
        'Tư vấn kiến trúc phần mềm & Mentoring',
        ${archSlug},
        ${otherType.id},
        'Dịch vụ tư vấn thiết kế hệ thống, review mã nguồn, tối ưu hóa hạ tầng và mentoring 1-1 cho lập trình viên/đội ngũ phát triển.',
        '# Tư vấn kiến trúc phần mềm & Mentoring chuyên sâu

Xây dựng nền móng kỹ thuật vững chắc cho dự án của bạn và phát triển vượt bậc kỹ năng lập trình cá nhân.

Chúng tôi cung cấp dịch vụ tư vấn kiến trúc phần mềm, thiết kế hệ thống quy mô lớn, review mã nguồn tối ưu hóa hiệu năng, và mentoring 1-1 thực chiến chuyên sâu.

## Các dịch vụ tư vấn kiến trúc & Mentoring chúng tôi cung cấp

### Thiết kế hệ thống (System Design)
* Thiết kế kiến trúc tổng thể dự án (Monolith vs Microservices)
* Thiết kế cơ sở dữ liệu (Database Schema) tối ưu hóa tốc độ truy vấn và dung lượng lưu trữ
* Lựa chọn giải pháp lưu trữ cache (Redis, Memcached), hàng đợi tin nhắn (RabbitMQ, Kafka)
* Tư vấn kiến trúc chịu tải cao (High Availability) và khả năng mở rộng (Scalability)

### Review Code & Tối ưu hiệu năng
* Rà soát mã nguồn tìm lỗi bảo mật nghiêm trọng (SQL Injection, XSS, RCE...)
* Phát hiện thắt nút cổ chai hiệu năng (Performance Bottlenecks) trong ứng dụng
* Hướng dẫn refactor code theo nguyên lý SOLID, Clean Code giúp code dễ đọc, dễ bảo trì

### Tư vấn hạ tầng Cloud & DevOps
* Thiết kế hạ tầng trên AWS, Google Cloud Platform (GCP) tối ưu chi phí
* Container hóa ứng dụng với Docker và điều phối cụm với Kubernetes
* Xây dựng luồng tự động hóa tích hợp & triển khai liên tục (CI/CD)

### Mentoring 1-1 & Đồng hành dự án
* Mentor trực tiếp cho lập trình viên muốn nâng cao trình độ kỹ thuật (Junior lên Middle/Senior)
* Đồng hành gỡ các bug khó, bài toán hóc búa trong dự án thực tế của bạn
* Định hướng lộ trình nghề nghiệp (Software Engineer, Solution Architect, Tech Lead)

## Tại sao chọn chúng tôi?

* **Kinh nghiệm thực chiến**: Được dẫn dắt bởi chuyên gia nhiều năm thiết kế hệ thống lớn hàng triệu người dùng.
* **Giải pháp thực tế**: Tập trung giải quyết bài toán thực tế của dự án, không lý thuyết suông.
* **Tối ưu hóa chi phí**: Đề xuất các giải pháp công nghệ mã nguồn mở hoặc tối ưu hóa hạ tầng để giảm hóa đơn Cloud hàng tháng của bạn.
* **Cam kết bảo mật**: Bảo mật thông tin dự án và mã nguồn tuyệt đối thông qua cam kết NDA thương mại.',
        'https://storage.vanistudio.com/uploads/Gemini-Generated-Image-a1axdja1axdja1ax-1781422928131.jpg',
        '[]'::jsonb,
        ${JSON.stringify(archFeatures)}::jsonb,
        ${JSON.stringify(archTechs)}::jsonb,
        2000000,
        'starting_at',
        3,
        'active',
        '[]'::jsonb,
        '{}'::jsonb
      ) RETURNING id
    `;

    const archPkg1Features = {
      'Thời lượng': '1 giờ trao đổi',
      'Record video buổi họp': true,
      'Tài liệu tóm tắt / Mindmap': true,
      'Follow-up qua chat': 'Hỗ trợ thêm trong 3 ngày'
    };

    const archPkg2Features = {
      'Số lượng buổi gọi video': '4 buổi (1.5h/buổi)',
      'Review code định kỳ': true,
      'Hỗ trợ chat 24/7': 'Ưu tiên phản hồi nhanh',
      'Hỗ trợ thiết kế DB/System': true
    };

    await sql`
      INSERT INTO service_packages (service_id, name, description, price, delivery_time, features_included)
      VALUES 
        (
          ${archService.id},
          'Session Tư vấn 1-1 (1 Giờ)',
          'Buổi trao đổi trực tiếp qua Google Meet/Discord giải đáp thắc mắc kỹ thuật, định hướng kiến trúc hoặc review code nhanh.',
          2000000,
          1,
          ${JSON.stringify(archPkg1Features)}::jsonb
        ),
        (
          ${archService.id},
          'Gói Mentor Đồng Hành (1 Tháng)',
          'Đồng hành cùng dự án của bạn trong 4 tuần. Hỗ trợ review thiết kế, gỡ lỗi khó và coaching 1-1 hàng tuần.',
          10000000,
          30,
          ${JSON.stringify(archPkg2Features)}::jsonb
        )
    `;
    console.log('Software Architecture Consulting seeded successfully.');

    // 4. UI/UX Design
    const uiuxSlug = 'ui-ux-design';
    console.log(`Seeding service: ${uiuxSlug}...`);
    await sql`DELETE FROM services WHERE slug = ${uiuxSlug}`;

    const uiuxFeatures = [
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Thiết kế UI/UX độc bản',
        description: 'Giao diện được thiết kế riêng biệt theo bộ nhận diện thương hiệu, không sử dụng template có sẵn.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Figma Prototype tương tác',
        description: 'Mô phỏng chân thực các thao tác chạm, vuốt, click của ứng dụng để khách hàng trải nghiệm thử trước khi lập trình.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Tương thích cao (Responsive)',
        description: 'Giao diện hiển thị chuẩn xác và mượt mà trên mọi thiết bị di động, máy tính bảng và màn hình máy tính.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Hệ thống Design System',
        description: 'Đầy đủ thành phần UI (buttons, inputs, cards) giúp lập trình viên code nhanh chóng và đồng bộ giao diện.'
      }
    ];

    const uiuxTechs = ['devicon:figma', 'devicon:photoshop', 'devicon:illustrator', 'devicon:tailwindcss'];

    const [uiuxService] = await sql`
      INSERT INTO services (
        name, slug, type_id, description, content, thumbnail, gallery, features, technologies, base_price, price_type, delivery_time, status, fields_config, metadata
      ) VALUES (
        'Thiết kế UI/UX Chuyên Sâu',
        ${uiuxSlug},
        ${designType.id},
        'Thiết kế giao diện người dùng và tối ưu trải nghiệm tương tác chuyên sâu cho Mobile App, Website và Web App.',
        '# Thiết kế UI/UX Chuyên Sâu

Tạo dựng trải nghiệm người dùng tối ưu và giao diện ấn tượng cho các sản phẩm công nghệ của bạn.

Chúng tôi tập trung vào việc nghiên cứu hành vi khách hàng để kiến tạo nên những thiết kế giao diện không chỉ **đẹp mắt** mà còn **dễ sử dụng**, giúp tối đa hóa tỷ lệ giữ chân người dùng (Retention Rate) và tỷ lệ chuyển đổi (Conversion Rate).

## Các dịch vụ thiết kế UI/UX chúng tôi cung cấp

### Thiết kế Mobile App UI/UX
* Giao diện app đa nền tảng iOS & Android theo chuẩn thiết kế Human Interface Guidelines (Apple) và Material Design (Google)
* Thiết kế luồng trải nghiệm đăng nhập, thanh toán, tương tác phức tạp mượt mà
* Tối ưu hóa kích thước nút bấm, khoảng cách và cử chỉ vuốt chạm trên màn hình di động

### Thiết kế Web App & SaaS Dashboard
* Giao diện quản trị hệ thống (Admin Panel) trực quan và hiện đại
* Thiết kế các thành phần tương tác cao như biểu đồ, bảng bộ lọc dữ liệu lớn, quy trình làm việc (workflow) phức tạp
* Tối ưu hóa UI giúp người dùng không bị mệt mỏi khi thao tác trên máy tính thời gian dài

### Thiết kế Landing Page & Website Doanh Nghiệp
* Thiết kế mang tính định hướng nhận diện thương hiệu độc bản
* Bố cục chuẩn chuyển đổi, nhấn mạnh thông điệp truyền tải cốt lõi
* Responsive hoàn hảo trên tất cả mọi kích thước màn hình

## Quy trình làm việc chuyên nghiệp

1. **Nghiên cứu & Khảo sát**: Lắng nghe yêu cầu, định hình chân dung người dùng (User Persona) và phân tích đối thủ cạnh tranh.
2. **Vẽ sơ đồ luồng (User Flow) & Wireframe**: Phác thảo cấu trúc và đường đi của người dùng qua các màn hình dạng trắng đen.
3. **Thiết kế giao diện chi tiết (UI Design)**: Áp dụng màu sắc, hình ảnh thương hiệu và thiết kế các thành phần component trên Figma.
4. **Interactive Prototype**: Liên kết các màn hình tạo trải nghiệm thử click/hover chân thực như một ứng dụng đã code hoàn tất.
5. **Bàn giao File gốc & Design System**: Cung cấp file thiết kế Figma gốc, Style Guide chi tiết (màu sắc, typography, icon) và các asset xuất ra chất lượng cao cho lập trình viên.',
        'https://storage.vanistudio.com/uploads/Gemini-Generated-Image-6zr7y86zr7y86zr7-1781423496122.jpg',
        '[]'::jsonb,
        ${JSON.stringify(uiuxFeatures)}::jsonb,
        ${JSON.stringify(uiuxTechs)}::jsonb,
        6000000,
        'starting_at',
        7,
        'active',
        '[]'::jsonb,
        '{}'::jsonb
      ) RETURNING id
    `;

    const uiuxPkg1Features = {
      'Số màn hình': '5 màn hình',
      'Số lần chỉnh sửa': '3 lần',
      'Interactive Prototype': true,
      'Bàn giao file Figma': true
    };

    const uiuxPkg2Features = {
      'Số màn hình': '7 màn hình chi tiết',
      'Số lần chỉnh sửa': 'Vô hạn',
      'Bàn giao Design System': true,
      'Figma File gốc': true
    };

    await sql`
      INSERT INTO service_packages (service_id, name, description, price, delivery_time, features_included)
      VALUES 
        (
          ${uiuxService.id},
          'Gói Mobile UI (5 trang)',
          'Thiết kế giao diện cho 5 màn hình cốt lõi của Mobile App trên Figma (ví dụ: Trang chủ, Đăng nhập, Chi tiết sản phẩm, Giỏ hàng, Hồ sơ).',
          6000000,
          7,
          ${JSON.stringify(uiuxPkg1Features)}::jsonb
        ),
        (
          ${uiuxService.id},
          'Gói Web App / Dashboard',
          'Thiết kế giao diện hệ thống quản lý hoặc phần mềm SaaS gồm Trang tổng quan (Dashboard) và 6 trang quản lý nghiệp vụ chi tiết.',
          12000000,
          14,
          ${JSON.stringify(uiuxPkg2Features)}::jsonb
        )
    `;
    console.log('UI/UX Design seeded successfully.');

    // 5. Codebase Optimization
    const optimizationSlug = 'codebase-optimization';
    console.log(`Seeding service: ${optimizationSlug}...`);
    await sql`DELETE FROM services WHERE slug = ${optimizationSlug}`;

    const optimizationFeatures = [
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Audit hiệu năng toàn diện',
        description: 'Đo đạc chi tiết và tìm ra chính xác các nguyên nhân gây lag, nghẽn hệ thống phần mềm của bạn.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Refactor Code chuẩn sạch',
        description: 'Tái cấu trúc mã nguồn theo chuẩn công nghiệp để dễ bảo trì, dễ đọc và dễ dàng mở rộng.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Tối ưu hóa Cơ sở dữ liệu',
        description: 'Tối ưu chỉ mục, tối ưu hóa các câu lệnh truy vấn phức tạp để cải thiện tốc độ tải dữ liệu rõ rệt.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Báo cáo Load Test thực tế',
        description: 'Cung cấp báo cáo giả lập hàng ngàn người dùng truy cập đồng thời để chứng minh tính chịu tải của hệ thống sau tối ưu.'
      }
    ];

    const optimizationTechs = ['devicon:nodejs', 'devicon:react', 'devicon:postgresql', 'devicon:docker', 'devicon:redis'];

    const [optimizationService] = await sql`
      INSERT INTO services (
        name, slug, type_id, description, content, thumbnail, gallery, features, technologies, base_price, price_type, delivery_time, status, fields_config, metadata
      ) VALUES (
        'Tối ưu hóa Codebase & Nâng cao Hiệu năng',
        ${optimizationSlug},
        ${otherType.id},
        'Dịch vụ phân tích, cấu trúc lại mã nguồn và tối ưu hóa hiệu năng phần mềm, giúp hệ thống hoạt động nhanh, ổn định và dễ mở rộng.',
        '# Dịch vụ Tối ưu hóa Codebase & Nâng cao Hiệu năng Hệ thống

Đưa ứng dụng của bạn lên tầm cao mới về tốc độ, khả năng chịu tải và sự sạch sẽ của mã nguồn.

Sau một thời gian phát triển nóng, dự án phần mềm thường rơi vào tình trạng \"mã nguồn rác\" (Technical Debt), hệ thống chạy chậm chạp, hay gặp lỗi vặt và rất khó nâng cấp tính năng mới. Chúng tôi giúp bạn giải quyết dứt điểm các vấn đề này.

## Các công việc tối ưu hóa chúng tôi thực hiện

### Khắc phục thắt nút cổ chai (Performance Tuning)
* Rà soát các truy vấn Database chậm (Slow Queries), thiết kế lại chỉ mục (Indexes) và tối ưu hóa câu lệnh SQL.
* Tích hợp các giải pháp bộ nhớ đệm (Caching) như Redis để giảm tải cho database lên tới 80%.
* Tối ưu hóa mã nguồn xử lý bất đồng bộ, giảm thiểu nghẽn luồng (Event Loop Blocking) trong các ứng dụng Node.js/Go.

### Refactor & Dọn dẹp mã nguồn (Codebase Refactoring)
* Thiết kế lại cấu trúc thư mục dự án chuẩn hóa, dễ tìm kiếm, dễ hiểu.
* Loại bỏ code thừa, code trùng lặp (Redundant Code) và áp dụng các mẫu thiết kế (Design Patterns) phù hợp.
* Thiết lập hệ thống kiểm tra code tự động (ESLint, Prettier, Husky) giúp đồng nhất phong cách viết code của đội ngũ.

### Tối ưu hóa Frontend (Web Performance)
* Tối ưu hóa tài nguyên tải về (ảnh, fonts, scripts) giúp giảm thời gian phản hồi trang web đầu tiên (FCP, LCP).
* Áp dụng Code Splitting, Lazy Loading để trang web tải cực nhanh trên thiết bị di động.
* Cải thiện điểm số hiệu năng trên Google Lighthouse đạt từ 90+ điểm.

## Quy trình tối ưu bài bản

1. **Đo đạc & Đánh giá (Audit)**: Sử dụng các công cụ giám sát (APM, Lighthouse, Profilers) để ghi nhận các số liệu thực tế về hiệu năng hiện tại.
2. **Phân tích nguyên nhân**: Chỉ ra chính xác dòng code, bảng database hoặc thiết kế hạ tầng nào đang gây chậm hệ thống.
3. **Lập phương án tối ưu**: Đề xuất kế hoạch sửa đổi phân kỳ, hạn chế tối đa ảnh hưởng tới người dùng đang hoạt động.
4. **Triển khai refactor & Kiểm thử**: Tiến hành tối ưu hóa mã nguồn, cải tạo cấu trúc dữ liệu và kiểm thử hiệu năng (Load Test) để chứng minh kết quả thực tế.
5. **Bàn giao & Giám sát**: Bàn giao mã nguồn đã tối ưu kèm báo cáo đối chiếu hiệu năng trước/sau khi thực hiện và hướng dẫn duy trì chất lượng code.',
        'https://storage.vanistudio.com/uploads/Gemini-Generated-Image-lckd0jlckd0jlckd-1781423628219.jpg',
        '[]'::jsonb,
        ${JSON.stringify(optimizationFeatures)}::jsonb,
        ${JSON.stringify(optimizationTechs)}::jsonb,
        3000000,
        'starting_at',
        5,
        'active',
        '[]'::jsonb,
        '{}'::jsonb
      ) RETURNING id
    `;

    const optimizationPkg1Features = {
      'Báo cáo chi tiết': 'Báo cáo PDF Audit',
      'Thời gian rà soát': '5 ngày làm việc',
      'Buổi họp giải trình': '1 giờ video call',
      'Độ dài Codebase hỗ trợ': '< 20,000 dòng code'
    };

    const optimizationPkg2Features = {
      'Trực tiếp refactor': true,
      'Tối ưu hóa Database': true,
      'Load Test kiểm chứng': true,
      'Bảo hành sửa lỗi': 'Miễn phí trong 1 tháng'
    };

    await sql`
      INSERT INTO service_packages (service_id, name, description, price, delivery_time, features_included)
      VALUES 
        (
          ${optimizationService.id},
          'Gói Đánh Giá & Tư Vấn (Code Audit)',
          'Audit toàn bộ codebase, database và cung cấp báo cáo chi tiết chỉ ra các lỗi kiến trúc, bảo mật, thắt nút cổ chai cùng hướng dẫn tự khắc phục.',
          3000000,
          5,
          ${JSON.stringify(optimizationPkg1Features)}::jsonb
        ),
        (
          ${optimizationService.id},
          'Gói Tối Ưu Hóa Trực Tiếp (Full Optimization)',
          'Chúng tôi trực tiếp refactor mã nguồn, tối ưu hóa cơ sở dữ liệu và tinh chỉnh hạ tầng để cải thiện hiệu năng rõ rệt.',
          8000000,
          10,
          ${JSON.stringify(optimizationPkg2Features)}::jsonb
        )
    `;
    console.log('Codebase Optimization seeded successfully.');

    // 6. Discord Bot Development
    const discordSlug = 'discord-bot-development';
    console.log(`Seeding service: ${discordSlug}...`);
    await sql`DELETE FROM services WHERE slug = ${discordSlug}`;

    const discordFeatures = [
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Hoạt động 24/7 ổn định',
        description: 'Bot được đóng gói Docker chuẩn hóa và hỗ trợ triển khai lên VPS chạy liên tục không gián đoạn.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Tương thích Discord API mới nhất',
        description: 'Sử dụng Discord.js v14+ hỗ trợ đầy đủ Slash Commands, Buttons, Modals và Select Menus.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Tích hợp AI thông minh',
        description: 'Kết nối OpenAI, Gemini hoặc Claude API để hỗ trợ phản hồi tự động thông minh.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Bảo mật & Phân quyền',
        description: 'Quản lý token bảo mật tuyệt đối, phân quyền chặt chẽ tránh tình trạng lạm dụng quyền admin.'
      }
    ];

    const discordTechs = ['devicon:nodejs', 'devicon:typescript', 'devicon:postgresql', 'devicon:docker', 'devicon:redis'];

    const [discordService] = await sql`
      INSERT INTO services (
        name, slug, type_id, description, content, thumbnail, gallery, features, technologies, base_price, price_type, delivery_time, status, fields_config, metadata
      ) VALUES (
        'Phát triển Bot Discord',
        ${discordSlug},
        ${botType.id},
        'Xây dựng Bot Discord tự động hóa quản trị server, tích hợp AI, minigames, cổng thanh toán và quản lý thành viên chuyên nghiệp.',
        '# Phát triển Bot Discord Tùy Chỉnh Chuyên Nghiệp

Tự động hóa hoàn toàn máy chủ Discord của bạn với các tính năng độc đáo và thông minh nhất.

Discord đã trở thành trung tâm cộng đồng cho các dự án game, tiền mã hóa, giáo dục và kinh doanh. Một chú Bot Discord được thiết kế riêng sẽ giúp bạn **giữ chân thành viên**, **tự động hóa quản trị** và **tích hợp sâu rộng** với các hệ thống bên ngoài.

## Các tính năng Bot Discord chúng tôi có thể phát triển

### Quản trị & Tự động hóa Máy chủ (Auto-Mod)
* Tự động duyệt thành viên mới, phân vai trò (Roles) tự động qua nút bấm hoặc xác thực captcha.
* Hệ thống lọc ngôn từ kích động, chống spam link, chống các cuộc tấn công phá hoại server (Anti-Raid).
* Tự động tạo phòng thoại (Voice Channels) tạm thời khi có người dùng tham gia và tự động xóa khi phòng trống.

### Tích hợp Trợ lý AI (ChatGPT / Gemini / Claude)
* Trả lời câu hỏi của thành viên tự động dựa trên kho tài liệu kiến thức của bạn.
* Chatbot AI trò chuyện tự nhiên, hỗ trợ giải đáp khách hàng 24/7 trực tiếp trên kênh chat.
* Hệ thống tự động phân loại và định tuyến các yêu cầu hỗ trợ (Support Ticket).

### Minigames & Hệ thống Kinh tế (Eco / RPG)
* Tạo hệ thống tính điểm kinh nghiệm (XP) và cấp bậc (Level) kích thích thành viên tương tác.
* Các trò chơi minigames trực tiếp trên chat (bói toán, đố vui, RPG chiến đấu, điểm danh nhận quà).
* Shop mua sắm vật phẩm ảo bằng tiền ảo tích lũy được trong server.

### Tích hợp Thanh toán & Webhook
* Liên kết ví điện tử (Momo, ZaloPay, VietQR) để bán vai trò VIP, khóa học hoặc dịch vụ tự động.
* Webhook thông báo tự động khi có video YouTube mới, bài viết Facebook, tin nhắn Telegram hoặc giao dịch trên website.
* Kết nối cơ sở dữ liệu MySQL, PostgreSQL lưu trữ dữ liệu người dùng đồng bộ với website của bạn.',
        'https://storage.vanistudio.com/uploads/Gemini-Generated-Image-eigqoleigqoleigq-1781423886866.jpg',
        '[]'::jsonb,
        ${JSON.stringify(discordFeatures)}::jsonb,
        ${JSON.stringify(discordTechs)}::jsonb,
        1500000,
        'starting_at',
        3,
        'active',
        '[]'::jsonb,
        '{}'::jsonb
      ) RETURNING id
    `;

    const discordPkg1Features = {
      'Slash Commands': 'Dưới 10 lệnh',
      'Số lần chỉnh sửa': '3 lần',
      'Đóng gói Docker': true,
      'Bảo hành lỗi': 'Miễn phí trong 1 tháng'
    };

    const discordPkg2Features = {
      'Slash Commands': 'Vô hạn',
      'Kết nối Database': true,
      'Tích hợp AI / Cổng thanh toán': 'Chọn 1 trong 2',
      'Hỗ trợ cài đặt lên VPS': true,
      'Bảo hành lỗi': 'Miễn phí trong 3 tháng'
    };

    await sql`
      INSERT INTO service_packages (service_id, name, description, price, delivery_time, features_included)
      VALUES 
        (
          ${discordService.id},
          'Gói Bot Quản Trị Cơ Bản',
          'Bot hỗ trợ các lệnh quản trị cơ bản, chào mừng thành viên mới, phân role tự động bằng nút bấm và tự động gửi thông báo Webhook.',
          1500000,
          3,
          ${JSON.stringify(discordPkg1Features)}::jsonb
        ),
        (
          ${discordService.id},
          'Gói Bot Tích Hợp Custom / AI',
          'Bot tích hợp cơ sở dữ liệu, có hệ thống kinh tế (Eco) hoặc kết nối AI Chatbot giải đáp tự động, cổng thanh toán tự động.',
          4500000,
          7,
          ${JSON.stringify(discordPkg2Features)}::jsonb
        )
    `;
    console.log('Discord Bot Development seeded successfully.');

    // 7. Telegram Bot Development
    const telegramSlug = 'telegram-bot-development';
    console.log(`Seeding service: ${telegramSlug}...`);
    await sql`DELETE FROM services WHERE slug = ${telegramSlug}`;

    const telegramFeatures = [
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Telegram Mini App (Web App)',
        description: 'Xây dựng ứng dụng Web tích hợp mượt mà chạy trực tiếp bên trong giao diện chat của Telegram.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Hệ thống thông báo tức thời',
        description: 'Gửi cảnh báo và dữ liệu quan trọng ngay lập tức khi phát sinh sự kiện từ hệ thống bên ngoài.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Tích hợp AI & Thanh toán',
        description: 'Kết nối trí tuệ nhân tạo và cổng thanh toán nội địa/quốc tế tự động hoàn toàn.'
      },
      {
        icon: 'solar:check-circle-line-duotone',
        name: 'Quản trị nhóm siêu tốc',
        description: 'Quét tin nhắn, loại bỏ spam và bảo vệ nhóm chat công khai của bạn 24/7.'
      }
    ];

    const telegramTechs = ['devicon:nodejs', 'devicon:typescript', 'devicon:react', 'devicon:postgresql', 'devicon:redis'];

    const [telegramService] = await sql`
      INSERT INTO services (
        name, slug, type_id, description, content, thumbnail, gallery, features, technologies, base_price, price_type, delivery_time, status, fields_config, metadata
      ) VALUES (
        'Phát triển Bot Telegram',
        ${telegramSlug},
        ${botType.id},
        'Phát triển Bot Telegram tự động gửi tin nhắn, nhận thanh toán, Mini App Telegram, hoặc trợ lý AI chăm sóc khách hàng tự động.',
        '# Phát triển Bot Telegram & Mini App Chuyên Nghiệp

Tự động hóa vận hành, tiếp cận khách hàng trực tiếp trên ứng dụng nhắn tin bảo mật hàng đầu thế giới.

Telegram là nền tảng tuyệt vời để triển khai các hệ thống thông báo tức thời, chatbot bán hàng tự động hoặc ứng dụng WebApp chạy trực tiếp bên trong cửa sổ chat (Telegram Mini App - TMA). Chúng tôi cung cấp giải pháp lập trình Bot Telegram tối ưu nhất.

## Các giải pháp Bot Telegram chúng tôi thực hiện

### Bot Thông Báo & Cảnh Báo Tự Động (Alert Bot)
* Nhận dữ liệu từ website, server giám sát gửi cảnh báo ngay lập tức về nhóm chat hoặc chat riêng khi có lỗi hệ thống hoặc đơn hàng mới.
* Tự động gửi báo cáo doanh thu, thống kê định kỳ hàng ngày/hàng tuần.

### Chatbot Chăm Sóc Khách Hàng & AI Support
* Bot tự động trả lời theo kịch bản có sẵn, hướng dẫn khách hàng mua hàng, đăng ký dịch vụ.
* Tích hợp AI (ChatGPT/Gemini) giúp tư vấn sản phẩm, giải quyết khiếu nại khách hàng tự nhiên và thông minh.
* Quản trị nhóm chat: Tự động xóa tin nhắn spam, kick/ban thành viên vi phạm quy tắc nhóm.

### Telegram Mini App (TMA - WebApp)
* Thiết kế và lập trình ứng dụng Web chạy trực tiếp trong Telegram bằng React/Vue/HTML5.
* Cho phép người dùng mua sắm, đặt lịch, chơi game (Tap-to-Earn, Minigames) mà không cần thoát Telegram.
* Tích hợp cổng thanh toán trực tiếp qua Telegram Pay hoặc QR ngân hàng Việt Nam.

## Ưu thế vượt trội của Bot Telegram

* **Không cần tải app**: Người dùng chỉ cần click vào link bot là có thể sử dụng ngay lập tức, bỏ qua bước cài đặt rườm rà.
* **Tốc độ cực nhanh**: Telegram API được thiết kế tối giản giúp bot phản hồi gần như ngay lập tức.
* **Độ bảo mật tối đa**: Mọi dữ liệu truyền tải qua Telegram đều được mã hóa an toàn.',
        'https://storage.vanistudio.com/uploads/Gemini-Generated-Image-yzkho1yzkho1yzkh-1781423975028.jpg',
        '[]'::jsonb,
        ${JSON.stringify(telegramFeatures)}::jsonb,
        ${JSON.stringify(telegramTechs)}::jsonb,
        1500000,
        'starting_at',
        3,
        'active',
        '[]'::jsonb,
        '{}'::jsonb
      ) RETURNING id
    `;

    const telegramPkg1Features = {
      'Kịch bản trả lời': 'Dưới 10 bước',
      'Số lần chỉnh sửa': '3 lần',
      'Cảnh báo Webhook': true,
      'Bảo hành lỗi': 'Miễn phí trong 1 tháng'
    };

    const telegramPkg2Features = {
      'Giao diện WebApp': true,
      'Kết nối Database': true,
      'Hỗ trợ thanh toán': true,
      'Cài đặt VPS miễn phí': true,
      'Bảo hành lỗi': 'Miễn phí trong 3 tháng'
    };

    await sql`
      INSERT INTO service_packages (service_id, name, description, price, delivery_time, features_included)
      VALUES 
        (
          ${telegramService.id},
          'Gói Bot Trực Tin Nhắn & Cảnh Báo',
          'Bot nhận webhook gửi tin nhắn cảnh báo tự động về chat hoặc tự động trả lời theo kịch bản chuẩn bị sẵn.',
          1500000,
          3,
          ${JSON.stringify(telegramPkg1Features)}::jsonb
        ),
        (
          ${telegramService.id},
          'Gói Telegram Mini App (WebApp)',
          'Thiết kế và lập trình giao diện WebApp chạy trong Telegram, kết nối database, tích hợp các tính năng tương tác phức tạp hoặc game.',
          6000000,
          10,
          ${JSON.stringify(telegramPkg2Features)}::jsonb
        )
    `;
    console.log('Telegram Bot Development seeded successfully.');

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error: any) {
    console.error('Failed to seed services:', error.message || error);
    process.exit(1);
  }
}

seed();
