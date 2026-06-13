import PubCheckCookie from "@/components/contents/public/_tools/PubCheckCookie";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiểm Tra Cookie Facebook | Vani Studio",
  description: "Công cụ kiểm tra nhanh trạng thái Cookie Facebook trực tuyến, trả về UID, Tên và Ảnh đại diện tài khoản.",
};

export default function CheckCookieFacebookPage() {
  return <PubCheckCookie />;
}
