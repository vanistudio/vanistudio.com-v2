import { useState, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface MultiFileUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  accept?: string;
}

export default function MultiFileUpload({
  value,
  onChange,
  accept = "image/*",
}: MultiFileUploadProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload/image", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          newUrls.push(data.url);
        } else {
          toast.error(`${file.name}: ${data.error || "Upload thất bại"}`);
        }
      }
      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
        toast.success(`Đã upload ${newUrls.length} ảnh`);
        setOpen(false);
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) uploadFiles(files);
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files?.length) uploadFiles(files);
  }, [value]);

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((url, i) => (
            <div key={i} className="relative group rounded-lg border border-border overflow-hidden bg-muted/20 aspect-video">
              <img src={url} alt={`Demo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 size-5 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon icon="solar:close-circle-bold" className="text-xs" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] text-white truncate">{url}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className="text-xs gap-1.5 w-full">
            <Icon icon="solar:gallery-add-bold-duotone" className="text-sm" />
            Thêm ảnh demo ({value.length} ảnh)
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Upload ảnh demo</DialogTitle>
          </DialogHeader>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40",
              uploading && "pointer-events-none opacity-60"
            )}
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
          >
            <input
              ref={fileRef}
              type="file"
              accept={accept}
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Icon icon="svg-spinners:ring-resize" className="text-3xl text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Đang upload...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon icon="solar:gallery-add-bold-duotone" className="text-2xl text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Kéo thả ảnh vào đây</p>
                  <p className="text-xs text-muted-foreground mt-0.5">hoặc click để chọn nhiều file</p>
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  JPG, PNG, WebP • Chọn được nhiều ảnh cùng lúc
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
