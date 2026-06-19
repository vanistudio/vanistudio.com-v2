import PubCheckRoblox from "@/components/contents/public/_tools/PubCheckRoblox";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiểm Tra Roblox Profile & Place | Vani Studio",
  description: "Công cụ trực tuyến hỗ trợ kiểm tra thông tin tài khoản Roblox, các vật phẩm đang đeo (currently wearing), nhóm tham gia, và chi tiết place/game.",
};

export default function CheckRobloxPage() {
  return <PubCheckRoblox />;
}
