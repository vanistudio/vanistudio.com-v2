import type { Metadata } from "next";
import TelegramAccounts from "@/components/contents/application/_telegram/TelegramAccounts";

export const metadata: Metadata = {
  title: "Quản lý Tài khoản Telegram | Vani Studio",
  description: "Trang cấu hình và quản lý danh sách tài khoản Telegram cá nhân, session và proxy.",
};

export default function TelegramAccountsPage() {
  return <TelegramAccounts />;
}
