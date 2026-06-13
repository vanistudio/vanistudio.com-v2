"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_SERVICE_TYPES, type DefaultServiceType } from "@/defaults/service-type.default";

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

interface QuickSeedServiceTypesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function SortableItem({
  tempId,
  name,
  sortOrder,
  indexNo,
  icon,
  color,
  bg,
  border,
}: {
  tempId: string;
  name: string;
  sortOrder: number;
  indexNo: number;
  icon?: string;
  color?: string;
  bg?: string;
  border?: string;
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
        <div className={cn("size-6 rounded flex items-center justify-center shrink-0 border bg-background", bg, border)}>
          <Icon icon={icon || "solar:widget-line-duotone"} className={cn("size-4", color || "text-vanixjnk")} />
        </div>
        <span className="text-[13px] font-bold text-foreground break-words whitespace-normal leading-snug">{name}</span>
      </div>
      <Badge variant="secondary" className="text-[10px] opacity-75 shrink-0">
        STT: {sortOrder}
      </Badge>
    </div>
  );
}

export function QuickSeedServiceTypesDialog({
  open,
  onOpenChange,
  onSuccess,
}: QuickSeedServiceTypesDialogProps) {
  const [items, setItems] = useState<(DefaultServiceType & { tempId: string })[]>([]);
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!open) {
      setItems([]);
      return;
    }
    const initial = DEFAULT_SERVICE_TYPES.map((type, index) => ({
      ...type,
      tempId: `default-${index}`,
    })).sort((a, b) => a.order - b.order);
    setItems(initial);
  }, [open]);

  const seedMutation = trpc.administrator.services.seedTypes.useMutation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const payload = items.map((item, idx) => ({
      name: item.name,
      icon: item.icon,
      description: item.description,
      color: item.color,
      bg: item.bg,
      border: item.border,
      order: idx + 1,
    }));
    try {
      const res = await seedMutation.mutateAsync(payload);
      toast.success(res.message || "Đổ dữ liệu mẫu thành công!");
      utils.administrator.services.getTypes.invalidate();
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
      <DialogContent className="sm:max-w-[550px] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="size-8 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center">
              <Icon icon="solar:database-line-duotone" className="size-5" />
            </div>
            Đổ dữ liệu mẫu phân loại
          </DialogTitle>
          <DialogDescription className="text-left mt-1 text-[13px]">
            Sắp xếp vị trí của các phân loại mẫu trước khi gieo vào hệ thống.
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
                    {items.map((item, idx) => (
                      <SortableItem
                        key={item.tempId}
                        tempId={item.tempId}
                        name={item.name}
                        sortOrder={item.order}
                        indexNo={idx}
                        icon={item.icon || undefined}
                        color={item.color || undefined}
                        bg={item.bg || undefined}
                        border={item.border || undefined}
                      />
                    ))}
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
              className="flex-1"
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
