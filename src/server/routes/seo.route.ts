import { Elysia } from "elysia";
import { seoService } from "@/server/services/seo.service";

export const seoRoutes = new Elysia()
  .get("/sitemap.xml", async () => {
    try {
      const xml = await seoService.generateSitemap();
      return new Response(xml, {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      });
    } catch (error: any) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  })
  .get("/robots.txt", () => {
    const text = seoService.getRobotsTxt();
    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  });
