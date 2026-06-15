import type { Metadata } from "next";
import OverviewEditor from "@/components/contents/administrator/_docs/OverviewEditor";

export const metadata: Metadata = {
  title: "Thêm tài liệu hướng dẫn mới | Trang quản trị",
  description: "Tạo tài liệu hướng dẫn hoặc tài liệu giới thiệu API mới.",
};

export default function CreateOverviewPage() {
  return <OverviewEditor mode="create" />;
}
