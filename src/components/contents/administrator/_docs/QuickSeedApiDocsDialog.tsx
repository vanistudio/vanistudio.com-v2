"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_API_DOCS, type DefaultApiProduct } from "@/defaults/api-docs.default";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface QuickSeedApiDocsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function SortableItem({
  tempId,
  name,
  slug,
  thumbnail,
  groupsCount,
  endpointsCount,
  indexNo,
}: {
  tempId: string;
  name: string;
  slug: string;
  thumbnail: string;
  groupsCount: number;
  endpointsCount: number;
  indexNo: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tempId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    zIndex: isDragging ? 50 : 1,
    position: "relative" as any,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-3 rounded-xl border bg-card text-card-foreground shadow-sm transition-colors gap-3 select-none",
        isDragging && "opacity-85 scale-[1.02] border-vanixjnk/40 shadow-md bg-vanixjnk/10"
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground">
          <Icon icon="solar:hamburger-menu-line-duotone" className="size-5" />
        </div>
        <Badge variant="outline" className="bg-muted text-muted-foreground font-mono font-bold shrink-0">
          #{indexNo + 1}
        </Badge>
        <div className="size-11 rounded-lg border border-border bg-muted/40 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
          {thumbnail ? (
            <img src={thumbnail} alt={name} className="size-full object-cover" />
          ) : (
            <Icon icon="solar:programming-line-duotone" className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-bold text-foreground truncate">{name}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-muted-foreground truncate">/{slug}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0 gap-1">
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 font-bold uppercase bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20">
          {groupsCount} Nhóm
        </Badge>
        <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 font-bold border-border/80 bg-background/50">
          {endpointsCount} API
        </Badge>
      </div>
    </div>
  );
}

export function QuickSeedApiDocsDialog({
  open,
  onOpenChange,
  onSuccess,
}: QuickSeedApiDocsDialogProps) {
  const [items, setItems] = useState<(DefaultApiProduct & { tempId: string })[]>([]);
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!open) {
      setItems([]);
      return;
    }
    const initial = DEFAULT_API_DOCS.map((prod, index) => ({
      ...prod,
      tempId: `default-${index}`,
    }));
    setItems(initial);
  }, [open]);

  const seedMutation = trpc.administrator.apiDocs.seedApiDocs.useMutation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Remove the tempId property when sending payload
    const payload = items.map((item) => {
      const { tempId, ...rest } = item;
      return rest;
    });

    try {
      const res = await seedMutation.mutateAsync(payload);
      toast.success(res.message || "Đổ dữ liệu mẫu API thành công!");
      utils.administrator.apiDocs.getApiProducts.invalidate();
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Lỗi khi đổ dữ liệu mẫu: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const sensors = useMemo(() => [pointerSensor, keyboardSensor], [pointerSensor, keyboardSensor]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.tempId === active.id);
    const newIndex = items.findIndex((item) => item.tempId === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  const tempIds = useMemo(() => items.map((item) => item.tempId), [items]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="size-8 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center">
              <Icon icon="solar:database-line-duotone" className="size-5" />
            </div>
            Đổ dữ liệu mẫu API Docs
          </DialogTitle>
          <DialogDescription className="text-left mt-1 text-[13px]">
            Sắp xếp vị trí/thứ tự hiển thị của các sản phẩm/loại API mẫu trước khi đổ vào hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4 px-1">
          <div className="overflow-y-auto min-h-[150px] max-h-[45vh] custom-scrollbar pr-1 flex flex-col gap-2">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <Icon icon="solar:gallery-minimalistic-line-duotone" className="size-10 opacity-30 mb-2" />
                <span className="text-[13px]">Không tìm thấy dữ liệu mẫu.</span>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={tempIds} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2">
                    {items.map((item, idx) => {
                      const groupsCount = item.groups.length;
                      const endpointsCount = item.groups.reduce((acc, g) => acc + g.endpoints.length, 0);
                      return (
                        <SortableItem
                          key={item.tempId}
                          tempId={item.tempId}
                          name={item.name}
                          slug={item.slug}
                          thumbnail={item.thumbnail}
                          groupsCount={groupsCount}
                          endpointsCount={endpointsCount}
                          indexNo={idx}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <div className="flex items-center gap-2 w-full mt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Hủy bỏ
            </Button>
            <Button
              variant="vanixjnk"
              className="flex-1 font-bold"
              disabled={items.length === 0 || isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <>
                  <Icon icon="solar:restart-line-duotone" className="size-4 animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Icon icon="solar:check-circle-line-duotone" className="size-4 mr-2" />
                  Xác nhận đổ dữ liệu
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
