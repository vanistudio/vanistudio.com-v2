import { notFound } from "next/navigation";
import { apiRepository } from "@/server/repositories/api.repository";
import PubDocsPage from "@/components/contents/public/_docs/PubDocsPage";
import type { Metadata } from "next";

export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await apiRepository.getApiProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await apiRepository.getApiProductBySlug(resolvedParams.slug);

  if (!product) {
    return {
      title: "Tài liệu không tồn tại | Vani Studio",
    };
  }

  return {
    title: `${product.name} | Tài liệu API | Vani Studio`,
    description: product.description || undefined,
    openGraph: {
      title: `${product.name} | Tài liệu API | Vani Studio`,
      description: product.description || undefined,
      images: product.thumbnail ? [{ url: product.thumbnail }] : undefined,
    },
  };
}

export default async function DocsDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const products = await apiRepository.getApiProducts();
  const currentProduct = products.find((p) => p.slug === resolvedParams.slug);

  if (!currentProduct) {
    notFound();
  }

  return (
    <PubDocsPage
      initialProducts={products as any}
      currentProductSlug={resolvedParams.slug}
    />
  );
}
