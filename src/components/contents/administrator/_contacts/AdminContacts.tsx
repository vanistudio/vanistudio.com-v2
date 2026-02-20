import { useState, useEffect, useCallback, useMemo } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import AdminStats from "@/components/vani/AdminStats";
import { usePageTitle } from "@/hooks/use-page-title";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins}p trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

export default function AdminContacts() {
  usePageTitle("Tin nhắn liên hệ");

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await (api.api.admin.contacts as any).get({
        query: { page: "1", limit: "500" },
      });
      if (data?.success) setContacts(data.contacts || []);
    } catch {
      toast.error("Không thể tải tin nhắn");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleRead = async (contact: Contact) => {
    setSelected(contact);
    if (!contact.isRead) {
      try {
        await (api.api.admin.contacts as any)[contact.id].read.patch();
        setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, isRead: true } : c));
      } catch {}
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa tin nhắn này?")) return;
    try {
      const { data } = await (api.api.admin.contacts as any)[id].delete() as any;
      if (data?.success) {
        toast.success("Đã xóa");
        setContacts(prev => prev.filter(c => c.id !== id));
        if (selected?.id === id) setSelected(null);
      } else toast.error(data?.error || "Thất bại");
    } catch { toast.error("Lỗi kết nối"); }
  };

  const filtered = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(c =>
      `${c.name} ${c.email} ${c.subject || ""} ${c.message}`.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const stats = useMemo(() => {
    const total = contacts.length;
    const unread = contacts.filter(c => !c.isRead).length;
    const read = contacts.filter(c => c.isRead).length;
    return [
      { label: "Tổng tin nhắn", value: total, icon: "solar:chat-round-dots-bold-duotone", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
      { label: "Chưa đọc", value: unread, icon: "solar:letter-unread-bold-duotone", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
      { label: "Đã đọc", value: read, icon: "solar:check-read-bold-duotone", bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
    ];
  }, [contacts]);

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:chat-round-dots-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">Tin nhắn liên hệ</h1>
              <p className="text-xs text-muted-foreground">{contacts.length} tin nhắn</p>
            </div>
          </div>
        </div>
      </AppDashed>
      <AdminStats items={stats} />
      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input
              placeholder="Tìm tên, email, tiêu đề..."
              className="pl-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-0" scrollable>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:chat-round-dots-bold-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search ? "Không tìm thấy tin nhắn phù hợp" : "Chưa có tin nhắn nào"}
            </p>
          </div>
        ) : (
          <div className="w-max min-w-full">
            <div className="flex items-center gap-4 px-4 py-2 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              <div className="w-4" />
              <div className="w-[140px]">Người gửi</div>
              <div className="w-[180px]">Email</div>
              <div className="w-[120px]">SĐT / Zalo</div>
              <div className="flex-1">Tiêu đề</div>
              <div className="w-[80px] text-right">Thời gian</div>
              <div className="w-8 shrink-0" />
            </div>

            <div className="divide-y divide-border">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleRead(c)}
                  className={`flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group whitespace-nowrap cursor-pointer ${!c.isRead ? "bg-primary/[0.03]" : ""}`}
                >
                  <div className="w-4 flex items-center justify-center">
                    {!c.isRead && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div className="w-[140px]">
                    <span className={`text-sm ${!c.isRead ? "font-bold text-title" : "font-medium text-foreground"}`}>
                      {c.name}
                    </span>
                  </div>
                  <div className="w-[180px]">
                    <span className="text-xs text-muted-foreground">{c.email}</span>
                  </div>
                  <div className="w-[120px]">
                    <span className="text-xs text-muted-foreground">{c.phone || "—"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground truncate block max-w-[250px]">
                      {c.subject || "Không có tiêu đề"}
                    </span>
                  </div>
                  <div className="w-[80px] text-right">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-muted-foreground tabular-nums">{timeAgo(c.createdAt)}</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          {new Date(c.createdAt).toLocaleString("vi-VN")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Icon icon="solar:menu-dots-bold" className="text-base" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRead(c); }}>
                        <Icon icon="solar:eye-bold-duotone" className="mr-2 text-base" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`mailto:${c.email}?subject=Re: ${c.subject || ""}`); }}>
                        <Icon icon="solar:reply-bold-duotone" className="mr-2 text-base" />
                        Trả lời
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}>
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="mr-2 text-base" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                Hiển thị {filtered.length} / {contacts.length} tin nhắn
              </span>
            </div>
          </div>
        )}
      </AppDashed>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{selected?.subject || "Tin nhắn liên hệ"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-border bg-muted/10">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Người gửi</p>
                  <p className="text-sm font-medium text-title">{selected.name}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/10">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
                  <a href={`mailto:${selected.email}`} className="text-sm font-medium text-primary hover:underline">{selected.email}</a>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/10">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">SĐT / Zalo</p>
                  <p className="text-sm font-medium text-title">{selected.phone || "—"}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border bg-muted/10">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Nội dung</p>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{new Date(selected.createdAt).toLocaleString("vi-VN")}</span>
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" className="text-xs" onClick={() => handleDelete(selected.id)}>
                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="text-sm mr-1" />
                    Xóa
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => window.open(`mailto:${selected.email}?subject=Re: ${selected.subject || ''}`)}>
                    <Icon icon="solar:reply-bold-duotone" className="text-sm mr-1" />
                    Trả lời
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
