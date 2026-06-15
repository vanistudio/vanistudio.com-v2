import type { Metadata } from "next";
import EndpointEditor from "@/components/contents/administrator/_docs/EndpointEditor";

export const metadata: Metadata = {
  title: "Thêm API Endpoint mới | Trang quản trị",
  description: "Tạo tài liệu đặc tả cho endpoint API mới.",
};

export default function CreateEndpointPage() {
  return <EndpointEditor mode="create" />;
}
