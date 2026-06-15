# Hướng dẫn Thiết kế Cơ sở Dữ liệu (Database Design & Schema Guidelines)

Tài liệu này quy định cách thiết kế bảng, viết schema, định nghĩa mối quan hệ và các quy chuẩn sử dụng **Drizzle ORM** với **PostgreSQL** trong dự án **VaniStudio**.

---

## 1. Cấu trúc và Tổ chức Cơ sở Dữ liệu

Dự án sử dụng **Drizzle ORM** làm lớp giao tiếp chính với hệ quản trị cơ sở dữ liệu **PostgreSQL** thông qua kết nối driver `postgres-js`.

Toàn bộ các tệp liên quan đến cơ sở dữ liệu được quản lý tập trung tại thư mục `src/server/db/`:
- `src/server/db/index.ts`: Khởi tạo và xuất thực thể kết nối cơ sở dữ liệu (`db`).
- `src/server/db/r.ts`: Định nghĩa tập trung các mối quan hệ (Relations) giữa các bảng.
- `src/server/db/schemas/`: Nơi chứa toàn bộ tệp định nghĩa cấu trúc bảng. Mỗi bảng/mảng nghiệp vụ liên quan sẽ nằm trong một tệp định nghĩa riêng biệt dạng `[entity-name].schema.ts`.

---

## 2. Quy chuẩn Thiết kế Schema (Schema Conventions)

### 2.1. Đặt tên Bảng và Cột (Naming Conventions)
- **Tên bảng (Table name)**: Sử dụng danh từ số nhiều, viết bằng chữ thường và phân tách bằng dấu gạch dưới (snake_case). Ví dụ: `users`, `blog_comments`, `service_packages`.
- **Tên trường dữ liệu trong Database (Column name)**: Sử dụng snake_case. Ví dụ: `email_verified`, `author_id`, `created_at`.
- **Tên thuộc tính trong Code (JavaScript/TypeScript property)**: Sử dụng camelCase ánh xạ trực tiếp sang trường dữ liệu tương ứng trong DB.

*Ví dụ ánh xạ*:
```typescript
emailVerified: boolean("email_verified").notNull(),
```

### 2.2. Khóa chính và Khóa ngoại (Primary & Foreign Keys)
- **Khóa chính (Primary Key)**:
  - Đối với các bảng liên quan đến người dùng/phiên làm việc (Auth): Dùng kiểu chuỗi ký tự ngẫu nhiên `text("id").primaryKey()`.
  - Đối với các bảng nghiệp vụ khác (Blog, Service, Project...): Sử dụng khóa chính UUID tự động sinh bởi database:
    ```typescript
    id: uuid("id").defaultRandom().primaryKey()
    ```
- **Khóa ngoại (Foreign Key)**:
  - Khai báo khóa ngoại trực tiếp bằng phương thức `.references()`.
  - Bắt buộc khai báo hành động khi bản ghi cha bị xóa (`onDelete: "cascade"` hoặc `onDelete: "set null"`).

### 2.3. Quy định về Thời gian (Timestamps & Timezone)
- Tất cả các trường lưu trữ ngày tháng/thời gian bắt buộc phải kích hoạt cấu hình múi giờ hệ thống (Timezone) trong PostgreSQL để đảm bảo tính đồng nhất khi xử lý ngày giờ ở client và server:
  ```typescript
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  ```

### 2.4. Trường Dữ liệu Phức tạp (JSONB)
- Đối với các trường chứa mảng dữ liệu hoặc đối tượng có cấu trúc động, hãy sử dụng kiểu dữ liệu `jsonb`.
- Bắt buộc chỉ định kiểu tĩnh (Type casting) qua phương thức `.$type<T>()` của Drizzle để đảm bảo an toàn kiểu dữ liệu ở mức compile-time.

*Ví dụ*:
```typescript
tags: jsonb("tags").$type<string[]>().default([]).notNull(),
```

---

## 3. Định nghĩa Quan hệ Tập trung (Centralized Relations)

Để giữ các tệp schema sạch và tránh lỗi tham chiếu vòng (circular dependency) giữa các bảng cơ sở dữ liệu, **không viết** định nghĩa quan hệ (`relations()`) trực tiếp trong các tệp `.schema.ts`.

Tất cả các định nghĩa quan hệ bắt buộc phải khai báo tập trung trong tệp `src/server/db/r.ts`.

*Ví dụ trích xuất quan hệ blog và bình luận*:
```typescript
import { relations } from "drizzle-orm";
import { users } from "@/server/db/schemas/user.schema";
import { blogs, blogComments } from "@/server/db/schemas/blog.schema";

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  comments: many(blogComments),
  author: one(users, {
    fields: [blogs.authorId],
    references: [users.id],
  }),
}));

export const blogCommentsRelations = relations(blogComments, ({ one }) => ({
  blog: one(blogs, {
    fields: [blogComments.blogId],
    references: [blogs.id],
  }),
  user: one(users, {
    fields: [blogComments.userId],
    references: [users.id],
  }),
}));
```

---

## 4. Trích xuất Kiểu dữ liệu (Type Inference)

Cuối mỗi file `.schema.ts`, bắt buộc export các Type đại diện cho bản ghi được chọn (Select) và bản ghi được thêm mới (Insert) bằng cách sử dụng các utility helper của Drizzle:

```typescript
export type Blog = typeof blogs.$inferSelect;
export type NewBlog = typeof blogs.$inferInsert;
```

Quy tắc này giúp các lớp phía trên như Service, Repository, và UI Component có thể tái sử dụng kiểu dữ liệu cơ sở dữ liệu mà không cần phải viết lại thủ công các interface TypeScript.

---

## 5. Quản lý và Đồng bộ Cơ sở Dữ liệu (Migrations & Operations)

Dự án cung cấp các câu lệnh tiêu chuẩn chạy qua `drizzle-kit` định nghĩa trong `package.json`:
- `npm run db:generate`: Tạo file SQL migration mới từ sự thay đổi của các file `.schema.ts` trong thư mục `src/server/db/schemas/`.
- `npm run db:migrate`: Áp dụng toàn bộ các file SQL migration chưa chạy vào cơ sở dữ liệu đích.
- `npm run db:push`: Đẩy trực tiếp các thay đổi schema lên database (chỉ dùng cho môi trường thử nghiệm cục bộ/local development, cấm chạy trên Production).
- `npm run db:studio`: Khởi chạy giao diện quản lý cơ sở dữ liệu Drizzle Studio GUI để duyệt dữ liệu trực quan.

---

## 6. Quy tắc nghiêm ngặt: CẤM ĐỘ CHẾ CƠ SỞ DỮ LIỆU (No Ad-hoc / Anti-Hack DB Rules)

Để tránh các lỗi xung đột dữ liệu, lỗi khóa ngoại, và mất đồng bộ cấu trúc, tất cả lập trình viên và tác nhân AI phải tuân thủ tuyệt đối các quy định sau:

### 6.1. Cấm Khai Báo Quan Hệ Phân Tán (No Distributed Relations)
- **Tuyệt đối cấm** việc định nghĩa quan hệ (`relations()`) trực tiếp trong các tệp schema con `*.schema.ts`.
- Mọi quan hệ giữa các bảng cơ sở dữ liệu bắt buộc phải được khai báo tập trung 100% tại tệp quản lý quan hệ duy nhất: **[r.ts](file:///v:/Elysia/vanistudio/src/server/db/r.ts)**. Điều này giúp ngăn chặn triệt để lỗi tham chiếu vòng (circular dependencies) khi biên dịch code.

### 6.2. Cấm Bỏ Qua Định Nghĩa Khóa Ngoại và Ràng Buộc Hủy (No Orphaned Foreign Keys)
- Tất cả các trường liên kết (Foreign Keys) bắt buộc phải khai báo tường minh qua phương thức `.references()`.
- **Cấm tuyệt đối** tạo khóa ngoại không kèm hành động xóa (`onDelete`). Bắt buộc phải xác định rõ chính sách:
  - Dùng `onDelete: "cascade"` khi bản ghi con bắt buộc phải biến mất cùng bản ghi cha (ví dụ: Xóa sản phẩm thì xóa các package đi kèm).
  - Dùng `onDelete: "set null"` khi bản ghi con cần được giữ lại nhưng ngắt liên kết (ví dụ: Người dùng bị xóa thì gán người dùng của yêu cầu dịch vụ về null).

### 6.3. Cấm Đồng Bộ Trực Tiếp Lên Production Bằng Push (No Push on Production)
- **Tuyệt đối cấm** sử dụng lệnh `npm run db:push` trên cơ sở dữ liệu môi trường Production. Việc đẩy trực tiếp cấu trúc không qua file migration có thể dẫn đến việc mất mát dữ liệu sản xuất không phục hồi được.
- Mọi thay đổi schema trên Production bắt buộc phải đi qua quy trình:
  1. Tạo file migration bằng `npm run db:generate`.
  2. Kiểm tra tính toàn vẹn của tệp SQL được sinh ra.
  3. Áp dụng lên DB bằng lệnh `npm run db:migrate`.

### 6.4. Cấm Gọi Database Thô Từ Lớp Ngoài (No DB Queries outside Repository)
- **Tuyệt đối cấm** các lớp bên ngoài như `Routes` hay `Services` import đối tượng kết nối `db` từ `@/server/db` hoặc các bảng schema để tự viết các câu lệnh truy vấn dữ liệu (`db.select()`, `db.insert()`...).
- Mọi truy xuất cơ sở dữ liệu bắt buộc phải được viết đóng gói bên trong phương thức của lớp **Repository** tương ứng để đảm bảo tính đóng gói và dễ bảo trì.

