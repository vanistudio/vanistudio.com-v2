import { useState } from 'react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AppContact() {
  usePageTitle("Liên hệ");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setLoading(true);
    try {
      const { data } = await (api.api.app.contact as any).post(form) as any;
      if (data?.success) {
        setSent(true);
        toast.success("Đã gửi tin nhắn thành công!");
      } else {
        toast.error(data?.error || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: "solar:letter-bold-duotone", label: "Email", value: "contact@vanistudio.com", href: "mailto:contact@vanistudio.com" },
    { icon: "logos:discord-icon", label: "Discord", value: "Vani Studio", href: "https://discord.gg/vanistudio" },
    { icon: "logos:facebook", label: "Facebook", value: "Vani Studio", href: "https://facebook.com/vanistudio" },
    { icon: "logos:telegram", label: "Telegram", value: "@vanistudio", href: "https://t.me/vanistudio" },
  ];

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-5">
        <div className="flex flex-col items-center gap-1.5">
          <div className="p-3 rounded-xl bg-primary/10 mb-1">
            <Icon icon="solar:chat-round-dots-bold-duotone" className="text-3xl text-primary" />
          </div>
          <h1 className="text-xl font-bold text-title">Liên hệ</h1>
          <p className="text-sm text-muted-foreground text-center max-w-lg">
            Liên hệ với chúng tôi để được tư vấn và hỗ trợ
          </p>
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {contactInfo.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
            >
              <Icon icon={item.icon} className="text-2xl" />
              <div className="text-center">
                <p className="text-xs font-medium text-title">{item.label}</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">{item.value}</p>
              </div>
            </a>
          ))}
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-5">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="p-3 rounded-full bg-emerald-500/10">
              <Icon icon="solar:check-circle-bold-duotone" className="text-4xl text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-title">Đã gửi thành công!</h2>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}>
              Gửi tin nhắn khác
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg mx-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Họ tên *</label>
                <Input
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email *</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Số điện thoại / Zalo</label>
                <Input
                  placeholder="0912 345 678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tiêu đề</label>
                <Input
                  placeholder="Chủ đề liên hệ..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nội dung *</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none min-h-[120px]"
                placeholder="Mô tả chi tiết nội dung cần tư vấn..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Icon icon="svg-spinners:ring-resize" className="text-sm mr-2" />
              ) : (
                <Icon icon="solar:plain-bold-duotone" className="text-sm mr-2" />
              )}
              Gửi tin nhắn
            </Button>
          </form>
        )}
      </AppDashed>
    </div>
  );
}
