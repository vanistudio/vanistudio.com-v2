import PubQRGenerator from "@/components/contents/public/_tools/PubQRGenerator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trình Tạo Mã QR | Vani Studio",
  description: "Công cụ tạo mã QR chuyên nghiệp, hỗ trợ tùy biến màu sắc, kiểu dáng, mức độ bảo mật và gắn thêm logo thương hiệu.",
};

export default function QRGeneratorPage() {
  return <PubQRGenerator />;
}
