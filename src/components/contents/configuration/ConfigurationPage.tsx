import { useState, useEffect } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import { Icon } from "@iconify/react";
import { sileo } from "sileo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STORAGE_KEY = "vani_setup_step";

const AUTH_ROUTES = {
  github: "/api/auth/github",
  google: "/api/auth/google",
};

const STEPS = [
  { label: "Giới thiệu", icon: "solar:star-bold-duotone" },
  { label: "Xác thực", icon: "solar:key-bold-duotone" },
  { label: "Đăng nhập", icon: "solar:login-bold-duotone" },
  { label: "Hồ sơ Admin", icon: "solar:user-bold-duotone" },
  { label: "Website", icon: "solar:global-bold-duotone" },
  { label: "Hoàn tất", icon: "solar:check-circle-bold-duotone" },
];

function StepTimeline({ current, onStepClick }: { current: number; onStepClick: (step: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-0 select-none">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = done;
        return (
          <div key={i} className="flex items-center">
            <div
              className={`flex flex-col items-center gap-1 ${clickable ? "cursor-pointer group" : ""}`}
              onClick={() => clickable && onStepClick(i)}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all text-lg ${
                  done
                    ? "bg-primary border-primary text-primary-foreground group-hover:bg-primary/80"
                    : active
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground"
                }`}
              >
                {done ? (
                  <Icon icon="solar:check-read-bold" className="text-base" />
                ) : (
                  <Icon icon={s.icon} className="text-base" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${
                  done || active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-6 sm:w-10 mt-[-18px] transition-colors ${
                  i < current ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function getInitialStep(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return parseInt(saved, 10);
  } catch {}
  return 0;
}

export default function ConfigurationPage() {
  const navigate = useNavigate();
  const { isAuthenticated, needsOnboarding, loading: authLoading, refresh } = useAuth();
  const [step, setStepRaw] = useState(getInitialStep);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [configKey, setConfigKey] = useState("");

  const [profile, setProfile] = useState({ username: "", fullName: "", phoneNumber: "" });

  const [site, setSite] = useState({
    siteName: "Vani Studio",
    siteUrl: "https://vanistudio.com",
    siteTagline: "Thiết kế và phát triển phần mềm",
    siteDescription: "Vani Studio chuyên thiết kế và phát triển phần mềm, website, ứng dụng di động",
    siteLanguage: "vi",
    siteMetaTitle: "Vani Studio - Thiết kế và phát triển phần mềm",
    siteMetaDescription: "Vani Studio cung cấp dịch vụ thiết kế web, phần mềm chuyên nghiệp tại Việt Nam",
    siteMetaKeywords: "thiết kế web, phần mềm, studio, lập trình",
    siteMetaAuthor: "Vani Studio",
  });

  const setStep = (s: number) => {
    setStepRaw(s);
    try { localStorage.setItem(STORAGE_KEY, String(s)); } catch {}
  };
  useEffect(() => {
    if (authLoading) return;
    if (step === 2 && isAuthenticated) {
      sileo.success({ title: "Đăng nhập thành công", description: "Tài khoản đã được xác thực" });
      setStep(needsOnboarding ? 3 : 4);
    }
    if (step === 3 && isAuthenticated && !needsOnboarding) {
      setStep(4);
    }
  }, [step, isAuthenticated, needsOnboarding, authLoading]);

  const verifyKey = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.api.config["verify-key"].post({ key: configKey });
      if (data?.success) {
        sileo.success({ title: "Xác thực thành công", description: "Mã cấu hình hợp lệ, tiếp tục đăng nhập" });
        setStep(2);
      } else {
        sileo.error({ title: "Xác thực thất bại", description: data?.error || "Mã cấu hình không chính xác" });
        setError(data?.error || "Mã không hợp lệ");
      }
    } catch {
      sileo.error({ title: "Lỗi kết nối", description: "Không thể kết nối đến máy chủ" });
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.api.auth.onboarding.post(profile);
      if (data?.success) {
        sileo.success({ title: "Lưu hồ sơ thành công", description: "Thông tin Admin đã được cập nhật" });
        await refresh();
        setStep(4);
      } else {
        sileo.error({ title: "Lưu hồ sơ thất bại", description: data?.error || "Có lỗi xảy ra" });
        setError(data?.error || "Có lỗi xảy ra");
      }
    } catch {
      sileo.error({ title: "Lỗi kết nối", description: "Không thể kết nối đến máy chủ" });
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const setupSite = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.api.config.setup.post(site);
      if (data?.success) {
        sileo.success({ title: "Cài đặt thành công", description: "Website đã được thiết lập hoàn tất" });
        localStorage.removeItem(STORAGE_KEY);
        setStepRaw(5);
      } else {
        sileo.error({ title: "Cài đặt thất bại", description: data?.error || "Có lỗi xảy ra" });
        setError(data?.error || "Có lỗi xảy ra");
      }
    } catch {
      sileo.error({ title: "Lỗi kết nối", description: "Không thể kết nối đến máy chủ" });
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-6">
        <div className="flex flex-col gap-6 max-w-[560px] mx-auto w-full">
          <StepTimeline current={step} onStepClick={(s) => setStep(s)} />
          {step === 0 && (
            <div className="flex flex-col gap-6 items-center text-center min-h-[400px] justify-center">
              <div className="flex justify-center">
                <img src="/vanistudio.png" alt="Logo" className="w-20 h-20 rounded-xl" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-title">Chào mừng đến Vani Studio</h1>
                <p className="text-muted-foreground text-sm max-w-[380px]">
                  Trình hướng dẫn này sẽ giúp bạn thiết lập website trong vài bước đơn giản.
                  Bạn sẽ cần mã cấu hình từ file <code className="text-xs bg-muted px-1.5 py-0.5 rounded">.env</code> để tiếp tục.
                </p>
              </div>
              <Button size="lg" className="w-full max-w-[320px]" onClick={() => setStep(1)}>
                Bắt đầu cài đặt
                <Icon icon="solar:arrow-right-linear" className="text-lg" />
              </Button>
            </div>
          )}
          {step === 1 && (
            <div className="flex flex-col gap-5 min-h-[400px] justify-center">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-title">Xác thực quyền cài đặt</h2>
                <p className="text-muted-foreground text-sm">
                  Nhập giá trị <code className="text-xs bg-muted px-1.5 py-0.5 rounded">APP_CONFIGURATION_KEY</code> từ file <code className="text-xs bg-muted px-1.5 py-0.5 rounded">.env</code>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="configKey">Mã cấu hình <span className="text-destructive">*</span></Label>
                <Input
                  id="configKey"
                  type="password"
                  required
                  placeholder="Nhập APP_CONFIGURATION_KEY"
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(0)}>
                  <Icon icon="solar:arrow-left-linear" className="text-lg" />
                  Quay lại
                </Button>
                <Button size="lg" className="flex-1" onClick={verifyKey} disabled={loading || !configKey}>
                  {loading ? "Đang xác thực..." : "Xác nhận"}
                </Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-5 min-h-[400px] justify-center">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-title">Đăng nhập tài khoản Admin</h2>
                <p className="text-muted-foreground text-sm">
                  Đăng nhập bằng tài khoản sẽ được cấp quyền quản trị
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button variant="outline" size="lg" className="w-full gap-3" asChild>
                  <a href={AUTH_ROUTES.github} className="no-underline">
                    <Icon icon="mdi:github" className="text-xl" />
                    Đăng nhập với GitHub
                  </a>
                </Button>

                <Button variant="outline" size="lg" className="w-full gap-3" asChild>
                  <a href={AUTH_ROUTES.google} className="no-underline">
                    <Icon icon="flat-color-icons:google" className="text-xl" />
                    Đăng nhập với Google
                  </a>
                </Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-5 min-h-[400px] justify-center">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-title">Hoàn tất hồ sơ Admin</h2>
                <p className="text-muted-foreground text-sm">
                  Nhập thông tin cá nhân cho tài khoản quản trị
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="username">Tên đăng nhập <span className="text-destructive">*</span></Label>
                  <Input
                    id="username"
                    required
                    minLength={3}
                    maxLength={32}
                    placeholder="vd: vanistudio"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="fullName">Họ và tên <span className="text-destructive">*</span></Label>
                  <Input
                    id="fullName"
                    required
                    maxLength={100}
                    placeholder="vd: Nguyễn Văn A"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="phoneNumber">Số điện thoại <span className="text-destructive">*</span></Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    required
                    maxLength={20}
                    placeholder="vd: 0935974907"
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  />
                </div>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={saveProfile}
                disabled={loading || !profile.username || !profile.fullName || !profile.phoneNumber}
              >
                {loading ? "Đang lưu..." : "Tiếp tục"}
                {!loading && <Icon icon="solar:arrow-right-linear" className="text-lg" />}
              </Button>
            </div>
          )}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-title">Thông tin Website</h2>
                <p className="text-muted-foreground text-sm">
                  Nhập thông tin cơ bản và SEO cho website
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="siteName">Tên website <span className="text-destructive">*</span></Label>
                  <Input
                    id="siteName"
                    required
                    maxLength={200}
                    placeholder="vd: Vani Studio"
                    value={site.siteName}
                    onChange={(e) => setSite({ ...site, siteName: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="siteUrl">URL website <span className="text-destructive">*</span></Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    required
                    maxLength={500}
                    placeholder="vd: https://vanistudio.com"
                    value={site.siteUrl}
                    onChange={(e) => setSite({ ...site, siteUrl: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="siteTagline">Khẩu hiệu</Label>
                  <Input
                    id="siteTagline"
                    maxLength={300}
                    placeholder="vd: Thiết kế và phát triển phần mềm"
                    value={site.siteTagline}
                    onChange={(e) => setSite({ ...site, siteTagline: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="siteDescription">Mô tả website</Label>
                  <Textarea
                    id="siteDescription"
                    maxLength={1000}
                    rows={3}
                    placeholder="vd: Vani Studio chuyên thiết kế và phát triển phần mềm, website, ứng dụng di động"
                    value={site.siteDescription}
                    onChange={(e) => setSite({ ...site, siteDescription: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Ngôn ngữ</Label>
                  <Select
                    value={site.siteLanguage}
                    onValueChange={(v) => setSite({ ...site, siteLanguage: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full h-px border-dashed-h my-1" />

                <div className="flex flex-col gap-2">
                  <Label htmlFor="siteMetaTitle">Meta Title</Label>
                  <Input
                    id="siteMetaTitle"
                    maxLength={200}
                    placeholder={site.siteName || "vd: Vani Studio - Thiết kế và phát triển phần mềm"}
                    value={site.siteMetaTitle}
                    onChange={(e) => setSite({ ...site, siteMetaTitle: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="siteMetaDescription">Meta Description</Label>
                  <Textarea
                    id="siteMetaDescription"
                    maxLength={500}
                    rows={2}
                    placeholder="vd: Vani Studio cung cấp dịch vụ thiết kế web, phần mềm chuyên nghiệp tại Việt Nam"
                    value={site.siteMetaDescription}
                    onChange={(e) => setSite({ ...site, siteMetaDescription: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="siteMetaKeywords">Meta Keywords</Label>
                  <Input
                    id="siteMetaKeywords"
                    maxLength={500}
                    placeholder="vd: thiết kế web, phần mềm, studio, lập trình"
                    value={site.siteMetaKeywords}
                    onChange={(e) => setSite({ ...site, siteMetaKeywords: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="siteMetaAuthor">Tác giả</Label>
                  <Input
                    id="siteMetaAuthor"
                    maxLength={200}
                    placeholder="vd: Vani Studio"
                    value={site.siteMetaAuthor}
                    onChange={(e) => setSite({ ...site, siteMetaAuthor: e.target.value })}
                  />
                </div>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={setupSite}
                disabled={loading || !site.siteName || !site.siteUrl}
              >
                {loading ? "Đang cài đặt..." : "Cài đặt website"}
              </Button>
            </div>
          )}
          {step === 5 && (
            <div className="flex flex-col gap-6 items-center text-center min-h-[400px] justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon icon="solar:check-circle-bold-duotone" className="text-4xl text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-title">Cài đặt thành công!</h2>
                <p className="text-muted-foreground text-sm max-w-[380px]">
                  Website của bạn đã sẵn sàng. Bạn có thể bắt đầu sử dụng ngay bây giờ.
                </p>
              </div>
              <Button size="lg" className="w-full max-w-[320px]" onClick={async () => { await refresh(); navigate("/"); }}>
                Đến Trang chủ
                <Icon icon="solar:arrow-right-linear" className="text-lg" />
              </Button>
            </div>
          )}
        </div>
      </AppDashed>
    </div>
  );
}
