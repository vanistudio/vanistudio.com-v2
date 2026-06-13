import PubCheckLiveUid from "@/components/contents/public/_tools/PubCheckLiveUid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiểm Tra Trạng Thái UID Facebook | Vani Studio",
  description: "Công cụ kiểm tra nhanh trạng thái Live/Die của danh sách UID Facebook trực tuyến và chính xác.",
};

export default function CheckLiveUidPage() {
  return <PubCheckLiveUid />;
}
