import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { products } from "@/schemas/product.schema";
import { projects } from "@/schemas/project.schema";
import { blogPosts } from "@/schemas/blog.schema";
import { services } from "@/schemas/service.schema";
import { eq } from "drizzle-orm";

function buildUrl(base: string, path: string) {
  return `${base.replace(/\/$/, '')}${path}`;
}

export const seoRoutes = new Elysia()
  .get("/sitemap.xml", async () => {
    const baseUrl = process.env.SITE_URL || "https://vanistudio.com";

    const staticPages = [
      { path: "/", priority: "1.0", changefreq: "daily" },
      { path: "/products", priority: "0.9", changefreq: "weekly" },
      { path: "/projects", priority: "0.9", changefreq: "weekly" },
      { path: "/services", priority: "0.9", changefreq: "weekly" },
      { path: "/blog", priority: "0.9", changefreq: "daily" },
      { path: "/contact", priority: "0.7", changefreq: "monthly" },
      { path: "/license", priority: "0.5", changefreq: "monthly" },
      { path: "/privacy", priority: "0.3", changefreq: "yearly" },
      { path: "/terms", priority: "0.3", changefreq: "yearly" },
      { path: "/refund", priority: "0.3", changefreq: "yearly" },
      { path: "/shipping", priority: "0.3", changefreq: "yearly" },
      { path: "/warranty", priority: "0.3", changefreq: "yearly" },
      { path: "/payment", priority: "0.3", changefreq: "yearly" },
    ];

    const [productList, projectList, blogList, serviceList] = await Promise.all([
      db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where(eq(products.status, "published")),
      db.select({ slug: projects.slug, updatedAt: projects.updatedAt }).from(projects).where(eq(projects.status, "published")),
      db.select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt }).from(blogPosts).where(eq(blogPosts.status, "published")),
      db.select({ slug: services.slug, updatedAt: services.updatedAt }).from(services).where(eq(services.status, "published")),
    ]);

    const dynamicPages = [
      ...productList.map(p => ({ path: `/products/${p.slug}`, priority: "0.8", changefreq: "weekly", lastmod: p.updatedAt })),
      ...projectList.map(p => ({ path: `/projects/${p.slug}`, priority: "0.8", changefreq: "monthly", lastmod: p.updatedAt })),
      ...blogList.map(p => ({ path: `/blog/${p.slug}`, priority: "0.7", changefreq: "weekly", lastmod: p.updatedAt })),
      ...serviceList.map(s => ({ path: `/services/${s.slug}`, priority: "0.7", changefreq: "monthly", lastmod: s.updatedAt })),
    ];

    const allPages = [...staticPages, ...dynamicPages];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${buildUrl(baseUrl, p.path)}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>${(p as any).lastmod ? `\n    <lastmod>${new Date((p as any).lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  })
  .get("/robots.txt", () => {
    const baseUrl = process.env.SITE_URL || "https://vanistudio.com";
    const text = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth
Disallow: /onboarding
Disallow: /configuration
Disallow: /api

Sitemap: ${baseUrl}/sitemap.xml`;

    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  });
