import { db } from "@/server/db";
import { blogs } from "@/server/db/schemas/blog.schema";
import { eq, desc } from "drizzle-orm";
import PubBlogList from "@/components/contents/public/_blog/PubBlogList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chia sẻ kiến thức & Tin tức công nghệ | Vani Studio",
  description: "Cập nhật những tin tức mới nhất, chia sẻ kinh nghiệm phát triển website, ứng dụng di động, thiết kế UI/UX và tối ưu SEO.",
};

export default async function BlogIndexPage() {
  const activeBlogs = await db.query.blogs.findMany({
    where: eq(blogs.isActive, true),
    orderBy: [desc(blogs.publishedAt), desc(blogs.createdAt)],
  });

  return <PubBlogList initialBlogs={activeBlogs as any} />;
}
