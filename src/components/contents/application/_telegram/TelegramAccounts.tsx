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
  DialogDescription,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";

interface TelegramAccount {
  id: string;
  phone: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  status: string;
  proxy: string | null;
  proxyStatus: string;
  createdAt: Date | string;
}

const navItems = [
  { name: "Tài khoản", href: "/application/telegram/accounts", icon: "solar:users-group-two-rounded-line-duotone" },
  { name: "Tự động trả lời", href: "/application/telegram/auto-reply", icon: "solar:chat-round-unread-line-duotone" },
  { name: "Lịch sử hoạt động", href: "/application/telegram/logs", icon: "solar:document-text-line-duotone" },
];

export default function TelegramAccounts() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditProxyOpen, setIsEditProxyOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TelegramAccount | null>(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  // Wizard login states
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [proxy, setProxy] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const [needTwoFactor, setNeedTwoFactor] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const sortField = sorting[0]?.id || "createdAt";
  const sortOrder = sorting[0]?.desc ? ("desc" as const) : ("asc" as const);

  // Fetch accounts query
  const { data: queryResult, isLoading, refetch, isFetching } = trpc.application.telegram.getAccountsList.useQuery(
    {
      search: debouncedSearch || undefined,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortField,
      sortOrder,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const accounts = queryResult?.data?.items || [];
  const totalRecords = queryResult?.data?.total || 0;
  const pageCount = queryResult?.data?.totalPages || 0;
  const stats = queryResult?.data?.stats || { total: 0, active: 0, inactive: 0 };

  // Mutations
  const sendLoginCodeMutation = trpc.application.telegram.sendLoginCode.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Mã xác minh OTP đã được gửi!");
        setStep("otp");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Gửi mã OTP thất bại");
    }
  });

  const submitLoginCodeMutation = trpc.application.telegram.submitLoginCode.useMutation({
    onSuccess: (data) => {
      if (data.need2FA) {
        setNeedTwoFactor(true);
        toast.info("Tài khoản yêu cầu mật khẩu 2 lớp (2FA).");
      } else if (data.success) {
        toast.success("Đăng nhập và liên kết tài khoản Telegram thành công!");
        handleOpenAddDialog(false);
        refetch();
      }
    },
    onError: (err) => {
      toast.error(err.message || "Đăng nhập thất bại");
    }
  });

  const updateProxyMutation = trpc.application.telegram.updateProxy.useMutation({
    onSuccess: () => {
      toast.success("Cập nhật Proxy thành công!");
      setIsEditProxyOpen(false);
      setProxy("");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Cập nhật Proxy thất bại");
    }
  });

  const deleteAccountMutation = trpc.application.telegram.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa tài khoản Telegram thành công!");
      setIsDeleteOpen(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Xóa tài khoản thất bại");
    }
  });

  const checkProxyMutation = trpc.application.telegram.checkProxy.useMutation({
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success(data.message || `Proxy kết nối tốt (Ping: ${data.ping || 0}ms)`);
      } else {
        toast.error(data.message || "Kết nối proxy thất bại");
      }
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Kiểm tra Proxy thất bại");
    }
  });

  // Action handlers
  const handleOpenAddDialog = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      setStep("phone");
      setPhone("");
      setProxy("");
      setOtpCode("");
      setTwoFactorPassword("");
      setNeedTwoFactor(false);
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Vui lòng điền số điện thoại");
      return;
    }
    sendLoginCodeMutation.mutate({
      phone,
      proxy: proxy || undefined,
    });
  };

  const handleSubmitOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error("Vui lòng điền mã OTP");
      return;
    }
    submitLoginCodeMutation.mutate({
      phone,
      code: otpCode,
      password: twoFactorPassword || undefined,
    });
  };

  const handleUpdateProxy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    updateProxyMutation.mutate({
      accountId: selectedAccount.id,
      proxy: proxy || null,
    });
  };

  const handleDeleteAccount = () => {
    if (!selectedAccount) return;
    deleteAccountMutation.mutate({
      accountId: selectedAccount.id,
    });
  };

  const handleCheckProxy = (acc: TelegramAccount) => {
    toast.promise(
      checkProxyMutation.mutateAsync({ accountId: acc.id }),
      {
        loading: `Đang kiểm tra kết nối proxy của ${acc.phone}...`,
        success: "Đã hoàn thành kiểm tra proxy!",
        error: "Lỗi kết nối proxy",
      }
    );
  };

  const columns = React.useMemo<ColumnDef<TelegramAccount>[]>(() => [
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
      accessorKey: "phone",
      meta: { title: "Tài khoản" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const acc = row.original;
        const name = [acc.firstName, acc.lastName].filter(Boolean).join(" ").trim() || "Telegram User";
        return (
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-vanixjnk/10 text-vanixjnk font-bold border border-vanixjnk/20 flex items-center justify-center">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-foreground truncate">
                {name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">{acc.phone}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "username",
      meta: { title: "Username" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const val = row.getValue("username") as string;
        return val ? (
          <span className="font-medium text-foreground">
            @{val}
          </span>
        ) : (
          <span className="text-muted-foreground italic">—</span>
        );
      },
    },
    {
      accessorKey: "proxy",
      meta: { title: "Proxy sử dụng" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const acc = row.original;
        return acc.proxy ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
              {acc.proxy.split("@")[1] || acc.proxy}
            </span>
            <Badge
              variant={acc.proxyStatus === "active" ? "success" : "destructive"}
              className="text-[9px] font-bold py-0 px-1 rounded-sm cursor-pointer"
              onClick={() => handleCheckProxy(acc)}
              title="Bấm vào để kiểm tra kết nối proxy"
            >
              {acc.proxyStatus === "active" ? "Live" : acc.proxyStatus === "dead" ? "Dead" : "Unknown"}
            </Badge>
          </div>
        ) : (
          <span className="text-muted-foreground italic">Không sử dụng</span>
        );
      },
    },
    {
      accessorKey: "status",
      meta: { title: "Trạng thái" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusVariants: Record<string, "success" | "outline" | "danger"> = {
          active: "success",
          rate_limited: "outline",
          error: "danger",
          inactive: "outline",
        };
        const statusLabels: Record<string, string> = {
          active: "Hoạt động",
          rate_limited: "Hạn chế",
          error: "Lỗi kết nối",
          inactive: "Ngoại tuyến",
        };
        return <Badge variant={statusVariants[status] || "outline"}>{statusLabels[status] || status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const acc = row.original;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Icon icon="solar:menu-dots-bold-duotone" className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1 flex flex-col gap-0.5" align="end">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedAccount(acc);
                  setProxy(acc.proxy || "");
                  setIsEditProxyOpen(true);
                }}
                className="w-full justify-start text-xs h-8 px-2 cursor-pointer"
              >
                <Icon icon="solar:globus-line-duotone" className="mr-2 size-3.5" />
                Đổi Proxy
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleCheckProxy(acc)}
                className="w-full justify-start text-xs h-8 px-2 cursor-pointer"
              >
                <Icon icon="solar:restart-line-duotone" className="mr-2 size-3.5" />
                Test kết nối
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedAccount(acc);
                  setIsDeleteOpen(true);
                }}
                className="w-full justify-start text-xs h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
              >
                <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5" />
                Xóa tài khoản
              </Button>
            </PopoverContent>
          </Popover>
        );
      },
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
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý Tài khoản Telegram</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý danh sách tài khoản Telegram cá nhân, phiên làm việc (session) và proxy đi kèm.
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
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {accounts.filter((a) => a.proxyStatus === "active").length}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:globus-line-duotone" className="text-xl" />
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
                <h3 className="text-base font-bold text-foreground">Danh sách tài khoản kết nối</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Danh sách tài khoản Telegram đang được điều khiển và giám sát.
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
                      onClick={() => handleOpenAddDialog(true)}
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
              pageCount={pageCount}
              totalRecords={totalRecords}
              pagination={pagination}
              onPaginationChange={setPagination}
              sorting={sorting}
              onSortingChange={setSorting}
              isLoading={isLoading || isFetching}
              toolbarInput={
                <div className="relative flex-1">
                  <Icon
                    icon="solar:magnifer-line-duotone"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
                  />
                  <Input
                    placeholder="Tìm theo số điện thoại, tên, username..."
                    className="pl-9 h-9 text-sm w-full bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              }
            />
          </div>

        </div>
      </div>

      {/* Add Account Dialog */}
      <Dialog open={isAddOpen} onOpenChange={handleOpenAddDialog}>
        <DialogContent className="sm:max-w-[460px]">
          <form onSubmit={step === "phone" ? handleSendOTP : handleSubmitOTP}>
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 mb-3">
                <Icon icon="ph:telegram-logo-duotone" className="text-2xl" />
              </div>
              <DialogTitle>Thêm tài khoản Telegram</DialogTitle>
              <DialogDescription>
                {step === "phone"
                  ? "Nhập số điện thoại đăng nhập và proxy gán cho tài khoản để yêu cầu gửi mã OTP từ Telegram."
                  : `Nhập mã OTP vừa được gửi tới số điện thoại ${phone}.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {step === "phone" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Số điện thoại</label>
                    <Input
                      placeholder="Ví dụ: +84987654321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-9 text-[13px]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Proxy kết nối (Tùy chọn)</label>
                    <Input
                      placeholder="Ví dụ: socks5://username:password@ip:port"
                      value={proxy}
                      onChange={(e) => setProxy(e.target.value)}
                      className="h-9 text-[13px]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Mã xác thực OTP (5 chữ số)</label>
                    <Input
                      placeholder="Nhập mã OTP..."
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="h-9 text-[13px] font-mono tracking-widest text-center"
                      required
                      maxLength={5}
                    />
                  </div>

                  {needTwoFactor && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Mật khẩu 2FA (Bảo mật 2 lớp)</label>
                      <Input
                        type="password"
                        placeholder="Nhập mật khẩu 2FA của bạn..."
                        value={twoFactorPassword}
                        onChange={(e) => setTwoFactorPassword(e.target.value)}
                        className="h-9 text-[13px]"
                        required
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              {step === "otp" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("phone");
                    setOtpCode("");
                    setTwoFactorPassword("");
                    setNeedTwoFactor(false);
                  }}
                  className="mr-auto cursor-pointer"
                >
                  Quay lại
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => handleOpenAddDialog(false)} className="cursor-pointer">
                Hủy
              </Button>
              <Button
                type="submit"
                variant="vanixjnk"
                disabled={sendLoginCodeMutation.isPending || submitLoginCodeMutation.isPending}
                className="cursor-pointer"
              >
                {sendLoginCodeMutation.isPending || submitLoginCodeMutation.isPending ? (
                  <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
                ) : step === "phone" ? (
                  <Icon icon="solar:paper-plane-line-duotone" className="mr-1.5 size-4" />
                ) : (
                  <Icon icon="solar:shield-check-line-duotone" className="mr-1.5 size-4" />
                )}
                {step === "phone" ? "Gửi mã OTP" : "Xác nhận đăng nhập"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Proxy Dialog */}
      <Dialog open={isEditProxyOpen} onOpenChange={setIsEditProxyOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleUpdateProxy}>
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 mb-3">
                <Icon icon="solar:globus-line-duotone" className="text-2xl" />
              </div>
              <DialogTitle>Cấu hình Proxy tài khoản</DialogTitle>
              <DialogDescription>
                Thay đổi proxy gán cho tài khoản <strong className="text-foreground">{selectedAccount?.phone}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Địa chỉ Proxy</label>
                <Input
                  placeholder="Ví dụ: socks5://username:password@ip:port"
                  value={proxy}
                  onChange={(e) => setProxy(e.target.value)}
                  className="h-9 text-[13px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditProxyOpen(false)} className="cursor-pointer">
                Hủy
              </Button>
              <Button type="submit" variant="vanixjnk" className="cursor-pointer" disabled={updateProxyMutation.isPending}>
                {updateProxyMutation.isPending ? (
                  <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
                ) : null}
                Lưu cấu hình
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center size-12 rounded-xl text-red-500 bg-red-500/10 border border-red-500/25 mb-3">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-2xl" />
            </div>
            <DialogTitle className="text-red-500">Xóa tài khoản Telegram</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-[13px] text-muted-foreground text-center">
            Bạn có chắc muốn xóa tài khoản <strong className="text-foreground font-semibold">{selectedAccount?.phone}</strong> không? Hành động này sẽ gỡ bỏ hoàn toàn phiên kết nối khỏi hệ thống của Vani Studio.
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="cursor-pointer">
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              className="cursor-pointer"
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? (
                <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
              ) : null}
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
