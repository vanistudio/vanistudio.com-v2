"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useIsMobile } from "@/hooks/use-mobile";
import { trpc } from "@/lib/trpc";
import { http } from "@/lib/http";
import { toast } from "sonner";

interface GalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  onSelectMultiple?: (urls: string[]) => void;
  multiple?: boolean;
}

export function GalleryDialog({ open, onOpenChange, onSelect, onSelectMultiple, multiple = false }: GalleryDialogProps) {
  const isMobile = useIsMobile();
  const trpcUtils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState("gallery");
  const [page, setPage] = useState(1);
  const [selectedGalleryUrl, setSelectedGalleryUrl] = useState<string | null>(null);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: galleryData, isLoading } = trpc.administrator.gallery.getAll.useQuery(undefined, {
    enabled: open && activeTab === "gallery"
  });

  const [inputUrl, setInputUrl] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  React.useEffect(() => {
    if (open) {
      setSelectedGalleryUrl(null);
      setSelectedUrls([]);
      setInputUrl("");
      setUploadFile(null);
      setUploadPreview(null);
      setUploadFiles([]);
      setUploadPreviews([]);
      setSearchTerm("");
      setSearchQuery("");
      setPage(1);
    }
  }, [open]);

  const filteredImages = React.useMemo(() => {
    if (!galleryData) return [];
    return galleryData.filter((img) => {
      const matchSearch = 
        img.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.url.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [galleryData, searchQuery]);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage) || 1;
  
  const paginatedImages = React.useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredImages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredImages, page]);

  const images = paginatedImages;
  
  const pagination = React.useMemo(() => {
    return {
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }, [page, totalPages]);

  const handleUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (multiple) {
        const filesArray = Array.from(e.target.files);
        const validFiles: File[] = [];
        const previewPromises: Promise<string>[] = [];

        for (const file of filesArray) {
          validFiles.push(file);
          previewPromises.push(new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.readAsDataURL(file);
          }));
        }

        if (validFiles.length > 0) {
          const previews = await Promise.all(previewPromises);
          setUploadFiles(prev => [...prev, ...validFiles]);
          setUploadPreviews(prev => [...prev, ...previews]);
        }
      } else {
        const file = e.target.files[0];
        setUploadFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setUploadPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleConfirm = async () => {
    if (activeTab === "gallery") {
      if (multiple) {
        if (selectedUrls.length > 0) {
          if (onSelectMultiple) {
            onSelectMultiple(selectedUrls);
          } else {
            selectedUrls.forEach(url => onSelect(url));
          }
          onOpenChange(false);
        }
      } else if (selectedGalleryUrl) {
        onSelect(selectedGalleryUrl);
        onOpenChange(false);
      }
    } else if (activeTab === "url" && inputUrl) {
      if (multiple) {
        const urls = inputUrl.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
        if (urls.length > 0) {
          if (onSelectMultiple) {
            onSelectMultiple(urls);
          } else {
            urls.forEach(url => onSelect(url));
          }
          onOpenChange(false);
        }
      } else {
        onSelect(inputUrl);
        onOpenChange(false);
      }
    } else if (activeTab === "upload") {
      if (multiple) {
        if (uploadFiles.length > 0) {
          const loadingId = toast.loading(`Đang tải ${uploadFiles.length} ảnh lên...`);
          setIsUploading(true);
          try {
            const urls: string[] = [];
            for (const file of uploadFiles) {
              const formData = new FormData();
              formData.append("file", file);
              const res = await http.post<{ success: boolean; data: { url: string } }>("/api/upload", formData);
              if (res.success && res.data?.url) {
                urls.push(res.data.url);
              }
            }
            if (urls.length > 0) {
              toast.success(`Đã tải lên thành công ${urls.length} ảnh`, { id: loadingId });
              trpcUtils.administrator.gallery.getAll.invalidate();
              if (onSelectMultiple) {
                onSelectMultiple(urls);
              } else {
                urls.forEach(url => onSelect(url));
              }
              setUploadPreviews([]);
              setUploadFiles([]);
              onOpenChange(false);
            } else {
              toast.error("Không có ảnh nào tải lên thành công", { id: loadingId });
            }
          } catch (err: any) {
            toast.error("Upload thất bại: " + (err.data?.error || err.message), { id: loadingId });
          } finally {
            setIsUploading(false);
          }
        }
      } else if (uploadFile) {
        const loadingId = toast.loading("Đang tải ảnh lên...");
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append("file", uploadFile);
          const res = await http.post<{ success: boolean; data: { url: string } }>("/api/upload", formData);
          if (res.success && res.data?.url) {
            toast.success("Tải ảnh lên thành công", { id: loadingId });
            trpcUtils.administrator.gallery.getAll.invalidate();
            onSelect(res.data.url);
            setUploadPreview(null);
            setUploadFile(null);
            onOpenChange(false);
          } else {
            toast.error("Tải ảnh lên thất bại", { id: loadingId });
          }
        } catch (err: any) {
          toast.error("Upload thất bại: " + (err.data?.error || err.message), { id: loadingId });
        } finally {
          setIsUploading(false);
        }
      }
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-full p-0 flex flex-col gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Icon icon="solar:gallery-line-duotone" className="size-6 text-vanixjnk" />
            Chọn hình ảnh
          </DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-[65vh] min-h-[400px] max-h-[600px]">
          <div className="px-5 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gallery">Thư viện</TabsTrigger>
              <TabsTrigger value="url">Nhập URL</TabsTrigger>
              <TabsTrigger value="upload">Tải lên</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
            <TabsContent value="gallery" className="h-full m-0 flex flex-col gap-4">
              <div className="flex gap-2 w-full">
                <Input
                  placeholder="Tìm kiếm hình ảnh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchQuery(searchTerm);
                      setPage(1);
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  className="h-9"
                  onClick={() => {
                    setSearchQuery(searchTerm);
                    setPage(1);
                  }}
                >
                  <Icon icon="solar:magnifer-line-duotone" className="size-4" />
                </Button>
              </div>
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Icon icon="solar:restart-line-duotone" className="size-8 animate-spin text-vanixjnk" />
                </div>
              ) : images.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((img: any) => {
                      const isSelected = multiple ? selectedUrls.includes(img.url) : selectedGalleryUrl === img.url;
                      return (
                        <div
                          key={img.id}
                          className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 bg-muted/20 ${
                            isSelected 
                              ? "ring-2 ring-vanixjnk ring-offset-2 ring-offset-background border-transparent" 
                              : "border border-border hover:border-vanixjnk/50 hover:shadow-sm"
                          }`}
                          onClick={() => {
                            if (multiple) {
                              if (selectedUrls.includes(img.url)) {
                                setSelectedUrls(prev => prev.filter(url => url !== img.url));
                              } else {
                                setSelectedUrls(prev => [...prev, img.url]);
                              }
                            } else {
                              setSelectedGalleryUrl(img.url);
                            }
                          }}
                        >
                          <img 
                            src={img.url} 
                            alt={img.fileName} 
                            className={`w-full h-full object-cover transition-transform duration-500`} 
                          />
                          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSelected ? 'opacity-100 from-vanixjnk/20 via-vanixjnk/5 to-transparent' : ''}`} />
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="size-7 rounded-lg bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage(img.url);
                              }}
                            >
                              <Icon icon="solar:maximize-square-minimalistic-line-duotone" className="size-3.5" />
                            </Button>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 left-2 size-6 bg-vanixjnk rounded-full flex items-center justify-center text-white shadow-lg text-[10px] font-bold">
                              {multiple ? selectedUrls.indexOf(img.url) + 1 : <Icon icon="solar:check-read-line-duotone" className="size-3.5" />}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {pagination && pagination.totalPages > 1 && (
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                      <span className="text-xs text-muted-foreground font-medium">Trang {pagination.page} / {pagination.totalPages}</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 rounded-lg" 
                          disabled={pagination.page <= 1}
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                          Trước
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 rounded-lg"
                          disabled={pagination.page >= pagination.totalPages}
                          onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        >
                          Tiếp
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Icon icon="solar:gallery-remove-line-duotone" className="size-10 opacity-50" />
                  <p className="text-sm font-medium">Thư viện trống</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="url" className="h-full m-0 flex flex-col items-center justify-center gap-6">
              <div className="w-full max-w-xl space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-foreground">{multiple ? "Danh sách URL hình ảnh (cách nhau bằng dấu phẩy hoặc dòng mới)" : "Đường dẫn hình ảnh (URL)"}</label>
                  {multiple ? (
                    <textarea
                      placeholder="https://example.com/image1.png&#10;https://example.com/image2.png"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  ) : (
                    <Input 
                      placeholder="https://example.com/image.png" 
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                    />
                  )}
                </div>
                {inputUrl && !multiple && (
                  <div className="w-full aspect-video flex items-center justify-center p-2 overflow-hidden">
                    <img 
                      src={inputUrl} 
                      alt="Preview" 
                      className="max-w-full max-h-full object-contain rounded-lg shadow-sm" 
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      onLoad={(e) => (e.currentTarget.style.display = 'block')}
                    />
                  </div>
                )}
                {inputUrl && multiple && (
                  <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-1 border rounded-lg">
                    {inputUrl.split(/[\n,]+/).map(u => u.trim()).filter(Boolean).map((url, index) => (
                      <div key={index} className="relative size-12 border rounded-lg overflow-hidden shrink-0 bg-muted/20">
                        <img 
                          src={url} 
                          alt={`Preview ${index}`} 
                          className="w-full h-full object-cover" 
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                          onLoad={(e) => (e.currentTarget.style.display = 'block')}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="upload" className="h-full m-0 flex flex-col items-center justify-center">
              <div className="w-full max-w-xl">
                {multiple ? (
                  uploadPreviews.length > 0 ? (
                    <div className="flex flex-col gap-4 w-full">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                        {uploadPreviews.map((preview, idx) => (
                          <div key={idx} className="relative aspect-square border rounded-xl overflow-hidden group bg-muted/20">
                            <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setUploadPreviews(prev => prev.filter((_, i) => i !== idx));
                                setUploadFiles(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="absolute inset-0 bg-red-500/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Icon icon="solar:trash-bin-trash-bold" className="size-5" />
                            </button>
                            <div className="absolute top-1 left-1 size-5 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                              {idx + 1}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => document.getElementById('gallery-upload-input')?.click()}
                          className="aspect-square border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground hover:border-vanixjnk/50 hover:bg-muted/10 transition-colors"
                        >
                          <Icon icon="solar:add-circle-line-duotone" className="size-6 text-vanixjnk" />
                          <span className="text-[10px] font-semibold">Thêm tiếp</span>
                        </button>
                      </div>
                      <Button variant="outline" className="w-full text-xs font-semibold" onClick={() => { setUploadPreviews([]); setUploadFiles([]); }}>
                        <Icon icon="solar:gallery-remove-line-duotone" className="size-4 mr-2 text-muted-foreground" />
                        Xóa tất cả ảnh đã chọn
                      </Button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => document.getElementById('gallery-upload-input')?.click()}
                      className="w-full h-[240px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/40 transition-colors hover:border-vanixjnk/50 group"
                    >
                      <div className="size-14 rounded-full bg-vanixjnk/10 flex items-center justify-center text-vanixjnk transition-transform">
                        <Icon icon="solar:upload-minimalistic-line-duotone" className="size-7" />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-semibold text-foreground">Nhấn để chọn các tập tin</span>
                        <span className="text-[11px] font-medium text-muted-foreground">Hỗ trợ JPG, PNG, WEBP (Chọn nhiều ảnh)</span>
                      </div>
                    </div>
                  )
                ) : (
                  uploadPreview ? (
                    <div className="flex flex-col gap-4 items-center w-full">
                      <div className="w-full aspect-video flex items-center justify-center">
                        <img src={uploadPreview} alt="Preview" className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => document.getElementById('gallery-upload-input')?.click()}>
                        <Icon icon="solar:gallery-remove-line-duotone" className="size-5 mr-2 text-muted-foreground" />
                        Chọn ảnh khác
                      </Button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => document.getElementById('gallery-upload-input')?.click()}
                      className="w-full h-[240px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/40 transition-colors hover:border-vanixjnk/50 group"
                    >
                      <div className="size-14 rounded-full bg-vanixjnk/10 flex items-center justify-center text-vanixjnk transition-transform">
                        <Icon icon="solar:upload-minimalistic-line-duotone" className="size-7" />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-semibold text-foreground">Nhấn để tải lên tập tin</span>
                        <span className="text-[11px] font-medium text-muted-foreground">Hỗ trợ JPG, PNG, WEBP</span>
                      </div>
                    </div>
                  )
                )}
                <input 
                  id="gallery-upload-input"
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                  onChange={handleUploadChange}
                  multiple={multiple} 
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
        <div className="p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy bỏ
          </Button>
          <Button 
            variant="vanixjnk" 
            onClick={handleConfirm}
            disabled={
              (activeTab === "gallery" && (multiple ? selectedUrls.length === 0 : !selectedGalleryUrl)) ||
              (activeTab === "url" && !inputUrl) ||
              (activeTab === "upload" && (multiple ? uploadPreviews.length === 0 : !uploadPreview) || isUploading)
            }
          >
            {isUploading ? (
               <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
            ) : (
               <Icon icon="solar:check-circle-line-duotone" className="mr-1.5 size-4" />
            )}
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
      <DialogContent showCloseButton={false} className="max-w-[90vw] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
         <DialogTitle className="sr-only">Xem trước hình ảnh</DialogTitle>
         {previewImage && (
           <img 
             src={previewImage} 
             className="w-full h-auto max-h-[85vh] rounded-lg object-contain" 
             alt="Preview" 
           />
         )}
      </DialogContent>
    </Dialog>
    </>
  );
}
