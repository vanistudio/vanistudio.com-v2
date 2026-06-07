# Hướng dẫn Kiến trúc và Quy chuẩn Frontend (Frontend Architecture & Guidelines)

Tài liệu này định nghĩa các quy tắc, cấu trúc thư mục, và chuẩn mực phát triển phần giao diện (frontend) cho dự án **VaniStudio**.

---

## 1. Công nghệ cốt lõi (Core Tech Stack)
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS v4 & PostCSS
- **UI Components**: Shadcn UI (xây dựng trên nền `@radix-ui/react`, cấm dùng `@base-ui/react`)
- **API & Data Fetching**: tRPC & `@tanstack/react-query`
- **Icon**: Chỉ sử dụng `@iconify/react` (cấm dùng `lucide-react`)
- **State & Validation**: Zod, React Hooks

---

## 2. Cấu trúc thư mục (Directory Structure)

Thư mục `src/` tuân thủ mô hình phân lớp rõ ràng:

```text
src/
├── app/                  # Routing & Layouts (Next.js App Router)
│   ├── (public)/         # Nhóm route công khai (không cần cấu hình hoặc cấu hình xong)
│   └── (configuration)/  # Nhóm route phục vụ việc cài đặt ban đầu
├── components/           # Các component tái sử dụng
│   ├── ui/               # Component nguyên tử (Primitives/Atomic: Button, Input, Card...)
│   └── contents/         # Component theo nghiệp vụ/trang (Domain-specific: ConfPage, Dashboard...)
├── constants/            # Các hằng số (Ngôn ngữ, Múi giờ, Ngân hàng...)
├── defaults/             # Cấu hình mặc định (ví dụ: default extensions)
├── hooks/                # Custom React Hooks dùng chung
├── lib/                  # Tiện ích chung, cấu hình HTTP client
├── proxies/              # Middleware proxies (Next.js middleware helpers)
├── server/               # Mã nguồn backend chạy trên server (drizzle, routes, services...)
```

---

## 3. Quy chuẩn viết Component

### 3.1. Phân loại Component
1. **UI Components (`src/components/ui/`)**:
   - Là các component dùng chung trên toàn hệ thống (Button, Dialog, Sheet...).
   - Không chứa logic nghiệp vụ (business logic), không kết nối API.
   - Sử dụng thư viện gốc Radix UI (cấm sử dụng Base UI) để đảm bảo khả năng tiếp cận (Accessibility - A11y).
   - Tạo kiểu bằng Tailwind và hỗ trợ tuỳ biến qua prop `className` kết hợp với tiện ích `cn()`.

2. **Content Components (`src/components/contents/`)**:
   - Chứa logic nghiệp vụ của từng trang cụ thể (Ví dụ: `ConfPage.tsx` cho trang `/configuration`).
   - Có nhiệm vụ quản lý state cục bộ, gọi API thông qua tRPC, hiển thị form, thông báo (sonner)...

### 3.2. Server Components (RSC) vs Client Components
- Mặc định, tất cả các file trong thư mục `app/` là **Server Components**. Hãy giữ chúng làm Server Components để tối ưu hiệu năng và SEO.
- Chỉ gắn directive `"use client"` ở đầu tệp khi component thực sự cần:
  - Sử dụng React Hooks (`useState`, `useEffect`, `useContext`, `useRef`).
  - Lắng nghe sự kiện của trình duyệt (click, submit, keypress).
  - Sử dụng các API chỉ có ở trình duyệt (localStorage, window, document).
- Nên đóng gói các phần cần tương tác Client vào các component nhỏ hơn thay vì khai báo cả trang là `"use client"`.

### 3.3. Quy chuẩn cho file `page.tsx` (Page File Conventions)
- Các file `page.tsx` trong thư mục `src/app/` bắt buộc phải là các file cực kỳ tối giản (thin files).
- Các file này chỉ chịu trách nhiệm định nghĩa/xuất **Metadata** phục vụ SEO và thực hiện import component giao diện tương ứng từ thư mục nghiệp vụ `src/components/contents/*/*.tsx` (ví dụ: `src/components/contents/configuration/ConfPage.tsx`).
- Tuyệt đối không viết logic xử lý giao diện, không quản lý state phức tạp, và không viết các đoạn code jsx lớn trực tiếp bên trong file `page.tsx`.

---

## 4. Quản lý trạng thái và Gọi dữ liệu (State & Data Fetching)

### 4.1. Gọi dữ liệu phía Server (Server-side Fetching)
- Đối với dữ liệu tĩnh hoặc dữ liệu hiển thị ban đầu cần SEO tốt, hãy fetch trực tiếp trong Server Component (hoặc sử dụng Server Actions / gọi trực tiếp database qua Drizzle).

### 4.2. Gọi dữ liệu phía Client (Client-side Fetching)
- Sử dụng **tRPC Client** kết hợp **TanStack Query** (`@tanstack/react-query`):
  - Truy vấn dữ liệu: Dùng `trpc.xxxx.useQuery()`.
  - Thay đổi dữ liệu (POST, PUT, DELETE): Dùng `trpc.xxxx.useMutation()`.
- Tuyệt đối không dùng `fetch` thuần hoặc `axios` trực tiếp trong component nghiệp vụ nếu API đó đã được định nghĩa trong tRPC.

### 4.3. Quản lý Form
- Sử dụng React state kết hợp với thư viện xác thực dữ liệu **Zod** để validate phía client trước khi gửi lên API.
- Hiển thị thông báo phản hồi (success, error) thông qua thư viện `sonner`.

---

## 5. Thiết kế và Styling (Tailwind CSS v4)

- **Quy tắc màu sắc (Mắt nhìn và thẩm mỹ)**:
  - **MÀU CHỦ ĐẠO**: Màu chủ đạo của toàn bộ hệ thống phải sử dụng biến CSS `--vanixjnk`.
  - **CẤM SỬ DỤNG TRANSPARENT**: Tuyệt đối không sử dụng thuộc tính trong suốt hoàn toàn (`bg-transparent` hoặc tương đương) cho các khối nội dung, hộp thông báo hoặc các phần tử cần làm nổi bật vì sẽ gây khó nhìn và thiếu độ tương phản.
  - **CÁCH THỂ HIỆN THAY THẾ CHO TRANSPARENT (Hộp nổi bật/Badges/Highlights)**: Trường hợp muốn hiển thị dạng trong suốt nhẹ có điểm nhấn, hãy thể hiện bằng cụm class phẳng sau:
    - Cú pháp: `text-* bg-*/10 border border-*/25`
    - Trong đó `*` là màu chủ đạo `vanixjnk` hoặc các biến thể màu sắc mà Tailwind hỗ trợ (ví dụ: `red-500`, `blue-600`... hoặc các sắc độ từ `100` đến `900`).
    - *Ví dụ*: `text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25` hoặc `text-red-600 bg-red-600/10 border border-red-600/25`.
  - **CẤM SỬ DỤNG MÀU TỐI / XÁM MẶC ĐỊNH**: Không sử dụng các class màu tối/xám mặc định của Tailwind như `bg-zinc-*`, `bg-gray-*`, `bg-slate-*`, `bg-neutral-*` làm màu nền chính hoặc cho các thành phần lớn.
  - **NỀN TOÀN CỤC**: Sử dụng class `bg-background` trên toàn cục (layout chung).
  - **SỬ DỤNG CARD COMPONENT**: Khi thiết kế các khối dạng thẻ, hãy sử dụng component `Card` của Shadcn (không tự code thẻ div với các class tùy tiện). **Tuy nhiên, cấm sử dụng CardFooter**; phần chân thẻ (footer) phải tự viết cấu trúc container HTML/CSS thủ công tùy biến theo nhu cầu thiết kế để tăng tính linh hoạt tối đa.
  - **BIẾN THỂ MÀU SẮC NÚT BẤM (BUTTON VARIANTS)**:
    Khi sử dụng nút bấm (`Button` component):
    - Khi áp dụng màu chủ đạo của website, bắt buộc phải sử dụng variant `vanixjnk`.
    - Các biến thể màu sắc khác được thiết kế riêng gồm có:
      - `vanixjnk`: `"border border-transparent border-vanixjnk/25 bg-vanixjnk/15 text-vanixjnk hover:bg-vanixjnk/15"`
      - `success`: `"border border-green-500/25 bg-green-500/15 text-green-500 hover:bg-green-500/15"`
      - `danger`: `"border border-red-500/25 bg-red-500/15 text-red-500 hover:bg-red-500/15"`
      - `warning`: `"border border-yellow-500/25 bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/15"`
      - `sky`: `"border border-sky-500/25 bg-sky-500/15 text-sky-500 hover:bg-sky-500/15"`
      - `fuschia`: `"border border-fuschia-500/25 bg-fuschia-500/15 text-fuschia-500 hover:bg-fuschia-500/15"`
      - `rose`: `"border border-rose-500/25 bg-rose-500/15 text-rose-500 hover:bg-rose-500/15"`
      - `indigo`: `"border border-indigo-500/25 bg-indigo-500/15 text-indigo-500 hover:bg-indigo-500/15"`
      - `violet`: `"border border-violet-500/25 bg-violet-500/15 text-violet-500 hover:bg-violet-500/15"`
      - `orange`: `"border border-orange-500/25 bg-orange-500/15 text-orange-500 hover:bg-orange-500/15"`
      - `pink`: `"border border-pink-500/25 bg-pink-500/15 text-pink-500 hover:bg-pink-500/15"`
      - `lime`: `"border border-lime-500/25 bg-lime-500/15 text-lime-500 hover:bg-lime-500/15"`
      - `emerald`: `"border border-emerald-500/25 bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/15"`
      - `teal`: `"border border-teal-500/25 bg-teal-500/15 text-teal-500 hover:bg-teal-500/15"`
      - `cyan`: `"border border-cyan-500/25 bg-cyan-500/15 text-cyan-500 hover:bg-cyan-500/15"`
      - `default`: `"bg-primary text-primary-foreground [a]:hover:bg-primary/80"`
      - `outline`: `"border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50"`
      - `secondary`: `"bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground"`
      - `ghost`: `"hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50"`
      - `destructive`: `"bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40"`
      - `link`: `"text-primary underline-offset-4 hover:underline"`
  - **MÀU CHỮ & QUẢN LÝ THEME**: 
    - Không sử dụng các class màu chữ tối cố định (như `text-zinc-*`, `text-gray-*`, `text-slate-*`...). Hãy để màu chữ hiển thị tự nhiên vì dự án đã tích hợp `next-themes` để tự động đảo màu chữ theo theme (light/dark mode).
    - Khi cần thể hiện màu chữ nhạt/phụ (muted text), hãy sử dụng `text-muted` hoặc `text-muted-foreground` (có thể kết hợp chia opacity nếu cần, ví dụ: `text-muted-foreground/80`).
  - **ĐỒNG NHẤT BỐ CỤC (Layout Uniformity)**: Chiều rộng tối đa (max-width) và padding của toàn bộ các trang con (ví dụ: trang đặt hàng, trang nạp tiền, v.v.) và Header phải đồng nhất tuyệt đối trên toàn hệ thống. Nếu sử dụng `max-w-7xl mx-auto px-4` thì tất cả các trang khác và Header cũng phải tuân thủ chính xác thông số này, không thiết kế mỗi trang một độ rộng khác nhau.
  - **ĐỒNG NHẤT TIÊU ĐỀ DIALOG / SHEET (Dialog/Sheet Header Uniformity)**: Phần đầu (Header/Title) của các hộp thoại (Dialog/Modal) và thanh trượt bên (Sheet/Drawer/Slide-over) phải đồng nhất về mặt thiết kế cấu trúc. Ví dụ: nếu một hộp thoại sử dụng biểu tượng icon đặt trong một hình tròn màu sắc (solid/tint background) làm điểm nhấn cho tiêu đề, thì tất cả các Dialog, Modal và Sheet khác trong toàn bộ ứng dụng cũng phải áp dụng cấu trúc thiết kế hình ảnh tương tự.
  - **HỆ THỐNG BIỂU TƯỢNG (Icon System)**: Khi sử dụng biểu tượng (icon) làm thành phần chính/nổi bật (ví dụ: các icon tiêu đề, icon hero, trang trí chính trong Card hoặc Hộp thoại), bắt buộc phải sử dụng bộ icon **Solar Line Duotone** (định dạng `solar:*-line-duotone` của Iconify). Tránh sử dụng các bộ icon khác (như Lucide, MDI...) cho các icon chính để đảm bảo tính đồng nhất thẩm mỹ.
- **Tránh Hardcode**: Hạn chế tối đa việc sử dụng các giá trị tùy ý trong Tailwind (ví dụ: `w-[327px]`, `bg-[#f3a123]`) trừ các trường hợp bất khả kháng. Nên sử dụng các class tiêu chuẩn hoặc định nghĩa biến trong file CSS.
- **Hiệu ứng & Hoạt ảnh (Animations & Transitions)**:
  - **CẤM HIỆU ỨNG CHUYỂN CẢNH / MỞ TRANG**: Tuyệt đối không áp dụng hiệu ứng hoạt ảnh (animate/duration) khi chuyển trang hoặc mở trang (page transitions / page loading). Mở trang phải hiển thị tức thì, không gây trễ bằng duration.
  - Các tương tác vi mô (micro-interactions) như hiệu ứng hover nhẹ trên nút/card vẫn được phép sử dụng để tăng tính phản hồi, nhưng phải nhanh và tối giản.

---

## 6. SEO & Khả năng tiếp cận (Accessibility - A11y)

- **Semantic HTML**: Sử dụng đúng các thẻ HTML5 (`<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`) thay vì lạm dụng thẻ `<div>`.
- **Cấu trúc Heading**: Mỗi trang chỉ có duy nhất một thẻ `<h1>`. Thứ tự các thẻ heading phải tuân thủ đúng phân cấp logic (`<h1>` -> `<h2>` -> `<h3>`).
- **Hình ảnh**: Tất cả các thẻ `<img>` hoặc `<Image>` của Next.js đều phải có thuộc tính `alt` mô tả nội dung ảnh.
- **Unique IDs**: Đảm bảo các phần tử tương tác quan trọng (nút bấm, ô nhập liệu) có `id` duy nhất và mang tính mô tả để phục vụ kiểm thử tự động (E2E testing).
- **Meta tags**: Thêm đầy đủ tiêu đề (`title`) và mô tả (`description`) thân thiện với SEO cho từng trang.
