"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { type StorageConfig as DefaultStorageConfig } from "@/defaults/extension.default";

const ALL_FORMATS = [
  { key: "png", label: "PNG", icon: "solar:gallery-line-duotone" },
  { key: "jpg", label: "JPG", icon: "solar:camera-line-duotone" },
  { key: "jpeg", label: "JPEG", icon: "solar:camera-line-duotone" },
  { key: "bmp", label: "BMP", icon: "solar:palette-line-duotone" },
  { key: "tiff", label: "TIFF", icon: "solar:file-line-duotone" },
  { key: "svg", label: "SVG", icon: "solar:code-line-duotone" },
];

interface Props {
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  config: DefaultStorageConfig;
  onConfigChange: (config: any) => void;
}

export default function StorageConfig({
  isEnabled,
  onEnabledChange,
  config,
  onConfigChange,
}: Props) {
  const activeStorage = config.siteActiveStorage || "local";
  const imgConfig = config.siteImageProcessing || {
    enabled: false,
    convertToWebp: true,
    convertFormats: ["png", "jpg", "jpeg", "bmp", "tiff"],
    quality: 80,
    maxWidth: 1920,
    maxHeight: 1080,
    stripMetadata: true,
    progressive: true,
    preserveOriginal: false,
  };

  const updateImgConfig = (key: string, value: any) => {
    onConfigChange({
      siteImageProcessing: {
        ...imgConfig,
        [key]: value,
      },
    });
  };

  const toggleFormat = (format: string) => {
    const current = imgConfig.convertFormats || [];
    const updated = current.includes(format)
      ? current.filter((f: string) => f !== format)
      : [...current, format];
    updateImgConfig("convertFormats", updated);
  };

  const handleCloudinaryChange = (key: string, value: string) => {
    const cloudinary = config.siteCloudinary || { siteCloudName: "", siteApiKey: "", siteApiSecret: "" };
    onConfigChange({
      siteCloudinary: {
        ...cloudinary,
        [key]: value,
      },
    });
  };

  const handleR2Change = (key: string, value: string) => {
    const r2 = config.siteR2 || {
      siteAccountId: "",
      siteAccessKeyId: "",
      siteSecretAccessKey: "",
      siteBucketName: "",
      sitePublicUrl: "",
    };
    onConfigChange({
      siteR2: {
        ...r2,
        [key]: value,
      },
    });
  };

  const handleTigrisChange = (key: string, value: string) => {
    const tigris = config.siteTigris || {
      siteAccessKeyId: "",
      siteSecretAccessKey: "",
      siteBucketName: "",
    };
    onConfigChange({
      siteTigris: {
        ...tigris,
        [key]: value,
      },
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Icon icon="solar:folder-open-line-duotone" className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base text-foreground leading-none">Máy chủ Lưu trữ (Storage Engine)</h3>
              <p className="text-[13px] text-muted-foreground font-medium">Lựa chọn nơi lưu trữ tập tin ảnh, dữ liệu hệ thống mã nguồn.</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-border/50">
          <button
            onClick={() => onConfigChange({ siteActiveStorage: "local" })}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl border transition-all ${activeStorage === "local" ? "border-vanixjnk bg-vanixjnk/10 shadow-sm text-vanixjnk ring-1 ring-vanixjnk/25" : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50"}`}
          >
            <Icon icon="solar:server-minimalistic-line-duotone" className="w-8 h-8 text-vanixjnk" />
            <div className="flex flex-col items-start gap-1">
              <span className="text-sm font-bold text-foreground">Máy chủ Cục bộ</span>
              <span className="text-[11px] font-medium leading-tight text-left">Lưu trực tiếp vào Public Upload Folder</span>
            </div>
          </button>

          <button
            onClick={() => onConfigChange({ siteActiveStorage: "cloudinary" })}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl border transition-all ${activeStorage === "cloudinary" ? "border-[#3448C5] bg-[#3448C5]/10 shadow-sm text-[#3448C5] ring-1 ring-[#3448C5]/30" : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50"}`}
          >
            <Icon icon="logos:cloudinary-icon" className="w-8 h-8" />
            <div className="flex flex-col items-start gap-1">
              <span className="text-sm font-bold text-foreground">Cloudinary</span>
              <span className="text-[11px] font-medium leading-tight text-left">Dịch vụ lưu trữ, nén ảnh cao cấp 3rd</span>
            </div>
          </button>

          <button
            onClick={() => onConfigChange({ siteActiveStorage: "r2" })}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl border transition-all ${activeStorage === "r2" ? "border-[#f38020] bg-[#f38020]/10 shadow-sm text-[#f38020] ring-1 ring-[#f38020]/30" : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50"}`}
          >
            <Icon icon="logos:cloudflare-icon" className="w-8 h-8" />
            <div className="flex flex-col items-start gap-1">
              <span className="text-sm font-bold text-foreground">Cloudflare R2</span>
              <span className="text-[11px] font-medium leading-tight text-left">Lưu trữ Object mạnh mẽ, CDN toàn cầu</span>
            </div>
          </button>

          <button
            onClick={() => onConfigChange({ siteActiveStorage: "tigris" })}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl border transition-all ${activeStorage === "tigris" ? "border-[#FF7034] bg-[#FF7034]/10 shadow-sm text-[#FF7034] ring-1 ring-[#FF7034]/30" : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50"}`}
          >
            <Icon icon="solar:box-minimalistic-line-duotone" className="w-8 h-8 text-[#FF7034]" />
            <div className="flex flex-col items-start gap-1">
              <span className="text-sm font-bold text-foreground">Tigris Storage</span>
              <span className="text-[11px] font-medium leading-tight text-left">Object Storage phân tán không máy chủ</span>
            </div>
          </button>
        </div>
      </div>

      {activeStorage === "cloudinary" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon icon="solar:server-square-line-duotone" className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-base text-foreground leading-none">Cấu hình Cloudinary</h3>
                <p className="text-[13px] text-muted-foreground font-medium">Bổ sung Credentials để mở cổng kết nối dữ liệu ảnh.</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5"><Icon icon="solar:user-id-line-duotone" className="size-4 text-muted-foreground" /> Tên Tài khoản (Cloud Name)</label>
              <Input
                value={config.siteCloudinary?.siteCloudName || ""}
                onChange={e => handleCloudinaryChange("siteCloudName", e.target.value)}
                className="bg-background h-9 shadow-sm text-[13px]"
                placeholder="VD: db3yax2xx"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5"><Icon icon="solar:key-square-line-duotone" className="size-4 text-muted-foreground" /> Mã API Key</label>
              <Input
                value={config.siteCloudinary?.siteApiKey || ""}
                onChange={e => handleCloudinaryChange("siteApiKey", e.target.value)}
                className="bg-background h-9 shadow-sm text-[13px]"
                placeholder="Mã định danh ứng dụng (VD: 5468...657)"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5"><Icon icon="solar:lock-keyhole-line-duotone" className="size-4 text-muted-foreground" /> Mã API Secret Bí mật</label>
              <Input
                type="password"
                value={config.siteCloudinary?.siteApiSecret || ""}
                onChange={e => handleCloudinaryChange("siteApiSecret", e.target.value)}
                className="bg-background h-9 shadow-sm text-[13px]"
                placeholder="Nhập khóa bí mật API (Secret Key)..."
              />
            </div>

            <div className="flex gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 md:col-span-2">
              <Icon icon="solar:info-circle-line-duotone" className="size-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5 text-[12px] text-muted-foreground leading-relaxed">
                <p className="font-bold text-foreground text-[13px]">Hướng dẫn lấy thông tin Cloudinary:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Đăng nhập vào <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-semibold">Cloudinary Console</a> (hoặc đăng ký tài khoản miễn phí).</li>
                  <li>Tại màn hình <strong>Dashboard</strong> chính, tìm mục <strong>Product Environment Credentials</strong>.</li>
                  <li>Sao chép <strong>Cloud name</strong> điền vào ô *Tên Tài khoản*.</li>
                  <li>Sao chép <strong>API Key</strong> điền vào ô *Mã API Key*.</li>
                  <li>Nhấp vào nút hiển thị (mắt) bên cạnh <strong>API Secret</strong> để hiện mã bảo mật và sao chép điền vào ô *API Secret Bí mật*.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStorage === "r2" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-xl bg-[#f38020]/10 text-[#f38020] flex items-center justify-center shrink-0">
                <Icon icon="solar:server-square-line-duotone" className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-base text-foreground leading-none">Cấu hình Cloudflare R2</h3>
                <p className="text-[13px] text-muted-foreground font-medium">Điền Access Key và Credentials Bucket để đồng bộ.</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5"><Icon icon="solar:shield-user-line-duotone" className="size-4 text-muted-foreground" /> Cloudflare Account ID</label>
              <Input
                value={config.siteR2?.siteAccountId || ""}
                onChange={e => handleR2Change("siteAccountId", e.target.value)}
                className="bg-background h-9 shadow-sm text-[13px]"
                placeholder="Nhập mã định danh tài khoản doanh nghiệp gốc..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5"><Icon icon="solar:key-minimalistic-square-2-line-duotone" className="size-4 text-muted-foreground" /> Access Key ID</label>
              <Input
                value={config.siteR2?.siteAccessKeyId || ""}
                onChange={e => handleR2Change("siteAccessKeyId", e.target.value)}
                className="bg-background h-9 shadow-sm text-[13px]"
                placeholder="Nhập mã định danh Token truy cập gốc..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5"><Icon icon="solar:lock-keyhole-line-duotone" className="size-4 text-muted-foreground" /> Secret Access Key</label>
              <Input
                type="password"
                value={config.siteR2?.siteSecretAccessKey || ""}
                onChange={e => handleR2Change("siteSecretAccessKey", e.target.value)}
                className="bg-background h-9 shadow-sm text-[13px]"
                placeholder="Nhập mã token bí mật của ứng dụng..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5"><Icon icon="solar:archive-line-duotone" className="size-4 text-muted-foreground" /> Tên Bucket Lưu trữ</label>
              <Input
                value={config.siteR2?.siteBucketName || ""}
                onChange={e => handleR2Change("siteBucketName", e.target.value)}
                className="bg-background h-9 shadow-sm text-[13px]"
                placeholder="Tên vùng chứa dữ liệu (Vd: assets-bucket)..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5"><Icon icon="solar:global-line-duotone" className="size-4 text-muted-foreground" /> Public CNAME URL (Tùy chọn)</label>
              <Input
                value={config.siteR2?.sitePublicUrl || ""}
                onChange={e => handleR2Change("sitePublicUrl", e.target.value)}
                className="bg-background h-9 shadow-sm text-[13px]"
                placeholder="Nhập tên miền tùy chỉnh gán với Bucket (VD: https://cdn.domain)..."
              />
            </div>

            <div className="flex gap-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/15 md:col-span-2">
              <Icon icon="solar:info-circle-line-duotone" className="size-5 text-[#f38020] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5 text-[12px] text-muted-foreground leading-relaxed">
                <p className="font-bold text-foreground text-[13px]">Hướng dẫn lấy cấu hình Cloudflare R2:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Đăng nhập vào <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-[#f38020] hover:underline font-semibold">Cloudflare Dashboard</a>.</li>
                  <li>Chọn <strong>R2 Object Storage</strong> ở menu bên trái.</li>
                  <li><strong>Tạo Bucket</strong>: Chọn <strong>Create Bucket</strong>, nhập tên bất kỳ và điền vào ô *Tên Bucket*.</li>
                  <li><strong>Lấy Account ID</strong>: Quay lại trang R2 chính, copy mã <strong>Account ID</strong> ở cột bên phải.</li>
                  <li><strong>Tạo Access Key</strong>: Nhấp vào <strong>Manage R2 API Tokens</strong> → <strong>Create API Token</strong>.</li>
                  <li>Đặt tên token, chọn quyền <strong>Edit</strong> (hoặc Read/Write), kéo xuống nhấn <strong>Create API Token</strong>.</li>
                  <li>Sao chép <strong>Access Key ID</strong> và <strong>Secret Access Key</strong> điền tương ứng vào form bên trên.</li>
                  <li><strong>Public CNAME URL</strong>: Để ảnh hiển thị công khai, vào mục <strong>Settings</strong> của Bucket → <strong>Public Access</strong> → cấu hình domain tùy chỉnh (Custom Domain) hoặc bật <strong>R2.dev Subdomain</strong>.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStorage === "tigris" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-xl bg-[#FF7034]/10 text-[#FF7034] flex items-center justify-center shrink-0">
                <Icon icon="solar:server-square-line-duotone" className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-base text-foreground leading-none">Cấu hình Tigris Storage</h3>
                <p className="text-[13px] text-muted-foreground font-medium">Điền Access Key, Secret Key và Tên Bucket để đồng bộ.</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5"><Icon icon="solar:key-minimalistic-square-2-line-duotone" className="size-4 text-muted-foreground" /> Access Key ID</label>
              <Input
                value={config.siteTigris?.siteAccessKeyId || ""}
                onChange={e => handleTigrisChange("siteAccessKeyId", e.target.value)}
                className="bg-background h-9 shadow-sm text-[13px]"
                placeholder="Nhập mã định danh Token truy cập Tigris..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5"><Icon icon="solar:lock-keyhole-line-duotone" className="size-4 text-muted-foreground" /> Secret Access Key</label>
              <Input
                type="password"
                value={config.siteTigris?.siteSecretAccessKey || ""}
                onChange={e => handleTigrisChange("siteSecretAccessKey", e.target.value)}
                className="bg-background h-9 shadow-sm text-[13px]"
                placeholder="Nhập mã token bí mật Tigris..."
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5"><Icon icon="solar:archive-line-duotone" className="size-4 text-muted-foreground" /> Tên Bucket Lưu trữ</label>
              <Input
                value={config.siteTigris?.siteBucketName || ""}
                onChange={e => handleTigrisChange("siteBucketName", e.target.value)}
                className="bg-background h-9 shadow-sm text-[13px]"
                placeholder="Tên vùng chứa dữ liệu Tigris (Vd: my-bucket)..."
              />
            </div>

            <div className="flex gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 md:col-span-2">
              <Icon icon="solar:info-circle-line-duotone" className="size-5 text-[#FF7034] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5 text-[12px] text-muted-foreground leading-relaxed">
                <p className="font-bold text-foreground text-[13px]">Hướng dẫn lấy cấu hình Tigris Storage:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Đăng nhập vào <a href="https://console.tigris.dev" target="_blank" rel="noopener noreferrer" className="text-[#FF7034] hover:underline font-semibold">Tigris Console</a> (hoặc Fly.io dashboard).</li>
                  <li><strong>Tạo Bucket</strong>: Tạo một dự án mới hoặc chọn dự án hiện tại, chọn mục <strong>Buckets</strong> và tạo một bucket lưu trữ mới, sao chép điền vào *Tên Bucket*.</li>
                  <li><strong>Tạo API Key</strong>: Đến mục <strong>Access Keys</strong> → <strong>Create Access Key</strong>.</li>
                  <li>Chọn phạm vi truy cập (Read/Write cho bucket của bạn).</li>
                  <li>Hệ thống sẽ cấp cho bạn <strong>Access Key ID</strong> và <strong>Secret Access Key</strong> một lần duy nhất. Sao chép và dán vào các ô tương ứng phía trên.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center shrink-0">
              <Icon icon="solar:gallery-edit-line-duotone" className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base text-foreground leading-none">Xử lý Ảnh khi Upload</h3>
              <p className="text-[13px] text-muted-foreground font-medium">Cấu hình nén, chuyển đổi định dạng và tối ưu ảnh tự động khi tải lên (áp dụng cho mọi storage engine).</p>
            </div>
          </div>
          <button
            onClick={() => updateImgConfig("enabled", !imgConfig.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${imgConfig.enabled ? "bg-vanixjnk" : "bg-muted-foreground/30"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${imgConfig.enabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        
        <div className="flex flex-col gap-6 pt-4 border-t border-border/50">
          <div className="flex gap-3 p-4 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/15">
            <Icon icon="solar:info-circle-line-duotone" className="size-5 text-fuchsia-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2 text-[12px] text-muted-foreground leading-relaxed">
              <p className="font-bold text-foreground text-[13px]">Quy trình xử lý ảnh khi Upload:</p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1">
                <li><strong>Kiểm tra định dạng</strong> — Xác định loại file (PNG, JPG, BMP, TIFF, SVG, GIF...). File GIF sẽ <strong>luôn được giữ nguyên</strong> để bảo toàn animation.</li>
                <li><strong>Resize (Thu nhỏ)</strong> — Nếu ảnh vượt kích thước tối đa (maxWidth/maxHeight), hệ thống sẽ thu nhỏ theo tỷ lệ gốc mà không bị méo.</li>
                <li><strong>Nén chất lượng</strong> — Áp dụng mức nén đã cấu hình (1-100%). Giá trị thấp = file nhẹ hơn nhưng chất lượng giảm.</li>
                <li><strong>Chuyển đổi WebP</strong> — Nếu bật, các định dạng được chọn sẽ tự động convert sang WebP (giảm 25-35% dung lượng).</li>
                <li><strong>Xóa Metadata</strong> — Loại bỏ thông tin EXIF (GPS, camera, ngày chụp...) giúp bảo mật và giảm dung lượng.</li>
                <li><strong>Progressive Loading</strong> — Ảnh JPEG/WebP sẽ tải dần từ mờ → rõ thay vì từ trên xuống, cải thiện UX.</li>
                <li><strong>Lưu file gốc</strong> — Nếu bật, hệ thống lưu song song cả bản gốc (backup) và bản đã xử lý.</li>
              </ol>
              <p className="mt-1 text-[11px] italic">Lưu ý: Cấu hình này áp dụng cho <strong>tất cả storage engine</strong> (Local, Cloudinary, R2). Với Cloudinary, một số tùy chọn (nén, resize) có thể được xử lý bởi chính Cloudinary thay vì server.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                <Icon icon="solar:tuning-2-line-duotone" className="size-4 text-fuchsia-500" />
                Chất lượng nén ảnh
              </label>
              <span className="text-[13px] font-bold text-vanixjnk bg-vanixjnk/10 px-2 py-0.5 rounded-md">{imgConfig.quality}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={imgConfig.quality}
              onChange={e => updateImgConfig("quality", Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-vanixjnk"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
              <span>Nén mạnh (nhẹ file)</span>
              <span>Chất lượng cao (nặng file)</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                <Icon icon="solar:refresh-circle-line-duotone" className="size-4 text-emerald-500" />
                Chuyển đổi sang WebP
              </label>
              <button
                onClick={() => updateImgConfig("convertToWebp", !imgConfig.convertToWebp)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${imgConfig.convertToWebp ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${imgConfig.convertToWebp ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              WebP giảm dung lượng 25-35% so với PNG/JPEG mà vẫn giữ chất lượng. GIF sẽ <strong>không bị convert</strong> để giữ animation.
            </p>
          </div>
          {imgConfig.convertToWebp && (
            <div className="flex flex-col gap-3">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                <Icon icon="solar:file-check-line-duotone" className="size-4 text-blue-500" />
                Định dạng áp dụng chuyển đổi WebP
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ALL_FORMATS.map(fmt => (
                  <button
                    key={fmt.key}
                    onClick={() => toggleFormat(fmt.key)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-left ${
                      (imgConfig.convertFormats || []).includes(fmt.key)
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20"
                        : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Icon icon={fmt.icon} className="size-4 shrink-0" />
                    <span className="text-[12px] font-bold uppercase">{fmt.label}</span>
                  </button>
                ))}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border bg-muted/10 text-muted-foreground cursor-not-allowed opacity-60">
                  <Icon icon="solar:videocamera-record-line-duotone" className="size-4 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold uppercase">GIF</span>
                    <span className="text-[10px]">Luôn giữ nguyên</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
              <Icon icon="solar:maximize-square-line-duotone" className="size-4 text-amber-500" />
              Kích thước tối đa (Resize)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Chiều rộng tối đa (px)</span>
                <Input
                  type="number"
                  value={imgConfig.maxWidth || ""}
                  onChange={e => updateImgConfig("maxWidth", Number(e.target.value) || 0)}
                  className="bg-background h-9 shadow-sm text-[13px]"
                  placeholder="0 = Không giới hạn"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Chiều cao tối đa (px)</span>
                <Input
                  type="number"
                  value={imgConfig.maxHeight || ""}
                  onChange={e => updateImgConfig("maxHeight", Number(e.target.value) || 0)}
                  className="bg-background h-9 shadow-sm text-[13px]"
                  placeholder="0 = Không giới hạn"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">Ảnh vượt kích thước sẽ được thu nhỏ tỷ lệ. Đặt 0 để bỏ qua giới hạn.</p>
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
              <Icon icon="solar:settings-line-duotone" className="size-4 text-indigo-500" />
              Tùy chọn nâng cao
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => updateImgConfig("stripMetadata", !imgConfig.stripMetadata)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${imgConfig.stripMetadata ? "border-indigo-500/30 bg-indigo-500/10 ring-1 ring-indigo-500/20" : "border-border bg-muted/20 hover:bg-muted/40"}`}
              >
                <Icon icon="solar:eraser-line-duotone" className={`size-5 ${imgConfig.stripMetadata ? "text-indigo-500" : "text-muted-foreground"}`} />
                <div className="flex flex-col items-start gap-0.5">
                  <span className={`text-[12px] font-bold ${imgConfig.stripMetadata ? "text-indigo-600" : "text-foreground"}`}>Xóa Metadata</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">Loại bỏ EXIF, GPS, camera info</span>
                </div>
              </button>
              <button
                onClick={() => updateImgConfig("progressive", !imgConfig.progressive)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${imgConfig.progressive ? "border-indigo-500/30 bg-indigo-500/10 ring-1 ring-indigo-500/20" : "border-border bg-muted/20 hover:bg-muted/40"}`}
              >
                <Icon icon="solar:layers-line-duotone" className={`size-5 ${imgConfig.progressive ? "text-indigo-500" : "text-muted-foreground"}`} />
                <div className="flex flex-col items-start gap-0.5">
                  <span className={`text-[12px] font-bold ${imgConfig.progressive ? "text-indigo-600" : "text-foreground"}`}>Progressive</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">Tải ảnh dần từ mờ → rõ</span>
                </div>
              </button>
              <button
                onClick={() => updateImgConfig("preserveOriginal", !imgConfig.preserveOriginal)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${imgConfig.preserveOriginal ? "border-indigo-500/30 bg-indigo-500/10 ring-1 ring-indigo-500/20" : "border-border bg-muted/20 hover:bg-muted/40"}`}
              >
                <Icon icon="solar:copy-line-duotone" className={`size-5 ${imgConfig.preserveOriginal ? "text-indigo-500" : "text-muted-foreground"}`} />
                <div className="flex flex-col items-start gap-0.5">
                  <span className={`text-[12px] font-bold ${imgConfig.preserveOriginal ? "text-indigo-600" : "text-foreground"}`}>Giữ file gốc</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">Lưu cả bản gốc + bản nén</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
