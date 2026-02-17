import { useState, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface FileUploadDialogProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
}

export default function FileUploadDialog({
  value,
  onChange,
  label = "Chọn ảnh",
  accept = "image/*",
}: FileUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload/image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        onChange(data.url);
        toast.success("Upload thành công");
        setOpen(false);
        setPreview(null);
      } else {
        toast.error(data.error || "Upload thất bại");
        setPreview(null);
      }
    } catch {
      toast.error("Lỗi kết nối");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleRemove = () => {
    onChange("");
    setPreview(null);
  };

  return (
    <div className="space-y-1.5">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-2">
          <Input
            className="text-sm flex-1"
            placeholder="URL ảnh..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={false}
          />
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="text-xs gap-1.5 shrink-0">
              <Icon icon="solar:upload-bold-duotone" className="text-sm" />
              {label}
            </Button>
          </DialogTrigger>
          {value && (
            <Button type="button" variant="outline" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={handleRemove}>
              <Icon icon="solar:close-circle-bold-duotone" className="text-base" />
            </Button>
          )}
        </div>
        {value && (
          <div className="mt-2 rounded-lg border border-border overflow-hidden bg-muted/20 p-3 flex items-center gap-3">
            <img
              src={value}
              alt="Preview"
              className="h-16 w-auto max-w-[120px] rounded-md object-contain bg-background border border-border"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden"); }}
            />
            <div className="hidden w-16 h-16 rounded-md bg-muted flex items-center justify-center border border-border">
              <Icon icon="solar:gallery-broken" className="text-xl text-muted-foreground/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{value}</p>
            </div>
          </div>
        )}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Upload ảnh</DialogTitle>
          </DialogHeader>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40",
              uploading && "pointer-events-none opacity-60"
            )}
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Icon icon="solar:spinner-bold-duotone" className="text-3xl text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Đang upload...</p>
              </div>
            ) : preview ? (
              <div className="flex flex-col items-center gap-3">
                <img src={preview} alt="Preview" className="max-h-32 rounded-md object-contain" />
                <p className="text-xs text-muted-foreground">Đang xử lý...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon icon="solar:cloud-upload-bold-duotone" className="text-2xl text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Kéo thả ảnh vào đây</p>
                  <p className="text-xs text-muted-foreground mt-0.5">hoặc click để chọn file</p>
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  JPG, PNG, WebP, SVG, GIF, ICO • Tối đa 5MB
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
