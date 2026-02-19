import { db } from "@/configs/index.config";
import { users } from "@/schemas/user.schema";
import { categories } from "@/schemas/category.schema";
import { products } from "@/schemas/product.schema";
import { services } from "@/schemas/service.schema";
import { blogPosts } from "@/schemas/blog.schema";
import { projects } from "@/schemas/project.schema";
import { licenses } from "@/schemas/license.schema";
import { sql, eq } from "drizzle-orm";

export const dashboardController = {
  async getOverview() {
    const [
      [usersCount],
      [categoriesCount],
      [productsCount],
      [productsPublished],
      [servicesCount],
      [servicesPublished],
      [blogCount],
      [blogPublished],
      [projectsCount],
      [projectsPublished],
      [licensesCount],
      [licensesActive],
      [licensesUnused],
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(categories),
      db.select({ count: sql<number>`count(*)` }).from(products),
      db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.status, "published")),
      db.select({ count: sql<number>`count(*)` }).from(services),
      db.select({ count: sql<number>`count(*)` }).from(services).where(eq(services.status, "published")),
      db.select({ count: sql<number>`count(*)` }).from(blogPosts),
      db.select({ count: sql<number>`count(*)` }).from(blogPosts).where(eq(blogPosts.status, "published")),
      db.select({ count: sql<number>`count(*)` }).from(projects),
      db.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.status, "published")),
      db.select({ count: sql<number>`count(*)` }).from(licenses),
      db.select({ count: sql<number>`count(*)` }).from(licenses).where(eq(licenses.status, "active")),
      db.select({ count: sql<number>`count(*)` }).from(licenses).where(eq(licenses.status, "unused")),
    ]);

    const recentProducts = await db.select({ id: products.id, name: products.name, status: products.status, createdAt: products.createdAt })
      .from(products).orderBy(sql`${products.createdAt} desc`).limit(5);
    const recentBlog = await db.select({ id: blogPosts.id, title: blogPosts.title, status: blogPosts.status, createdAt: blogPosts.createdAt })
      .from(blogPosts).orderBy(sql`${blogPosts.createdAt} desc`).limit(5);
    const recentLicenses = await db.select({
      id: licenses.id, key: licenses.key, productName: licenses.productName,
      status: licenses.status, createdAt: licenses.createdAt,
    }).from(licenses).orderBy(sql`${licenses.createdAt} desc`).limit(5);

    return {
      counts: {
        users: Number(usersCount.count),
        categories: Number(categoriesCount.count),
        products: { total: Number(productsCount.count), published: Number(productsPublished.count) },
        services: { total: Number(servicesCount.count), published: Number(servicesPublished.count) },
        blog: { total: Number(blogCount.count), published: Number(blogPublished.count) },
        projects: { total: Number(projectsCount.count), published: Number(projectsPublished.count) },
        licenses: { total: Number(licensesCount.count), active: Number(licensesActive.count), unused: Number(licensesUnused.count) },
      },
      recent: { products: recentProducts, blog: recentBlog, licenses: recentLicenses },
    };
  },
};
