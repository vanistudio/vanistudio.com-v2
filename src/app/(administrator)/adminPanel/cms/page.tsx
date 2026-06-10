import type { Metadata } from "next";
import AdminCMS from "@/components/contents/administrator/_cms/AdminCMS";

export const metadata: Metadata = {
  title: "Quản lý trang CMS | Trang quản trị",
  description: "Quản lý nội dung, bài viết tĩnh, chính sách và tối ưu SEO cho các trang CMS của website",
};

export default function AdminCMSPage() {
  return <AdminCMS />;
}
