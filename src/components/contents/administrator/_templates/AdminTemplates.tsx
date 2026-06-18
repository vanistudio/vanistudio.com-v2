"use client";

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { TemplateChannelTab } from "./TemplateChannelTab";
import { type NotificationTemplate } from "@/server/db/schemas/template.schema";

const TABS = [
  {
    id: "email",
    title: "Email Template",
    icon: "arcticons:mail",
    desc: "Cấu hình tiêu đề, nội dung và người gửi cho các thông báo Email.",
  },
  {
    id: "telegram",
    title: "Telegram Template",
    icon: "arcticons:telegram",
    desc: "Thiết lập tin nhắn đẩy qua Telegram Bot sử dụng định dạng HTML/Markdown.",
  },
  {
    id: "slack",
    title: "Slack Template",
    icon: "arcticons:slack",
    desc: "Tùy chỉnh nội dung thông báo và khối Block Kit đẩy lên các kênh Slack.",
  },
  {
    id: "discord",
    title: "Discord Template",
    icon: "arcticons:discord",
    desc: "Định dạng các bản tin Rich Embed và cảnh báo bảo mật đẩy lên Discord.",
  },
];

export default function AdminTemplates() {
  const { data: dbTemplates, isLoading, refetch, isFetching, error } = trpc.administrator.templates.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const updateMutation = trpc.administrator.templates.update.useMutation();
  const resetAllMutation = trpc.administrator.templates.resetAllToDefault.useMutation();
  const [activeTab, setActiveTab] = useState("email");
  const [templatesList, setTemplatesList] = useState<NotificationTemplate[]>([]);
  const [modifiedIds, setModifiedIds] = useState<Set<string>>(new Set());
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useEffect(() => {
    if (dbTemplates) {
      setTemplatesList(dbTemplates);
    }
  }, [dbTemplates]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Không thể tải cấu hình mẫu thông báo");
    }
  }, [error]);

  const handleReset = async () => {
    try {
      await refetch();
      setModifiedIds(new Set());
      toast.success("Đã làm mới dữ liệu cấu hình");
    } catch {
      toast.error("Có lỗi xảy ra khi làm mới cấu hình");
    }
  };

  const handleResetAllToDefault = async () => {
    try {
      await resetAllMutation.mutateAsync();
      toast.success("Khôi phục toàn bộ mẫu thông báo về mặc định thành công!");
      await refetch();
      setModifiedIds(new Set());
      setResetConfirmOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Không thể khôi phục cấu hình mặc định");
    }
  };

  const handleSave = async () => {
    if (modifiedIds.size === 0) {
      toast.info("Không có thay đổi nào để lưu");
      return;
    }

    try {
      const promises = Array.from(modifiedIds).map((id) => {
        const t = templatesList.find((item) => item.id === id);
        if (!t) return Promise.resolve();
        return updateMutation.mutateAsync({
          id: t.id,
          subject: t.subject,
          content: t.content,
          isActive: t.isActive,
          extraConfig: t.extraConfig as any,
        });
      });

      await Promise.all(promises);
      toast.success("Lưu cấu hình mẫu thông báo thành công");
      setModifiedIds(new Set());
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu cấu hình");
    }
  };

  const handleTemplateChange = (id: string, updates: Partial<NotificationTemplate>) => {
    setTemplatesList((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const mergedExtra = updates.extraConfig
            ? { ...t.extraConfig, ...updates.extraConfig }
            : t.extraConfig;
          return {
            ...t,
            ...updates,
            extraConfig: mergedExtra,
          };
        }
        return t;
      })
    );
    setModifiedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab);
  const activeChannelTemplates = templatesList.filter((t) => t.channel === activeTab);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:letter-opened-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Cấu hình Mẫu Thông báo</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý nội dung, từ khóa và kênh thông báo của hệ thống.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetConfirmOpen(true)}
                disabled={isLoading || isFetching || resetAllMutation.isPending}
                className="gap-1.5 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50/10 border-red-500/20"
              >
                {resetAllMutation.isPending ? (
                  <Icon icon="solar:restart-line-duotone" className="animate-spin text-base" />
                ) : (
                  <Icon icon="solar:shield-warning-line-duotone" className="text-base" />
                )}
                <span>Khôi phục mặc định</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset()}
                disabled={isLoading || isFetching || updateMutation.isPending}
                className="gap-1.5 shrink-0"
              >
                <Icon
                  icon="solar:restart-line-duotone"
                  className={isLoading || isFetching ? "animate-spin" : ""}
                />
                <span>Làm mới</span>
              </Button>
              <Button
                variant="vanixjnk"
                size="sm"
                onClick={() => handleSave()}
                disabled={isLoading || updateMutation.isPending || modifiedIds.size === 0}
                className="gap-1.5 shrink-0 font-semibold"
              >
                {updateMutation.isPending ? (
                  <Icon icon="solar:restart-line-duotone" className="animate-spin text-base" />
                ) : (
                  <Icon icon="solar:diskette-line-duotone" className="text-base" />
                )}
                <span>Lưu cấu hình</span>
              </Button>
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
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)",
          }}
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-b border-border/60 flex-1">
              <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-border/60 flex flex-col gap-4">
                <div className="pb-3">
                  <Skeleton className="h-5 w-36 rounded" />
                  <Skeleton className="h-3.5 w-48 rounded mt-1.5" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
              <div className="lg:col-span-8 p-6 flex flex-col gap-4">
                <div className="pb-3">
                  <Skeleton className="h-5 w-44 rounded" />
                  <Skeleton className="h-3.5 w-64 rounded mt-1.5" />
                </div>
                <div className="space-y-6 mt-4">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-b border-border/60 flex-1">
              <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-border/60 flex flex-col gap-4">
                <div className="pb-3">
                  <h3 className="text-base font-bold text-foreground">Kênh thông báo</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Chọn kênh để điều chỉnh các mẫu tin nhắn.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-vanixjnk/15 border-vanixjnk/25 text-vanixjnk shadow-sm"
                          : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      }`}
                    >
                      <Icon
                        icon={tab.icon}
                        className={`size-5 ${
                          activeTab === tab.id ? "text-vanixjnk" : "text-muted-foreground"
                        }`}
                      />
                      <span className="text-[13px] font-bold">{tab.title}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-8 p-6">
                <div className="mb-6 pb-4 border-b border-border/60">
                  <h3 className="text-base font-bold text-foreground">{activeTabMeta?.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{activeTabMeta?.desc}</p>
                </div>

                <TemplateChannelTab
                  channel={activeTab}
                  templates={activeChannelTemplates}
                  onTemplateChange={handleTemplateChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              <span>Xác nhận khôi phục mặc định</span>
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">Xác nhận khôi phục toàn bộ mẫu thông báo về cấu hình mặc định ban đầu</DialogDescription>
          <div className="py-2 text-sm text-muted-foreground">
            Bạn có chắc chắn muốn khôi phục <strong className="text-foreground font-semibold">toàn bộ mẫu thông báo</strong> về cấu hình mặc định ban đầu không? Mọi tùy chỉnh hiện tại của bạn sẽ bị xóa và ghi đè hoàn toàn. Hành động này không thể hoàn tác.
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleResetAllToDefault}
              disabled={resetAllMutation.isPending}
            >
              {resetAllMutation.isPending && (
                <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
              )}
              Xác nhận khôi phục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
