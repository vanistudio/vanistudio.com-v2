import { useState } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import { Icon } from "@iconify/react";

const AUTH_ROUTES = {
  github: "/api/auth/github",
  google: "/api/auth/google",
};

export default function ConfigurationPage() {
  const navigate = useNavigate();
  const { isAuthenticated, refresh } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    siteName: "",
    siteUrl: "",
    siteTagline: "",
    siteDescription: "",
    siteLanguage: "vi",
    siteMetaTitle: "",
    siteMetaDescription: "",
    siteMetaKeywords: "",
    siteMetaAuthor: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.api.config.setup.post(form);
      if (data?.success) {
        await refresh();
        navigate("/");
      } else {
        setError(data?.error || "Có lỗi xảy ra");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col w-full">
        <AppDashed noTopBorder padding="p-6">
          <div className="flex flex-col gap-6 max-w-[420px] mx-auto w-full min-h-[500px] justify-center">
            <div className="text-center select-none space-y-3">
              <div className="flex justify-center">
                <Icon icon="solar:settings-bold-duotone" className="text-5xl text-primary" />
              </div>
              <h1 className="text-xl font-bold leading-tight text-title">
                Cài đặt Vani Studio
              </h1>
              <p className="text-muted-foreground text-sm">
                Bạn cần đăng nhập để thiết lập website
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={AUTH_ROUTES.github}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted-background transition-colors text-sm font-medium text-foreground cursor-pointer no-underline"
              >
                <Icon icon="mdi:github" className="text-xl" />
                <span>Đăng nhập với GitHub</span>
              </a>

              <a
                href={AUTH_ROUTES.google}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted-background transition-colors text-sm font-medium text-foreground cursor-pointer no-underline"
              >
                <Icon icon="flat-color-icons:google" className="text-xl" />
                <span>Đăng nhập với Google</span>
              </a>
            </div>
          </div>
        </AppDashed>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-6">
        <div className="flex flex-col gap-6 max-w-[520px] mx-auto w-full">
          <div className="text-center select-none space-y-1">
            <h1 className="text-xl font-bold leading-tight text-title">
              {step === 1 ? "Thông tin Website" : "Cấu hình SEO"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {step === 1
                ? "Nhập thông tin cơ bản cho website của bạn"
                : "Tối ưu hoá cho công cụ tìm kiếm (tuỳ chọn)"}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-border"}`} />
              <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-border"}`} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="siteName" className="text-sm font-medium text-foreground">
                    Tên website <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="siteName"
                    type="text"
                    required
                    maxLength={200}
                    placeholder="vd: Vani Studio"
                    value={form.siteName}
                    onChange={(e) => updateField("siteName", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="siteUrl" className="text-sm font-medium text-foreground">
                    URL website <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="siteUrl"
                    type="url"
                    required
                    maxLength={500}
                    placeholder="vd: https://vanistudio.com"
                    value={form.siteUrl}
                    onChange={(e) => updateField("siteUrl", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="siteTagline" className="text-sm font-medium text-foreground">
                    Khẩu hiệu
                  </label>
                  <input
                    id="siteTagline"
                    type="text"
                    maxLength={300}
                    placeholder="vd: Thiết kế và phát triển phần mềm"
                    value={form.siteTagline}
                    onChange={(e) => updateField("siteTagline", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="siteDescription" className="text-sm font-medium text-foreground">
                    Mô tả
                  </label>
                  <textarea
                    id="siteDescription"
                    maxLength={1000}
                    rows={3}
                    placeholder="Mô tả ngắn gọn về website của bạn"
                    value={form.siteDescription}
                    onChange={(e) => updateField("siteDescription", e.target.value)}
                    className={inputClass + " resize-none"}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="siteLanguage" className="text-sm font-medium text-foreground">
                    Ngôn ngữ
                  </label>
                  <select
                    id="siteLanguage"
                    value={form.siteLanguage}
                    onChange={(e) => updateField("siteLanguage", e.target.value)}
                    className={inputClass}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!form.siteName || !form.siteUrl) {
                      setError("Vui lòng điền tên và URL website");
                      return;
                    }
                    setError("");
                    setStep(2);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium cursor-pointer"
                >
                  Tiếp tục
                  <Icon icon="solar:arrow-right-linear" className="text-lg" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="siteMetaTitle" className="text-sm font-medium text-foreground">
                    Meta Title
                  </label>
                  <input
                    id="siteMetaTitle"
                    type="text"
                    maxLength={200}
                    placeholder={form.siteName || "Tiêu đề SEO"}
                    value={form.siteMetaTitle}
                    onChange={(e) => updateField("siteMetaTitle", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="siteMetaDescription" className="text-sm font-medium text-foreground">
                    Meta Description
                  </label>
                  <textarea
                    id="siteMetaDescription"
                    maxLength={500}
                    rows={3}
                    placeholder="Mô tả hiển thị trên kết quả tìm kiếm"
                    value={form.siteMetaDescription}
                    onChange={(e) => updateField("siteMetaDescription", e.target.value)}
                    className={inputClass + " resize-none"}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="siteMetaKeywords" className="text-sm font-medium text-foreground">
                    Meta Keywords
                  </label>
                  <input
                    id="siteMetaKeywords"
                    type="text"
                    maxLength={500}
                    placeholder="vd: thiết kế web, phần mềm, studio"
                    value={form.siteMetaKeywords}
                    onChange={(e) => updateField("siteMetaKeywords", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="siteMetaAuthor" className="text-sm font-medium text-foreground">
                    Tác giả
                  </label>
                  <input
                    id="siteMetaAuthor"
                    type="text"
                    maxLength={200}
                    placeholder="vd: Vani Studio"
                    value={form.siteMetaAuthor}
                    onChange={(e) => updateField("siteMetaAuthor", e.target.value)}
                    className={inputClass}
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-500 text-center bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted-background transition-colors text-sm font-medium text-foreground cursor-pointer"
                  >
                    <Icon icon="solar:arrow-left-linear" className="text-lg" />
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang cài đặt..." : "Hoàn tất"}
                  </button>
                </div>
              </>
            )}

            {step === 1 && error && (
              <div className="text-sm text-red-500 text-center bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                {error}
              </div>
            )}
          </form>
        </div>
      </AppDashed>
    </div>
  );
}
