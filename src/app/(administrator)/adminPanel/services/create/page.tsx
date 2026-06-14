import type { Metadata } from "next";
import ServiceEditor from "@/components/contents/administrator/_services/ServiceEditor";

export const metadata: Metadata = {
  title: "Tạo dịch vụ mới | Trang quản trị",
  description: "Tạo mới dịch vụ kỹ thuật",
};

export default function ServiceCreatePage() {
  return <ServiceEditor mode="create" />;
}
