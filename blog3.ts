import * as fs from "fs";
import * as path from "path";

// ==========================================
// 1. CẤU HÌNH DATABASE URL TẠI ĐÂY
// Bạn có thể nhập chuỗi kết nối PostgreSQL của mình vào biến DATABASE_URL bên dưới.
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

// 4. Nội dung bài viết MDX siêu chi tiết về Astro 7.0 (Sử dụng các component hỗ trợ trong mdx-builder)
const mdxContent = `# Astro 7.0 Trình Làng: Bản Cập Nhật Tập Trung Hoàn Toàn Vào Hiệu Năng & Tốc Độ Biên Dịch

Astro 7 đã chính thức ra mắt! Phiên bản phát hành lần này được định nghĩa bằng một yếu tố cốt lõi duy nhất: **Tốc độ (Speed)**. 

Toàn bộ trình biên dịch component \`.astro\` đã được viết lại bằng Rust. Quy trình xử lý và biên dịch Markdown/MDX giờ đây được đảm nhận bởi một pipeline mới hoàn toàn chạy bằng Rust. Động cơ kết xuất (rendering engine) cũng đã được thay thế bằng một giải pháp tối ưu hơn dựa trên cơ chế hàng đợi (Queued Rendering). 

Hợp tác cùng Vite 8 và bộ đóng gói mã nguồn (bundler) Rolldown viết bằng Rust, Astro 7 giúp tăng tốc độ build từ **15% đến 61%** trong các bài kiểm tra hiệu năng (benchmark) thực tế.

Nhưng tốc độ biên dịch nhanh nhất chính là việc không cần biên dịch lại từ đầu. Vì vậy, Astro 7 cũng chính thức ổn định tính năng **Route Caching** và giới thiệu các CDN Cache Providers thử nghiệm cho Netlify, Vercel và Cloudflare.

Bên cạnh đó, Astro 7 còn mang lại quyền kiểm soát tuyệt đối vòng đời request thông qua điểm truy cập **Advanced Routing (src/fetch.ts)**. Đối với kỷ nguyên lập trình có sự hỗ trợ của trí tuệ nhân tạo, Astro 7.0 đi tiên phong khi bổ sung khả năng tự động phát hiện các **AI Coding Agents**, hỗ trợ chạy Dev Server dưới nền và xuất log định dạng JSON có cấu trúc để các agent dễ dàng phân tích cú pháp.

<Separator className="my-6" />

## Nâng cấp ngay bây giờ

Để nâng cấp tự động một dự án hiện có lên Astro 7, hãy sử dụng công cụ CLI tự động \`@astrojs/upgrade\`:

<CodeGroup>
\`\`\`bash npm
npx @astrojs/upgrade
\`\`\`

\`\`\`bash pnpm
pnpm dlx @astrojs/upgrade
\`\`\`

\`\`\`bash yarn
yarn dlx @astrojs/upgrade
\`\`\`

\`\`\`bash bun
bunx @astrojs/upgrade
\`\`\`
</CodeGroup>

Hoặc nếu bạn muốn nâng cấp thủ công:

<CodeGroup>
\`\`\`bash npm
npm install astro@latest
\`\`\`

\`\`\`bash pnpm
pnpm add astro@latest
\`\`\`

\`\`\`bash yarn
yarn add astro@latest
\`\`\`

\`\`\`bash bun
bun add astro@latest
\`\`\`
</CodeGroup>

Đối với các dự án mới, bạn khởi tạo bằng lệnh:

<CodeGroup>
\`\`\`bash npm
npm create astro@latest
\`\`\`

\`\`\`bash pnpm
pnpm create astro@latest
\`\`\`

\`\`\`bash yarn
yarn create astro
\`\`\`

\`\`\`bash bun
bun create astro@latest
\`\`\`
</CodeGroup>

Xem thêm tại [hướng dẫn nâng cấp](https://docs.astro.build/en/guides/upgrade-to/v7/) để biết các bước di chuyển chi tiết.

## 1. Vite 8 & Rolldown: Động Cơ Bundler Hợp Nhất Thế Hệ Mới

Astro 7 chính thức nâng cấp lên **Vite 8** – phiên bản Vite lớn nhất và đột phá nhất trong nhiều năm qua. Thay đổi mang tính tiêu điểm là Vite giờ đây tích hợp sẵn **Rolldown**, một bộ đóng gói mã nguồn (bundler) viết bằng Rust được thiết kế để thay thế hoàn toàn cả esbuild lẫn Rollup.

<Columns cols={2}>
  <Column>
    <Card className="h-full border-border/80 bg-card">
      <CardHeader>
        <CardTitle className="text-base font-bold text-foreground">Hợp Nhất Động Cơ</CardTitle>
        <CardDescription className="text-xs">Thay thế Rollup & esbuild</CardDescription>
      </CardHeader>
      <CardContent className="text-[13px] text-muted-foreground space-y-2">
        <p>Trước đây, Vite dùng esbuild cho môi trường dev và Rollup cho production. Rolldown đảm nhận cả hai vai trò này để đồng bộ hóa hành vi biên dịch.</p>
        <p>Rolldown nhanh hơn **10x đến 30x** so với Rollup trong các bài test benchmark độc lập nhờ viết hoàn toàn bằng Rust.</p>
      </CardContent>
    </Card>
  </Column>
  <Column>
    <Card className="h-full border-border/80 bg-card">
      <CardHeader>
        <CardTitle className="text-base font-bold text-foreground">Khả Năng Tương Thích</CardTitle>
        <CardDescription className="text-xs">Không phá vỡ dự án</CardDescription>
      </CardHeader>
      <CardContent className="text-[13px] text-muted-foreground space-y-2">
        <p>Vite 8 cung cấp một lớp tương thích tự động chuyển dịch các tùy chọn cấu hình cũ của \`esbuild\` và \`rollupOptions\` sang Rolldown tương ứng.</p>
        <p>Hệ thống plugin của Rolldown tương thích ngược với Rollup và Vite, giúp hầu hết các plugin tùy biến hoạt động bình thường.</p>
      </CardContent>
    </Card>
  </Column>
</Columns>

---

## 2. Phân Tích Hiệu Năng: Cách Astro 7 Tối Ưu Hóa Quá Trình Build

Để hiểu tại sao Astro 7 lại nhanh hơn, chúng ta cần nhìn vào cách một dự án Astro được đóng gói (build):

1. **Bước 1 (Đóng gói mã nguồn):** Gom tất cả các trang, nội dung (content), và client components của ứng dụng để đóng gói thành mã JavaScript.
2. **Bước 2 (Kết xuất tĩnh):** Chạy mã nguồn đã đóng gói này giống như một máy chủ mini, gửi request đến từng trang được cấu hình render trước (prerendered) và lưu kết quả trả về thành các file HTML tĩnh.

Astro 7 cải thiện mạnh mẽ cả hai bước trên, nhưng tập trung đặc biệt vào **Bước 1**. Những cải tiến lớn nhất đến từ việc chuyển đổi các tác vụ xử lý chậm nhất trong quá trình build sang native code viết bằng Rust. 

Trong các thử nghiệm benchmark thực tế trên máy **MacBook Pro Apple M4 Pro (48 GB RAM)**, thời gian build tổng thể được rút ngắn đáng kể:

| Dự án thử nghiệm | Đường dẫn tài liệu | Mức độ cải thiện (%) |
| :--- | :--- | :--- |
| **Astro Docs** | docs.astro.build | **Giảm 35% thời gian build** |
| **Astro Homepage** | astro.build | **Giảm 18% thời gian build** |
| **BiomeJS Web** | biomejs.dev | **Giảm 15% thời gian build** |
| **Cloudflare Docs** | developers.cloudflare.com | **Giảm 61% thời gian build (Hơn gấp đôi)** |
| **Tauri Web** | tauri.app | **Giảm 42% thời gian build** |
| **Aspire Web** | aspire.dev | **Giảm 25% thời gian build** |

Các trang web sử dụng nhiều component \`.astro\` và Markdown/MDX là những đối tượng nhận được lợi ích lớn nhất, vì đây chính xác là các phần được viết lại hoàn toàn bằng Rust.

---

## 3. Trình Biên Dịch Component .astro Mới Viết Bằng Rust

Trình biên dịch file component \`.astro\` cũ được phát triển bằng Go nay đã được viết lại 100% bằng **Rust**. Dưới sự hỗ trợ của parser **Oxc** và **Lightning CSS** (để xử lý CSS scoping), trình biên dịch mới hoạt động dưới dạng native binary cực kỳ nhanh, đồng thời cung cấp cơ chế WebAssembly (WASM) fallback cho các môi trường chạy đặc biệt.

Trình biên dịch Rust mới tương thích ngược hầu hết với cú pháp cũ, ngoại trừ ba điểm thay đổi hành vi quan trọng sau:

*   **Không còn cơ chế tự động sửa lỗi HTML (No HTML Correction):** Trình biên dịch Go cũ thường tự động can thiệp sửa markup bị viết sai (tự sắp xếp lại thứ tự thẻ, đóng tag bị thiếu, di chuyển node). Cơ chế này tuy tiện lợi nhưng lại thường gây ra các lỗi Hydration nghiêm trọng và khó debug giữa Client và Server. Trình biên dịch Rust mới sẽ kết xuất chính xác những gì bạn viết.
*   **Kiểm soát cú pháp nghiêm ngặt kiểu JSX:** Các thẻ không có tag đóng (như \`<div>Hello\`) hoặc thuộc tính thiếu dấu nháy kết thúc (như \`<div class="Hello >\`) giờ đây sẽ lập tức dừng chương trình và báo lỗi biên dịch (Compile Error).
*   **Xử lý khoảng trắng chuẩn JSX (JSX Whitespace Collapsing):** Khoảng trắng giữa các inline element sẽ được tự động thu gọn giống như cơ chế của React và các framework JSX khác.

<CodeGroup>
\`\`\`astro Cú pháp cũ (Astro 6)
<!-- Tự động thêm khoảng trắng giữa các thẻ -->
<span>Hello</span>
<span>World</span>

<!-- Kết quả kết xuất trên trình duyệt: "Hello World" -->
\`\`\`

\`\`\`astro Cú pháp mới (Astro 7)
<!-- Khoảng trắng xuống dòng bị loại bỏ -->
<span>Hello</span>
<span>World</span>

<!-- Kết quả kết xuất trên trình duyệt: "HelloWorld" -->

<!-- Cách giữ khoảng trắng thủ công: -->
<span>Hello</span>{' '}<span>World</span>
\`\`\`
</CodeGroup>

Mặc dù việc chuyển đổi compiler chỉ đóng góp khoảng **6%** tốc độ cải thiện trên trang tài liệu \`docs.astro.build\` (vì phần lớn thời gian build của trang này bị chiếm dụng bởi xử lý Markdown và đóng gói), nhưng con số này sẽ cộng dồn đáng kể trên các dự án lớn hàng ngìn trang.

---

## 4. Sätteri: Cuộc Cách Mạng Xử Lý Markdown & MDX Tốc Độ Cao

Astro 7 chính thức thay thế pipeline xử lý Markdown và MDX mặc định bằng **Sätteri**, một bộ xử lý viết hoàn toàn bằng Rust được phát triển bởi Erika (thành viên core team Astro). Việc chuyển đổi giúp giảm hơn 1 phút thời gian build cho trang tài liệu của Astro và Cloudflare.

Trước đây, hệ thống Markdown của Astro dựa trên thư viện **unified** (remark, rehype và một chuỗi dài các package JS phụ thuộc). Trên các trang web lớn, mỗi tệp tin Markdown phải được nạp vào JavaScript, duyệt qua hết plugin này đến plugin khác trên toàn bộ cây cú pháp (AST), rồi mới chuyển đổi thành mã HTML. Sätteri loại bỏ hoàn toàn sự cồng kềnh này.

<Info>
  **Tại sao Sätteri lại nhanh vượt trội?**
  Sätteri sử dụng **pulldown-cmark** cho việc parse CommonMark và **Oxc** cho MDX expressions. Đồng thời, kiến trúc plugin của Sätteri cho phép các plugin đăng ký loại node cụ thể mà chúng cần xử lý và bỏ qua các node còn lại, thay vì phải duyệt tuần tự toàn bộ cây cú pháp cho mỗi plugin như Unified.
</Info>

Sätteri tích hợp sẵn nhiều tính năng Markdown mà trước đây bạn phải tự cài đặt plugin ngoài thông qua tùy chọn \`features\`:

\`\`\`typescript astro.config.ts
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

export default defineConfig({
  markdown: {
    processor: satteri({
      features: {
        directive: true,         // Hỗ trợ markdown directives
        math: true,              // Biên dịch toán học LaTeX
        headingAttributes: true, // Cho phép viết thuộc tính tự chế cho tiêu đề
      },
    }),
  },
});
\`\`\`

Nếu dự án của bạn bắt buộc phải dùng các plugin remark/rehype cũ chưa được cập nhật tương thích với Sätteri, bạn vẫn có thể quay lại dùng pipeline cũ thông qua package hỗ trợ chính thức:

\`\`\`typescript astro.config.ts
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkToc from 'remark-toc';

export default defineConfig({
  markdown: {
    processor: unified({
      remarkPlugins: [remarkToc],
    }),
  },
});
\`\`\`

---

## 5. Queued Rendering: Tối Ưu Hóa Bộ Nhớ Render Bằng Hàng Đợi

Được giới thiệu dưới dạng thử nghiệm từ phiên bản 6.0, cơ chế **Queued Rendering** (kết xuất theo hàng đợi) đã chính thức trở nên ổn định và được chọn làm động cơ render mặc định cho Astro 7, mang lại tốc độ render nhanh hơn **~2.4 lần** cho các trang web phức tạp.

Trước đây, Astro kết xuất trang bằng phương pháp đệ quy, nơi các component con được kết xuất bằng cách gọi lại chính hàm render của nó:

\`\`\`typescript Phương pháp đệ quy cũ (Recursive)
export function renderComponentToString(node: unknown): string {
  let destination = "";
  destination += \`<\${node.name}>\`; // Mở thẻ HTML
  
  // Gọi đệ quy lặp lại cho toàn bộ children
  for (const child of node.children) {
    destination += renderComponentToString(child);
  }
  
  destination += \`</\${node.name}>\`; // Đóng thẻ HTML
  return destination;
}
\`\`\`

Phương pháp đệ quy này hoạt động tốt với các trang đơn giản nhưng sẽ gây phình bộ nhớ Stack và tiêu tốn CPU đáng kể khi gặp các trang chứa cấu trúc phân cấp sâu và dày đặc các biểu thức dynamic. 

Động cơ render mới thay thế đệ quy bằng một **hàng đợi (queue hoặc stack) tuyến tính** kết hợp vòng lặp duy nhất:

\`\`\`typescript Thuật toán hàng đợi mới (Queued/Stack)
export function renderComponentToString(root: unknown): string {
  let destination = "";
  destination += \`<\${root.name}>\`;
  
  // Nạp root node vào hàng đợi tuyến tính
  let stack = [root];
  
  while (stack.length > 0) {
    const node = stack.pop();
    
    if (Array.isArray(node)) {
      // Đẩy ngược các node con vào cuối hàng đợi để render trước
      for (let i = node.length - 1; i >= 0; i--) {
        stack.push(node[i]);
      }
      continue;
    }
    
    const nodeType = typeof node;
    if (nodeType === 'string') {
      destination += escapeHTML(node as string);
    }
  }
  
  destination += \`</\${root.name}>\`;
  return destination;
}
\`\`\`

Trong phiên bản thử nghiệm đầu tiên, thuật toán này chạy qua hai giai đoạn: đầu tiên tạo ra danh sách có thứ tự của các component, sau đó lặp qua danh sách để kết xuất. 

Phiên bản chính thức của Astro 7 đã loại bỏ việc tạo danh sách trung gian này. Dữ liệu HTML giờ đây được xuất trực tiếp (flushed) ngay trong quá trình lặp của vòng lặp chính. Điều này giúp giảm thiểu dung lượng RAM tiêu thụ và tối ưu hóa tốc độ vượt trội.

---

## 6. Advanced Routing Với Điểm Đầu Vào src/fetch.ts

Astro khởi đầu như một công cụ tạo trang tĩnh (Static Site Generator). Trải qua nhiều phiên bản phát triển, các tính năng nâng cao như middleware, redirects, rewrites, Actions, sessions, và đa ngôn ngữ (i18n) đã biến Astro thành một framework SSR cực kỳ mạnh mẽ. Tuy nhiên, điều này cũng làm cho vòng đời của một request trở nên phức tạp và khó can thiệp.

Nếu bạn muốn chạy xác thực tài khoản (auth) trước khi Astro Actions kích hoạt, hay đo đếm thời gian phản hồi chỉ riêng xung quanh việc render trang, hoặc thậm chí dùng một API tùy biến để xử lý trước một số đường dẫn, việc cấu hình trước đây là cực kỳ khó khăn.

Astro 7 giải quyết triệt để bài toán này bằng cách giới thiệu tệp tin **\`src/fetch.ts\`**. Khi tệp này tồn tại, Astro sẽ chuyển toàn bộ luồng xử lý request qua fetch handler tiêu chuẩn (tương tự như API của Cloudflare Workers, Deno, và Bun):

\`\`\`typescript src/fetch.ts (Proxy cơ bản)
import { astro, FetchState } from 'astro/fetch';

export default {
  fetch(request: Request) {
    const state = new FetchState(request);

    // Chuyển hướng các request bắt đầu bằng /api sang server backend chuyên biệt
    if (state.url.pathname.startsWith('/api')) {
      const url = new URL(state.url.pathname + state.url.search, 'https://backend-api.example.com');
      return fetch(new Request(url, request));
    }

    // Trả về luồng xử lý mặc định của các trang Astro
    return astro(state);
  }
}
\`\`\`

API này tương thích hoàn toàn với **Hono**, cho phép bạn nạp các middleware của Hono trực tiếp vào ứng dụng Astro:

\`\`\`typescript src/fetch.ts (Tích hợp Hono)
import { astro } from 'astro/hono';
import { Hono } from 'hono';
import { basicAuth } from 'hono/basic-auth';

const app = new Hono();
app.use(basicAuth({ username: 'admin', password: 'secret' }));
app.use(astro()); // Chuyển giao các route còn lại cho Astro xử lý

export default app;
\`\`\`

Đối với các cấu trúc phức tạp hơn, bạn có thể tách biệt các tính năng của Astro thành các middleware riêng lẻ và sắp xếp thứ tự chạy theo ý muốn:

\`\`\`typescript src/fetch.ts (Sắp xếp Middleware nâng cao)
import { Hono } from 'hono';
import { actions, middleware, pages, i18n } from 'astro/hono';
import { auth } from './middleware/auth';
import { timing } from './middleware/timing';

const app = new Hono();

app.use(i18n());
app.use(auth());       // Xác thực chạy TRƯỚC Actions để chặn truy cập lậu
app.use(actions());
app.use(middleware()); // Chạy middleware tiêu chuẩn của Astro
app.use(timing());     // Gắn công cụ đo đếm thời gian xung quanh bước render trang
app.use(pages());      // Thực hiện render trang HTML

export default app;
\`\`\`

Nếu dự án của bạn không tạo file \`src/fetch.ts\`, Astro sẽ tự động vận hành theo luồng xử lý mặc định như trước đây.

---

## 7. Route Caching Ổn Định & Các CDN Cache Providers Edge

Bộ nhớ đệm (caching) cho các trang SSR luôn là một thử thách vì mỗi nhà cung cấp hạ tầng (hosting) lại có một cơ chế cấu hình khác nhau. 

Astro 7 mang đến giải pháp **Route Caching** ổn định với một API hợp nhất không phụ thuộc nền tảng. Bạn chỉ cần bật một nhà cung cấp cache (cache provider), sau đó dùng API \`Astro.cache\` (hoặc \`context.cache\` trong API routes và middleware) để kiểm soát cache trên từng phản hồi theo chuẩn HTTP:

\`\`\`typescript astro.config.ts
import { defineConfig, memoryCache } from 'astro/config';

export default defineConfig({
  cache: {
    provider: memoryCache(), // Sử dụng bộ nhớ trong làm cache mặc định
  },
});
\`\`\`

Và thiết lập cache ngay trên trang component của bạn:

\`\`\`astro src/pages/index.astro
---
Astro.cache.set({
  maxAge: 120, // Lưu cache trong vòng 2 phút
  swr: 60,     // Trả về dữ liệu cũ (stale) trong 1 phút khi đang chạy ngầm revalidate
  tags: ['products'], // Đánh nhãn thẻ tag để xóa cache khi cần
});
---
<!-- Nội dung trang web hiển thị sản phẩm -->
\`\`\`

Bạn cũng có thể định nghĩa luật cache tập trung trong file cấu hình bằng \`routeRules\` để giữ cho mã nguồn trang luôn sạch sẽ:

\`\`\`typescript astro.config.ts
export default defineConfig({
  cache: { provider: memoryCache() },
  routeRules: {
    '/blog/[...path]': { maxAge: 300, swr: 60 },
  },
});
\`\`\`

### Tích hợp Live Content Collections
Ưu điểm vượt trội của Route Caching là khả năng tích hợp chặt chẽ với **Live Content Collections**. Các Live Loader giờ đây có thể tự động đính kèm thông tin cache trực tiếp vào dữ liệu trả về (bao gồm nhãn invalidation tags và mốc thời gian cập nhật gần nhất). 

Bạn chỉ cần truyền trực tiếp đối tượng dữ liệu vào \`Astro.cache.set(entry)\` và hệ thống sẽ tự động phân tích:

\`\`\`astro src/pages/products/[id].astro
---
import { getLiveEntry } from 'astro:content';

const { entry } = await getLiveEntry('products', Astro.params.id);

// Astro tự động đọc cache hint từ loader đính kèm trong entry
Astro.cache.set(entry);
---
\`\`\`

### Xóa Cache Linh Hoạt Qua Webhook Endpoint
Khi nội dung thay đổi trên CMS của bạn, bạn có thể tạo một API Route webhook để yêu cầu dọn dẹp cache một cách có chọn lọc thông qua API \`cache.invalidate()\`:

\`\`\`typescript src/pages/api/revalidate.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cache }) => {
  // Thực tế bạn cần kiểm tra Secret Token của request để bảo mật
  const { slug } = await request.json();

  // Xóa toàn bộ cache của các trang được đánh dấu thẻ 'products'
  await cache.invalidate({ tags: ["products"] });

  // Xóa cache của riêng trang sử dụng product entry này
  await cache.invalidate({ tags: [\`products:\${slug}\`] });

  // Hoặc xóa trực tiếp bộ nhớ đệm của đường dẫn URL cụ thể
  await cache.invalidate({ path: \`/products/\${slug}\` });

  return new Response('Dọn dẹp cache thành công!');
};
\`\`\`

### Kết nối trực tiếp đến Edge Network của CDN
Trong Astro 7, các nhà phát triển có thể tận dụng bộ CDN cache provider thử nghiệm cho **Netlify, Vercel, và Cloudflare** (đang ở chế độ thử nghiệm nội bộ - private beta).

Thay vì lưu bộ nhớ đệm trong RAM của Serverless Function (gây tốn tài nguyên), các nhà cung cấp này sẽ đẩy trực tiếp các thiết lập cache xuống mạng lưới CDN Edge Network. Khi có người truy cập mới, CDN sẽ phản hồi trực tiếp mà không cần khởi chạy lại Serverless Function.

\`\`\`typescript astro.config.ts
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import { cacheNetlify } from '@astrojs/netlify/cache';

export default defineConfig({
  adapter: netlify(),
  cache: {
    provider: cacheNetlify(), // Đẩy chỉ thị cache trực tiếp sang Netlify Edge CDN
  },
});
\`\`\`

Các adapter tương ứng sẽ cung cấp cache provider tương tự từ thư mục \`/cache\` của chúng:
*   \`@astrojs/netlify/cache\` -> \`cacheNetlify()\`
*   \`@astrojs/vercel/cache\` -> \`cacheVercel()\`
*   \`@astrojs/cloudflare/cache\` -> \`cacheCloudflare()\` *(Yêu cầu quyền truy cập Cloudflare Workers Cache private beta).*

---

## 8. Trợ Lực Toàn Diện Cho AI Coding Agents

Các công cụ lập trình AI (AI Coding Agents) ngày nay đã trở thành một phần không thể thiếu trong quy trình làm việc của nhiều lập trình viên. Tuy nhiên, cách các AI Agent tương tác với hệ thống lại rất khác con người. Astro 7.0 là framework tiên phong thực hiện các tối ưu hóa chuyên biệt dành riêng cho các tác nhân AI này.

### Background Dev Server (Chạy ngầm server)
Các tác nhân AI thường gặp khó khăn với các tiến trình chạy liên tục (như dev server). AI Agent thường gửi lệnh, chờ chương trình kết thúc để đọc kết quả đầu ra. Việc dev server chạy vô hạn khiến AI Agent bị treo, khởi chạy trùng lặp nhiều server gây xung đột, hoặc để lại các tiến trình rác (zombie processes) ngốn tài nguyên hệ thống.

Astro 7 bổ sung cờ lệnh \`astro dev --background\`. Khi phát hiện đang chạy trong môi trường của AI Agent, Astro sẽ **tự động chuyển sang chế độ chạy ngầm** mà không cần lập trình viên phải thêm cờ này vào script.

\`\`\`bash Terminal
$ astro dev --background
Dev server running at http://localhost:4321 (pid 12345)
Stop: astro dev stop
Status: astro dev status
Logs: astro dev logs
\`\`\`

Lệnh khởi chạy sẽ chặn (block) cho đến khi dev server sẵn sàng nhận request, thông báo địa chỉ URL kèm mã định danh tiến trình (process ID - pid) rồi tự giải phóng dòng lệnh để AI Agent tiếp tục các bước kiểm tra code tiếp theo.

Hệ thống sử dụng tệp khóa lockfile để ngăn việc khởi chạy trùng lặp. Nếu Agent cố khởi chạy thêm một server thứ hai, hệ thống sẽ trả về trực tiếp thông tin của tiến trình hiện tại:

\`\`\`bash Terminal
$ astro dev --background
Dev server already running at http://localhost:4321 (pid 12345)
\`\`\`

Bạn có thể kiểm tra trạng thái hoặc tắt server chạy ngầm từ các phiên làm việc (shell session) khác:

\`\`\`bash Terminal
$ astro dev status
Dev server running at http://localhost:4321 (pid 12345, uptime 123s, background)

$ astro dev stop
Stopped dev server (pid 12345).
\`\`\`

Tất cả các câu lệnh trên đều đảm bảo tính chất **idempotent (hành vi nhất quán)**. Lệnh tắt server khi không chạy sẽ kết thúc êm đẹp thay vì báo lỗi. Dev server chạy ngầm cũng cung cấp một endpoint kiểm thử trạng thái tại **\`/_astro/status\`** để các AI Agent dễ dàng ping kiểm tra độ sẵn sàng của máy chủ.

### Hệ thống Log JSON cấu trúc
Bộ ghi log (logger) của Astro 7 hiện tại đã có thể cấu hình linh hoạt. JSON Logging được tự động bật cho các AI Agent hoặc cấu hình thủ công qua cờ \`--json\` hoặc file cài đặt:

\`\`\`typescript astro.config.ts
import { defineConfig, logHandlers } from "astro/config";

export default defineConfig({
  logger: logHandlers.json() // Bật ghi log định dạng JSON cấu trúc
});
\`\`\`

Định dạng JSON cấu trúc giúp máy móc và các AI Agent dễ dàng phân tích cú pháp để tìm lỗi thay vì các log màu sắc hiển thị cho con người. Điều này cũng vô cùng hữu ích cho các dự án chạy SSR cần đẩy log về các công cụ tập trung như Kibana, CloudWatch, hay Grafana/Loki.

Bạn cũng có thể gom nhóm các log handler bằng API \`compose()\` để vừa in log đẹp cho người dùng vừa lưu log cấu trúc cho máy quét:

\`\`\`typescript astro.config.ts
import { defineConfig, logHandlers } from "astro/config";

export default defineConfig({
  logger: logHandlers.compose(
    logHandlers.console(), // Log console thông thường
    logHandlers.json()     // Log JSON cấu trúc
  )
});
\`\`\`

---

## Lời Cảm Ơn Đến Cộng Đồng

Astro 7.0 là kết quả của sự nỗ lực làm việc không mệt mỏi từ core team Astro và hàng trăm lập trình viên đóng góp trên toàn thế giới. 

Đặc biệt cảm ơn đội ngũ phát triển nòng cốt: *Alexander Niebuhr, Armand Philippot, Chris Swithinbank, Emanuele Stoppa, Erika, Florian Lefebvre, Fred Schott, HiDeoo, Luiz Ferraz, Matt Kane, Matthew Phillips, Reuben Tier, Sarah Rainsberger, và Yan Thomas*, cùng toàn thể các thành viên đóng góp mã nguồn và tài liệu cho phiên bản tuyệt vời này.

Hãy cùng nâng cấp và trải nghiệm tốc độ tối đa của **Astro 7.0** cùng team Vani Studio nhé!`;

// 5. Hàm chạy Seeding dữ liệu
async function runSeed() {
  try {
    console.log("----------------------------------------------------------------");
    console.log("BẮT ĐẦU NẠP BÀI VIẾT: ASTRO 7.0 RELEASE (BẢN ĐẦY ĐỦ)...");
    console.log("----------------------------------------------------------------");

    // Dynamic import các module dự án sau khi đã thiết lập biến môi trường ở trên
    const { db } = await import("./src/server/db");
    const { blogs } = await import("./src/server/db/schemas/blog.schema");
    const { eq } = await import("drizzle-orm");

    const blogPost = {
      title: "Astro 7.0 Trình Làng: Bản Cập Nhật Tập Trung Hoàn Toàn Vào Hiệu Năng & Tốc Độ Biên Dịch",
      slug: "astro-7-0-release-speed-rust-compiler",
      description: "Đánh giá cực kỳ chi tiết tất cả các nâng cấp hiệu năng cốt lõi trên Astro 7.0: Bộ biên dịch Rust, bộ xử lý Markdown Sätteri, Advanced Routing (src/fetch.ts), Route Caching và các tối ưu hóa đột phá hỗ trợ AI Coding Agents.",
      isActive: true,
      publishedAt: new Date("2026-06-29T10:00:00.000Z"),
      thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-n0r47yn0r47yn0r4-1782674516722.jpg",
      metaTitle: "Astro 7.0 Trình Làng: Trình Biên Dịch Rust & Advanced Routing - Vani Studio",
      metaDescription: "Đánh giá chi tiết toàn bộ cải tiến đột phá trong Astro 7.0 với trình biên dịch Rust mới, Sätteri Markdown, Advanced Routing, Route Caching và các hỗ trợ chuyên biệt cho AI Agents.",
      metaKeywords: "astro 7.0, astro framework, rust compiler, satteri markdown, advanced routing, vite 8, rolldown, ai coding agents, route caching, web development, queued rendering, memory cache, cdn providers",
      tags: ["astro", "frontend", "architecture", "web-development"],
      content: mdxContent,
      views: 0,
      likes: 0,
      readingTime: 20,
    };

    console.log(`Dọn dẹp bài viết cũ có cùng slug: "${blogPost.slug}"...`);
    await db.delete(blogs).where(eq(blogs.slug, blogPost.slug));

    console.log("Đang thêm bài viết mới vào database...");
    await db.insert(blogs).values(blogPost);

    console.log("----------------------------------------------------------------");
    console.log("ĐÃ NẠP THÀNH CÔNG BÀI VIẾT BẢN ĐẦY ĐỦ!");
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
