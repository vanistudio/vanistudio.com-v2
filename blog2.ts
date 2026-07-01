import * as fs from "fs";
import * as path from "path";

// ==========================================
// 1. CẤU HÌNH DATABASE URL TẠI ĐÂY
// Bạn có thể nhập chuỗi kết nối PostgreSQL của mình vào biến DATABASE_URL bên dưới.
// Ví dụ: const DATABASE_URL = "postgresql://username:password@localhost:5432/vanistudio";
// Nếu để trống hoặc null, script sẽ tự động tìm biến môi trường APP_DATABASE_URI_VALUE hoặc file .env
// ==========================================
const DATABASE_URL = "";

// 2. Tự động đọc và nạp file .env cục bộ
const envPath = path.join(__dirname, "./.env");
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

// 3. Thiết lập biến môi trường kết nối cơ sở dữ liệu
const finalDbUrl = DATABASE_URL || process.env.APP_DATABASE_URI_VALUE;
if (!finalDbUrl) {
  console.error("\n[Error] Vui lòng nhập DATABASE_URL trực tiếp trong script này hoặc định nghĩa APP_DATABASE_URI_VALUE trong file .env!\n");
  process.exit(1);
}
process.env.APP_DATABASE_URI_VALUE = finalDbUrl;

// 4. Nội dung bài viết MDX (Sử dụng toàn bộ các component hỗ trợ trong mdx-builder)
const mdxContent = `# Next.js v16 Modular Monolith: Kiến trúc Module hóa và Hệ thống Ép luật ESLint Boundaries Tự động cho Dự án Thực chiến

Next.js App Router giúp bạn bắt đầu dự án cực nhanh. Nhưng chỉ sau 6 tháng phát triển, nếu không có một quy chuẩn rõ ràng, mã nguồn của bạn sẽ nhanh chóng biến thành một bãi chiến trường: logic nghiệp vụ nằm lẫn trong component UI, truy vấn database xuất hiện trực tiếp ở \`page.tsx\`, và các thành viên tự do import chéo bất cứ thứ gì họ thấy tiện. 

Nhiều team chọn cách giải quyết bằng cách tách thành Microservices hay Polyrepo. Tuy nhiên, với một team vừa và nhỏ, đây thường là một quyết định sai lầm (resume-driven development) làm giảm tốc độ phát triển và tăng chi phí vận hành lên gấp nhiều lần.

Bài viết này sẽ hướng dẫn bạn cách áp dụng mô hình **Modular Monolith** trên Next.js v16, kết hợp với hệ thống luật thép **ESLint Boundaries** tự động. Bạn sẽ giữ được sự ngăn nắp, tách biệt module sạch sẽ của NestJS nhưng vẫn giữ nguyên sự tinh gọn, dễ deploy của Next.js.

<Separator className="my-6" />

<Note>
  **Modular Monolith** là kiến trúc tổ chức code bên trong một repository duy nhất (Monolith), chia ứng dụng thành các module độc lập có ranh giới rõ ràng. Mỗi module tự quản lý dữ liệu và logic nghiệp vụ của riêng mình, chỉ giao tiếp với bên ngoài qua các cổng được định nghĩa sẵn.
</Note>

## 1. Tại sao không phải Polyrepo hay Microservices?

Khi dự án ở giai đoạn khởi động hoặc phát triển nóng, tốc độ là yếu tố sống còn. Tách nhỏ hệ thống quá sớm đồng nghĩa với việc bạn phải gánh chịu hàng loạt rắc rối: cấu hình CORS phức tạp, đồng bộ type giữa các repo, quản lý nhiều pipeline CI/CD, và debug lỗi xuyên suốt nhiều server.

Modular Monolith mang lại một "điểm ngọt" (sweet spot) hoàn hảo nhờ ba lợi ích cốt lõi:

- **1 Port Duy Nhất:** Toàn bộ ứng dụng (cả FE & BE) chạy trên một cổng duy nhất. Deploy nhanh chóng lên Vercel, Coolify hoặc VPS mà không cần lo lắng cấu hình proxy ngược hay CORS.
- **Type Safety Tuyệt Đối:** Chia sẻ trực tiếp các type TypeScript, DTO Zod từ backend sang frontend mà không cần qua các bước sinh code trung gian. Đổi tên một trường dữ liệu ở database, toàn bộ form nhập liệu ở UI lập tức báo đỏ nếu chưa đồng bộ.
- **Sẵn Sàng Mở Rộng:** Do các module đã được đóng gói cô lập, nếu sau này một module (ví dụ: xử lý thanh toán hoặc gợi ý sản phẩm) bị quá tải, bạn có thể dễ dàng tách riêng module đó ra thành một Microservice độc lập mà không cần phải đập đi viết lại cấu trúc.

<Separator className="my-6" />

## 2. Triết lý Modular Monolith & Quy hoạch Root Level

Trong mô hình này, chúng ta định nghĩa một quy tắc bất di bất dịch: **Thư mục định tuyến (\`src/app/\`) chỉ làm nhiệm vụ hiển thị, toàn bộ logic nghiệp vụ phải nằm trong \`src/modules/\`**.

<Tree>
  <Tree.Folder name="vanistudio" defaultOpen={true} isRoot={true}>
    <Tree.Folder name="src" defaultOpen={true}>
      <Tree.Folder name="app" defaultOpen={true}>
        <Tree.File name="layout.tsx" />
        <Tree.File name="page.tsx" />
        <Tree.Folder name="dashboard" defaultOpen={false}>
          <Tree.File name="page.tsx" />
          <Tree.File name="loading.tsx" />
        </Tree.Folder>
      </Tree.Folder>
      <Tree.Folder name="modules" defaultOpen={true}>
        <Tree.Folder name="auth" defaultOpen={true}>
          <Tree.File name="auth.dto.ts" />
          <Tree.File name="auth.action.ts" />
          <Tree.File name="auth.service.ts" />
          <Tree.File name="auth.repo.ts" />
        </Tree.Folder>
        <Tree.Folder name="order" defaultOpen={false}>
          <Tree.File name="order.dto.ts" />
          <Tree.File name="order.action.ts" />
          <Tree.File name="order.service.ts" />
          <Tree.File name="order.repo.ts" />
        </Tree.Folder>
      </Tree.Folder>
      <Tree.Folder name="shared" defaultOpen={false}>
        <Tree.Folder name="components" defaultOpen={false} />
        <Tree.Folder name="libs" defaultOpen={false} />
        <Tree.Folder name="io" defaultOpen={false} />
      </Tree.Folder>
      <Tree.File name="proxy.ts" />
    </Tree.Folder>
    <Tree.File name="eslint.config.mjs" />
    <Tree.File name="package.json" />
  </Tree.Folder>
</Tree>

### Phân vùng trách nhiệm rõ ràng ở Root:
1. **src/app/:** Nơi chứa cấu trúc URL Router, các file \`page.tsx\`, \`layout.tsx\`, \`loading.tsx\` phục vụ hiển thị. Tuyệt đối không viết logic xử lý dữ liệu hay câu lệnh truy vấn SQL tại đây. Thư mục này chỉ import các thành phần từ \`modules\` hoặc \`shared\` để hiển thị ra cho người dùng.
2. **src/modules/:** Xương thịt của ứng dụng. Đây là nơi chứa toàn bộ logic nghiệp vụ, được phân chia thành từng cụm tính năng độc lập (ví dụ: \`auth\`, \`order\`, \`product\`, \`billing\`).
3. **src/proxy.ts:** Điểm tiếp nhận request đầu tiên của toàn bộ ứng dụng.

<Separator className="my-6" />

## 3. Gác cổng Runtime: Khai tử middleware.ts, chào đón proxy.ts & Pipeline Pattern

Tại Next.js v16, tệp tin gác cổng quen thuộc \`middleware.ts\` đã chính thức bị thay thế hoàn toàn bởi **\`proxy.ts\`**. 

### Quy tắc của proxy.ts:
- Bắt buộc phải sử dụng tên hàm export là \`proxy\` (không sử dụng default export hay tên hàm khác).
- Vận hành ở tầng mạng Edge Runtime nhằm tối ưu hóa hiệu năng tối đa trước khi request chạm tới server ứng dụng.
- Chỉ chịu trách nhiệm kiểm tra điều hướng, kiểm tra tính hợp lệ của request. **Cấm viết business logic hay truy vấn database tại đây.**

### Giải quyết bài toán ôm đồm logic với Pipeline Pattern
Thay vì viết một file \`proxy.ts\` dài hàng ngàn dòng chứa đủ thứ logic từ check session, check IP, rate limit cho đến CORS headers, chúng ta áp dụng **Pipeline Pattern**. Toàn bộ logic kiểm tra được xé nhỏ thành các tệp chuyên dụng nằm trong thư mục \`src/proxies/*.proxy.ts\`.

<Workflow interactive="true">
  [HTTP Request đi vào]
  -> (1. DDoS Block) ->
  [DDoS Proxy: Kiểm tra rate limit & IP blacklist | badge=Edge]
  -> (2. IP Tracker) ->
  [IP Tracker Proxy: Phân tích Header & Location | badge=Edge]
  -> (3. Auth Guard) ->
  [Auth Guard Proxy: Xác thực JWT / Session cookie | badge=Edge]
  -> (Pipeline Success) ->
  [NextResponse.next(): Chuyển request tới Route Handler / Page | badge=App]
</Workflow>

Bằng cách này, thành viên trong team có thể thoải mái chèn thêm hoặc gỡ bỏ các lớp bảo mật (Auth Guard, DDoS Block, IP Tracker) như các mắt xích của một đường ống (pipeline) mà không sợ làm ảnh hưởng đến cấu hình chung của hệ thống:

\`\`\`typescript src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ddosProxy } from './proxies/ddos.proxy';
import { ipTrackerProxy } from './proxies/ip-tracker.proxy';
import { authProxy } from './proxies/auth.proxy';

export async function proxy(request: NextRequest) {
  // Chạy qua ddos proxy
  const ddosRes = await ddosProxy(request);
  if (ddosRes) return ddosRes;

  // Chạy qua tracking ip
  await ipTrackerProxy(request);

  // Chạy qua xác thực người dùng
  const authRes = await authProxy(request);
  if (authRes) return authRes;

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
\`\`\`

<Separator className="my-6" />

## 4. Giải phẫu một Module: Phân chia 4 lớp (DTO -> Action -> Service -> Repo)

Để triệt tiêu tình trạng code nghiệp vụ bị trộn lẫn, mỗi module trong \`src/modules/\` được chia tách thành 4 lớp rõ ràng, đi từ ngoài vào trong:

<Columns cols={4}>
  <Column>
    <Card className="h-full border-border/80 bg-card">
      <CardHeader>
        <Badge className="bg-blue-500/15 text-blue-400 border-none mb-1">Layer 1</Badge>
        <CardTitle className="text-sm font-bold">DTO & Zod</CardTitle>
        <CardDescription className="text-[11px]">Bản thiết kế dữ liệu</CardDescription>
      </CardHeader>
      <CardContent className="text-[11px] text-muted-foreground leading-relaxed">
        Sử dụng Zod để validate đầu vào ngay tại cửa ngõ Server. Đóng vai trò là Single Source of Truth cho cả client form lẫn API validation.
      </CardContent>
    </Card>
  </Column>

  <Column>
    <Card className="h-full border-border/80 bg-card">
      <CardHeader>
        <Badge className="bg-emerald-500/15 text-emerald-400 border-none mb-1">Layer 2</Badge>
        <CardTitle className="text-sm font-bold">Server Actions</CardTitle>
        <CardDescription className="text-[11px]">Cửa ngõ thực thi</CardDescription>
      </CardHeader>
      <CardContent className="text-[11px] text-muted-foreground leading-relaxed">
        Thay thế hoàn toàn tRPC/REST cho các tác vụ CRUD. Chỉ làm nhiệm vụ kiểm tra quyền, parse DTO và chuyển tiếp dữ liệu đến Service.
      </CardContent>
    </Card>
  </Column>

  <Column>
    <Card className="h-full border-border/80 bg-card">
      <CardHeader>
        <Badge className="bg-purple-500/15 text-purple-400 border-none mb-1">Layer 3</Badge>
        <CardTitle className="text-sm font-bold">Services</CardTitle>
        <CardDescription className="text-[11px]">Động cơ nghiệp vụ</CardDescription>
      </CardHeader>
      <CardContent className="text-[11px] text-muted-foreground leading-relaxed">
        Chứa 100% logic nghiệp vụ của ứng dụng. Hoàn toàn là code TypeScript thuần túy, không phụ thuộc vào Web API hay framework.
      </CardContent>
    </Card>
  </Column>

  <Column>
    <Card className="h-full border-border/80 bg-card">
      <CardHeader>
        <Badge className="bg-red-500/15 text-red-400 border-none mb-1">Layer 4</Badge>
        <CardTitle className="text-sm font-bold">Repositories</CardTitle>
        <CardDescription className="text-[11px]">Tầng truy cập dữ liệu</CardDescription>
      </CardHeader>
      <CardContent className="text-[11px] text-muted-foreground leading-relaxed">
        Nơi chứa các truy vấn SQL thô hoặc các hàm ORM (Drizzle/Prisma). Giúp cô lập hoàn toàn logic truy vấn khỏi tầng nghiệp vụ ở trên.
      </CardContent>
    </Card>
  </Column>
</Columns>

### Lớp 1: DTO (Data Transfer Object) - \`*.dto.ts\`
\`\`\`typescript src/modules/order/order.dto.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  productId: z.string().uuid('ID sản phẩm không đúng định dạng'),
  quantity: z.number().int().positive().max(50, 'Chỉ được mua tối đa 50 sản phẩm một lần'),
  promoCode: z.string().optional(),
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
\`\`\`

### Lớp 2: Server Actions - \`*.action.ts\`
\`\`\`typescript src/modules/order/order.action.ts
'use server';

import { createOrderSchema } from './order.dto';
import { orderService } from './order.service';
import { getSessionUser } from '@/shared/libs/auth.util';

export async function createOrderAction(rawInput: unknown) {
  // 1. Kiểm tra xác thực ở cửa ngõ
  const user = await getSessionUser();
  if (!user) throw new Error('Bạn cần đăng nhập để thực hiện tác vụ này');

  // 2. Parse dữ liệu đầu vào bằng DTO
  const input = createOrderSchema.parse(rawInput);

  // 3. Đẩy tiếp dữ liệu đã an toàn cho Service xử lý
  return await orderService.create(user.id, input);
}
\`\`\`

### Lớp 3: Services (Nghiệp vụ thuần túy) - \`*.service.ts\`
Tầng này tuyệt đối không được đọc cookies, headers, hay nhận đối tượng request. Việc này giúp Service cực kỳ độc lập, dễ dàng chạy unit test mà không cần mock môi trường trình duyệt hay request.

\`\`\`typescript src/modules/order/order.service.ts
import { orderRepo } from './order.repo';
import type { CreateOrderDTO } from './order.dto';

export class OrderService {
  async create(userId: string, data: CreateOrderDTO) {
    // 1. Kiểm tra số lượng tồn kho qua Repository
    const stock = await orderRepo.getProductStock(data.productId);
    if (stock < data.quantity) {
      throw new Error('Sản phẩm trong kho không đủ đáp ứng số lượng yêu cầu');
    }

    // 2. Thực hiện tính toán nghiệp vụ
    const price = await this.calculateOrderPrice(data.productId, data.quantity, data.promoCode);

    // 3. Lưu trữ đơn hàng thông qua Repository
    return await orderRepo.saveOrder({
      userId,
      productId: data.productId,
      quantity: data.quantity,
      price,
    });
  }

  private async calculateOrderPrice(productId: string, quantity: number, promoCode?: string) {
    // Thực hiện logic tính toán chiết khấu, thuế phí...
    return 150000 * quantity; 
  }
}

export const orderService = new OrderService();
\`\`\`

### Lớp 4: Repositories (Truy cập dữ liệu) - \`*.repo.ts\`
\`\`\`typescript src/modules/order/order.repo.ts
import { db } from '@/server/db';
import { orders, products } from '@/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export class OrderRepository {
  async getProductStock(productId: string): Promise<number> {
    const [product] = await db.select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, productId));
    return product?.stock ?? 0;
  }

  async saveOrder(data: { userId: string; productId: string; quantity: number; price: number }) {
    return await db.transaction(async (tx) => {
      // Cập nhật giảm kho
      await tx.update(products)
        .set({ stock: sql\`\${products.stock} - \${data.quantity}\` })
        .where(eq(products.id, data.productId));

      // Thêm bản ghi hóa đơn mới
      const [newOrder] = await tx.insert(orders).values(data).returning();
      return newOrder;
    });
  }
}

export const orderRepo = new OrderRepository();
\`\`\`

<Separator className="my-6" />

## 5. Tầng Shared: Tránh bẫy đặt tên mập mờ và quy hoạch I/O Utilities

Các module nghiệp vụ được giữ cô lập, nhưng chúng vẫn cần truy cập vào các thư viện dùng chung như gửi mail, lưu file, hay component UI. Thư mục \`src/shared/\` là nơi quản lý các tài nguyên này.

### Shadcn UI & I/O đóng gói tập trung
- **shared/components/ui/:** Nơi Shadcn UI tự động sinh code (Button, Dialog, Input...).
- **shared/io/storage.io.ts:** Đóng gói cổng kết nối Cloudflare R2, AWS S3, Cloudinary.
- **shared/io/mail.io.ts:** Giao diện tập trung gửi email (Resend, Nodemailer).
- **shared/io/payment.io.ts:** Cổng xử lý giao dịch thanh toán tập trung (Stripe, PayOS, Crypto).

### Tuyệt đối tránh đặt tên đuôi mập mờ kiểu \`*.plugin.ts\`
Nhiều dự án thường có các file như \`auth.plugin.ts\` hay \`ip.plugin.ts\`. Tên gọi này rất mơ hồ, khiến thành viên trong team không phân biệt được đâu là code xử lý mạng (I/O) và đâu là thư viện thuật toán thuần túy.

Chúng ta phân định rõ ràng thành hai nhóm:
- **libs (Thư viện thuật toán thuần túy, không gọi API ngoài):** Ví dụ \`device.util.ts\` (đọc User-Agent phân tích thiết bị), \`ip.util.ts\` (trích xuất IP từ request header).
- **io (Thực hiện kết nối và gọi dịch vụ bên ngoài):** Ví dụ \`location.io.ts\` (gọi API của bên thứ ba để tìm vị trí địa lý từ IP).

<Separator className="my-6" />

## 6. Xây dựng ranh giới thép: Hệ thống luật ESLint Boundaries tự động

Thách thức lớn nhất của Modular Monolith là **sự suy thoái kiến trúc theo thời gian**. Chỉ cần một phút lơ là hoặc do áp lực deadline, một lập trình viên có thể import trực tiếp logic của module này sang module khác, hoặc tệ hơn là cho phép tầng Repository đi gọi ngược lên tầng Service.

Để giải quyết triệt để, chúng ta thiết lập hệ thống tự động kiểm soát ranh giới module bằng plugin \`eslint-plugin-boundaries\`.

### Bước 1: Cài đặt Packages
Chạy lệnh sau tại thư mục gốc dự án:

<CodeGroup>
\`\`\`bash npm
npm install -D eslint-plugin-boundaries
\`\`\`

\`\`\`bash pnpm
pnpm add -D eslint-plugin-boundaries
\`\`\`

\`\`\`bash yarn
yarn add -D eslint-plugin-boundaries
\`\`\`

\`\`\`bash bun
bun add -D eslint-plugin-boundaries
\`\`\`
</CodeGroup>

### Bước 2: Cấu hình eslint.config.mjs (Flat Config)
Chúng ta định nghĩa rõ các loại phần tử (elements) dựa trên pattern của tệp tin, sau đó áp các quy luật cấm import chéo và import ngược.

\`\`\`javascript eslint.config.mjs
import boundaries from 'eslint-plugin-boundaries';

export default [
  {
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/elements': [
        {
          type: 'module-dto',
          pattern: 'src/modules/*/*.dto.ts',
        },
        {
          type: 'module-action',
          pattern: 'src/modules/*/*.action.ts',
        },
        {
          type: 'module-service',
          pattern: 'src/modules/*/*.service.ts',
        },
        {
          type: 'module-repo',
          pattern: 'src/modules/*/*.repo.ts',
        },
        {
          type: 'shared',
          pattern: 'src/shared/**/*',
        },
        {
          type: 'app-router',
          pattern: 'src/app/**/*',
        },
      ],
    },
    rules: {
      // 1. Cấm import các tệp không được định nghĩa rõ ràng làm entrypoint
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              target: [['module-dto', 'module-action', 'module-service', 'module-repo']],
              allow: '*.ts',
            },
          ],
        },
      ],
      // 2. Thiết lập ranh giới phụ thuộc nghiêm ngặt giữa các tầng
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          message: 'Không được phép import từ "\${dependency.type}" vào "\${target.type}"',
          rules: [
            // App Router có quyền sử dụng DTO, Action, Service, Shared
            {
              from: 'app-router',
              allow: ['module-dto', 'module-action', 'module-service', 'shared'],
            },
            // Action chỉ được gọi Service và DTO
            {
              from: 'module-action',
              allow: ['module-dto', 'module-service', 'shared'],
            },
            // Service chỉ được gọi Repo và DTO
            {
              from: 'module-service',
              allow: ['module-dto', 'module-repo', 'shared'],
            },
            // Repo chỉ được sử dụng DTO và Shared (không được gọi ngược lên Service/Action)
            {
              from: 'module-repo',
              allow: ['module-dto', 'shared'],
            },
            // Cấm hoàn toàn import chéo ruột giữa các Module khác nhau
            {
              from: 'module-service',
              allow: [
                ['module-repo', { family: 'same' }],
                ['module-dto', { family: 'same' }],
                'shared'
              ],
            },
          ],
        },
      ],
    },
  },
];
\`\`\`

<Separator className="my-6" />

## 7. Vận hành thực tế: IDE Cảnh báo Đỏ và CI/CD Quality Gate

Hệ thống luật cấu hình thông qua ESLint mới sẽ bảo vệ chất lượng dự án của bạn trên hai cấp độ:

### Cấp độ 1: Cảnh báo trực quan thời gian thực trên VS Code
Khi một lập trình viên viết sai quy tắc cấu trúc, lỗi vi phạm lập tức bị gạch chân đỏ lòm ngay trên màn hình code. Lỗi hiển thị rõ ràng thông báo cấm đoán mà bạn đã thiết lập:

<Warning>
  **ESLint Error (VS Code Tooltip):**
  \`eslint-plugin-boundaries/element-types: Không được phép import từ "module-service" vào "module-repo"\`
</Warning>

### Cấp độ 2: Kiểm soát tự động trước khi Deploy (Terminal & CI/CD Pipeline)
Để đảm bảo không có bất kỳ dòng code "láo" nào vượt qua được vòng kiểm duyệt của dự án, câu lệnh kiểm tra sau sẽ được chạy tự động trong pipeline CI/CD trước khi đóng gói sản phẩm:

<CodeGroup>
\`\`\`bash npm
npm run lint
\`\`\`

\`\`\`bash pnpm
pnpm lint
\`\`\`

\`\`\`bash yarn
yarn lint
\`\`\`

\`\`\`bash bun
bun lint
\`\`\`
</CodeGroup>

Nếu có bất kỳ vi phạm ranh giới nào, pipeline build sẽ lập tức bị hủy bỏ, bắt buộc lập trình viên phải sửa đổi lại code cho đúng thiết kế.

<Separator className="my-6" />

Kiến trúc **Modular Monolith** trên Next.js v16 đem lại sự cân bằng hoàn hảo giữa tốc độ phát triển và tính bền vững của mã nguồn. Bằng cách áp dụng quy hoạch 4 lớp cho mỗi Module kết hợp với hệ thống luật thép **ESLint Boundaries**, bạn sẽ không còn phải lo lắng về việc dự án bị phình to và biến thành "đống rác" spaghetti sau vài tháng code. 

Hãy bắt đầu quy hoạch gọn gàng - ép luật tự động - để code chạy bàn thờ ngay hôm nay cùng team Vani nhé!`;

// 5. Hàm chạy Seeding dữ liệu
async function runSeed() {
  try {
    console.log("----------------------------------------------------------------");
    console.log("BẮT ĐẦU NẠP BÀI VIẾT: NEXT.JS V16 MODULAR MONOLITH...");
    console.log("----------------------------------------------------------------");

    // Dynamic import các module dự án sau khi đã thiết lập biến môi trường ở trên
    const { db } = await import("./src/server/db");
    const { blogs } = await import("./src/server/db/schemas/blog.schema");
    const { eq } = await import("drizzle-orm");

    const blogPost = {
      title: "Next.js v16 Modular Monolith: Kiến trúc Module hóa và Hệ thống Ép chuẩn ESLint Tự động cho Dự án Thực chiến",
      slug: "next-v16-modular-monolith",
      description: "Hướng dẫn chi tiết cách áp dụng kiến trúc Modular Monolith trên Next.js v16, phân tầng DTO → Action → Service → Repository, kèm hệ thống ép chuẩn ESLint Boundaries tự động ngăn chặn vi phạm cấu trúc module.",
      isActive: true,
      publishedAt: new Date("2026-06-29T09:00:00.000Z"),
      thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-1lxiux1lxiux1lxi-1782666671986.jpg",
      metaTitle: "Next.js v16 Modular Monolith: Kiến trúc & ESLint Boundaries - Vani Studio",
      metaDescription: "Hướng dẫn kiến trúc Modular Monolith trên Next.js v16 với phân tầng DTO, Server Actions, Services, Repositories và hệ thống ép chuẩn ESLint Boundaries tự động.",
      metaKeywords: "nextjs v16, modular monolith, eslint boundaries, server actions, dto zod, repository pattern, nextjs architecture, web development",
      tags: ["nextjs", "architecture", "eslint", "web-development"],
      content: mdxContent,
      views: 0,
      likes: 0,
      readingTime: 15,
    };

    console.log(`Dọn dẹp bài viết cũ có cùng slug: "${blogPost.slug}"...`);
    await db.delete(blogs).where(eq(blogs.slug, blogPost.slug));

    console.log("Đang thêm bài viết mới vào database...");
    await db.insert(blogs).values(blogPost);

    console.log("----------------------------------------------------------------");
    console.log("ĐÃ NẠP THÀNH CÔNG BÀI VIẾT!");
    console.log("Bạn có thể truy cập trang xem trước của bài viết theo đường dẫn:");
    console.log(`-> /blog/${blogPost.slug}`);
    console.log("----------------------------------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("Đã xảy ra lỗi khi nạp bài viết:", error);
    process.exit(1);
  }
}

runSeed();
