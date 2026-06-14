import type { Metadata } from "next";
import BlogEditor from "@/components/contents/administrator/_blog/BlogEditor";

export const metadata: Metadata = {
  title: "Tạo bài viết Blog mới | Trang quản trị",
  description: "Tạo bài viết blog mới, chia sẻ kiến thức công nghệ",
};

export default function BlogCreatePage() {
  return <BlogEditor mode="create" />;
}
