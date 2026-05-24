import { productRepository } from "@/server/repositories/product.repository";
import { projectRepository } from "@/server/repositories/project.repository";
import { blogRepository } from "@/server/repositories/blog.repository";
import { serviceRepository } from "@/server/repositories/service.repository";
import { settingRepository } from "@/server/repositories/setting.repository";

function buildUrl(base: string, path: string) {
  return `${base.replace(/\/$/, '')}${path}`;
}

export const seoService = {
  async generateSitemap(): Promise<string> {
    const setting = await settingRepository.get();
    const baseUrl = setting?.siteUrl || process.env.SITE_URL || "https://vanistudio.com";

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
      productRepository.getPublishedSlugs(),
      projectRepository.getPublishedSlugs(),
      blogRepository.getPublishedSlugs(),
      serviceRepository.getPublishedSlugs(),
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

    return xml;
  },

  async getRobotsTxt(): Promise<string> {
    const setting = await settingRepository.get();
    const baseUrl = setting?.siteUrl || process.env.SITE_URL || "https://vanistudio.com";
    return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth
Disallow: /onboarding
Disallow: /configuration
Disallow: /api

Sitemap: ${baseUrl}/sitemap.xml`;
  },
};
