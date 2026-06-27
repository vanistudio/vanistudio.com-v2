"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { useSetting } from "@/contexts/SettingContext";
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";

import LogDetailsDialog from "./LogDetailsDialog";
import ClearLogsDialog from "./ClearLogsDialog";

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

  const [logs, setLogs] = useState<DiscordLog[]>(mockLogs);
  const [selectedLog, setSelectedLog] = useState<DiscordLog | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const query = debouncedSearch.toLowerCase();
      return (
        log.username.toLowerCase().includes(query) ||
        log.message.toLowerCase().includes(query)
      );
    });
  }, [logs, debouncedSearch]);

  const stats = useMemo(() => {
    return {
      auto: logs.filter((l) => l.actionType === "auto_reply" || l.actionType === "trigger_fired").length,
      profile: logs.filter((l) => l.actionType === "rpc_update" || l.actionType === "change_avatar" || l.actionType === "change_bio").length,
      errors: logs.filter((l) => l.status === "failed" || l.status === "warning").length,
    };
  }, [logs]);

  const handleClearLogs = () => {
    setLogs([]);
    setIsClearOpen(false);
    toast.success("Đã xóa toàn bộ lịch sử hoạt động!");
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
          <div className="flex items-center gap-3">
            {log.avatar ? (
              <img
                src={log.avatar}
                alt={log.username}
                className="size-9 rounded-full object-cover border border-vanixjnk/20 bg-neutral-900"
              />
            ) : (
              <div className="size-9 rounded-full text-white border border-border flex items-center justify-center font-bold text-sm bg-vanixjnk/15 text-vanixjnk">
                {log.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-foreground text-xs">@{log.username}</span>
            </div>
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
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setSelectedLog(log);
                setIsDetailsOpen(true);
              }}
              className="cursor-pointer"
            >
              <Icon icon="solar:document-text-line-duotone" className="size-3.5 mr-1 text-vanixjnk" />
              Chi tiết
            </Button>
          </div>
        );
      },
    },
  ], [pagination, siteTimezone]);

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
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">{stats.auto}</h3>
              </div>
              <div className="size-10 rounded-lg text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:chat-round-unread-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Hoạt động Profile</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">{stats.profile}</h3>
              </div>
              <div className="size-10 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:user-id-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Lỗi & Cảnh báo</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight text-red-500">{stats.errors}</h3>
              </div>
              <div className="size-10 rounded-lg text-red-500 bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {navItems.map((item) => {
                const active = pathname === item.href;
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

          <div className="p-6 space-y-6">
            <div className="flex flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Danh sách nhật ký hoạt động</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Danh sách các log sự kiện tự động, trạng thái tài khoản và webhook.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="vanixjnk" size="sm" className="gap-1.5 shrink-0 cursor-pointer">
                      <Icon icon="solar:hamburger-menu-line-duotone" className="text-base" />
                      <span>Thao tác</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1 flex flex-col gap-0.5" align="end">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs h-8 px-2 cursor-pointer"
                      onClick={() => {
                        toast.success("Đang tải lại dữ liệu nhật ký...");
                      }}
                    >
                      <Icon icon="solar:restart-line-duotone" className="mr-2 size-3.5 text-sky-500" />
                      Tải lại (Refresh)
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs h-8 px-2 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => setIsClearOpen(true)}
                    >
                      <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5 text-red-500" />
                      Xóa lịch sử
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
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
              }
            />
          </div>
        </div>
      </div>

      <LogDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        log={selectedLog}
        siteTimezone={siteTimezone}
        getActionBadge={getActionBadge}
        getStatusBadge={getStatusBadge}
      />

      <ClearLogsDialog
        open={isClearOpen}
        onOpenChange={setIsClearOpen}
        onConfirm={handleClearLogs}
      />
    </div>
  );
}
