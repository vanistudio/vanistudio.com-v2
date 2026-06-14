import { notFound } from "next/navigation";
import { servicesRepository } from "@/server/repositories/administrator/services.repository";
import PubServiceDetail from "@/components/contents/public/_services/PubServiceDetail";
import type { Metadata } from "next";

export const dynamicParams = true;

// Pre-render some active services
export async function generateStaticParams() {
  const allServices = await servicesRepository.getServices();
  return allServices
    .filter((s) => s.status === "active")
    .map((s) => ({
      slug: s.slug,
    }));
}

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const service = await servicesRepository.getServiceBySlug(resolvedParams.slug);

  if (!service || service.status !== "active") {
    return {
      title: "Dịch vụ không tồn tại | Vani Studio",
    };
  }

  const metaTitle = `${service.name} | Vani Studio`;
  const metaDesc = service.description || "Chi tiết dịch vụ chất lượng cao cung cấp bởi Vani Studio.";

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      images: service.thumbnail ? [{ url: service.thumbnail }] : undefined,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const service = await servicesRepository.getServiceBySlug(resolvedParams.slug);

  if (!service || service.status !== "active") {
    notFound();
  }

  const packages = await servicesRepository.getPackagesByServiceId(service.id);

  return <PubServiceDetail service={service} packages={packages} />;
}

