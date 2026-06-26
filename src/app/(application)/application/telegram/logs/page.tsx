import type { Metadata } from "next";
import TelegramLogs from "@/components/contents/application/_telegram/TelegramLogs";

export const metadata: Metadata = {
  title: "Lịch sử hoạt động Telegram | Vani Studio",
  description: "Nhật ký ghi nhận chi tiết kết nối, lỗi Proxy, giới hạn API và các tiến trình tự động trả lời tin nhắn.",
};

export default function TelegramLogsPage() {
  return <TelegramLogs />;
}
