import { notFound } from "next/navigation";
import { productsRepository } from "@/server/repositories/products.repository";
import PubProductDetail from "@/components/contents/public/_products/PubProductDetail";
import type { Metadata } from "next";

export const dynamicParams = true;

export async function generateStaticParams() {
  const allProducts = await productsRepository.getProducts();
  return allProducts
    .filter((p) => p.status !== "draft")
    .map((p) => ({
      slug: p.slug,
    }));
}

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await productsRepository.getProductBySlug(resolvedParams.slug);

  if (!product || product.status === "draft") {
    return {
      title: "Sản phẩm không tồn tại | Vani Studio",
    };
  }

  const metaTitle = `${product.name} | Vani Studio`;
  const metaDesc = product.description || "Chi tiết sản phẩm, phần mềm do Vani Studio thiết kế & phát triển.";

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      images: product.thumbnail ? [{ url: product.thumbnail }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const product = await productsRepository.getProductBySlug(resolvedParams.slug);

  if (!product || product.status === "draft") {
    notFound();
  }

  return <PubProductDetail product={product} />;
}
