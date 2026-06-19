"use client";

import React, { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { type GalleryItem } from "@/server/db/schemas/gallery.schema";
import Link from "next/link";
import { http } from "@/lib/http";
import { useSetting } from "@/contexts/SettingContext";
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";

const FILTER_TABS = [
  { id: "all", title: "Tất cả", icon: "solar:gallery-line-duotone" },
  { id: "image", title: "Hình ảnh", icon: "solar:gallery-wide-line-duotone" },
  { id: "video", title: "Video", icon: "solar:videocamera-record-line-duotone" },
  { id: "document", title: "Tài liệu", icon: "solar:document-text-line-duotone" },
  { id: "other", title: "Khác", icon: "solar:file-line-duotone" },
];

export default function AdminMedia() {
  const setting = useSetting();
  const siteTimezone = setting?.siteTimezone || "Asia/Ho_Chi_Minh";

  const { data: items, isLoading, refetch, isFetching } = trpc.administrator.gallery.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { data: extensions } = trpc.administrator.extensions.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const storageExt = extensions?.find((e) => e.id === "storage_config");
  const activeStorage = (storageExt?.config as any)?.siteActiveStorage || "local";

  const totalFiles = items?.length || 0;
  const totalSize = items?.reduce((sum, item) => sum + (item.size || 0), 0) || 0;
  const imageCount = items?.filter((item) => item.mediaType?.startsWith("image/")).length || 0;
  const otherCount = totalFiles - imageCount;

  const getStorageDetails = (type: string) => {
    switch (type.toLowerCase()) {
      case "cloudinary":
        return {
          label: "Cloudinary",
          icon: "logos:cloudinary-icon",
          className: "bg-[#3448C5]/10 text-[#3448C5] border-[#3448C5]/30 hover:bg-[#3448C5]/20",
        };
      case "r2":
        return {
          label: "Cloudflare R2",
          icon: "logos:cloudflare-icon",
          className: "bg-[#f38020]/10 text-[#f38020] border-[#f38020]/30 hover:bg-[#f38020]/20",
        };
      case "tigris":
        return {
          label: "Tigris Storage",
          icon: "solar:box-minimalistic-line-duotone",
          className: "bg-[#FF7034]/10 text-[#FF7034] border-[#FF7034]/30 hover:bg-[#FF7034]/20",
        };
      case "local":
      default:
        return {
          label: "Cục bộ (Local)",
          icon: "solar:server-minimalistic-line-duotone",
          className: "bg-vanixjnk/15 text-vanixjnk border-vanixjnk/25 hover:bg-vanixjnk/25",
        };
    }
  };

  const deleteMutation = trpc.administrator.gallery.delete.useMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const getFileIcon = (mediaType: string) => {
    if (mediaType.startsWith("image/")) return "solar:gallery-wide-line-duotone";
    if (mediaType.startsWith("video/")) return "solar:videocamera-record-line-duotone";
    if (mediaType.startsWith("audio/")) return "solar:music-library-2-line-duotone";
    if (mediaType.includes("pdf")) return "solar:document-text-line-duotone";
    if (mediaType.includes("zip") || mediaType.includes("rar") || mediaType.includes("tar")) return "solar:archive-line-duotone";
    return "solar:file-line-duotone";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFiles(e.target.files);
    }
  };

  const uploadFiles = async (files: FileList) => {
    setIsUploading(true);

    const uploadPromise = new Promise(async (resolve, reject) => {
      let successCount = 0;
      let failCount = 0;
      let lastError = "";

      const uploadTasks = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
          await http.post("/api/upload", formData);
          successCount++;
        } catch (err: any) {
          failCount++;
          lastError = err.data?.error || err.message || "Lỗi không xác định";
        }
      });

      await Promise.all(uploadTasks);

      if (successCount > 0) {
        refetch();
      }

      if (failCount > 0) {
        if (successCount > 0) {
          reject(new Error(`Đã tải lên ${successCount} tập tin, thất bại ${failCount} tập tin`));
        } else {
          reject(new Error(`Tải lên thất bại: ${lastError}`));
        }
      } else {
        resolve(files.length > 1 ? `Đã tải lên thành công ${files.length} tập tin` : "Đã tải lên tập tin thành công");
      }
    });

    toast.promise(uploadPromise, {
      loading: files.length > 1 ? `Đang tải ${files.length} tập tin lên...` : "Đang tải tập tin lên...",
      success: (msg: any) => msg,
      error: (err: any) => err.message || "Tải lên thất bại",
    });

    try {
      await uploadPromise;
    } catch {
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCopyLink = (url: string) => {
    const fullUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Đã sao chép đường dẫn tập tin!");
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation.mutateAsync({ id: itemToDelete.id });
      toast.success("Xóa tập tin thành công!");
      setItemToDelete(null);
      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null);
      }
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Xóa tập tin thất bại");
    }
  };
  const filteredItems = (items || []).filter((item) => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "all") return true;
    if (activeTab === "image") return item.mediaType.startsWith("image/");
    if (activeTab === "video") return item.mediaType.startsWith("video/");
    if (activeTab === "document") return item.mediaType.includes("pdf") || item.mediaType.includes("document") || item.mediaType.includes("text/");
    if (activeTab === "other") {
      return !item.mediaType.startsWith("image/") &&
        !item.mediaType.startsWith("video/") &&
        !item.mediaType.includes("pdf") &&
        !item.mediaType.includes("document") &&
        !item.mediaType.includes("text/");
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:gallery-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Thư viện ảnh & Media</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý hình ảnh và các tệp tin phương tiện dùng trên toàn hệ thống.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeStorage && (() => {
                const details = getStorageDetails(activeStorage);
                return (
                  <Link href="/adminPanel/extensions?tab=storage_config">
                    <Button
                      variant="outline"
                      size="sm"
                      title="Nhấp để cấu hình lưu trữ"
                      className="gap-1.5 shrink-0 font-semibold"
                    >
                      <Icon icon={details.icon} className="size-4 shrink-0" />
                      <span>{details.label}</span>
                    </Button>
                  </Link>
                );
              })()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading || isFetching}
                className="gap-1.5 shrink-0"
              >
                <Icon
                  icon="solar:restart-line-duotone"
                  className={isLoading || isFetching ? "animate-spin" : ""}
                />
                <span>Làm mới</span>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
                accept="image/*,video/*,application/pdf"
              />
              <Button
                variant="vanixjnk"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-1.5 shrink-0 font-semibold"
              >
                {isUploading ? (
                  <Icon icon="solar:restart-line-duotone" className="animate-spin text-base" />
                ) : (
                  <Icon icon="solar:upload-line-duotone" className="text-base" />
                )}
                <span>Tải tệp lên</span>
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
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-b border-border/60 flex-1">
            <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-border/60 flex flex-col gap-4">
              <div className="pb-3">
                <h3 className="text-base font-bold text-foreground">Thống kê Thư viện</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tổng quan dung lượng và số lượng tệp tin hiện tại.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-lg border bg-background/60 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng số tệp tin</p>
                    <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        totalFiles
                      )}
                    </h3>
                  </div>
                  <div className="size-10 rounded-lg text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                    <Icon icon="solar:folder-with-files-line-duotone" className="text-xl" />
                  </div>
                </div>
                <div className="p-4 rounded-lg border bg-background/60 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng dung lượng</p>
                    <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                      {isLoading ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        formatBytes(totalSize)
                      )}
                    </h3>
                  </div>
                  <div className="size-10 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                    <Icon icon="solar:database-line-duotone" className="text-xl" />
                  </div>
                </div>
                <div className="p-4 rounded-lg border bg-background/60 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Phân loại tệp tin</p>
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mt-1.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-vanixjnk shrink-0" />
                          <span>Hình ảnh:</span>
                        </div>
                        <span className="font-semibold text-foreground">{imageCount} tệp</span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>Tệp khác:</span>
                        </div>
                        <span className="font-semibold text-foreground">{otherCount} tệp</span>
                      </div>
                    </div>
                  </div>
                  <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                    <Icon icon="solar:gallery-wide-line-duotone" className="text-xl" />
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 p-6 flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/60">
                <div className="flex flex-wrap gap-1.5">
                  {FILTER_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer",
                        activeTab === tab.id
                          ? "bg-vanixjnk/15 border-vanixjnk/25 text-vanixjnk shadow-sm"
                          : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <Icon icon={tab.icon} className="size-4" />
                      <span>{tab.title}</span>
                    </button>
                  ))}
                </div>
                <div className="relative w-full lg:w-72">
                  <Icon
                    icon="solar:magnifer-line-duotone"
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    type="text"
                    placeholder="Tìm tên tệp hoặc đường dẫn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "relative flex-1 rounded-2xl border-2 border-dashed border-transparent transition-all duration-300 flex flex-col min-h-[450px]",
                  dragActive && "border-vanixjnk bg-vanixjnk/5 scale-[0.995]"
                )}
              >
                {dragActive && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-50 pointer-events-none">
                    <div className="size-16 rounded-full bg-vanixjnk/15 flex items-center justify-center text-vanixjnk mb-4 animate-bounce">
                      <Icon icon="solar:upload-track-line-duotone" className="size-8" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Thả file vào đây</h3>
                    <p className="text-sm text-muted-foreground mt-1">Để tải nhanh lên thư viện ảnh hệ thống</p>
                  </div>
                )}
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 flex-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border/60">
                        <Skeleton className="size-full" />
                      </div>
                    ))}
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                    <div className="size-20 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground mb-4 border border-border/40">
                      <Icon icon="solar:gallery-wide-line-duotone" className="size-9" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">Không tìm thấy tập tin nào</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">
                      {searchQuery || activeTab !== "all"
                        ? "Hãy thử tìm kiếm từ khóa khác hoặc chuyển bộ lọc."
                        : "Kéo thả hình ảnh vào đây hoặc nhấp vào nút tải tệp để bắt đầu."}
                    </p>
                    {!searchQuery && activeTab === "all" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 gap-1.5"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Icon icon="solar:upload-line-duotone" />
                        <span>Chọn tệp ngay</span>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredItems.map((item) => {
                      const isImg = item.mediaType.startsWith("image/");
                      return (
                        <div
                          key={item.id}
                          className="group relative aspect-square rounded-xl border border-border/60 bg-background/50 overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                          {isImg ? (
                            <img
                              src={item.url}
                              alt={item.fileName}
                              className="size-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="size-full flex flex-col items-center justify-center p-4">
                              <div className="size-12 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground mb-2">
                                <Icon icon={getFileIcon(item.mediaType)} className="size-6" />
                              </div>
                              <span className="text-[10px] font-bold text-foreground text-center line-clamp-2 px-1 break-all">
                                {item.fileName}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end pointer-events-none z-10">
                            <span className="text-[10px] font-bold text-white truncate">{item.fileName}</span>
                            <span className="text-[9px] text-white/70 mt-0.5">{formatBytes(item.size)}</span>
                          </div>
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                              }}
                              title="Chi tiết"
                              className="size-7 rounded-lg bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
                            >
                              <Icon icon="solar:info-square-line-duotone" className="size-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyLink(item.url);
                              }}
                              title="Sao chép link"
                              className="size-7 rounded-lg bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
                            >
                              <Icon icon="solar:link-round-line-duotone" className="size-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemToDelete(item);
                              }}
                              title="Xóa"
                              className="size-7 rounded-lg bg-red-950/70 hover:bg-red-650/90 text-red-200 flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer border border-red-900/30"
                            >
                              <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="sm:max-w-[550px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6">
            <div className="size-10 rounded-xl bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0 mb-2">
              <Icon icon="solar:info-square-line-duotone" className="size-6" />
            </div>
            <SheetTitle className="text-xl font-bold">
              Thông tin tập tin
            </SheetTitle>
            <SheetDescription>Chi tiết thông số tệp tin phương tiện trên hệ thống</SheetDescription>
          </SheetHeader>

          {selectedItem && (
            <>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-background">
                <div className="aspect-video w-full rounded-xl border border-border/60 bg-muted/40 overflow-hidden flex items-center justify-center">
                  {selectedItem.mediaType.startsWith("image/") ? (
                    <img
                      src={selectedItem.url}
                      alt={selectedItem.fileName}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Icon icon={getFileIcon(selectedItem.mediaType)} className="size-16 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-4 text-sm">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tên tập tin</label>
                    <p className="font-semibold text-foreground break-all mt-0.5">{selectedItem.fileName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Kích thước</label>
                    <p className="font-semibold text-foreground mt-0.5">{formatBytes(selectedItem.size)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Định dạng (Type)</label>
                    <p className="font-semibold text-foreground mt-0.5">{selectedItem.mediaType}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lưu trữ (Storage)</label>
                    <p className="font-semibold text-foreground capitalize mt-0.5">{selectedItem.storageType}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Đường dẫn liên kết</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        readOnly
                        value={selectedItem.url.startsWith("http://") || selectedItem.url.startsWith("https://") ? selectedItem.url : `${window.location.origin}${selectedItem.url}`}
                        className="h-8 text-xs font-mono read-only:bg-muted/40 flex-1 pr-2 select-all"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 shrink-0"
                        onClick={() => handleCopyLink(selectedItem.url)}
                      >
                        <Icon icon="solar:copy-line-duotone" className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ngày tải lên</label>
                    <p className="font-semibold text-foreground mt-0.5">
                      {formatWithSiteTimezone(selectedItem.createdAt, siteTimezone)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 flex gap-2.5">
                <Button
                  className="flex-1 text-sm"
                  variant="outline"
                  onClick={() => window.open(selectedItem.url, "_blank")}
                >
                  <Icon icon="solar:arrow-to-down-left-line-duotone" className="mr-1.5 size-4" />
                  Mở tab mới
                </Button>
                <Button
                  className="text-sm"
                  variant="danger"
                  onClick={() => {
                    setSelectedItem(null);
                    setItemToDelete(selectedItem);
                  }}
                >
                  <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-1.5 size-4" />
                  Xóa tập tin
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-500 flex items-center gap-2">
              <Icon icon="solar:danger-line-duotone" className="size-5" />
              <span>Xác nhận xóa tập tin?</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tập tin <span className="font-bold text-foreground break-all">"{itemToDelete?.fileName}"</span>? Hành động này không thể hoàn tác và các liên kết trỏ tới tệp tin này sẽ bị lỗi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm" disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="danger"
              size="sm"
              onClick={handleDeleteItem}
              disabled={deleteMutation.isPending}
              className="gap-1.5 font-bold"
            >
              {deleteMutation.isPending ? (
                <Icon icon="solar:restart-line-duotone" className="animate-spin" />
              ) : (
                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
              )}
              <span>Đồng ý xóa</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}