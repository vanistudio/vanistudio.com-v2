import PubCheckDiscord from "@/components/contents/public/_tools/PubCheckDiscord";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiểm Tra Token Discord | Vani Studio",
  description:
    "Công cụ trực tuyến hỗ trợ kiểm tra chi tiết trạng thái hoạt động (Live/Die), thông tin tài khoản, cấu hình bot, liên kết thanh toán, Nitro của token Discord.",
};

export default function CheckDiscordPage() {
  return <PubCheckDiscord />;
}
