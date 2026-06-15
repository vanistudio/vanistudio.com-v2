import type { Metadata } from "next";
import AdminDocs from "@/components/contents/administrator/_docs/AdminDocs";

export const metadata: Metadata = {
  title: "Tài liệu API & Playground | Trang quản trị",
  description: "Tra cứu và thử nghiệm trực tiếp các cổng API của hệ thống VaniStudio",
};

export default function AdminDocsPage() {
  return <AdminDocs />;
}
