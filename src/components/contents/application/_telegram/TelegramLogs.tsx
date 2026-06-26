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
import { trpc } from "@/lib/trpc";
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
  accountId: string;
  actionType: string;
  message: string;
  status: "success" | "failed" | string;
  details: any;
  createdAt: Date | string;
}

const navItems = [
  { name: "Tài khoản", href: "/application/telegram/accounts", icon: "solar:users-group-two-rounded-line-duotone" },
  { name: "Tự động trả lời", href: "/application/telegram/auto-reply", icon: "solar:chat-round-unread-line-duotone" },
  { name: "Lịch sử hoạt động", href: "/application/telegram/logs", icon: "solar:document-text-line-duotone" },
];

export default function TelegramLogs() {
  const pathname = usePathname();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<"all" | "auto_reply" | "connection">("all");
  const [selectedLog, setSelectedLog] = useState<TelegramSelfbotLog | null>(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fetch accounts list
  const { data: accountsData, isLoading: accountsLoading } = trpc.application.telegram.getAccounts.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const accountsList = accountsData || [];

  // Automatically select the first account when accounts list loads
  useEffect(() => {
    if (accountsList.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accountsList[0].id);
    }
  }, [accountsList, selectedAccountId]);

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

  const sortField = sorting[0]?.id || "createdAt";
  const sortOrder = sorting[0]?.desc ? ("desc" as const) : ("asc" as const);

  // Fetch paginated logs
  const { data: queryResult, isLoading: logsLoading, refetch } = trpc.application.telegram.getLogsList.useQuery(
    {
      accountId: selectedAccountId,
      search: debouncedSearch || undefined,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortField,
      sortOrder,
      event: eventFilter === "all" ? undefined : eventFilter,
    },
    {
      enabled: !!selectedAccountId,
      refetchOnWindowFocus: false,
    }
  );

  const responseData = queryResult?.data;
  const logs = responseData?.items || [];
  const totalRecords = responseData?.total || 0;
  const pageCount = responseData?.totalPages || 0;
  const stats = responseData?.stats || { total: 0, autoReply: 0, connection: 0 };

  const clearLogsMutation = trpc.application.telegram.clearLogs.useMutation({
    onSuccess: () => {
      toast.success("Nhật ký đã được xóa sạch!");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Xóa lịch sử thất bại");
    }
  });

  const handleClearLogs = () => {
    if (!selectedAccountId) return;
    toast.promise(
      clearLogsMutation.mutateAsync({ accountId: selectedAccountId }),
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
      default:
        return (
          <Badge className="bg-muted hover:bg-muted text-muted-foreground font-bold text-[10px] rounded-md px-2 py-0.5 border border-border">
            {event}
          </Badge>
        );
    }
  };

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
      accessorKey: "actionType",
      meta: { title: "Sự kiện" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const event = row.getValue("actionType") as string;
        return getEventBadge(event);
      },
    },
    {
      accessorKey: "details",
      meta: { title: "Đối tượng" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const details = row.getValue("details") as any;
        const senderName = details?.senderName || details?.senderId || "";
        return (
          <span className="text-[13px] font-mono text-vanixjnk font-semibold">
            {senderName ? `@${senderName}` : "—"}
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
          
          {/* Stats Row */}
          <div className="p-6 pb-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tự động trả lời</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {stats.autoReply}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:chat-round-unread-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Kết nối API</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {stats.connection}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:link-circle-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng số sự kiện</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {stats.total}
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Icon icon="solar:user-id-line-duotone" className="text-xl text-vanixjnk" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chọn tài khoản Telegram</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Nhật ký hoạt động sẽ được tải riêng theo từng tài khoản.</p>
                </div>
              </div>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="w-full sm:w-80 h-10 text-[13px] justify-between bg-background border-border">
                  <SelectValue placeholder="Chọn tài khoản" />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  {accountsList.map((acc) => {
                    const name = [acc.firstName, acc.lastName].filter(Boolean).join(" ").trim() || "Telegram Account";
                    return (
                      <SelectItem key={acc.id} value={acc.id} className="text-[13px]">
                        {name} ({acc.phone})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {accountsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-background/40">
                <div className="size-14 rounded-2xl text-muted-foreground bg-muted flex items-center justify-center mb-4">
                  <Icon icon="ph:telegram-logo-duotone" className="text-3xl" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Chưa có tài khoản Telegram kết nối</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Vui lòng thêm ít nhất một tài khoản Telegram ở trang danh sách tài khoản trước khi thực hiện xem nhật ký hoạt động.
                </p>
                <Link href="/application/telegram/accounts" className="mt-4">
                  <Button variant="vanixjnk" size="sm">
                    Đến trang tài khoản
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
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
                  data={logs}
                  pageCount={pageCount}
                  totalRecords={totalRecords}
                  pagination={pagination}
                  onPaginationChange={setPagination}
                  sorting={sorting}
                  onSortingChange={setSorting}
                  isLoading={logsLoading}
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
                <span className="col-span-2 text-foreground font-mono font-bold">
                  {accountsList.find((a) => a.id === selectedLog.accountId)?.phone || selectedLog.accountId}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-2">
                <span className="text-muted-foreground font-semibold">Sự kiện:</span>
                <span className="col-span-2">{getEventBadge(selectedLog.actionType)}</span>
              </div>

              {(selectedLog.details?.senderName || selectedLog.details?.senderId) && (
                <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground font-semibold">Khách hàng:</span>
                  <span className="col-span-2 text-vanixjnk font-mono">
                    @{selectedLog.details?.senderName || selectedLog.details?.senderId}
                  </span>
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
