import type { Metadata } from "next";
import TelegramAutoReply from "@/components/contents/application/_telegram/TelegramAutoReply";

export const metadata: Metadata = {
  title: "Cấu hình Tự động trả lời Telegram | Vani Studio",
  description: "Trang cấu hình chế độ tự động phản hồi tin nhắn riêng tư khi offline, thiết lập giờ làm việc và chống spam.",
};

export default function TelegramAutoReplyPage() {
  return <TelegramAutoReply />;
}
