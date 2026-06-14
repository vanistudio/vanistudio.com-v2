import { notFound } from "next/navigation";
import { blogService } from "@/server/services/administrator/blog.service";
import PubBlogPage from "@/components/contents/public/_blog/PubBlogPage";
import type { Metadata } from "next";

export const dynamicParams = true;

export async function generateStaticParams() {
  const blogs = await blogService.getBlogs();
  return blogs
    .filter((blog) => blog.isActive)
    .map((blog) => ({
      slug: blog.slug,
    }));
}

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await blogService.getBlogBySlug(resolvedParams.slug);

  if (!blog || !blog.isActive) {
    return {
      title: "Bài viết không tồn tại | Vani Studio",
    };
  }

  return {
    title: `${blog.metaTitle || blog.title} | Vani Studio`,
    description: blog.metaDescription || blog.description || undefined,
    keywords: blog.metaKeywords || undefined,
    openGraph: {
      title: `${blog.metaTitle || blog.title} | Vani Studio`,
      description: blog.metaDescription || blog.description || undefined,
      images: blog.thumbnail ? [{ url: blog.thumbnail }] : undefined,
    },
  };
}

export default async function BlogPublicDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const blog = await blogService.getBlogBySlug(resolvedParams.slug);

  if (!blog || !blog.isActive) {
    notFound();
  }

  return <PubBlogPage blog={blog} />;
}
