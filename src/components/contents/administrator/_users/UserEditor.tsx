"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserEditorProps {
  initialId: string;
}

const TABS = [
  {
    id: "account",
    title: "Tài khoản",
    icon: "solar:user-id-line-duotone",
    desc: "Quản lý thông tin tài khoản cốt lõi như tên, email, ảnh đại diện, vai trò và trạng thái hoạt động.",
  },
  {
    id: "profile",
    title: "Thông tin cá nhân",
    icon: "solar:folder-with-files-line-duotone",
    desc: "Cấu hình số điện thoại, CMND/CCCD, mã số thuế và thông tin địa chỉ chi tiết.",
  },
  {
    id: "sessions",
    title: "Liên kết & Bảo mật",
    icon: "solar:history-line-duotone",
    desc: "Xem các mạng xã hội đã liên kết và quản lý hoặc thu hồi các phiên đăng nhập hoạt động.",
  },
];

function formatDateTime(dateStr: string | Date | null | undefined) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function UserEditor({ initialId }: UserEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("account");

  // Core User states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");
  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [image, setImage] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  // Profile states
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [identityCard, setIdentityCard] = useState("");
  const [taxId, setTaxId] = useState("");

  const { data, isLoading, refetch, error } = trpc.administrator.users.getFullDetails.useQuery(
    { id: initialId },
    {
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Không thể tải chi tiết thông tin thành viên");
      router.push("/adminPanel/users");
    }
  }, [error, router]);

  useEffect(() => {
    if (data?.data) {
      const u = data.data.user;
      const p = data.data.profile || {};

      setName(u.name || "");
      setUsername(u.username || "");
      setRole(u.role || "user");
      setBanned(!!u.banned);
      setBanReason(u.banReason || "");
      setImage(u.image || "");
      setEmailVerified(!!u.emailVerified);

      setPhone(p.phone || "");
      setAddress1(p.address1 || "");
      setAddress2(p.address2 || "");
      setCity(p.city || "");
      setDistrict(p.district || "");
      setState(p.state || "");
      setPostalCode(p.postalCode || "");
      setCountry(p.country || "");
      setIdentityCard(p.identityCard || "");
      setTaxId(p.taxId || "");
    }
  }, [data]);

  const updateMutation = trpc.administrator.users.updateFullDetails.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Có lỗi xảy ra khi cập nhật thông tin");
    },
  });

  const revokeSessionMutation = trpc.administrator.users.revokeSession.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Không thể thu hồi phiên đăng nhập");
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tên hiển thị không được để trống");
      return;
    }

    updateMutation.mutate({
      id: initialId,
      user: {
        name: name.trim(),
        username: username.trim() || null,
        role,
        banned,
        banReason: banned ? banReason.trim() : null,
        emailVerified,
        image: image.trim() || null,
      },
      profile: {
        phone: phone.trim() || null,
        address1: address1.trim() || null,
        address2: address2.trim() || null,
        city: city.trim() || null,
        district: district.trim() || null,
        state: state.trim() || null,
        postalCode: postalCode.trim() || null,
        country: country.trim() || null,
        identityCard: identityCard.trim() || null,
        taxId: taxId.trim() || null,
      },
    });
  };

  const getProviderBadge = (providerId: string) => {
    switch (providerId.toLowerCase()) {
      case "credentials":
        return {
          label: "Tài khoản mật khẩu",
          icon: "solar:key-line-duotone",
          className: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        };
      case "google":
        return {
          label: "Tài khoản Google",
          icon: "logos:google-icon",
          className: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        };
      case "github":
        return {
          label: "Tài khoản GitHub",
          icon: "logos:github-icon",
          className: "text-foreground bg-muted border-border",
        };
      default:
        const capitalized = providerId.charAt(0).toUpperCase() + providerId.slice(1);
        return {
          label: `Tài khoản ${capitalized}`,
          icon: "solar:link-round-line-duotone",
          className: "text-muted-foreground bg-muted border-border",
        };
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép ID vào bộ nhớ tạm");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full flex-1">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1">
          <div className="border-l border-r border-dashed border-primary/20 p-6 flex flex-col gap-6">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const user = data?.data?.user;
  const sessions = data?.data?.sessions || [];
  const providers = data?.data?.providers || [];
  const profile = data?.data?.profile;
  const activeTabMeta = TABS.find((t) => t.id === activeTab);

  return (
    <div className="flex flex-col w-full flex-1">
      {/* Header */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/adminPanel/users")}
                className="flex items-center justify-center size-10 rounded-xl border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                title="Quay lại danh sách"
              >
                <Icon icon="solar:arrow-left-outline" className="text-xl" />
              </button>
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl border border-border bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                  {image ? (
                    <img src={image} alt={name} className="size-full object-cover" />
                  ) : (
                    <Icon icon="solar:user-line-duotone" className="size-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <span>{name}</span>
                    {emailVerified && (
                      <Badge variant="success" className="text-[9px] px-1.5 py-0 font-bold">
                        <Icon icon="solar:check-circle-line-duotone" className="size-2.5 mr-0.5" />
                        Đã xác minh
                      </Badge>
                    )}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {user?.email} {user?.username ? `• @${user.username}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/adminPanel/users")}
                className="font-bold text-xs"
              >
                Hủy bỏ
              </Button>
              {activeTab !== "sessions" && (
                <Button
                  type="submit"
                  form="user-editor-form"
                  variant="vanixjnk"
                  size="sm"
                  disabled={updateMutation.isPending}
                  className="font-bold text-xs gap-1.5"
                >
                  {updateMutation.isPending ? (
                    <Icon icon="solar:restart-line-duotone" className="size-3.5 animate-spin" />
                  ) : (
                    <Icon icon="solar:diskette-line-duotone" className="size-3.5" />
                  )}
                  Lưu thay đổi
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Repeating Stripe divider */}
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

      {/* Main Tabbed Area */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          
          {/* Tab Header Selector */}
          <div className="px-6 py-4 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background/35">
            <div className="flex flex-wrap items-center gap-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-vanixjnk/15 border-vanixjnk/25 text-vanixjnk shadow-sm"
                        : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <Icon
                      icon={tab.icon}
                      className={`size-4 ${isActive ? "text-vanixjnk" : "text-muted-foreground"}`}
                    />
                    <span>{tab.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Details Title & Body Form wrapper */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-6 pb-4 border-b border-border/60">
              <h3 className="text-sm font-bold text-foreground">{activeTabMeta?.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{activeTabMeta?.desc}</p>
            </div>

            <form id="user-editor-form" onSubmit={handleSave} className="flex-1 flex flex-col">
              
              {/* TAB 1: Core Account Settings */}
              {activeTab === "account" && (
                <div className="space-y-6 max-w-4xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    
                    {/* Profile image URL + Preview */}
                    <div className="p-4 rounded-xl border border-border bg-background/50 flex flex-col items-center gap-3">
                      <label className="text-xs font-bold text-foreground self-start">Ảnh đại diện (Avatar)</label>
                      <div className="size-24 rounded-2xl border border-border bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                        {image ? (
                          <img src={image} alt="Avatar Preview" className="size-full object-cover" />
                        ) : (
                          <Icon icon="solar:user-line-duotone" className="size-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="w-full flex flex-col gap-1.5 mt-1">
                        <Input
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          placeholder="Dán link ảnh đại diện..."
                          className="h-8 text-[11px]"
                        />
                      </div>
                    </div>

                    {/* Basic details */}
                    <div className="md:col-span-2 p-5 rounded-xl border border-border bg-background/50 flex flex-col gap-4">
                      
                      {/* Readonly ID */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Mã thành viên (User ID)</label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={initialId}
                            readOnly
                            className="h-9 text-xs font-mono bg-muted/30 select-all cursor-default"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-border shrink-0 cursor-pointer"
                            onClick={() => copyToClipboard(initialId)}
                            title="Sao chép ID"
                          >
                            <Icon icon="solar:copy-line-duotone" className="size-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground">Tên hiển thị</label>
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên hiển thị..."
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground">Tên tài khoản (Username)</label>
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Tên tài khoản đăng nhập..."
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground">Email đăng ký</label>
                          <Input
                            value={user?.email || ""}
                            disabled
                            className="h-9 text-xs bg-muted/30 cursor-not-allowed opacity-80"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground">Vai trò phân quyền</label>
                          <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="h-9 w-full text-xs">
                              <SelectValue placeholder="Chọn vai trò..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user" className="text-xs">Thành viên thông thường (User)</SelectItem>
                              <SelectItem value="admin" className="text-xs">Quản trị viên (Admin)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Verification & Security Switch toggles */}
                    <div className="p-5 rounded-xl border border-border bg-background/50 flex flex-col gap-5">
                      <h4 className="text-xs font-bold text-foreground pb-2 border-b border-border/40">Trạng thái bảo mật & xác minh</h4>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-foreground">Xác minh Email</span>
                          <span className="text-[10px] text-muted-foreground">Xác nhận địa chỉ email này đã hoàn thành xác thực OTP/Token.</span>
                        </div>
                        <Switch
                          checked={emailVerified}
                          onCheckedChange={setEmailVerified}
                        />
                      </div>

                      <div className="flex items-center justify-between border-t border-border/30 pt-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-rose-500">Khóa tài khoản</span>
                          <span className="text-[10px] text-muted-foreground">Tạm ngưng quyền truy cập của người dùng này trên toàn bộ hệ thống.</span>
                        </div>
                        <Switch
                          checked={banned}
                          onCheckedChange={setBanned}
                        />
                      </div>
                    </div>

                    {/* Metadata timestamps */}
                    <div className="p-5 rounded-xl border border-border bg-background/50 flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-foreground pb-2 border-b border-border/40">Thông tin hệ thống</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ngày tham gia</span>
                          <span className="text-xs font-semibold text-foreground">{formatDateTime(user?.createdAt)}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cập nhật lần cuối</span>
                          <span className="text-xs font-semibold text-foreground">{formatDateTime(user?.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {banned && (
                    <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/5 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="text-xs font-bold text-rose-500">Lý do khóa tài khoản</label>
                      <Textarea
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Nhập lý do chi tiết tài khoản bị khóa để người dùng được rõ..."
                        className="min-h-[100px] text-xs resize-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Detailed Profile Info (address, phone, identity card) */}
              {activeTab === "profile" && (
                <div className="space-y-6 max-w-4xl">
                  <div className="p-5 rounded-xl border border-border bg-background/50 flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-foreground pb-2 border-b border-border/40">Hồ sơ cá nhân chính</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Số điện thoại</label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Số điện thoại..."
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Số CMND / Thẻ CCCD</label>
                        <Input
                          value={identityCard}
                          onChange={(e) => setIdentityCard(e.target.value)}
                          placeholder="Số CMND/CCCD..."
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Mã số thuế cá nhân</label>
                        <Input
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          placeholder="Mã số thuế..."
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border border-border bg-background/50 flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-foreground pb-2 border-b border-border/40">Địa chỉ liên hệ & Cư trú</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Địa chỉ chính</label>
                        <Input
                          value={address1}
                          onChange={(e) => setAddress1(e.target.value)}
                          placeholder="Số nhà, tên đường, phường..."
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Địa chỉ phụ</label>
                        <Input
                          value={address2}
                          onChange={(e) => setAddress2(e.target.value)}
                          placeholder="Số phòng, toà nhà, khu chung cư..."
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Quận / Huyện</label>
                        <Input
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="Quận/Huyện..."
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Thành phố / Tỉnh</label>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Thành phố..."
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Bang / Tỉnh bang</label>
                        <Input
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Tỉnh bang..."
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Mã bưu chính</label>
                        <Input
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="Mã bưu chính..."
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Quốc gia</label>
                        <Input
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Quốc gia..."
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {profile && (
                    <div className="p-5 rounded-xl border border-border bg-background/50 flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-foreground pb-2 border-b border-border/40">Thông tin hồ sơ hệ thống</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ngày tạo hồ sơ</span>
                          <span className="text-xs font-semibold text-foreground">{formatDateTime(profile.createdAt)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cập nhật hồ sơ</span>
                          <span className="text-xs font-semibold text-foreground">{formatDateTime(profile.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Integrations & Active Sessions (revocable) */}
              {activeTab === "sessions" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  
                  {/* Social accounts */}
                  <div className="lg:col-span-1 p-5 rounded-xl border border-border bg-background/50 flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-foreground pb-2 border-b border-border/40">Tài khoản liên kết</h4>
                    
                    {providers.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">Không có liên kết tài khoản mạng xã hội nào.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {providers.map((prov: any) => {
                          const badge = getProviderBadge(prov.providerId);
                          return (
                            <div
                              key={prov.id}
                              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/20 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Icon icon={badge.icon} className="size-4.5 shrink-0" />
                                <span className="font-bold text-foreground">{badge.label}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[130px]" title={prov.accountId}>
                                ID: {prov.accountId}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-background/50 flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-foreground pb-2 border-b border-border/40">Phiên đăng nhập đang hoạt động ({sessions.length})</h4>

                    {sessions.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">Không có phiên đăng nhập hoạt động nào.</p>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                        {sessions.map((sess: any) => {
                          const isDesktop = sess.userAgent && (sess.userAgent.includes("Windows") || sess.userAgent.includes("Macintosh") || sess.userAgent.includes("Linux"));
                          const icon = isDesktop ? "solar:laptop-line-duotone" : "solar:smartphone-line-duotone";

                          return (
                            <div
                              key={sess.id}
                              className="p-3 rounded-lg border border-border bg-card/20 flex flex-col gap-2 relative group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Icon icon={icon} className="size-4 text-muted-foreground shrink-0" />
                                  <span className="font-bold text-foreground text-[11px] truncate max-w-[200px]">
                                    {sess.ipAddress || "Không rõ IP"}
                                  </span>
                                </div>
                                
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-6 px-1.5 text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer shrink-0"
                                  disabled={revokeSessionMutation.isPending}
                                  onClick={() => revokeSessionMutation.mutate({ sessionId: sess.id, userId: initialId })}
                                >
                                  Thu hồi
                                </Button>
                              </div>

                              <div className="text-[10px] text-muted-foreground font-medium truncate" title={sess.userAgent}>
                                {sess.userAgent || "Không xác định thiết bị"}
                              </div>

                              <div className="text-[9px] text-muted-foreground/80 flex items-center justify-between border-t border-border/30 pt-1.5 mt-0.5">
                                <span>Bắt đầu: {formatDateTime(sess.createdAt)}</span>
                                <span>Hết hạn: {formatDateTime(sess.expiresAt)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
