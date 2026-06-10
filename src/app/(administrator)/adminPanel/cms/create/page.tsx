import type { Metadata } from "next";
import CmsPageEditor from "@/components/contents/administrator/_cms/CmsPageEditor";

export const metadata: Metadata = {
  title: "Tạo trang CMS mới | Trang quản trị",
  description: "Tạo mới trang CMS tĩnh, bài viết giới thiệu, điều khoản điều kiện",
};

export default function CmsCreatePage() {
  return <CmsPageEditor mode="create" />;
}
