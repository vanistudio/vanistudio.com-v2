import { db } from "@/server/db";
import { apiProducts } from "@/server/db/schemas/api.schema";
import { asc, desc } from "drizzle-orm";
import PubDocsProductList from "@/components/contents/public/_docs/PubDocsProductList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tài liệu API tích hợp | Vani Studio",
  description: "Khám phá tài liệu kỹ thuật, hướng dẫn tích hợp và thử nghiệm trực tiếp các sản phẩm API của Vani Studio.",
};

export default async function DocsIndexPage() {
  const products = await db
    .select()
    .from(apiProducts)
    .orderBy(asc(apiProducts.order), desc(apiProducts.createdAt));

  return <PubDocsProductList initialProducts={products as any} />;
}
