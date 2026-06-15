import { db } from "@/server/db";
import { products } from "@/server/db/schemas/product.schema";
import { ne, desc, asc } from "drizzle-orm";
import PubProductsList from "@/components/contents/public/_products/PubProductsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sản Phẩm Phần Mềm & SaaS Premium | Vani Studio",
  description: "Khám phá các sản phẩm phần mềm chất lượng cao, SaaS boilerplates, chatbot AI và công cụ tự động hóa được tối ưu hóa hiệu năng bởi Vani Studio.",
};

export default async function ProductsPage() {
  const activeProducts = await db.query.products.findMany({
    where: ne(products.status, "draft"),
    orderBy: [asc(products.order), desc(products.createdAt)],
  });

  return <PubProductsList initialProducts={activeProducts as any} />;
}
