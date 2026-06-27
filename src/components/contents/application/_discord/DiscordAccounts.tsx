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
import { trpc } from "@/lib/trpc";

import AddAccountDialog from "./AddAccountDialog";
import EditProxyDialog from "./EditProxyDialog";
import DeleteAccountDialog from "./DeleteAccountDialog";
import AccountDetailsDialog from "./AccountDetailsDialog";

const navItems = [
  { name: "Tài khoản", href: "/application/discord/accounts", icon: "solar:users-group-two-rounded-line-duotone" },
  { name: "Trạng thái & Rich Presence", href: "/application/discord/presences", icon: "solar:gamepad-old-line-duotone" },
  { name: "Lịch sử hoạt động", href: "/application/discord/logs", icon: "solar:document-text-line-duotone" },
];

export default function DiscordAccounts() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditProxyOpen, setIsEditProxyOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: queryResult, isLoading, refetch, isFetching } = trpc.application.discord.getAccountsList.useQuery(
    {
      search: debouncedSearch,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortField: sorting[0]?.id || undefined,
      sortOrder: sorting[0]?.desc ? "desc" : "asc",
    },
    {
      placeholderData: (prev) => prev,
    }
  );

  const accounts = (queryResult?.data?.items || []) as any[];
  const totalAccounts = queryResult?.data?.total || 0;
  const stats = {
    total: queryResult?.data?.stats?.total || 0,
    active: queryResult?.data?.stats?.active || 0,
    proxyActive: queryResult?.data?.stats?.proxyActive || 0,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleStartSelfbot = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    if (acc.status === "invalid") {
      toast.error("Không thể khởi chạy tài khoản có token không hợp lệ!");
      return;
    }
    toast.success(`Khởi chạy selfbot cho tài khoản @${acc.username} thành công!`);
  };

  const handleStopSelfbot = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    toast.info(`Đã ngắt kết nối selfbot tài khoản @${acc.username}`);
  };

  const handleCheckProxy = (acc: any) => {
    toast.info(`Kiểm tra proxy cho @${acc.username}: Tính năng đang được phát triển`);
  };

  const handleAddAccountSuccess = () => {
    refetch();
  };

  const handleSaveProxySuccess = () => {
    refetch();
  };

  const handleDeleteAccountConfirm = () => {
    refetch();
  };

  const refreshTokenMutation = trpc.application.discord.refreshToken.useMutation({
    onSuccess: (data, variables) => {
      refetch();
      toast.success(`Đã cập nhật thông tin @${data?.username || "unknown"}`);
    },
    onError: (error) => {
      toast.error(error.message || "Kiểm tra token thất bại");
    },
  });

  const handleRefreshToken = (acc: any) => {
    toast.promise(refreshTokenMutation.mutateAsync({ accountId: acc.id }), {
      loading: `Đang kiểm tra token @${acc.username || "unknown"}...`,
    });
  };

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
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
      meta: { title: "Tài khoản Discord" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const acc = row.original;
        const color = acc.accentColor || "var(--primary)";
        return (
          <div className="flex items-center gap-3">
            {acc.avatar ? (
              <img
                src={acc.avatar}
                alt={acc.username}
                className="size-9 rounded-full object-cover border border-vanixjnk/20 bg-neutral-900"
              />
            ) : (
              <div
                className="size-9 rounded-full text-white border border-border flex items-center justify-center font-bold text-sm bg-vanixjnk/15 text-vanixjnk"
                style={{ backgroundColor: acc.avatar ? undefined : color + "33" }}
              >
                {acc.globalName?.charAt(0)?.toUpperCase() || acc.username?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-foreground truncate flex items-center gap-1.5 text-xs">
                {acc.globalName || acc.username || "Unknown"}
              </span>
              <span className="text-[10px] text-muted-foreground">@{acc.username || "unknown"}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "discordId",
      meta: { title: "Discord ID" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.getValue("discordId")}
        </span>
      ),
    },
    {
      accessorKey: "proxy",
      meta: { title: "Proxy" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const acc = row.original;
        return acc.proxy ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border font-mono">
              {acc.proxy?.split("@")[1] || acc.proxy || "?"}
            </span>
            <Badge
              variant={acc.proxyStatus === "active" ? "success" : "destructive"}
              className="text-[9px] font-bold py-0 px-1 rounded-sm cursor-pointer"
              onClick={() => handleCheckProxy(acc)}
              title="Bấm để kiểm tra kết nối proxy"
            >
              {acc.proxyStatus === "active" ? "Live" : acc.proxyStatus === "dead" ? "Dead" : "Unknown"}
            </Badge>
          </div>
        ) : (
          <span className="text-muted-foreground italic text-xs">Không sử dụng</span>
        );
      },
    },
    {
      accessorKey: "status",
      meta: { title: "Trạng thái" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let badgeColor: any = "secondary";
        let statusText = "Ngoại tuyến";

        if (status === "active") {
          badgeColor = "success";
          statusText = "Sẵn sàng";
        } else if (status === "rate_limited") {
          badgeColor = "warning";
          statusText = "Rate Limited";
        } else if (status === "invalid") {
          badgeColor = "danger";
          statusText = "Token Die";
        } else if (status === "phone_lock") {
          badgeColor = "danger";
          statusText = "Kẹt SĐT";
        } else if (status === "suspended") {
          badgeColor = "destructive";
          statusText = "Khóa Account";
        }

        return (
          <Badge variant={badgeColor} className="text-[10px] font-bold rounded-sm py-0.5">
            {statusText}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isRunning",
      meta: { title: "Gateway Client" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const acc = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-block size-2 rounded-full ${acc.isRunning ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/45"}`} />
            <span className="text-xs font-semibold">
              {acc.isRunning ? "Đang chạy" : "Đã dừng"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => {
        const acc = row.original;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
              >
                <Icon icon="solar:menu-dots-bold-duotone" className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-36 p-1 flex flex-col gap-0.5" align="end">
              {acc.isRunning ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs h-8 px-2"
                  onClick={() => handleStopSelfbot(acc.id)}
                >
                  <Icon icon="solar:pause-line-duotone" className="mr-2 size-3.5 text-amber-500" />
                  Dừng
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs h-8 px-2"
                  onClick={() => handleStartSelfbot(acc.id)}
                >
                  <Icon icon="solar:play-line-duotone" className="mr-2 size-3.5 text-emerald-500" />
                  Chạy
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2"
                onClick={() => {
                  setSelectedAccount(acc);
                  setIsDetailsOpen(true);
                }}
              >
                <Icon icon="solar:user-id-line-duotone" className="mr-2 size-3.5 text-vanixjnk" />
                Xem chi tiết
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2"
                onClick={() => {
                  setSelectedAccount(acc);
                  setIsEditProxyOpen(true);
                }}
              >
                <Icon icon="solar:server-square-line-duotone" className="mr-2 size-3.5 text-sky-500" />
                Gán Proxy
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2"
                onClick={() => handleRefreshToken(acc)}
                disabled={refreshTokenMutation.isPending}
              >
                <Icon icon="solar:refresh-square-line-duotone" className="mr-2 size-3.5 text-blue-500" />
                Kiểm tra token
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                onClick={() => {
                  setSelectedAccount(acc);
                  setIsDeleteOpen(true);
                }}
              >
                <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5" />
                Xóa tài khoản
              </Button>
            </PopoverContent>
          </Popover>
        );
      },
    },
  ], [pagination, sorting]);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:users-group-two-rounded-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Discord Selfbots</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý tài khoản Discord (User Tokens), gán proxy và cấu hình Gateway kết nối tự động.
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
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng tài khoản</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">{stats.total}</h3>
              </div>
              <div className="size-10 rounded-lg text-indigo-500 bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:users-group-two-rounded-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Đang hoạt động</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">{stats.active}</h3>
              </div>
              <div className="size-10 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:shield-check-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Proxy hoạt động</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">{stats.proxyActive}</h3>
              </div>
              <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:globus-line-duotone" className="text-xl" />
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
                <h3 className="text-base font-bold text-foreground">Danh sách tài khoản kết nối</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Danh sách tài khoản Discord (selfbot) đang được quản lý.
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
                      onClick={() => setIsAddOpen(true)}
                    >
                      <Icon icon="solar:user-plus-line-duotone" className="mr-2 size-3.5 text-emerald-500" />
                      Thêm tài khoản
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs h-8 px-2 cursor-pointer"
                      onClick={() => {
                        toast.success("Đang bắt đầu test toàn bộ proxy...");
                        accounts.forEach((acc) => {
                          if (acc.proxy) {
                            handleCheckProxy(acc);
                          }
                        });
                      }}
                    >
                      <Icon icon="solar:bolt-line-duotone" className="mr-2 size-3.5 text-amber-500" />
                      Test Toàn bộ Proxy
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={accounts}
              pagination={pagination}
              onPaginationChange={setPagination}
              sorting={sorting}
              onSortingChange={setSorting}
              pageCount={Math.max(1, Math.ceil(totalAccounts / pagination.pageSize))}
              isLoading={isLoading || isFetching}
              toolbarInput={
                <div className="relative flex-1">
                  <Icon
                    icon="solar:magnifer-line-duotone"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
                  />
                  <Input
                    placeholder="Tìm theo username hoặc Discord ID..."
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

      <AddAccountDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={handleAddAccountSuccess}
      />

      <EditProxyDialog
        open={isEditProxyOpen}
        onOpenChange={setIsEditProxyOpen}
        account={selectedAccount}
        onSuccess={handleSaveProxySuccess}
      />

      <DeleteAccountDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        account={selectedAccount}
        onConfirm={handleDeleteAccountConfirm}
      />

      <AccountDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        account={selectedAccount}
      />
    </div>
  );
}
