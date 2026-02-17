import { useState, useEffect } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { usePageTitle } from "@/hooks/use-page-title";
import { api } from "@/lib/api";
import { toast } from "sonner";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Icon icon={icon} className="text-sm text-primary" />
        </div>
        <span className="text-sm font-semibold text-title">{title}</span>
      </div>
      <Separator className="mb-4" />
    </>
  );
}

export default function AdminSettings() {
  usePageTitle("Cài đặt Website");

  const [form, setForm] = useState({
    siteName: "",
    siteTagline: "",
    siteDescription: "",
    siteUrl: "",
    siteLogo: "",
    siteFavicon: "",
    siteLanguage: "vi",
    siteMetaTitle: "",
    siteMetaDescription: "",
    siteMetaKeywords: "",
    siteMetaAuthor: "",
    siteMetaRobots: "index, follow",
    siteCanonicalUrl: "",
    siteOgImage: "",
    siteOgType: "website",
    siteOgLocale: "vi_VN",
    siteGoogleAnalyticsId: "",
    siteGoogleTagManagerId: "",
    siteFacebookPixelId: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    setLoading(true);
    (api.api.admin.settings as any).get().then(({ data }: any) => {
      if (data?.success && data.settings) {
        const s = data.settings;
        setForm({
          siteName: s.siteName || "",
          siteTagline: s.siteTagline || "",
          siteDescription: s.siteDescription || "",
          siteUrl: s.siteUrl || "",
          siteLogo: s.siteLogo || "",
          siteFavicon: s.siteFavicon || "",
          siteLanguage: s.siteLanguage || "vi",
          siteMetaTitle: s.siteMetaTitle || "",
          siteMetaDescription: s.siteMetaDescription || "",
          siteMetaKeywords: s.siteMetaKeywords || "",
          siteMetaAuthor: s.siteMetaAuthor || "",
          siteMetaRobots: s.siteMetaRobots || "index, follow",
          siteCanonicalUrl: s.siteCanonicalUrl || "",
          siteOgImage: s.siteOgImage || "",
          siteOgType: s.siteOgType || "website",
          siteOgLocale: s.siteOgLocale || "vi_VN",
          siteGoogleAnalyticsId: s.siteGoogleAnalyticsId || "",
          siteGoogleTagManagerId: s.siteGoogleTagManagerId || "",
          siteFacebookPixelId: s.siteFacebookPixelId || "",
        });
      }
    }).catch(() => {
      toast.error("Không thể tải cài đặt");
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!form.siteName) return toast.error("Tên website là bắt buộc");
    if (!form.siteUrl) return toast.error("URL website là bắt buộc");
    setSubmitting(true);
    try {
      const { data } = await (api.api.admin.settings as any).patch(form);
      if (data?.success) {
        toast.success("Cập nhật cài đặt thành công");
      } else {
        toast.error(data?.error || "Cập nhật thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <AppDashed noTopBorder padding="p-0">
          <div className="flex items-center justify-center py-20">
            <Icon icon="solar:spinner-bold-duotone" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        </AppDashed>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:tuning-2-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">Cài đặt Website</h1>
              <p className="text-xs text-muted-foreground">Quản lý thông tin và cấu hình website</p>
            </div>
          </div>
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-5">
        <div className="space-y-6">
          <div>
            <SectionHeader icon="solar:home-2-bold-duotone" title="Thông tin chung" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tên website *">
                  <Input className="text-sm" placeholder="Vani Studio" value={form.siteName} onChange={(e) => set("siteName", e.target.value)} />
                </Field>
                <Field label="URL website *" hint="Bao gồm https://">
                  <Input className="text-sm" placeholder="https://vanistudio.com" value={form.siteUrl} onChange={(e) => set("siteUrl", e.target.value)} />
                </Field>
              </div>
              <Field label="Tagline" hint="Khẩu hiệu ngắn gọn cho website">
                <Input className="text-sm" placeholder="Creative Digital Studio" value={form.siteTagline} onChange={(e) => set("siteTagline", e.target.value)} />
              </Field>
              <Field label="Mô tả website">
                <Input className="text-sm" placeholder="Mô tả ngắn gọn về website..." value={form.siteDescription} onChange={(e) => set("siteDescription", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Logo URL">
                  <Input className="text-sm" placeholder="https://..." value={form.siteLogo} onChange={(e) => set("siteLogo", e.target.value)} />
                </Field>
                <Field label="Favicon URL">
                  <Input className="text-sm" placeholder="https://..." value={form.siteFavicon} onChange={(e) => set("siteFavicon", e.target.value)} />
                </Field>
              </div>
              <Field label="Ngôn ngữ">
                <Input className="text-sm" placeholder="vi" value={form.siteLanguage} onChange={(e) => set("siteLanguage", e.target.value)} />
              </Field>
            </div>
          </div>

          <Separator />

          <div>
            <SectionHeader icon="solar:magnifer-bold-duotone" title="SEO & Meta" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Meta Title" hint="Tiêu đề hiển thị trên kết quả tìm kiếm">
                  <Input className="text-sm" placeholder="Vani Studio - Creative Digital Studio" value={form.siteMetaTitle} onChange={(e) => set("siteMetaTitle", e.target.value)} />
                </Field>
                <Field label="Meta Author">
                  <Input className="text-sm" placeholder="Vani Studio" value={form.siteMetaAuthor} onChange={(e) => set("siteMetaAuthor", e.target.value)} />
                </Field>
              </div>
              <Field label="Meta Description" hint="Mô tả hiển thị trên kết quả tìm kiếm (tối đa 160 ký tự)">
                <Input className="text-sm" placeholder="Mô tả website cho SEO..." value={form.siteMetaDescription} onChange={(e) => set("siteMetaDescription", e.target.value)} />
              </Field>
              <Field label="Meta Keywords" hint="Các từ khóa cách nhau bằng dấu phẩy">
                <Input className="text-sm" placeholder="web development, design, saas..." value={form.siteMetaKeywords} onChange={(e) => set("siteMetaKeywords", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Meta Robots">
                  <Input className="text-sm" placeholder="index, follow" value={form.siteMetaRobots} onChange={(e) => set("siteMetaRobots", e.target.value)} />
                </Field>
                <Field label="Canonical URL">
                  <Input className="text-sm" placeholder="https://vanistudio.com" value={form.siteCanonicalUrl} onChange={(e) => set("siteCanonicalUrl", e.target.value)} />
                </Field>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <SectionHeader icon="solar:share-bold-duotone" title="Open Graph / Social" />
            <div className="space-y-4">
              <Field label="OG Image URL" hint="Ảnh hiển thị khi chia sẻ trên mạng xã hội (1200x630)">
                <Input className="text-sm" placeholder="https://..." value={form.siteOgImage} onChange={(e) => set("siteOgImage", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="OG Type">
                  <Input className="text-sm" placeholder="website" value={form.siteOgType} onChange={(e) => set("siteOgType", e.target.value)} />
                </Field>
                <Field label="OG Locale">
                  <Input className="text-sm" placeholder="vi_VN" value={form.siteOgLocale} onChange={(e) => set("siteOgLocale", e.target.value)} />
                </Field>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <SectionHeader icon="solar:chart-bold-duotone" title="Analytics & Tracking" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Google Analytics ID" hint="Ví dụ: G-XXXXXXXXXX">
                  <Input className="text-sm font-mono" placeholder="G-XXXXXXXXXX" value={form.siteGoogleAnalyticsId} onChange={(e) => set("siteGoogleAnalyticsId", e.target.value)} />
                </Field>
                <Field label="Google Tag Manager ID" hint="Ví dụ: GTM-XXXXXXX">
                  <Input className="text-sm font-mono" placeholder="GTM-XXXXXXX" value={form.siteGoogleTagManagerId} onChange={(e) => set("siteGoogleTagManagerId", e.target.value)} />
                </Field>
              </div>
              <Field label="Facebook Pixel ID">
                <Input className="text-sm font-mono" placeholder="XXXXXXXXXXXXXXXX" value={form.siteFacebookPixelId} onChange={(e) => set("siteFacebookPixelId", e.target.value)} />
              </Field>
            </div>
          </div>
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-end">
          <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
            <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
            {submitting ? "Đang lưu..." : "Lưu cài đặt"}
          </Button>
        </div>
      </AppDashed>
    </div>
  );
}
