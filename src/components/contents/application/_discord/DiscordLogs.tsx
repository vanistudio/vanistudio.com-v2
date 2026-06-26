"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { useSetting } from "@/contexts/SettingContext";
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";

interface DiscordLog {
  id: string;
  accountId: string;
  username: string;
  avatar: string | null;
  actionType: "change_avatar" | "change_bio" | "rpc_update" | "auto_reply" | "trigger_fired" | "token_expired";
  status: "success" | "failed" | "warning";
  message: string;
  details: string;
  createdAt: string;
}

const navItems = [
  { name: "Tài khoản", href: "/application/discord/accounts", icon: "solar:users-group-two-rounded-line-duotone" },
  { name: "Trạng thái & Rich Presence", href: "/application/discord/presences", icon: "solar:gamepad-old-line-duotone" },
  { name: "Tự động hóa", href: "/application/discord/automations", icon: "solar:cpu-bolt-line-duotone" },
  { name: "Lịch sử hoạt động", href: "/application/discord/logs", icon: "solar:document-text-line-duotone" },
];

const mockAccountsList = [
  { id: "1", username: "vanixjnk", discordId: "109283749283749283" },
  { id: "2", username: "clone_buyer_01", discordId: "209384759283748592" },
  { id: "3", username: "spammer_bot_99", discordId: "309284759182738495" },
  { id: "4", username: "dead_token_user", discordId: "409284759384758291" },
];

const mockLogs: DiscordLog[] = [
  {
    id: "log-1",
    accountId: "1",
    username: "vanixjnk",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",
    actionType: "auto_reply",
    status: "success",
    message: "Tự động phản hồi tin nhắn của @heloworld_user",
    details: '{\n  "channelId": "109283749283749283",\n  "triggerKeyword": "hi",\n  "repliedText": "Chào bạn, mình đang offline. Liên hệ Telegram @vani_support..."\n}',
    createdAt: "2026-06-26T13:30:00Z"
  },
  {
    id: "log-2",
    accountId: "1",
    username: "vanixjnk",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",
    actionType: "rpc_update",
    status: "success",
    message: "Cập nhật Rich Presence: Playing Valorant",
    details: '{\n  "applicationId": "809283749283749",\n  "game": "Valorant",\n  "state": "In a Match (9-3)"\n}',
    createdAt: "2026-06-26T13:00:00Z"
  },
  {
    id: "log-3",
    accountId: "3",
    username: "spammer_bot_99",
    avatar: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=150&auto=format&fit=crop&q=60",
    actionType: "trigger_fired",
    status: "failed",
    message: "Gửi tin nhắn quảng cáo định kỳ thất bại (Rate Limited)",
    details: '{\n  "channelId": "109283749283749283",\n  "retryAfter": "42300ms",\n  "errorCode": 429\n}',
    createdAt: "2026-06-26T12:45:00Z"
  },
  {
    id: "log-4",
    accountId: "4",
    username: "dead_token_user",
    avatar: null,
    actionType: "token_expired",
    status: "failed",
    message: "Xác thực token thất bại: Unauthorized (Token đã hết hạn)",
    details: '{\n  "reason": "Token invalid or reset password",\n  "status": 401\n}',
    createdAt: "2026-06-25T14:22:00Z"
  },
  {
    id: "log-5",
    accountId: "2",
    username: "clone_buyer_01",
    avatar: null,
    actionType: "change_bio",
    status: "success",
    message: "Thay đổi thông tin tiểu sử thành công",
    details: '{\n  "oldBio": "",\n  "newBio": "Contact for business: vanistudio.com"\n}',
    createdAt: "2026-06-24T09:15:00Z"
  }
];

export default function DiscordLogs() {
  const pathname = usePathname();
  const setting = useSetting();
  const siteTimezone = setting?.siteTimezone || "Asia/Ho_Chi_Minh";

  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [logs, setLogs] = useState<DiscordLog[]>(mockLogs);
  const [selectedLog, setSelectedLog] = useState<DiscordLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [filterAction, filterStatus, selectedAccountId]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedAccountId !== "all" && log.accountId !== selectedAccountId) {
        return false;
      }

      const matchesSearch =
        log.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        log.message.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesAction = filterAction === "all" || log.actionType === filterAction;
      const matchesStatus = filterStatus === "all" || log.status === filterStatus;

      return matchesSearch && matchesAction && matchesStatus;
    });
  }, [logs, selectedAccountId, debouncedSearch, filterAction, filterStatus]);

  const stats = useMemo(() => {
    const targetLogs = logs.filter((l) => selectedAccountId === "all" || l.accountId === selectedAccountId);
    return {
      auto: targetLogs.filter((l) => l.actionType === "auto_reply" || l.actionType === "trigger_fired").length,
      profile: targetLogs.filter((l) => l.actionType === "rpc_update" || l.actionType === "change_avatar" || l.actionType === "change_bio").length,
      errors: targetLogs.filter((l) => l.status === "failed" || l.status === "warning").length,
      total: targetLogs.length
    };
  }, [logs, selectedAccountId]);

  const handleClearLogs = () => {
    if (selectedAccountId === "all") {
      setLogs([]);
      toast.success("Đã xóa toàn bộ lịch sử hoạt động!");
    } else {
      setLogs((prev) => prev.filter((l) => l.accountId !== selectedAccountId));
      toast.success("Đã xóa lịch sử hoạt động của tài khoản đang chọn!");
    }
    setIsClearOpen(false);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "auto_reply":
        return (
          <Badge variant="outline" className="text-[10px] font-bold py-0.5 rounded-sm border-vanixjnk/25 bg-vanixjnk/15 text-vanixjnk dark:bg-vanixjnk/20">
            Auto Reply
          </Badge>
        );
      case "rpc_update":
        return (
          <Badge variant="outline" className="text-[10px] font-bold py-0.5 rounded-sm border-sky-500/25 bg-sky-500/15 text-sky-500 dark:bg-sky-500/20">
            RPC Update
          </Badge>
        );
      case "trigger_fired":
        return (
          <Badge variant="outline" className="text-[10px] font-bold py-0.5 rounded-sm border-violet-500/25 bg-violet-500/15 text-violet-500 dark:bg-violet-500/20">
            Trigger Fired
          </Badge>
        );
      case "token_expired":
        return (
          <Badge variant="danger" className="text-[10px] font-bold py-0.5 rounded-sm">
            Token Expired
          </Badge>
        );
      case "change_bio":
        return (
          <Badge variant="outline" className="text-[10px] font-bold py-0.5 rounded-sm border-emerald-500/25 bg-emerald-500/15 text-emerald-500 dark:bg-emerald-500/20">
            Change Bio
          </Badge>
        );
      case "change_avatar":
        return (
          <Badge variant="outline" className="text-[10px] font-bold py-0.5 rounded-sm border-amber-500/25 bg-amber-500/15 text-amber-500 dark:bg-amber-500/20">
            Change Avatar
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[10px] font-bold py-0.5 rounded-sm">
            {action}
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="success" className="text-[9px] font-bold py-0 px-1.5 rounded-sm">
            Thành công
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="danger" className="text-[9px] font-bold py-0 px-1.5 rounded-sm">
            Thất bại
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[9px] font-bold py-0 px-1.5 rounded-sm border-yellow-500/25 bg-yellow-500/15 text-yellow-500 dark:bg-yellow-500/20">
            Cảnh báo
          </Badge>
        );
    }
  };

  const columns = React.useMemo<ColumnDef<DiscordLog>[]>(() => [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-normal">
          {pagination.pageIndex * pagination.pageSize + row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: "username",
      meta: { title: "Tài khoản" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="flex items-center gap-2">
            {log.avatar ? (
              <img
                src={log.avatar}
                alt={log.username}
                className="size-7 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="size-7 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center font-bold text-xs">
                {log.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-xs text-foreground">@{log.username}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "actionType",
      meta: { title: "Loại hoạt động" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => getActionBadge(row.getValue("actionType")),
    },
    {
      accessorKey: "status",
      meta: { title: "Trạng thái" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "message",
      meta: { title: "Nội dung chi tiết" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <span className="text-xs text-foreground font-medium block max-w-md truncate">
          {row.getValue("message")}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      meta: { title: "Thời gian" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const val = row.getValue("createdAt") as string;
        return (
          <span className="text-[11px] font-mono text-muted-foreground">
            {formatWithSiteTimezone(val, siteTimezone, "DD/MM/YYYY HH:mm:ss")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="xs"
          onClick={() => {
            setSelectedLog(row.original);
            setIsDetailsOpen(true);
          }}
          className="cursor-pointer"
        >
          <Icon icon="solar:document-text-line-duotone" className="size-3.5 mr-1 text-vanixjnk" />
          Chi tiết
        </Button>
      ),
    },
  ], [pagination, siteTimezone, logs]);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:document-text-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Lịch sử hoạt động Discord</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Nhật ký ghi nhận chi tiết kết nối, lỗi Proxy, giới hạn API và các tiến trình tự động của Discord Selfbot.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative w-full border-t border-b border-dashed border-primary/20 overflow-hidden text-primary/20"
        style={{ height: "36px" }}
      >
        <div
          className="absolute inset-y-0 left-[-100vw] w-[300vw]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)"
          }}
        />
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          
          <div className="p-6 pb-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tự động hóa</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {stats.auto}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:chat-round-unread-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Hoạt động Profile</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {stats.profile}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:user-id-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Lỗi & Cảnh báo</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight text-red-500">
                  {stats.errors}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-red-500 bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "bg-vanixjnk/15 border-vanixjnk/25 text-vanixjnk shadow-sm"
                        : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <Icon
                      icon={item.icon}
                      className={`size-4 ${active ? "text-vanixjnk" : "text-muted-foreground"}`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="p-6 space-y-6 flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Icon icon="solar:user-id-line-duotone" className="text-xl text-vanixjnk" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chọn tài khoản Discord</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Nhật ký hoạt động sẽ được tải riêng theo từng tài khoản.</p>
                </div>
              </div>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="w-full sm:w-80 h-10 text-[13px] justify-between bg-background border-border">
                  <SelectValue placeholder="Chọn tài khoản" />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  <SelectItem value="all" className="text-[13px]">Tất cả tài khoản</SelectItem>
                  {mockAccountsList.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id} className="text-[13px]">
                      {acc.username} ({acc.discordId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredLogs.length === 0 && searchTerm === "" && filterAction === "all" && filterStatus === "all" ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-background/40">
                <div className="size-14 rounded-2xl text-muted-foreground bg-muted flex items-center justify-center mb-4">
                  <Icon icon="solar:document-text-line-duotone" className="text-3xl" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Không có dữ liệu nhật ký</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Chưa ghi nhận hoạt động tự động nào cho tài khoản này.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Danh sách nhật ký hoạt động</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Danh sách các log sự kiện tự động, trạng thái tài khoản và webhook.
                    </p>
                  </div>
                  {filteredLogs.length > 0 && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        onClick={() => setIsClearOpen(true)}
                        className="h-9 rounded-xl text-xs font-bold gap-2 text-rose-500 border-rose-500/20 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Icon icon="solar:trash-bin-trash-line-duotone" className="text-lg" />
                        Xóa lịch sử
                      </Button>
                    </div>
                  )}
                </div>

                <DataTable
                  columns={columns}
                  data={filteredLogs}
                  pagination={pagination}
                  onPaginationChange={setPagination}
                  sorting={sorting}
                  onSortingChange={setSorting}
                  pageCount={Math.ceil(filteredLogs.length / pagination.pageSize)}
                  isLoading={false}
                  toolbarInput={
                    <div className="flex items-center gap-2 w-full">
                      <div className="relative flex-1">
                        <Icon
                          icon="solar:magnifer-line-duotone"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
                        />
                        <Input
                          placeholder="Tìm kiếm nội dung hoạt động..."
                          className="pl-9 h-9 text-[13px] w-full bg-background"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-9 w-9 border-border bg-background hover:bg-muted/50 shrink-0",
                              (filterAction !== "all" || filterStatus !== "all") && "text-vanixjnk border-vanixjnk/30 bg-vanixjnk/5 hover:bg-vanixjnk/10"
                            )}
                            title="Lọc nâng cao"
                          >
                            <Icon icon="solar:filter-line-duotone" className="size-4 shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3 flex flex-col gap-3" align="end">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                              Loại hoạt động
                            </label>
                            <Select value={filterAction} onValueChange={setFilterAction}>
                              <SelectTrigger className="w-full h-9 text-[13px] justify-between">
                                <SelectValue placeholder="Chọn hoạt động" />
                              </SelectTrigger>
                              <SelectContent position="popper" align="start">
                                <SelectItem value="all" className="text-[13px]">Tất cả</SelectItem>
                                <SelectItem value="auto_reply" className="text-[13px]">Auto Reply</SelectItem>
                                <SelectItem value="rpc_update" className="text-[13px]">RPC Update</SelectItem>
                                <SelectItem value="trigger_fired" className="text-[13px]">Trigger Fired</SelectItem>
                                <SelectItem value="token_expired" className="text-[13px]">Token Expired</SelectItem>
                                <SelectItem value="change_bio" className="text-[13px]">Change Bio</SelectItem>
                                <SelectItem value="change_avatar" className="text-[13px]">Change Avatar</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                              Trạng thái
                            </label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                              <SelectTrigger className="w-full h-9 text-[13px] justify-between">
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                              <SelectContent position="popper" align="start">
                                <SelectItem value="all" className="text-[13px]">Tất cả</SelectItem>
                                <SelectItem value="success" className="text-[13px]">Thành công</SelectItem>
                                <SelectItem value="failed" className="text-[13px]">Thất bại</SelectItem>
                                <SelectItem value="warning" className="text-[13px]">Cảnh báo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedLog && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Icon icon="solar:document-text-line-duotone" className="size-5 text-vanixjnk" />
                  Chi tiết nhật ký hoạt động
                </DialogTitle>
                <DialogDescription>
                  Xem dữ liệu JSON đầu vào/đầu ra của tiến trình tự động hóa selfbot.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-muted-foreground block">Tài khoản thực thi:</span>
                    <span className="font-bold text-foreground">@{selectedLog.username}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block">Thời gian:</span>
                    <span className="text-foreground">{formatWithSiteTimezone(selectedLog.createdAt, siteTimezone, "DD/MM/YYYY HH:mm:ss")}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block">Loại hành động:</span>
                    <span className="mt-1 block">{getActionBadge(selectedLog.actionType)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block">Trạng thái:</span>
                    <span className="mt-1 block">{getStatusBadge(selectedLog.status)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Thông báo tóm tắt:</span>
                  <p className="text-xs text-foreground bg-muted p-2.5 rounded border border-border leading-relaxed font-semibold">
                    {selectedLog.message}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Dữ liệu chi tiết (Log payload):</span>
                  <pre className="text-[11px] font-mono text-foreground bg-muted p-3 rounded border border-border overflow-x-auto max-h-[220px]">
                    {selectedLog.details}
                  </pre>
                </div>
              </div>

              <DialogFooter>
                <Button variant="vanixjnk" onClick={() => setIsDetailsOpen(false)} className="px-6 cursor-pointer">
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-500">Xóa lịch sử hoạt động</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa lịch sử hoạt động của selfbot không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsClearOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleClearLogs} className="font-bold cursor-pointer">
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
