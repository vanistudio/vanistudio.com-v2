"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Service, ServiceType } from "@/server/db/schemas/service.schema";

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

interface QuickReorderServicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ServiceWithTypeName = Service & { serviceType: ServiceType | null };

function SortableItem({
  id,
  name,
  sortOrder,
  indexNo,
  thumbnail,
  typeName,
  typeColor,
  typeBg,
  typeBorder,
}: {
  id: string;
  name: string;
  sortOrder: number;
  indexNo: number;
  thumbnail?: string | null;
  typeName?: string | null;
  typeColor?: string | null;
  typeBg?: string | null;
  typeBorder?: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `item-${id}`,
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
        <div className="size-8 rounded-lg border border-border bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
          {thumbnail ? (
            <img src={thumbnail} alt={name} className="size-full object-cover" />
          ) : (
            <Icon icon="solar:code-line-duotone" className="size-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col min-w-0 text-left">
          <span className="text-[13px] font-bold text-foreground truncate">{name}</span>
          {typeName && (
            <div className="mt-0.5">
              <Badge className={cn("font-semibold text-[9px] py-0.5 capitalize border shadow-none", typeColor, typeBg, typeBorder)}>
                {typeName}
              </Badge>
            </div>
          )}
        </div>
      </div>
      <Badge variant="secondary" className="text-[10px] opacity-75 shrink-0">
        STT: {sortOrder}
      </Badge>
    </div>
  );
}

export function QuickReorderServicesDialog({
  open,
  onOpenChange,
  onSuccess,
}: QuickReorderServicesDialogProps) {
  const [items, setItems] = useState<ServiceWithTypeName[]>([]);
  const utils = trpc.useUtils();
  const servicesQuery = trpc.administrator.services.getAll.useQuery(
    undefined,
    { enabled: open }
  );

  const isLoading = servicesQuery.isLoading;

  useEffect(() => {
    if (!open) {
      setItems([]);
      return;
    }
    if (servicesQuery.data) {
      setItems(
        servicesQuery.data
          .slice()
          .sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0))
      );
    } else {
      setItems([]);
    }
  }, [open, servicesQuery.data]);

  const reorderMutation = trpc.administrator.services.reorderServices.useMutation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const payload = items.map((item, idx) => ({
      id: item.id,
      order: idx + 1,
    }));
    try {
      await reorderMutation.mutateAsync(payload);
      toast.success("Đã cập nhật thứ tự hiển thị dịch vụ!");
      utils.administrator.services.getAll.invalidate();
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Lỗi khi lưu thứ tự: " + err.message);
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

    const oldIndex = items.findIndex((item) => `item-${item.id}` === active.id);
    const newIndex = items.findIndex((item) => `item-${item.id}` === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  const itemIds = useMemo(() => items.map((item) => `item-${item.id}`), [items]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="size-8 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center">
              <Icon icon="solar:sort-by-time-line-duotone" className="size-5" />
            </div>
            Sắp xếp thứ tự dịch vụ
          </DialogTitle>
          <DialogDescription className="text-left mt-1 text-[13px]">
            Kéo thả để sắp xếp thứ tự hiển thị của các Dịch vụ trên trang công khai.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4 px-1">
          <div className="overflow-y-auto min-h-[150px] max-h-[45vh] custom-scrollbar pr-1 flex flex-col gap-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                <Icon icon="solar:restart-line-duotone" className="size-8 animate-spin text-vanixjnk" />
                <span className="text-[13px] font-medium">Đang tải dữ liệu...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <Icon icon="solar:gallery-minimalistic-line-duotone" className="size-10 opacity-30 mb-2" />
                <span className="text-[13px]">Chưa có dịch vụ nào.</span>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2">
                    {items.map((item, idx) => (
                      <SortableItem
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        sortOrder={item.order}
                        indexNo={idx}
                        thumbnail={item.thumbnail}
                        typeName={item.serviceType?.name}
                        typeColor={item.serviceType?.color}
                        typeBg={item.serviceType?.bg}
                        typeBorder={item.serviceType?.border}
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
              disabled={isLoading || items.length === 0 || isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <>
                  <Icon icon="solar:restart-line-duotone" className="size-4 animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Icon icon="solar:check-circle-line-duotone" className="size-4 mr-2" />
                  Lưu thứ tự mới
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
