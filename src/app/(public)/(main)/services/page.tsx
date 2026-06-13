import { db } from "@/server/db";
import { services } from "@/server/db/schemas/service.schema";
import { eq, desc } from "drizzle-orm";
import PubServicesList from "@/components/contents/public/_services/PubServicesList";
import type { Metadata } from "next";
import { servicesRepository } from "@/server/repositories/administrator/services.repository";

export const metadata: Metadata = {
  title: "Dịch Vụ Thiết Kế & Lập Trình Chuyên Nghiệp | Vani Studio",
  description: "Dịch vụ lập trình Website chuẩn SEO, Ứng dụng di động iOS/Android, Chatbot AI thông minh, Minecraft Plugin và Thiết kế UI/UX theo yêu cầu.",
};

export default async function ServicesPage() {
  const activeServices = await db.query.services.findMany({
    where: eq(services.status, "active"),
    orderBy: [desc(services.createdAt)],
    with: {
      serviceType: true,
    },
  });

  const categories = await servicesRepository.getTypes();

  return <PubServicesList initialServices={activeServices as any} categories={categories} />;
}
