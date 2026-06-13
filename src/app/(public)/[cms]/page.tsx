import { notFound } from "next/navigation";
import { cmsService } from "@/server/services/administrator/cms.service";
import PubCmsPage from "@/components/contents/public/_cms/PubCmsPage";
import AppLayout from "@/components/layouts/application/AppLayout";
import type { Metadata } from "next";

export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await cmsService.getPages();
  return pages
    .filter((page) => page.isActive)
    .map((page) => ({
      cms: page.slug,
    }));
}


interface Props {
  params: Promise<{ cms: string }> | { cms: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const page = await cmsService.getPageBySlug(resolvedParams.cms);

  if (!page || !page.isActive) {
    return {
      title: "Trang không tồn tại | Vani Studio",
    };
  }

  return {
    title: `${page.metaTitle || page.title} | Vani Studio`,
    description: page.metaDescription || page.description || undefined,
    keywords: page.metaKeywords || undefined,
    openGraph: {
      title: `${page.metaTitle || page.title} | Vani Studio`,
      description: page.metaDescription || page.description || undefined,
      images: page.thumbnail ? [{ url: page.thumbnail }] : undefined,
    },
  };
}

export default async function CmsPublicPage({ params }: Props) {
  const resolvedParams = await params;
  const page = await cmsService.getPageBySlug(resolvedParams.cms);

  if (!page || !page.isActive) {
    notFound();
  }

  return (
    <AppLayout>
      <PubCmsPage page={page} />
    </AppLayout>
  );
}
