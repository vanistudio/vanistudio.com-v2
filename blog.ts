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
const mdxContent = `# Next.js 16.3: Tại sao Vercel khai tử cơ chế Prefetch cũ và cách Instant Navigations định nghĩa lại trải nghiệm Single Page App

Nếu bạn từng bực mình vì Next.js App Router tải trang chậm hoặc gửi hàng chục request prefetch làm nghẽn tab Network, bạn không đơn độc. 

Next.js 16.3 chính thức giải quyết vấn đề này bằng **Instant Navigations** – một bộ công cụ mang trải nghiệm chuyển trang tức thì của SPA vào mô hình Server Components mà không làm mất đi lợi thế phía máy chủ.

Trong bài viết này, chúng ta sẽ đi sâu vào cấu trúc bên dưới của Instant Navigations, tại sao cơ chế prefetch cũ bị thay thế, và làm cách nào để áp dụng giải pháp này vào các ứng dụng lớn một cách hiệu quả.

<Separator className="my-6" />

<Note>
  **Instant Navigations** không đơn giản chỉ là một thư viện client-side. Đó là sự kết hợp chặt chẽ giữa trình biên dịch React Server Components (RSC) ở phía Server và bộ định tuyến Client-side Router cải tiến ở phía Client, giúp hiển thị khung xương tĩnh của trang tiếp theo ngay khi người dùng click chuột.
</Note>

## 1. Nguồn cơn: Network Flooding và sự kém hiệu quả của Prefetch cũ

Trong các phiên bản Next.js từ 13 đến 16.2, khi một thẻ \`<Link>\` xuất hiện trên viewport (khu vực hiển thị của trình duyệt), Next.js sẽ tự động thực hiện tải trước (prefetching). 

Hệ quả là gì? 

Mỗi link trỏ tới một đường dẫn động như \`/products/1\`, \`/products/2\`, \`/products/3\` sẽ gửi một request riêng biệt lên server để lấy mã RSC Payload tương ứng. Khi bạn cuộn qua một danh sách sản phẩm dài, trình duyệt lập tức bắn đi hàng chục request đồng thời. 

<Callout icon="solar:sad-circle-line-duotone" color="#ef4444">
  **Hệ lụy về hiệu năng:**
  - **Với Client:** Hao phí băng thông mạng, tăng mức sử dụng CPU do liên tục phân tích RSC payload tải về.
  - **Với Server:** Gây quá tải CPU và tràn kết nối cơ sở dữ liệu (database connection pool exhaustion) do server liên tục phải tính toán và render mã RSC động cho từng link riêng lẻ, ngay cả khi người dùng không bao giờ click vào chúng.
</Callout>

Next.js 16.3 chính thức khai tử cơ chế prefetch kiểu cũ này. Thay vì tải trước payload của từng link đơn lẻ, hệ thống mới chuyển hướng sang tải trước **Loading Shell (bộ khung giao diện tĩnh)** duy nhất của Route đó.

<Separator className="my-6" />

## 2. Kiến trúc bên dưới: Sự kết hợp giữa React Server Components và PPR

Bản chất của Instant Navigations nằm ở cơ chế **Partial Prerendering (PPR)** và biên dịch tĩnh động phân tách. Trình biên dịch của Next.js sẽ chia tách mã nguồn của một trang thành hai phần riêng biệt:

1. **Static Shell (Khung tĩnh):** Chứa các thành phần UI tĩnh không phụ thuộc vào dữ liệu yêu cầu thực tế (ví dụ: Sidebar, Navbar, khung Header, hoặc các Skeleton chờ tải dữ liệu).
2. **Dynamic Segments (Phần động):** Chứa các thành phần cần truy vấn cơ sở dữ liệu, đọc cookies, đọc query parameters hoặc dữ liệu thời gian thực.

Khi bạn click vào một đường link, Client-side Router sẽ ngay lập tức kết xuất tĩnh bộ khung giao diện của trang tiếp theo (vốn đã được tải trước và cache trên trình duyệt). Song song đó, trình duyệt mở một kết nối Stream tới server để tải các phần động và hiển thị dần lên màn hình thông qua cơ chế React Suspense.

### Quy trình chuyển trang tức thì (0ms Transition)

<Workflow interactive="true">
  [Click Link: Người dùng nhấn thẻ Link | method=GET | badge=Client]
  -> (0ms Transition) ->
  [Hiển thị Shell tĩnh: Tải trước từ Cache Client và hiển thị ngay | duration=0ms | badge=Cache]
  -> (Stream kết nối Server) ->
  [Server Render: Biên dịch dynamic segments và stream dữ liệu | duration=120ms | badge=Server]
  -> (Dữ liệu trả về qua HTTP stream) ->
  [Giải phóng Suspense: Điền UI động để hoàn tất hiển thị | badge=React]
</Workflow>

Cách tiếp cận này mang lại tốc độ phản hồi tuyệt đối của Single Page App (nhấp chuột là chuyển trang ngay, không có màn hình trắng) nhưng vẫn giữ được toàn bộ sức mạnh xử lý dữ liệu bảo mật ở phía Server.

<Separator className="my-6" />

## 3. Ba chiến lược điều khiển: Stream, Cache và Block

Next.js 16.3 không ép buộc bạn phải chọn một giải pháp duy nhất. Lập trình viên có quyền chỉ định cơ chế xử lý dữ liệu dựa trên tầm quan trọng của từng Route:

<Columns cols={3}>
  <Column>
    <Card className="h-full flex flex-col justify-between border-border/80 bg-card">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none">Stream</Badge>
          <Icon icon="solar:round-transfer-horizontal-line-duotone" className="size-5 text-blue-500" />
        </div>
        <CardTitle className="text-base font-bold">Stream với Suspense</CardTitle>
        <CardDescription className="text-xs">Uu tiên tốc độ phản hồi UI</CardDescription>
      </CardHeader>
      <CardContent className="text-[12px] text-muted-foreground leading-relaxed flex-1">
        Trang web sẽ chuyển sang khung xương tĩnh (Skeleton) ngay lập tức. Sau đó dữ liệu động được nạp dần. Thích hợp cho Dashboards, Trang cá nhân, và các trang có độ trễ truy vấn dữ liệu từ API bên thứ ba.
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full text-xs">Xem chi tiết</Button>
      </CardFooter>
    </Card>
  </Column>

  <Column>
    <Card className="h-full flex flex-col justify-between border-border/80 bg-card">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none">Cache</Badge>
          <Icon icon="solar:database-line-duotone" className="size-5 text-emerald-500" />
        </div>
        <CardTitle className="text-base font-bold">Cache với 'use cache'</CardTitle>
        <CardDescription className="text-xs">Tải trang tức thì với dữ liệu cũ</CardDescription>
      </CardHeader>
      <CardContent className="text-[12px] text-muted-foreground leading-relaxed flex-1">
        Áp dụng directive \`'use cache'\` để lưu trữ dữ liệu tại biên (Edge) hoặc CDN. Client sẽ nhận toàn bộ giao diện và dữ liệu hoàn chỉnh ngay lập tức mà không phải thực thi lại câu lệnh xử lý trên Server.
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full text-xs">Xem chi tiết</Button>
      </CardFooter>
    </Card>
  </Column>

  <Column>
    <Card className="h-full flex flex-col justify-between border-border/80 bg-card">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none">Block</Badge>
          <Icon icon="solar:shield-warning-line-duotone" className="size-5 text-red-500" />
        </div>
        <CardTitle className="text-base font-bold">Blocking UI</CardTitle>
        <CardDescription className="text-xs">Chờ tải xong hoàn chỉnh</CardDescription>
      </CardHeader>
      <CardContent className="text-[12px] text-muted-foreground leading-relaxed flex-1">
        Vô hiệu hóa hoàn toàn cơ chế chuyển hướng tức thời. Client sẽ giữ nguyên giao diện trang cũ cho đến khi Server chuẩn bị xong 100% dữ liệu của trang mới. Thích hợp cho các trang viết Blog, tài liệu đọc tĩnh để tránh giật lag khung hình.
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full text-xs">Xem chi tiết</Button>
      </CardFooter>
    </Card>
  </Column>
</Columns>

### Sự khác biệt về thời gian phản hồi (Latency Benchmarks)

| Phương pháp | Trạng thái hiển thị tức thì (0-50ms) | Thời gian tải toàn bộ dữ liệu | Ngăn ngừa layout shift | Mức độ tải Server |
| :--- | :--- | :--- | :--- | :--- |
| **Stream (Suspense)** | Có (Hiển thị Skeleton) | p99 - 400ms | Trung bình | Thấp |
| **Cache ('use cache')** | Có (Hiển thị dữ liệu hoàn chỉnh) | p99 - 20ms | Rất cao (Không dịch chuyển) | Cực kỳ thấp |
| **Block (instant = false)** | Không (Màn hình đứng im) | p99 - 420ms | Cao | Cao |

<Tip>
  Nếu bạn đang viết blog hoặc trang tin tức, hãy cấu hình chặn chuyển hướng tức thì để mang lại trải nghiệm đọc liền mạch, tránh tạo ra các khung xương tải trang chớp nháy gây khó chịu mắt:
  \`export const instant = false;\`
</Tip>

<Separator className="my-6" />

## 4. Hướng dẫn từng bước kích hoạt & Thiết kế cấu trúc dự án

Để bắt đầu trải nghiệm và tối ưu hóa ứng dụng của bạn cho Instant Navigations, hãy thực hiện lần lượt theo các bước sau:

<Steps>
  <Step title="Bước 1: Cài đặt phiên bản thử nghiệm (Preview)">
    Cập nhật dự án của bạn lên Next.js phiên bản 16.3 Preview bằng một trong các trình quản lý gói sau:
    
    <CodeGroup>
\`\`\`bash npm
npm install next@preview react@preview react-dom@preview
\`\`\`

\`\`\`bash pnpm
pnpm add next@preview react@preview react-dom@preview
\`\`\`

\`\`\`bash bun
bun add next@preview react@preview react-dom@preview
\`\`\`
    </CodeGroup>
  </Step>

  <Step title="Bước 2: Cấu hình next.config.ts">
    Kích hoạt cơ chế lưu trữ thành phần và tải trước một phần trong file cấu hình dự án của bạn:

\`\`\`typescript next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,     // Bật cơ chế Cache Components mới
  partialPrefetching: true,  // Bật Partial Prefetching
};

export default nextConfig;
\`\`\`
  </Step>

  <Step title="Bước 3: Thiết lập cấu trúc thư mục App Router tối ưu">
    Cấu trúc thư mục của bạn cần phân chia rõ ràng các trang tĩnh và trang động. Dưới đây là mô hình tham khảo chuẩn:

    <Tree>
      <Tree.Folder name="my-nextjs-app" defaultOpen={true} isRoot={true}>
        <Tree.Folder name="src" defaultOpen={true}>
          <Tree.Folder name="app" defaultOpen={true}>
            <Tree.Folder name="dashboard" defaultOpen={true}>
              <Tree.File name="page.tsx" />
              <Tree.File name="loading.tsx" />
            </Tree.Folder>
            <Tree.Folder name="blog" defaultOpen={false}>
              <Tree.File name="[slug].tsx" />
            </Tree.Folder>
            <Tree.File name="layout.tsx" />
            <Tree.File name="page.tsx" />
          </Tree.Folder>
        </Tree.Folder>
        <Tree.File name="next.config.ts" />
        <Tree.File name="package.json" />
      </Tree.Folder>
    </Tree>
  </Step>

  <Step title="Bước 4: Sử dụng Dynamic APIs cẩn thận">
    Khi sử dụng các API động như \`headers()\`, \`cookies()\` hoặc \`searchParams\`, hãy chắc chắn bọc các thành phần tiêu thụ các API này trong một ranh giới \`<Suspense>\`. 
    
    Nếu bạn đọc trực tiếp chúng ở phần đầu của layout, Next.js sẽ coi toàn bộ layout là Dynamic và ngăn cản quá trình tạo Static Shell của cả Route đó.
  </Step>
</Steps>

<Separator className="my-6" />

## 5. Viết kiểm thử tự động (Playwright Testing) cho Instant Navigations

Một trong những cải tiến rất thực tế trong phiên bản 16.3 là helper kiểm thử \`instant()\` từ package \`@next/playwright\`. Công cụ này cho phép bạn viết kiểm thử tự động để kiểm chứng hành vi của trang web khi click chuột chuyển trang, đảm bảo trang đó phản hồi ngay lập tức mà không phải chờ đợi máy chủ xử lý dữ liệu qua mạng.

<CodeGroup>
\`\`\`typescript product-navigation.spec.ts
import { expect, test } from '@playwright/test';
import { instant } from '@next/playwright';

test('Trang chi tiết sản phẩm phải tải khung xương tức thì', async ({ page }) => {
  // 1. Đi tới trang danh mục shop
  await page.goto('/shop');

  // 2. Chặn đứng kết nối mạng và click thử vào link chi tiết sản phẩm
  await instant(page, async () => {
    await page.click('a[href="/products/sneaker-ultra"]');
    
    // 3. Khẳng định: Tiêu đề tĩnh của trang sản phẩm và Skeleton hiển thị ngay lập tức (0ms)
    await expect(page.locator('h1')).toContainText('Sneaker Ultra');
    await expect(page.getByText('Đang kết nối kho hàng...')).toBeVisible();
  });

  // 4. Khẳng định: Sau khi kết nối mạng hoàn tất, thông tin động hiển thị đầy đủ
  await expect(page.getByText('Còn lại: 15 đôi trong kho')).toBeVisible();
});
\`\`\`
</CodeGroup>

<Warning>
  **Lưu ý quan trọng khi chạy test:** Công cụ Instant Insights trong quá trình chạy ở môi trường phát triển (Local Dev) sẽ báo lỗi trực tiếp trên màn hình nếu có bất kỳ Route nào được cấu hình chuyển trang tức thì nhưng lại bị block hoặc phản hồi chậm do thiết kế UI chưa bọc đúng Suspense.
</Warning>

<Separator className="my-6" />

## 6. Cạm bẫy thiết kế: Lỗi thường gặp và Giới hạn

Mặc dù Instant Navigations rất mạnh mẽ, việc chuyển đổi từ mô hình cũ có thể khiến bạn gặp phải một số lỗi kiến trúc khó chịu. Dưới đây là những điểm cần lưu ý:

### 1. Bẫy truy cập Dynamic Params trong Layout (Layout Param Access)
Khi bạn bật \`partialPrefetching: true\`, nếu bạn truy cập vào \`params\` trực tiếp trong thành phần Layout để lấy dữ liệu, layout đó sẽ tự động bị chuyển sang chế độ Block. 
Next.js không thể xây dựng Static Shell cho trang con vì chính bộ khung của trang cha (layout) đã trở nên động.

*Cách giải quyết:* Hãy chuyển logic lấy dữ liệu phụ thuộc vào \`params\` xuống trực tiếp thành phần \`page.tsx\` hoặc các thành phần con nằm sâu hơn và bọc chúng trong \`<Suspense>\`.

### 2. Sự cố tương thích trên Safari khi chạy ở môi trường Dev
Vercel ghi nhận một số lỗi liên quan đến việc bắt gói tin và báo cáo lỗi Instant Insights trên trình duyệt Safari ở môi trường phát triển cục bộ. Bạn nên sử dụng Chrome hoặc Firefox để nhận cảnh báo chuẩn xác nhất.

<Danger>
  **Cảnh báo dự án Production:**
  Do đây vẫn là phiên bản Preview, cấu trúc của cache và cách lưu trữ CDN có thể thay đổi trong các bản cập nhật sắp tới. Hãy cân nhắc kỹ và thử nghiệm diện rộng trong môi trường Staging trước khi chính thức đưa vào sản xuất cho người dùng thực tế.
</Danger>

<Separator className="my-6" />

## 7. Bảng Thử Nghiệm Tương Tác: Thử nghiệm MDX Builder Components

Để giúp bạn trực quan hóa việc phát triển và kiểm tra trải nghiệm, dưới đây là một khu vực tương tác nhỏ được xây dựng hoàn toàn từ các MDX components:

<Accordion>
  <AccordionItem value="interactive-mdx-demo">
    <AccordionTrigger>Bảng Điều Khiển & Góp Ý Bản Thử Nghiệm</AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4 p-4 rounded-xl border border-border/80 bg-muted/10 my-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Bạn có thể điền thông tin và đóng góp ý kiến về bài viết bên dưới để kiểm tra khả năng tích hợp sẵn của các trường nhập liệu trong MDX Builder:
        </p>
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Email của bạn:</span>
            <Input type="email" placeholder="email@developer.com" className="max-w-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Nội dung góp ý / Ý kiến về Partial Prefetching:</span>
            <Textarea placeholder="Tôi cảm thấy cơ chế tải trước theo Route rất tiện lợi..." />
          </div>
          <div className="flex items-center gap-3">
            <Switch id="notify-updates-switch" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-xs underline text-vanixjnk cursor-pointer font-medium">Bật thông báo cập nhật Next.js 16.3</span>
                </TooltipTrigger>
                <TooltipContent>Hệ thống sẽ gửi email cho bạn khi Next.js phát hành phiên bản 16.3 Stable.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
</Accordion>

<Separator className="my-6" />

## 8. Câu hỏi thường gặp (FAQs)

<Accordion type="single" collapsible className="w-full border border-border/60 rounded-xl px-4 py-2 bg-muted/5">
  <AccordionItem value="faq-1">
    <AccordionTrigger className="text-sm font-bold">Bật 'cacheComponents' có làm tăng dung lượng lưu trữ trên máy chủ không?</AccordionTrigger>
    <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
      Không. \`cacheComponents\` thực tế giúp đơn giản hóa cơ chế lưu trữ của Next.js bằng cách đưa ứng dụng về cơ chế mặc định là Dynamic (không tự động cache ngầm). Điều này giúp giảm thiểu việc lưu trữ rác dữ liệu không mong muốn và giúp bạn kiểm soát bộ nhớ cache một cách tường minh hơn.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="faq-2">
    <AccordionTrigger className="text-sm font-bold">Tôi có cần thay thế toàn bộ thẻ \`<Link>\` cũ khi chuyển sang Next.js 16.3 không?</AccordionTrigger>
    <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
      Không cần thiết. Mọi thẻ \`<Link>\` cũ sẽ tự động kế thừa cơ chế Partial Prefetching mới (chỉ prefetch Loading Shell tĩnh của Route một lần). Nếu bạn muốn prefetch sâu hơn và tải thêm dữ liệu động đã cache, bạn mới cần thêm thuộc tính \`prefetch={true}\` vào thẻ \`<Link>\`.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="faq-3">
    <AccordionTrigger className="text-sm font-bold">Tại sao ứng dụng của tôi không kích hoạt prefetching trong môi trường Local Dev?</AccordionTrigger>
    <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
      Đây là hành vi mặc định nhằm tiết kiệm tài nguyên máy tính cá nhân của bạn trong lúc viết code. Các tính năng tải trước prefetch thực tế chỉ được kích hoạt trong môi trường build Production. Ở Local Dev, bạn có thể mô phỏng và kiểm tra bộ khung shell bằng công cụ **Navigation Inspector** tích hợp trong Next.js DevTools.
    </AccordionContent>
  </AccordionItem>
</Accordion>

---

Nếu bạn muốn đóng góp ý kiến hoặc báo cáo lỗi trực tiếp cho đội ngũ phát triển Vercel, hãy tham gia thảo luận tại [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions/95130). Chúc các bạn có những dự án tối ưu và đạt tốc độ phản hồi tuyệt vời với Next.js 16.3!`;

// 5. Hàm chạy Seeding dữ liệu
async function runSeed() {
  try {
    console.log("----------------------------------------------------------------");
    console.log("BẮT ĐẦU NẠP BÀI VIẾT: NEXT.JS 16.3 INSTANT NAVIGATIONS...");
    console.log("----------------------------------------------------------------");

    // Dynamic import các module dự án sau khi đã thiết lập biến môi trường ở trên
    const { db } = await import("./src/server/db");
    const { blogs } = await import("./src/server/db/schemas/blog.schema");
    const { eq } = await import("drizzle-orm");

    const blogPost = {
      title: "Next.js 16.3: Tại sao Vercel khai tử cơ chế Prefetch cũ và cách Instant Navigations định nghĩa lại trải nghiệm Single Page App",
      slug: "next-16-3-instant-navigations",
      description: "Khám phá bộ công cụ Instant Navigations mới trong Next.js 16.3 giúp xóa nhòa ranh giới giữa mô hình Server-driven và sự mượt mà của Client-driven SPA.",
      isActive: true,
      publishedAt: new Date("2026-06-25T09:00:00.000Z"),
      thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-g81ej4g81ej4g81e-1782615979101.jpg",
      metaTitle: "Next.js 16.3: Instant Navigations - Vani Studio",
      metaDescription: "Khám phá chi tiết Instant Navigations, Cache Components và Partial Prefetching trong Next.js 16.3 nhằm tối ưu tốc độ chuyển trang tức thì.",
      metaKeywords: "nextjs 16.3, instant navigations, cache components, partial prefetching, react, web development, nextjs, frontend",
      tags: ["nextjs", "react", "web-development", "frontend"],
      content: mdxContent,
      views: 0,
      likes: 0,
      readingTime: 12,
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
