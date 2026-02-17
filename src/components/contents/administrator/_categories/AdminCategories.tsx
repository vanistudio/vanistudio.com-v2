import { useState, useEffect, useMemo } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminStats from "@/components/vani/AdminStats";
import { usePageTitle } from "@/hooks/use-page-title";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins}p trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

function SortableRow({
  cat, isDraggable, navigate, handleDelete,
}: {
  cat: Category;
  isDraggable: boolean;
  navigate: (path: string) => void;
  handleDelete: (id: string) => void;
}) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: cat.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group",
        isDragging && "z-50 relative bg-background shadow-lg rounded-md border border-border opacity-90"
      )}
    >
      {isDraggable && (
        <button
          {...attributes}
          {...listeners}
          className="flex items-center justify-center size-6 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
        >
          <Icon icon="solar:sort-vertical-bold-duotone" className="text-base" />
        </button>
      )}
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon icon={cat.icon || "solar:folder-bold-duotone"} className="text-lg text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{cat.name}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{cat.slug}</Badge>
          {!cat.isActive && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">Ẩn</Badge>
          )}
        </div>
        {cat.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[400px]">{cat.description}</p>
        )}
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-xs text-muted-foreground font-mono">#{cat.sortOrder}</span>
        <span className="text-[11px] text-muted-foreground/70 w-[70px]">{timeAgo(cat.createdAt)}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0">
            <Icon icon="solar:menu-dots-bold" className="text-base" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => navigate(`/admin/categories/${cat.id}/edit`)}>
            <Icon icon="solar:pen-bold-duotone" className="mr-2 text-base" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(cat.id)}>
            <Icon icon="solar:trash-bin-trash-bold-duotone" className="mr-2 text-base" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function AdminCategories() {
  usePageTitle("Quản lý Chuyên mục");
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.api.admin.categories.get();
      if (data?.success) setCategories((data as any).categories || []);
    } catch {
      toast.error("Không thể tải danh sách chuyên mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa chuyên mục này?")) return;
    try {
      const { data } = await api.api.admin.categories({ id }).delete();
      if (data?.success) { toast.success("Đã xóa"); fetchCategories(); }
      else toast.error((data as any)?.error || "Thất bại");
    } catch { toast.error("Lỗi kết nối"); }
  };

  const isDraggable = !search;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(categories, oldIndex, newIndex).map((c, i) => ({
      ...c,
      sortOrder: i,
    }));
    setCategories(reordered);

    setReordering(true);
    try {
      const items = reordered.map((c, i) => ({ id: c.id, sortOrder: i }));
      const { data } = await (api.api.admin.categories as any).reorder.patch({ items });
      if (data?.success) {
        toast.success("Cập nhật thứ tự thành công");
      } else {
        toast.error((data as any)?.error || "Cập nhật thất bại");
        fetchCategories();
      }
    } catch {
      toast.error("Lỗi kết nối");
      fetchCategories();
    } finally {
      setReordering(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) =>
      `${c.name} ${c.slug} ${c.description || ""}`.toLowerCase().includes(q)
    );
  }, [categories, search]);

  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive).length;
    const withIcon = categories.filter((c) => c.icon).length;
    const withDesc = categories.filter((c) => c.description).length;
    return [
      { label: "Tổng chuyên mục", value: total, icon: "solar:folder-bold-duotone", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
      { label: "Đang hoạt động", value: active, icon: "solar:check-circle-bold-duotone", bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
      { label: "Có icon", value: withIcon, icon: "solar:pallete-2-bold-duotone", bgColor: "bg-violet-500/10", textColor: "text-violet-500" },
      { label: "Có mô tả", value: withDesc, icon: "solar:document-text-bold-duotone", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
    ];
  }, [categories]);

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:folder-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">Chuyên mục</h1>
              <p className="text-xs text-muted-foreground">{categories.length} chuyên mục</p>
            </div>
          </div>
          <Button size="sm" className="text-xs gap-1.5" onClick={() => navigate("/admin/categories/create")}>
            <Icon icon="solar:add-circle-bold-duotone" className="text-sm" />
            Thêm mới
          </Button>
        </div>
      </AppDashed>
      <AdminStats items={stats} />
      <AppDashed noTopBorder padding="p-3">
        <div className="relative">
          <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
          <Input
            placeholder="Tìm chuyên mục..."
            className="pl-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-0" scrollable>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="solar:spinner-bold-duotone" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:folder-bold-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search ? "Không tìm thấy chuyên mục phù hợp" : "Chưa có chuyên mục nào"}
            </p>
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredCategories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y divide-border">
                  {filteredCategories.map((cat) => (
                    <SortableRow
                      key={cat.id}
                      cat={cat}
                      isDraggable={isDraggable}
                      navigate={navigate}
                      handleDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <div className="flex items-center justify-between px-4 py-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                Hiển thị {filteredCategories.length} / {categories.length} chuyên mục
              </span>
              {reordering && (
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Icon icon="solar:spinner-bold-duotone" className="text-xs animate-spin" />
                  Đang lưu...
                </span>
              )}
            </div>
          </>
        )}
      </AppDashed>
    </div>
  );
}
