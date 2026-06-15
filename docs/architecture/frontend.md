# Hướng dẫn Kiến trúc và Quy chuẩn Frontend (Frontend Architecture & Guidelines)

Tài liệu này định nghĩa các quy tắc, cấu trúc thư mục, luồng layout đặc trưng và chuẩn mực phát triển phần giao diện (frontend) cho toàn bộ hệ thống **VaniStudio** (áp dụng đồng bộ cho cả trang Client công khai và trang Quản trị Admin).

---

## 1. Công nghệ cốt lõi (Core Tech Stack)
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS v4 & PostCSS
- **UI Components**: Shadcn UI (xây dựng trên nền `@radix-ui/react`, cấm dùng `@base-ui/react`)
- **API & Data Fetching**: tRPC & `@tanstack/react-query`
- **Icon**: Chỉ sử dụng `@iconify/react` (cấm dùng `lucide-react`)
- **State & Validation**: Zod, React Hooks
- **Toasts**: `sonner`

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

### 5.1. Khung Layout Cấu Trúc Đặc Trưng (Global Layout Architecture)
Để tạo ấn tượng thị giác mạnh mẽ và tính đồng nhất trên toàn website, tất cả các trang lớn (cả Admin và Client công khai) đều phải tuân thủ cấu trúc layout khung đứt nét sau:
- **Lớp bọc ngoài (Outer Container)**:
  `flex flex-col w-full flex-1`
- **Giới hạn chiều rộng trang (Width Boundaries)**:
  `w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8`
- **Đường viền dọc đứt nét (Vertical Dashed Borders)**:
  `border-l border-r border-dashed border-primary/20`
- **Nền thẻ nội dung**:
  Sử dụng `bg-card/10` kết hợp viền nét đứt.

*Ví dụ khung bố cục chuẩn*:
```tsx
export default function StandardPage() {
  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          {/* Header Trang */}
        </div>
      </div>
      
      {/* Dải phân cách sọc chéo */}
      <div className="relative w-full border-t border-b border-dashed border-primary/20 overflow-hidden text-primary/20 h-9">
        <div
          className="absolute inset-y-0 left-[-100vw] w-[300vw]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)"
          }}
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6">
          {/* Body Nội dung */}
        </div>
      </div>
    </div>
  );
}
```

### 5.2. Quy Tắc Phối Màu & Phản Đối Trong Suốt (Opacity Tints over Transparent)
- **MÀU CHỦ ĐẠO**: Màu chủ đạo của toàn bộ hệ thống phải sử dụng biến CSS `--vanixjnk`.
- **CẤM SỬ DỤNG TRANSPARENT**: Tuyệt đối không sử dụng thuộc tính trong suốt hoàn toàn (`bg-transparent` hoặc tương đương) cho các khối nội dung, hộp thông báo hoặc các phần tử cần làm nổi bật vì sẽ gây khó nhìn và thiếu độ tương phản.
- **CÔNG THỨC PHẲNG THAY THẾ TRANSPARENT (Tints & Badges)**:
  - Cú pháp: `text-* bg-*/10 border border-*/25`
  - Trong đó `*` là màu chủ đạo `vanixjnk` hoặc các biến thể màu sắc Tailwind.
  - *Ví dụ*: `text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25` hoặc `text-rose-500 bg-rose-500/10 border border-rose-500/25`.
- **CẤM SỬ DỤNG MÀU TỐI / XÁM MẶC ĐỊNH**: Không sử dụng các class màu tối/xám mặc định của Tailwind như `bg-zinc-*`, `bg-gray-*`, `bg-slate-*`, `bg-neutral-*` làm màu nền chính hoặc cho các thành phần lớn.
- **NỀN TOÀN CỤC**: Sử dụng class `bg-background` trên toàn cục (layout chung).
- **SỬ DỤNG CARD COMPONENT**: Khi thiết kế các khối dạng thẻ, hãy sử dụng component `Card` của Shadcn (không tự code thẻ div với các class tùy tiện). **Tuy nhiên, cấm sử dụng CardFooter**; phần chân thẻ (footer) phải tự viết cấu trúc container HTML/CSS thủ công tùy biến theo nhu cầu thiết kế để tăng tính linh hoạt tối đa.

### 5.3. Biến Thể Màu Sắc Nút Bấm (Button Variants)
Khi sử dụng nút bấm (`Button` component):
- Khi áp dụng màu chủ đạo của website, bắt buộc phải sử dụng variant `vanixjnk`.
- Các biến thể màu sắc khác được thiết kế riêng gồm có:
  - `vanixjnk`: `"border border-transparent border-vanixjnk/25 bg-vanixjnk/15 text-vanixjnk hover:bg-vanixjnk/15"`
  - `success`: `"border border-green-500/25 bg-green-500/15 text-green-500 hover:bg-green-500/15"`
  - `danger`: `"border border-red-500/25 bg-red-500/15 text-red-500 hover:bg-red-500/15"`
  - `warning`: `"border border-yellow-500/25 bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/15"`
  - `sky`: `"border border-sky-500/25 bg-sky-500/15 text-sky-500 hover:bg-sky-500/15"`
  - `rose`: `"border border-rose-500/25 bg-rose-500/15 text-rose-500 hover:bg-rose-500/15"`
  - `default`: `"bg-primary text-primary-foreground [a]:hover:bg-primary/80"`
  - `outline`: `"border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50"`
  - `secondary`: `"bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground"`
  - `ghost`: `"hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50"`
  - `destructive`: `"bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40"`
  - `link`: `"text-primary underline-offset-4 hover:underline"`

### 5.4. Màu Chữ & Quản lý Theme
- Không sử dụng các class màu chữ tối cố định (như `text-zinc-*`, `text-gray-*`, `text-slate-*`...). Hãy để màu chữ hiển thị tự nhiên vì dự án đã tích hợp `next-themes` để tự động đảo màu chữ theo theme (light/dark mode).
- Khi cần thể hiện màu chữ nhạt/phụ (muted text), hãy sử dụng `text-muted` hoặc `text-muted-foreground` (có thể kết hợp chia opacity nếu cần, ví dụ: `text-muted-foreground/80`).

### 5.5. Thiết Kế Điểm Nhấn Nhận Diện Đầu Trang/Hộp Thoại (Header Badge Uniformity)
- Phần đầu (Header/Title) của các hộp thoại (Dialog/Modal), thanh trượt bên (Sheet/Drawer/Slide-over) hoặc tiêu đề trang con bắt buộc phải có biểu tượng icon cỡ lớn đặt trong khối bo góc `rounded-xl` dạng tint nhạt (`bg-vanixjnk/10 border border-vanixjnk/25 text-vanixjnk`) làm điểm nhấn nhận diện thương hiệu.

### 5.6. Hệ Thống Biểu Tượng (Icon System)
- Khi sử dụng biểu tượng (icon) làm thành phần chính/nổi bật (icon tiêu đề, trang trí Card hoặc Hộp thoại), bắt buộc phải sử dụng bộ icon **Solar Line Duotone** (định dạng `solar:*-line-duotone` của Iconify). Tránh sử dụng các bộ icon khác (như Lucide, MDI...) cho các icon chính để đảm bảo tính đồng nhất thẩm mỹ.

### 5.7. Hiệu ứng & Hoạt ảnh (Animations & Transitions)
- **CẤM HIỆU ỨNG CHUYỂN CẢNH / MỞ TRANG**: Tuyệt đối không áp dụng hiệu ứng hoạt ảnh (animate/duration) khi chuyển trang hoặc mở trang (page transitions / page loading). Mở trang phải hiển thị tức thì, không gây trễ bằng duration.
- Các tương tác vi mô (micro-interactions) như hiệu ứng hover nhẹ trên nút/card vẫn được phép sử dụng để tăng tính phản hồi, nhưng phải nhanh và tối giản.

### 5.8. Xử lý Trạng thái Khóa Tương Tác khi Gửi Dữ liệu (Mutation UI State)
- Để tránh người dùng click đúp gửi request nhiều lần khi đang gọi API tRPC `useMutation`, nút bấm submit bắt buộc phải:
  - Bị vô hiệu hóa (`disabled={mutation.isPending}`).
  - Hiển thị hiệu ứng icon xoay tròn `solar:restart-line-duotone` với class `animate-spin` đại diện cho trạng thái đang tải.

*Ví dụ nút bấm mutation chuẩn*:
```tsx
<Button
  variant="vanixjnk"
  onClick={() => mutation.mutate()}
  disabled={mutation.isPending}
>
  {mutation.isPending ? (
    <Icon icon="solar:restart-line-duotone" className="animate-spin text-base" />
  ) : (
    <Icon icon="solar:diskette-line-duotone" className="text-base" />
  )}
  <span>Lưu cấu hình</span>
</Button>
```

---

## 6. SEO & Khả năng tiếp cận (Accessibility - A11y)
- **Semantic HTML**: Sử dụng đúng các thẻ HTML5 (`<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`) thay vì lạm dụng thẻ `<div>`.
- **Cấu trúc Heading**: Mỗi trang chỉ có duy nhất một thẻ `<h1>`. Thứ tự các thẻ heading phải tuân thủ đúng phân cấp logic (`<h1>` -> `<h2>` -> `<h3>`).
- **Hình ảnh**: Tất cả các thẻ `<img>` hoặc `<Image>` của Next.js đều phải có thuộc tính `alt` mô tả nội dung ảnh.
- **Unique IDs**: Đảm bảo các phần tử tương tác quan trọng (nút bấm, ô nhập liệu) có `id` duy nhất và mang tính mô tả để phục vụ kiểm thử tự động (E2E testing).
- **Meta tags**: Thêm đầy đủ tiêu đề (`title`) và mô tả (`description`) thân thiện với SEO cho từng trang.

---

## 7. Quy tắc nghiêm ngặt: CẤM ĐỘ CHẾ (No Ad-hoc / Anti-Hack Policy)

Tất cả các lập trình viên và tác nhân AI tham gia phát triển dự án tuyệt đối không được phép tự ý thay đổi, cấu hình sai lệch, hoặc tự chế (hacked/ad-hoc configurations) ngoài các quy chuẩn và thư viện dùng chung được định nghĩa sẵn.

### 7.1. Cấm Tự Chế Thiết Kế & Hardcode Tailwind
- **Tuyệt đối cấm** sử dụng các giá trị tuỳ ý (arbitrary values) của Tailwind trực tiếp trong class (ví dụ: `w-[327px]`, `bg-[#f3a123]`, `h-[72px]`, `p-[11px]`...) trừ các trường hợp bất khả kháng liên quan đến ảnh nền động hoặc animation. Phải dùng hệ thống spacing chuẩn của Tailwind hoặc khai báo biến trong `index.css`.
- **Tuyệt đối cấm** hardcode mã màu hex trực tiếp. Mọi màu sắc phải thông qua các biến màu HSL của hệ thống (như `--background`, `--primary`, `--vanixjnk`, `--rose-500`...) để đảm bảo việc hỗ trợ đổi màu giao diện (Light/Dark Mode) hoạt động hoàn hảo.

### 7.2. Cấm Sử Dụng Dialog/Confirm Gốc Trình Duyệt hoặc Tự Chế Bằng Thẻ Div
- **Tuyệt đối cấm** sử dụng các hàm xác nhận gốc của trình duyệt như `confirm()`, `alert()`, `prompt()` vì chúng phá vỡ trải nghiệm người dùng và thẩm mỹ hệ thống.
- **Tuyệt đối cấm** tự thiết kế các hộp thoại thông báo/xác nhận xóa bằng thẻ `div` tự chế. Phải sử dụng bộ UI component có sẵn:
  - Hành động mang tính huỷ hoại, nguy hiểm (ví dụ: Xoá bài viết, Reset cấu hình): Bắt buộc dùng `<AlertDialog>` từ `@/components/ui/alert-dialog`.
  - Hộp nhập liệu hoặc hiển thị thông tin thông thường: Bắt buộc dùng `<Dialog>` từ `@/components/ui/dialog`.
- **Cấm can thiệp sai lệch Footer**: Khi viết Dialog Footer, cấm chèn thêm các class margin tùy biến làm phá vỡ margin âm mặc định của container (`-mx-4 -mb-4`) gây méo mó nút bấm hoặc sai lệch khung viền.

### 7.3. Cấm Tự Định Dạng Thời Gian (Date-Time Formatting Hacks)
- Phía Client **tuyệt đối cấm** sử dụng các hàm thời gian mặc định của JavaScript như `new Date().toLocaleString()` hay `new Date().toLocaleDateString()` một cách tùy ý. Việc này dẫn đến sai lệch múi giờ giữa người dùng và máy chủ.
- **Bắt buộc sử dụng** helper chuẩn hóa múi giờ `formatWithSiteTimezone` kết hợp với `useSetting()` của hệ thống để hiển thị ngày tháng nhất quán theo đúng cấu hình múi giờ của trang web.

### 7.4. Cấm Tự Chế API Client
- Khi API nghiệp vụ đã được định nghĩa trong bộ định tuyến tRPC (`src/server/routes/`), **tuyệt đối cấm** sử dụng `fetch`, `axios` hay gọi HTTP request thô để giao tiếp dữ liệu.
- Mọi hoạt động gọi dữ liệu bắt buộc phải đi qua tRPC client (`trpc.[router].[procedure].useQuery` hoặc `useMutation`) để đảm bảo an toàn kiểu dữ liệu 100% từ Database tới giao diện.

### 7.5. Cấm Tự Định Nghĩa Lại Các Component UI Cơ Bản
- Không tự viết lại mã nguồn thô cho các phần tử cơ bản như `Input`, `Button`, `Checkbox`, `Switch`, `Skeleton`, `Badge`... khi dự án đã cung cấp sẵn các component nguyên tử trong `src/components/ui/`. Phải luôn kế thừa và import trực tiếp từ `@/components/ui/`.
- Mọi điều chỉnh về biến thể màu sắc nút bấm phải bổ sung trực tiếp vào file định nghĩa gốc `button.tsx` của dự án dưới dạng các `variant` chuẩn (success, danger, warning...), tuyệt đối không chèn ép class Tailwind tuỳ ý ghi đè màu sắc ở lớp sử dụng.

### 7.6. Bắt Buộc Sử Dụng Bộ Component Nghiệp Vụ Chia Sẻ (Custom Component Suite)
Để đảm bảo giao diện đồng nhất 100%, tuyệt đối cấm sử dụng các thư viện ngoài hoặc tự chế mã nguồn thô cho các tác vụ đặc thù dưới đây. Bắt buộc phải import trực tiếp từ thư mục `@/components/vanixjnk/`:
- **Quản lý & Chọn Ảnh/Tệp tin**: Bắt buộc sử dụng `<GalleryDialog>` từ `@/components/vanixjnk/gallery-dialog` khi làm việc với các form chọn ảnh đại diện, banner, tệp đính kèm.
- **Chọn Màu Sắc (Color Picker)**: Bắt buộc dùng `<ColorPicker>` từ `@/components/vanixjnk/color-picker` cho các cấu hình giao diện.
- **Chọn Biểu Tượng (Icon Picker)**: Bắt buộc dùng `<IconPicker>` từ `@/components/vanixjnk/icon-picker` khi gán icon danh mục, menu, dịch vụ.
- **Chọn Ngày Giờ (Date & Time Picker)**: Bắt buộc dùng `<DateTimePicker>` từ `@/components/vanixjnk/date-time-picker`.
- **Soạn thảo & Hiển thị MDX/Markdown**: Bắt buộc dùng `<MdxEditor>` và `<MdxRenderer>` từ `@/components/vanixjnk/mdx-builder` cho các nội dung bài viết blog, trang tĩnh (CMS), mô tả dịch vụ/dự án.
- **Bảng dữ liệu nâng cao (Advanced Data Tables)**: Bắt buộc dùng `<DataTable>` và `<DataTableColumnHeader>` từ `@/components/vanixjnk/data-table` để xây dựng tất cả các bảng hiển thị thông tin ở Admin.

### 7.7. Quy Chuẩn Đồng Nhất Input Form & Kích Thước Thành Phần
- Tất cả các control của form nhập liệu (`Input`, `SelectTrigger`, `Textarea`, v.v.) bắt buộc phải có chiều cao thống nhất là `h-9` (hoặc chiều cao tự động đối với `Textarea`) và cỡ chữ `text-[13px]`.
- Tuyệt đối không sử dụng `text-xs` hoặc `text-sm` cho các thẻ input, select, textarea thông thường.
- Tuyệt đối không sử dụng `font-mono` cho các trường nhập liệu (như slug, version, liên kết...).
- Cấu trúc bo góc tuân thủ theo cấu hình mặc định của hệ thống (`rounded-md` hoặc `rounded-lg`), tuyệt đối không tự chế độ bo góc ad-hoc lớn như `rounded-xl` cho các nút bấm và ô nhập liệu thông thường.
- Cấu trúc lưới (Grid) hiển thị form nhập liệu ở cả trang Login, Register lẫn các trang Editor nghiệp vụ phải tuân thủ nghiêm ngặt hệ thống grid Tailwind:
  - Lưới cơ bản: `grid grid-cols-2 gap-x-4 gap-y-3.5` hoặc `grid grid-cols-1 md:grid-cols-2 gap-4`.
  - Phân bổ cột: Sử dụng `col-span-2` cho các trường nhập dài (email, địa chỉ, ảnh, editor) và `col-span-2 sm:col-span-1` cho các trường nhập ngắn đặt cạnh nhau (mật khẩu, xác nhận mật khẩu, tên/họ, tỉnh/thành phố).

### 7.8. Đồng Nhất Cơ Chế Tìm Kiếm Trì Hoãn (Debounced Search Logic)
- Khi triển khai bộ lọc/tìm kiếm dữ liệu Client gọi API tRPC, **tuyệt đối cấm** việc gọi API trực tiếp theo từng sự kiện gõ phím (`onChange`).
- Bắt buộc dùng cơ chế trì hoãn (Debounce) đúng `300ms` sử dụng `setTimeout` để gom nhóm các thao tác nhập liệu trước khi kích hoạt query lên máy chủ:
  ```tsx
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Bắt buộc reset về trang đầu tiên
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  ```


