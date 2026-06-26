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

interface TelegramSelfbotLog {
  id: string;
  phone: string;
  event: "auto_reply" | "connection" | "proxy_error" | "rate_limit";
  message: string;
  targetUser: string | null;
  status: "success" | "failed" | "info";
  createdAt: string;
}

const navItems = [
  { name: "Tài khoản", href: "/application/telegram/accounts", icon: "solar:users-group-two-rounded-line-duotone" },
  { name: "Tự động trả lời", href: "/application/telegram/auto-reply", icon: "solar:chat-round-unread-line-duotone" },
  { name: "Lịch sử hoạt động", href: "/application/telegram/logs", icon: "solar:document-text-line-duotone" },
];

export default function TelegramLogs() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<"all" | "auto_reply" | "connection" | "proxy_error" | "rate_limit">("all");
  const [selectedLog, setSelectedLog] = useState<TelegramSelfbotLog | null>(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  // Mock log history matching database schema
  const [logs, setLogs] = useState<TelegramSelfbotLog[]>([
    {
      id: "log-1",
      phone: "+84987654321",
      event: "auto_reply",
      message: "Đã tự động phản hồi tin nhắn thành công cho khách hàng",
      targetUser: "@anhtuan_dev",
      status: "success",
      createdAt: "2026-06-26T18:10:15Z",
    },
    {
      id: "log-2",
      phone: "+84987654321",
      event: "connection",
      message: "Thiết lập kết nối với Telegram API gateway thành công",
      targetUser: null,
      status: "success",
      createdAt: "2026-06-26T18:00:00Z",
    },
    {
      id: "log-3",
      phone: "+84912345678",
      event: "proxy_error",
      message: "Lỗi kết nối SOCKS5 Proxy: Connection timeout (10000ms)",
      targetUser: null,
      status: "failed",
      createdAt: "2026-06-26T17:45:22Z",
    },
    {
      id: "log-4",
      phone: "+84987654321",
      event: "rate_limit",
      message: "Bị giới hạn API tạm thời (FLOOD_WAIT_60). Tự động tạm dừng 60s.",
      targetUser: null,
      status: "failed",
      createdAt: "2026-06-26T16:30:10Z",
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [eventFilter]);

  const handleClearLogs = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setLogs([]);
          resolve(true);
        }, 1000);
      }),
      {
        loading: "Đang xóa toàn bộ lịch sử hoạt động...",
        success: "Đã xóa sạch lịch sử nhật ký!",
        error: "Lỗi xóa lịch sử",
      }
    );
  };

  const getEventBadge = (event: string) => {
    switch (event) {
      case "auto_reply":
        return (
          <Badge className="bg-vanixjnk/15 hover:bg-vanixjnk/20 text-vanixjnk font-bold text-[10px] rounded-md px-2 py-0.5 border border-vanixjnk/20">
            Auto Reply
          </Badge>
        );
      case "connection":
        return (
          <Badge className="bg-green-500/10 hover:bg-green-500/15 text-green-500 font-bold text-[10px] rounded-md px-2 py-0.5 border border-green-500/20">
            Kết nối
          </Badge>
        );
      case "proxy_error":
        return (
          <Badge className="bg-red-500/10 hover:bg-red-500/15 text-red-500 font-bold text-[10px] rounded-md px-2 py-0.5 border border-red-500/20">
            Lỗi Proxy
          </Badge>
        );
      case "rate_limit":
        return (
          <Badge className="bg-amber-500/10 hover:bg-amber-500/15 text-amber-500 font-bold text-[10px] rounded-md px-2 py-0.5 border border-amber-500/20">
            Rate Limit
          </Badge>
        );
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (debouncedSearch) {
      result = result.filter(
        (log) =>
          log.phone.includes(debouncedSearch) ||
          (log.targetUser && log.targetUser.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          log.message.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (eventFilter !== "all") {
      result = result.filter((log) => log.event === eventFilter);
    }

    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      result.sort((a: any, b: any) => {
        const valA = a[id];
        const valB = b[id];
        if (valA === undefined || valB === undefined) return 0;
        if (typeof valA === "string" && typeof valB === "string") {
          return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return desc
          ? new Date(valB).getTime() - new Date(valA).getTime()
          : new Date(valA).getTime() - new Date(valB).getTime();
      });
    }

    return result;
  }, [logs, debouncedSearch, eventFilter, sorting]);

  const paginatedLogs = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredLogs.slice(start, end);
  }, [filteredLogs, pagination]);

  const columns = React.useMemo<ColumnDef<TelegramSelfbotLog>[]>(() => [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => {
        const pageIdx = pagination.pageIndex;
        const pageSize = pagination.pageSize;
        return (
          <span className="text-muted-foreground font-normal">
            {pageIdx * pageSize + row.index + 1}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      meta: { title: "Thời gian" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const dateStr = row.getValue("createdAt") as string;
        return (
          <span className="text-xs font-mono text-muted-foreground">
            {new Date(dateStr).toLocaleString("vi-VN")}
          </span>
        );
      },
    },
    {
      accessorKey: "phone",
      meta: { title: "Tài khoản" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string;
        return (
          <span className="text-[13px] font-bold text-foreground">
            {phone}
          </span>
        );
      },
    },
    {
      accessorKey: "event",
      meta: { title: "Sự kiện" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const event = row.getValue("event") as string;
        return getEventBadge(event);
      },
    },
    {
      accessorKey: "targetUser",
      meta: { title: "Đối tượng" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const target = row.getValue("targetUser") as string;
        return (
          <span className="text-[13px] font-mono text-vanixjnk font-semibold">
            {target || "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "message",
      meta: { title: "Thông điệp" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const msg = row.getValue("message") as string;
        const failed = row.original.status === "failed";
        return (
          <span className={cn(
            "text-xs max-w-[320px] block truncate font-medium",
            failed ? "text-rose-500 font-semibold" : "text-muted-foreground"
          )}>
            {msg}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="size-8 cursor-pointer"
          onClick={() => setSelectedLog(row.original)}
        >
          <Icon icon="solar:eye-line-duotone" className="size-4 text-muted-foreground hover:text-foreground" />
        </Button>
      ),
    },
  ], [pagination]);

  return (
    <div className="flex flex-col w-full flex-1">
      {/* Page Header */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="ph:telegram-logo-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Lịch sử hoạt động Telegram</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Nhật ký ghi nhận chi tiết kết nối, lỗi Proxy, giới hạn API và các tiến trình tự động trả lời tin nhắn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative separator line */}
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

      {/* Main Content */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          
          {/* Stats Row: grid-cols-1 md:grid-cols-3 gap-6 exactly like services list */}
          <div className="p-6 pb-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tự động trả lời</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {logs.filter((l) => l.event === "auto_reply").length}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:chat-round-unread-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Lỗi hệ thống / Proxy</p>
                <h3 className="text-2xl font-extrabold text-rose-500 tracking-tight">
                  {logs.filter((l) => l.event === "proxy_error" || l.status === "failed").length}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-rose-500 bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng số sự kiện</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {logs.length}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-sky-500 bg-sky-500/10 border border-sky-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:document-text-line-duotone" className="text-xl" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
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

          {/* Inner Content */}
          <div className="p-6 space-y-6">
            <div className="flex flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Danh sách nhật ký hoạt động</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Danh sách các log sự kiện, kết nối và hoạt động tự động phản hồi.
                </p>
              </div>
              {logs.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    onClick={handleClearLogs}
                    className="h-9 rounded-xl text-xs font-bold gap-2 text-rose-500 border-rose-500/20 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Icon icon="solar:trash-bin-trash-line-duotone" className="text-lg" />
                    Xóa tất cả logs
                  </Button>
                </div>
              )}
            </div>

            <DataTable
              columns={columns}
              data={paginatedLogs}
              pageCount={Math.ceil(filteredLogs.length / pagination.pageSize)}
              totalRecords={filteredLogs.length}
              pagination={pagination}
              onPaginationChange={setPagination}
              sorting={sorting}
              onSortingChange={setSorting}
              toolbarInput={
                <div className="flex items-center gap-2 w-full">
                  <div className="relative flex-1">
                    <Icon
                      icon="solar:magnifer-line-duotone"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
                    />
                    <Input
                      placeholder="Tìm kiếm nội dung logs, khách hàng..."
                      className="pl-9 h-9 text-sm w-full bg-background"
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
                          eventFilter !== "all" && "text-vanixjnk border-vanixjnk/30 bg-vanixjnk/5 hover:bg-vanixjnk/10"
                        )}
                        title="Lọc loại sự kiện"
                      >
                        <Icon icon="solar:filter-line-duotone" className="size-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3 flex flex-col gap-2" align="end">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Loại sự kiện
                        </label>
                        <Select value={eventFilter} onValueChange={(val: any) => setEventFilter(val)}>
                          <SelectTrigger className="w-full h-9 text-[13px] justify-between">
                            <SelectValue placeholder="Chọn sự kiện" />
                          </SelectTrigger>
                          <SelectContent position="popper" align="start">
                            <SelectItem value="all" className="text-[13px]">
                              <span className="flex items-center gap-2">
                                <Icon icon="solar:widget-3-line-duotone" className="size-3.5 shrink-0 text-blue-500" />
                                <span>Tất cả</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="auto_reply" className="text-[13px]">
                              <span className="flex items-center gap-2">
                                <Icon icon="solar:chat-round-unread-line-duotone" className="size-3.5 shrink-0 text-vanixjnk" />
                                <span>Auto Reply</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="connection" className="text-[13px]">
                              <span className="flex items-center gap-2">
                                <Icon icon="solar:link-circle-line-duotone" className="size-3.5 shrink-0 text-emerald-500" />
                                <span>Kết nối</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="proxy_error" className="text-[13px]">
                              <span className="flex items-center gap-2">
                                <Icon icon="solar:danger-triangle-line-duotone" className="size-3.5 shrink-0 text-rose-500" />
                                <span>Lỗi Proxy</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="rate_limit" className="text-[13px]">
                              <span className="flex items-center gap-2">
                                <Icon icon="solar:shield-warning-line-duotone" className="size-3.5 shrink-0 text-amber-500" />
                                <span>Rate Limit</span>
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              }
            />
          </div>

        </div>
      </div>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 mb-3">
              <Icon icon="solar:document-text-line-duotone" className="text-2xl" />
            </div>
            <DialogTitle>Chi tiết nhật ký hoạt động</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-3 text-[13px]">
              <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-2">
                <span className="text-muted-foreground font-semibold">Tài khoản:</span>
                <span className="col-span-2 text-foreground font-mono font-bold">{selectedLog.phone}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-2">
                <span className="text-muted-foreground font-semibold">Sự kiện:</span>
                <span className="col-span-2">{getEventBadge(selectedLog.event)}</span>
              </div>

              {selectedLog.targetUser && (
                <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground font-semibold">Khách hàng:</span>
                  <span className="col-span-2 text-vanixjnk font-mono">{selectedLog.targetUser}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-2">
                <span className="text-muted-foreground font-semibold">Thời gian:</span>
                <span className="col-span-2 text-muted-foreground font-mono">
                  {new Date(selectedLog.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-muted-foreground font-semibold block">Thông báo chi tiết:</span>
                <div className={cn(
                  "p-3 rounded-lg border leading-relaxed font-medium text-left",
                  selectedLog.status === "failed"
                    ? "bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400"
                    : "bg-muted/40 border-border text-foreground"
                )}>
                  {selectedLog.message}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLog(null)} className="h-9 text-[13px]">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
