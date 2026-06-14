import type { Metadata } from "next";
import BlogList from "@/components/contents/administrator/_blog/AdminBlogList";

export const metadata: Metadata = {
  title: "Quản lý bài viết Blog | Trang quản trị",
  description: "Quản lý bài viết blog, chia sẻ kiến thức công nghệ và tối ưu SEO cho Vani Studio",
};

export default function AdminBlogPage() {
  return <BlogList />;
}
