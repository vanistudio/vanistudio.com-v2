import { notFound } from "next/navigation";
import { cmsService } from "@/server/services/administrator/cms.service";
import PubCmsPage from "@/components/contents/public/_cms/PubCmsPage";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const page = await cmsService.getPageBySlug(resolvedParams.slug);

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
  const page = await cmsService.getPageBySlug(resolvedParams.slug);

  if (!page || !page.isActive) {
    notFound();
  }

  return <PubCmsPage page={page} />;
}
