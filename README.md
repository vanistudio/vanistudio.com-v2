# VaniStudio.com v2

Đây là mã nguồn chính thức của **[VaniStudio](https://vanistudio.com)** — Đơn vị hàng đầu chuyên thiết kế website chuyên nghiệp, lập trình ứng dụng di động (iOS & Android), xây dựng chatbot AI thông minh và thiết kế UI/UX hiện đại.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

Để phát triển ứng dụng này, chúng tôi sử dụng các công nghệ tiên tiến nhất hiện nay:

[![Tech Stack](https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,postgres,nodejs,git,docker,postman,vscode)](https://skillicons.dev)

- **Core Framework**: Next.js 16 (App Router) & React 19
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL & Drizzle ORM
- **API Communication**: tRPC
- **Authentication**: Better Auth

---

## 🚀 Hướng dẫn khởi chạy cục bộ (Getting Started)

### 1. Cấu hình biến môi trường
Tạo file `.env` tại thư mục gốc của dự án với các thông số kết nối cơ sở dữ liệu:
```env
APP_DATABASE_URI_VALUE=postgresql://postgres:postgres@localhost:5432/vanistudio
APP_BETTER_AUTH_DOMAIN=localhost:3000
```

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Khởi tạo cấu trúc bảng (Push Schema)
Chạy lệnh sau để đồng bộ schema từ mã nguồn vào cơ sở dữ liệu PostgreSQL cục bộ của bạn:
```bash
npx drizzle-kit push
```

### 4. Chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.
Truy cập [http://localhost:3000/configuration](http://localhost:3000/configuration) để thực hiện thiết lập cấu hình website & khởi tạo tài khoản quản trị Admin.
