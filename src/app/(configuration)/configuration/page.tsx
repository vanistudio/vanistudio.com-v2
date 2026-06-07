import type { Metadata } from "next";
import { ConfPage } from "@/components/contents/configuration/ConfPage";

export const metadata: Metadata = {
  title: "Cấu hình hệ thống | VaniStudio",
  description: "Thiết lập cấu hình ban đầu cho trang web VaniStudio",
};

export default function ConfigurationPage() {
  return <ConfPage />;
}
