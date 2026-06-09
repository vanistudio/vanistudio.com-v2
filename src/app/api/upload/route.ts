import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { StorageService } from "@/server/io/_others/storage.io";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(true);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền thực hiện hành động này" }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file để tải lên" }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const savedItem = await StorageService.uploadBuffer(
      buffer,
      file.name,
      file.type || "image/png",
      "uploads"
    );
    return NextResponse.json({ success: true, data: savedItem });
  } catch (error: any) {
    console.error("Lỗi upload file:", error);
    return NextResponse.json({ error: error.message || "Tải tập tin lên thất bại" }, { status: 500 });
  }
}
