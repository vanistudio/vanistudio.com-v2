import { db } from "@/server/db";
import { projects } from "@/server/db/schemas/project.schema";
import { products } from "@/server/db/schemas/product.schema";
import { services } from "@/server/db/schemas/service.schema";
import { blogs } from "@/server/db/schemas/blog.schema";
import { apiProducts } from "@/server/db/schemas/api.schema";
import { eq, desc, asc } from "drizzle-orm";
import PubHome from "@/components/contents/public/_home/PubHome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vani Studio | Thiết kế Website, Lập Trình App Di Động & AI Chatbot Chuyên Nghiệp",
  description: "Vani Studio chuyên cung cấp giải pháp chuyển đổi số toàn diện: thiết kế Website chuyên nghiệp chuẩn SEO, lập trình ứng dụng di động iOS/Android, thiết kế UI/UX và giải pháp Chatbot AI tự động hóa.",
};

export default async function Home() {
  let featuredProjects: any[] = [];
  let featuredProducts: any[] = [];
  let activeServices: any[] = [];
  let latestBlogs: any[] = [];
  let apiDocs: any[] = [];

  try {
    featuredProjects = await db.query.projects.findMany({
      orderBy: [desc(projects.createdAt)],
      with: { service: true },
      limit: 6,
    });
  } catch (e) {
    // Fail silently
  }

  try {
    featuredProducts = await db.query.products.findMany({
      where: eq(products.status, "active"),
      orderBy: [desc(products.createdAt)],
      limit: 20,
    });
  } catch (e) {
    // Fail silently
  }

  try {
    activeServices = await db.query.services.findMany({
      where: eq(services.status, "active"),
      orderBy: [desc(services.createdAt)],
      with: { serviceType: true },
      limit: 8,
    });
  } catch (e) {
    // Fail silently
  }

  try {
    latestBlogs = await db.query.blogs.findMany({
      where: eq(blogs.isActive, true),
      orderBy: [desc(blogs.createdAt)],
      limit: 4,
    });
  } catch (e) {
    // Fail silently
  }

  try {
    apiDocs = await db
      .select()
      .from(apiProducts)
      .orderBy(asc(apiProducts.order), desc(apiProducts.createdAt))
      .limit(8);
  } catch (e) {
    // Fail silently
  }

  return (
    <PubHome
      initialProjects={JSON.parse(JSON.stringify(featuredProjects))}
      initialProducts={JSON.parse(JSON.stringify(featuredProducts))}
      initialServices={JSON.parse(JSON.stringify(activeServices))}
      initialBlogs={JSON.parse(JSON.stringify(latestBlogs))}
      initialApiProducts={JSON.parse(JSON.stringify(apiDocs))}
    />
  );
}
