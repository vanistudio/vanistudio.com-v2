import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminContacts() {
  usePageTitle("Tin nhắn liên hệ");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Contact | null>(null);

  const fetchContacts = (p = 1, s = '') => {
    setLoading(true);
    const query: Record<string, string> = { page: String(p), limit: '20' };
    if (s) query.search = s;
    (api.api.admin.contacts as any).get({ query })
      .then(({ data }: any) => {
        if (data?.success) {
          setContacts(data.contacts || []);
          setTotalPages(data.pagination?.totalPages || 1);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchContacts(1, search);
  };

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
        setContacts(prev => prev.filter(c => c.id !== id));
        setSelected(null);
        toast.success("Đã xóa tin nhắn");
      }
    } catch {
      toast.error("Lỗi khi xóa");
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-title">Tin nhắn liên hệ</h1>
          <p className="text-sm text-muted-foreground">Quản lý tin nhắn từ khách hàng</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" />
          <Input className="pl-9 h-9 text-sm" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button type="submit" size="sm" variant="outline" className="h-9">Tìm</Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Icon icon="svg-spinners:ring-resize" className="text-xl text-muted-foreground" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Icon icon="solar:chat-round-dots-bold-duotone" className="text-4xl text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">Chưa có tin nhắn nào</p>
        </div>
      ) : (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground"></th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Người gửi</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Email</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Tiêu đề</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Thời gian</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(c => (
                  <tr key={c.id} className={cn("border-b border-border hover:bg-muted/20 cursor-pointer transition-colors", !c.isRead && "bg-primary/5")} onClick={() => handleRead(c)}>
                    <td className="p-3 w-8">
                      {!c.isRead && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </td>
                    <td className="p-3">
                      <span className={cn("text-sm", !c.isRead ? "font-semibold text-title" : "text-foreground")}>{c.name}</span>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{c.email}</td>
                    <td className="p-3 hidden sm:table-cell text-xs text-muted-foreground truncate max-w-[150px]">{c.subject || '—'}</td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(c.createdAt)}</td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="icon" className="size-7" onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}>
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="text-sm text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchContacts(page - 1, search); }}>
                <Icon icon="solar:arrow-left-bold" className="text-xs" />
              </Button>
              <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); fetchContacts(page + 1, search); }}>
                <Icon icon="solar:arrow-right-bold" className="text-xs" />
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{selected?.subject || "Tin nhắn liên hệ"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border bg-muted/10">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Người gửi</p>
                  <p className="text-sm font-medium text-title">{selected.name}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/10">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
                  <a href={`mailto:${selected.email}`} className="text-sm font-medium text-primary hover:underline">{selected.email}</a>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border bg-muted/10">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Nội dung</p>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{formatDate(selected.createdAt)}</span>
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
