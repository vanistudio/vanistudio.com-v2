import PubCheckDomain from "@/components/contents/public/_tools/PubCheckDomain";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra Cứu WHOIS & DNS Tên Miền | Vani Studio",
  description: "Tra cứu thông tin chi tiết WHOIS, kiểm tra trạng thái ngày đăng ký, ngày hết hạn và các bản ghi DNS A, AAAA, MX, NS, TXT của tên miền Việt Nam (.vn) và quốc tế.",
};

export default function CheckDomainPage() {
  return <PubCheckDomain />;
}
