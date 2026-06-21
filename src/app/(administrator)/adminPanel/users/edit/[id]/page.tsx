import type { Metadata } from "next";
import UserEditor from "@/components/contents/administrator/_users/UserEditor";

export const metadata: Metadata = {
  title: "Chỉnh sửa thành viên | Trang quản trị",
  description: "Chi tiết và chỉnh sửa thông tin thành viên hệ thống",
};

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export default async function UserEditPage({ params }: Props) {
  const resolvedParams = await params;
  return <UserEditor initialId={resolvedParams.id} />;
}
