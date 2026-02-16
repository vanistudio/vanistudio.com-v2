import { useState } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { authProxy } from "@/proxies/authentication.proxy";

export default function AppOnboarding() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ username: "", fullName: "", phoneNumber: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authProxy.completeOnboarding(form);
      if (data.success) {
        await refresh();
        navigate("/");
      } else {
        setError(data.error || "Có lỗi xảy ra");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-6">
        <div className="flex flex-col gap-6 max-w-[420px] mx-auto w-full min-h-[500px] justify-center">
          <div className="text-center select-none space-y-1">
            <h1 className="text-xl font-bold leading-tight text-title">
              Hoàn tất hồ sơ
            </h1>
            <p className="text-muted-foreground text-sm">
              Nhập thông tin của bạn để tiếp tục sử dụng Vani Studio
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                required
                minLength={3}
                maxLength={32}
                placeholder="vd: vanistudio"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                maxLength={100}
                placeholder="vd: Nguyễn Văn A"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                id="phoneNumber"
                type="tel"
                required
                maxLength={20}
                placeholder="vd: 0935974907"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 text-center bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Hoàn tất"}
            </button>
          </form>
        </div>
      </AppDashed>
    </div>
  );
}
