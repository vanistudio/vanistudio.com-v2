import { type NewBlog } from "@/server/db/schemas/blog.schema";

export const DEFAULT_BLOGS: Omit<NewBlog, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "Cloudflare đồng hành cùng sứ mệnh của Vite: Kỷ nguyên mới của Web Tooling",
    slug: "cloudflare-supports-vite-mission",
    description: "Khám phá chi tiết thương vụ sáp nhập VoidZero của Cloudflare cùng quỹ đầu tư 1 triệu USD dành riêng cho hệ sinh thái Vite, đánh dấu bước chuyển mình quan trọng của toàn bộ giới phát triển web.",
    isActive: true,
    publishedAt: new Date("2026-06-04T09:00:00.000Z"),
    thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-4nmzf64nmzf64nmz-1781451575572.jpg",
    metaTitle: "Cloudflare Đồng Hành Cùng Sứ Mệnh Của Vite | Vani Studio",
    metaDescription: "Tìm hiểu chi tiết thương vụ sáp nhập VoidZero của Cloudflare và tác động to lớn của quỹ đầu tư 1 triệu USD đối với sự phát triển của Vite, Rolldown và Oxc.",
    metaKeywords: "cloudflare, vite, voidzero, evan you, rolldown, oxc, web tooling, open source",
    content: `# Cloudflare đồng hành cùng sứ mệnh của Vite: Kỷ nguyên mới của Web Tooling

Vào ngày 4 tháng 6 năm 2026, thế giới phát triển web đã chứng kiến một cột mốc lịch sử khi **Cloudflare** chính thức công bố việc mua lại **VoidZero** — công ty đứng sau hệ sinh thái công cụ JavaScript thế hệ mới bao gồm Vite, Vitest, Rolldown và Oxc. 

Thương vụ này không chỉ đơn thuần là một cuộc sáp nhập doanh nghiệp, mà còn mở ra một chương mới đầy hứa hẹn cho tương lai của hệ sinh thái web nguồn mở.

<Separator className="my-6" />

## 1. VoidZero gia nhập Cloudflare và Cam kết của Evan You

Đội ngũ sáng lập VoidZero, dẫn đầu bởi **Evan You** (cha đẻ của Vue.js và Vite), sẽ chính thức đầu quan cho tổ chức Công nghệ Mới nổi & Ươm tạo (Emerging Technology and Incubation - ETI) của Cloudflare. Quyết định này được đưa ra dựa trên sự đồng điệu sâu sắc về tầm nhìn công nghệ giữa hai bên.

<Alert variant="default" className="border-vanixjnk/20 bg-vanixjnk/5 text-foreground my-6">
  <Icon icon="solar:info-square-line-duotone" className="size-5 text-vanixjnk" />
  <AlertTitle className="text-vanixjnk font-bold">Cam kết từ Evan You</AlertTitle>
  <AlertDescription className="text-sm leading-relaxed mt-1 text-muted-foreground">
    "Sứ mệnh của chúng tôi tại VoidZero luôn là xây dựng thế hệ công cụ phát triển nhanh nhất cho web. Gia nhập Cloudflare giúp chúng tôi đảm bảo nguồn tài chính vững chắc và lâu dài để tiếp tục hiện thực hóa sứ mệnh đó dưới dạng nguồn mở phi lợi nhuận."
  </AlertDescription>
</Alert>

Mặc dù gia nhập Cloudflare, đội ngũ VoidZero khẳng định các dự án cốt lõi sẽ luôn giữ vững các nguyên tắc nền tảng sau:

- **Nguồn mở hoàn toàn (MIT License):** Vite, Vitest, Rolldown, Oxc và Vite+ sẽ tiếp tục được phát triển miễn phí dưới giấy phép MIT.
- **Độc lập và Trung lập (Vendor-Agnostic):** Vite sẽ không bị ràng buộc riêng cho Cloudflare. Các ứng dụng xây dựng bằng Vite sẽ chạy mượt mà trên bất kỳ nhà cung cấp hạ tầng nào khác (Vercel, Netlify, AWS, v.v.).
- **Quản trị cộng đồng:** Lộ trình phát triển vẫn do đội ngũ nòng cốt (Vite Core Team) và cộng đồng cùng quyết định.

<Separator className="my-6" />

## 2. Quỹ Hệ sinh thái Vite trị giá 1 triệu USD

Để minh chứng cho cam kết phát triển bền vững và trung lập của hệ sinh thái, Cloudflare đã thiết lập một **Quỹ hệ sinh thái độc lập trị giá 1 triệu USD**.

<Card className="border-border/60 bg-card my-6">
  <CardHeader>
    <CardTitle className="text-lg">Chi tiết phân bổ Quỹ hệ sinh thái Vite</CardTitle>
    <CardDescription>Mục tiêu phân bổ dòng vốn hỗ trợ cộng đồng</CardDescription>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-muted/20 border border-border/40">
        <h4 className="font-bold text-foreground mb-1 text-sm">Nhà phát triển cốt lõi</h4>
        <span className="text-xs text-muted-foreground block">Tài trợ trực tiếp cho các maintainer độc lập để họ tập trung 100% thời gian tối ưu hóa lõi Vite.</span>
      </div>
      <div className="p-4 rounded-xl bg-muted/20 border border-border/40">
        <h4 className="font-bold text-foreground mb-1 text-sm">Hệ sinh thái Plugin</h4>
        <span className="text-xs text-muted-foreground block">Hỗ trợ các tác giả của những plugin và công cụ tích hợp phổ biến thuộc cộng đồng Vite rộng lớn.</span>
      </div>
      <div className="p-4 rounded-xl bg-muted/20 border border-border/40">
        <h4 className="font-bold text-foreground mb-1 text-sm">Bảo mật & Hiệu năng</h4>
        <span className="text-xs text-muted-foreground block">Đầu tư vào các chiến dịch kiểm định bảo mật định kỳ và nghiên cứu tối ưu hóa hiệu năng biên dịch cực hạn.</span>
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <span className="text-xs text-muted-foreground">Quỹ này hoạt động độc lập và bổ trợ trực tiếp cho quỹ Open Collective hiện tại của Vite.</span>
  </CardFooter>
</Card>

<Separator className="my-6" />

## 3. Tương lai của Rolldown, Oxc và Sự dịch chuyển của Cloudflare

Sự gia nhập của VoidZero mang lại cho Cloudflare cơ hội tối ưu hóa toàn bộ hệ thống phát triển cục bộ và trên Cloudflare Workers. Bản thân Cloudflare cũng đang lên kế hoạch dịch chuyển toàn bộ hạ tầng tooling của họ sang hệ sinh thái Vite.

<Tabs defaultValue="rolldown" className="w-full my-6">
  <TabsList className="bg-muted/40 p-1">
    <TabsTrigger value="rolldown">Rolldown (Rust-based Bundler)</TabsTrigger>
    <TabsTrigger value="oxc">Oxc (Rust Linter & Parser)</TabsTrigger>
    <TabsTrigger value="integration">Tích hợp Cloudflare Workers</TabsTrigger>
  </TabsList>
  <TabsContent value="rolldown" className="p-4 border rounded-xl mt-2 space-y-2">
    <h4 className="font-bold text-sm text-foreground">Trọng tâm phát triển Rolldown</h4>
    <span className="text-xs text-muted-foreground leading-relaxed block">
      Rolldown là bundler viết bằng Rust có tính tương thích cực cao với API của Rollup. Việc đẩy mạnh phát triển Rolldown sẽ giúp cải thiện đáng kể tốc độ build sản phẩm cuối cùng của Vite, loại bỏ các nút thắt hiệu năng hiện tại khi chuyển dịch từ môi trường dev (sử dụng Esbuild) sang production.
    </span>
  </TabsContent>
  <TabsContent value="oxc" className="p-4 border rounded-xl mt-2 space-y-2">
    <h4 className="font-bold text-sm text-foreground">Sức mạnh từ Oxc</h4>
    <span className="text-xs text-muted-foreground leading-relaxed block">
      Oxc là bộ công cụ phân tích cú pháp JavaScript/TypeScript siêu nhanh bằng Rust. Nó nhanh gấp nhiều lần so với các công cụ cũ như Babel hay ESLint, giúp rút ngắn thời gian linter và type-checking xuống còn một phần nhỏ của giây.
    </span>
  </TabsContent>
  <TabsContent value="integration" className="p-4 border rounded-xl mt-2 space-y-2">
    <h4 className="font-bold text-sm text-foreground">Đưa Cloudflare Workers lên tầm cao mới</h4>
    <span className="text-xs text-muted-foreground leading-relaxed block">
      Sự kết hợp giữa tooling hiệu năng cao từ Rust của VoidZero và runtime V8 cực nhanh của Cloudflare Workers hứa hẹn mang lại trải nghiệm phát triển từ local đến production liền mạch, loại bỏ độ trễ và sự khác biệt về môi trường thực thi.
    </span>
  </TabsContent>
</Tabs>

<Separator className="my-6" />

## 4. Hỏi đáp nhanh (FAQ) về sự kiện này

Dưới đây là một số thông tin giải đáp nhanh cho cộng đồng lập trình viên đang quan tâm về bước đi chiến lược này:

<Accordion type="single" collapsible className="w-full border border-border/60 rounded-xl px-4 py-2 bg-muted/10 my-6">
  <AccordionItem value="faq-1">
    <AccordionTrigger className="text-sm font-bold">Vite có bị độc quyền bởi Cloudflare hay không?</AccordionTrigger>
    <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
      Không. Vite vẫn là một dự án nguồn mở độc lập với sự quản lý của cộng đồng và các đối tác đóng góp lớn. Tôn chỉ của Vite là trung lập về nhà cung cấp (vendor-agnostic).
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="faq-2">
    <AccordionTrigger className="text-sm font-bold">Quỹ 1 triệu USD hoạt động như thế nào?</AccordionTrigger>
    <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
      Quỹ được quản lý độc lập để cấp ngân sách hỗ trợ cho các maintainer, nhà phát triển plugin, và tổ chức các sự kiện kỹ thuật nhằm củng cố tính bảo mật và sự đa dạng của hệ sinh thái Vite.
    </AccordionContent>
  </AccordionItem>
</Accordion>

## Kết luận

Sự kết hợp giữa một người khổng lồ hạ tầng Internet như **Cloudflare** và bộ não đứng sau hệ sinh thái tooling phổ biến bậc nhất **VoidZero** hứa hẹn sẽ mang đến những bước tiến nhảy vọt cho công nghệ Web Tooling trong những năm tới. Lập trình viên trên toàn cầu sẽ là những người được hưởng lợi trực tiếp từ những công cụ ngày một nhanh hơn, ổn định hơn và hoàn toàn mở.
`,
  },
  {
    title: "Next.js đa nền tảng: Đưa React Server Components vượt giới hạn trình duyệt",
    slug: "nextjs-across-platforms",
    description: "Tìm hiểu kiến trúc mới của Next.js cho phép chạy ứng dụng trên đa nền tảng từ Web, Mobile (React Native) đến môi trường Desktop mà vẫn giữ nguyên mô hình Server Components.",
    isActive: true,
    publishedAt: new Date("2026-06-12T09:00:00.000Z"),
    thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-g11s67g11s67g11s-1781451910666.jpg",
    metaTitle: "Next.js Đa Nền Tảng: Tương Lai Của Ứng Dụng React | Vani Studio",
    metaDescription: "Khám phá cách Next.js định hình lại quy trình phát triển đa nền tảng bằng việc đưa React Server Components và mô hình routing đồng nhất vào React Native và Desktop.",
    metaKeywords: "nextjs, react native, expo, server components, multiplatform, crossplatform, react, vercel",
    content: `# Next.js đa nền tảng: Đưa React Server Components vượt giới hạn trình duyệt

Tại các hội nghị lập trình gần đây, Vercel cùng đội ngũ phát triển Next.js đã chia sẻ tầm nhìn và lộ trình kỹ thuật mang tính đột phá: **Next.js Across Platforms** (Next.js trên đa nền tảng). 

Mục tiêu lớn nhất là đưa trải nghiệm lập trình đỉnh cao của React Server Components (RSC) và App Router vượt ra ngoài trình duyệt web truyền thống để thống trị cả môi trường ứng dụng di động (Mobile) và máy tính để bàn (Desktop).

<Separator className="my-6" />

## 1. Triết lý "Write Once, Run Everywhere" được nâng cấp

Trước đây, lập trình viên React thường phải duy trì hai luồng mã nguồn riêng biệt: một dự án Web sử dụng Next.js và một ứng dụng di động sử dụng React Native hoặc Expo.

Với định hướng mới, Next.js đóng vai trò là lõi kiến trúc quản lý định tuyến (routing), quản lý dữ liệu (data fetching), và tối ưu hóa tài nguyên chung, trong khi các đầu ra (target output) sẽ tự động khớp với nền tảng đích:

- **Web:** Render ra HTML chuẩn, tối ưu hóa SEO với CSS truyền thống.
- **Mobile (iOS/Android):** Chuyển dịch cấu trúc cây thành phần (component tree) của React Server Components thành mã giao diện gốc (Native UI Components) thông qua Expo.
- **Desktop (macOS/Windows):** Đóng gói thành các ứng dụng siêu nhẹ sử dụng cấu trúc tương tự Electron hoặc Tauri nhưng hiệu quả hơn nhờ kết xuất phía máy chủ (Server Rendering).

<Separator className="my-6" />

## 2. Mô hình Server Components trên ứng dụng di động hoạt động thế nào?

Việc áp dụng RSC trên di động giải quyết bài toán tải dữ liệu chậm và kích thước ứng dụng phình to.

<Card className="border-border/60 bg-card my-6">
  <CardHeader>
    <CardTitle className="text-lg">Quy trình thực thi RSC trên Mobile</CardTitle>
    <CardDescription>Cách dữ liệu và giao diện được xử lý từ máy chủ đến thiết bị</CardDescription>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-muted/20 border border-border/40">
        <h4 className="font-bold text-foreground mb-1 text-sm">1. Server Execution</h4>
        <span className="text-xs text-muted-foreground block">Máy chủ thực thi Server Component, kết nối cơ sở dữ liệu và gọi API trực tiếp với độ trễ cực thấp.</span>
      </div>
      <div className="p-4 rounded-xl bg-muted/20 border border-border/40">
        <h4 className="font-bold text-foreground mb-1 text-sm">2. Payload Serialization</h4>
        <span className="text-xs text-muted-foreground block">Thay vì trả về HTML, máy chủ serialize cây component thành một luồng dữ liệu JSON đặc biệt (RSC Payload).</span>
      </div>
      <div className="p-4 rounded-xl bg-muted/20 border border-border/40">
        <h4 className="font-bold text-foreground mb-1 text-sm">3. Native Reconciliation</h4>
        <span className="text-xs text-muted-foreground block">Ứng dụng khách (React Native Client) tiếp nhận payload và chuyển đổi trực tiếp thành các widget UI gốc của iOS/Android.</span>
      </div>
    </div>
  </CardContent>
</Card>

<Alert variant="default" className="border-vanixjnk/20 bg-vanixjnk/5 text-foreground my-6">
  <Icon icon="solar:lightbulb-bold-duotone" className="size-5 text-vanixjnk shrink-0" />
  <div className="flex flex-col">
    <AlertTitle className="text-vanixjnk font-bold">Lợi ích vượt trội</AlertTitle>
    <AlertDescription className="text-sm leading-relaxed mt-1 text-muted-foreground">
      Nhờ Server Components, các thư viện nặng và logic nghiệp vụ phức tạp được thực thi hoàn toàn trên máy chủ. Thiết bị di động của người dùng không cần tải hay chạy lượng code JS này, giúp tối ưu dung lượng pin và tốc độ phản hồi đáng kể.
    </AlertDescription>
  </div>
</Alert>

<Separator className="my-6" />

## 3. Sự hợp tác chặt chẽ giữa Vercel và Expo

Vercel đang làm việc chặt chẽ cùng đội ngũ **Expo** để biến sự kết hợp này trở nên mượt mà nhất có thể thông qua việc chuẩn hóa API định tuyến và chia sẻ các cơ chế caching nâng cao.

<Tabs defaultValue="routing" className="w-full my-6">
  <TabsList className="bg-muted/40 p-1">
    <TabsTrigger value="routing">Unified Routing (Hệ thống định tuyến hợp nhất)</TabsTrigger>
    <TabsTrigger value="data">Data Fetching & Caching</TabsTrigger>
  </TabsList>
  <TabsContent value="routing" className="p-4 border rounded-xl mt-2 space-y-2">
    <h4 className="font-bold text-sm text-foreground">Chia sẻ cấu trúc thư mục App Router</h4>
    <span className="text-xs text-muted-foreground leading-relaxed block">
      Lập trình viên có thể sử dụng cấu trúc thư mục quen thuộc như \`app/(web)/page.tsx\` và \`app/(mobile)/index.tsx\`. Expo Router sẽ kế thừa các cơ chế layout lồng nhau (nested layouts) và middleware bảo vệ tuyến đường y hệt cách Next.js vận hành trên trình duyệt.
    </span>
  </TabsContent>
  <TabsContent value="data" className="p-4 border rounded-xl mt-2 space-y-2">
    <h4 className="font-bold text-sm text-foreground">Hợp nhất tầng dữ liệu</h4>
    <span className="text-xs text-muted-foreground leading-relaxed block">
      Các truy vấn dữ liệu từ khóa \`fetch()\` hay cơ chế Revalidation tự động trên máy chủ của Next.js nay có thể đồng bộ trực tiếp tới trạng thái lưu trữ cục bộ của điện thoại, giúp hỗ trợ tốt cả hai trạng thái kết nối trực tuyến (Online) và ngoại tuyến (Offline).
    </span>
  </TabsContent>
</Tabs>

<Separator className="my-6" />

## 4. Hỏi đáp nhanh (FAQ)

<Accordion type="single" collapsible className="w-full border border-border/60 rounded-xl px-4 py-2 bg-muted/10 my-6">
  <AccordionItem value="faq-1">
    <AccordionTrigger className="text-sm font-bold">Tôi có thể viết một component và dùng chung 100% cho cả Web và App không?</AccordionTrigger>
    <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
      Được một phần lớn. Các logic lấy dữ liệu (RSC) và quản lý trạng thái có thể dùng chung hoàn toàn. Tuy nhiên, phần giao diện trực quan vẫn cần tách biệt linh hoạt nhờ các primitive tương thích đa nền tảng (ví dụ như thư viện React Native Web hoặc các giải pháp UI đa nền tảng).
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="faq-2">
    <AccordionTrigger className="text-sm font-bold">Khi nào tính năng này sẵn sàng cho sản xuất?</AccordionTrigger>
    <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
      Hiện tại các tích hợp sâu đang được thử nghiệm dưới dạng thử nghiệm lập trình viên (Developer Preview). Sự hợp tác bền chặt giữa Vercel và Expo hứa hẹn sẽ mang đến bản phát hành ổn định thương mại trong thời gian ngắn sắp tới.
    </AccordionContent>
  </AccordionItem>
</Accordion>

## Lời kết

**Next.js Across Platforms** chứng minh vị thế dẫn đầu của Next.js và Vercel trong việc định hình lại tiêu chuẩn lập trình ứng dụng hiện đại. Việc xóa nhòa ranh giới giữa phát triển Web và App bằng kiến trúc Server Components hợp nhất chắc chắn sẽ thúc đẩy năng suất làm việc của các lập trình viên lên một tầm cao mới.
`,
  },
];
