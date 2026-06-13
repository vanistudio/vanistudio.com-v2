"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import type { ServiceType } from "@/server/db/schemas/service.schema";

const COLOR_PRESETS = [
  { name: "Blue (Mặc định)", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { name: "Violet", color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { name: "Amber/Gold", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { name: "Green", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  { name: "Rose/Red", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { name: "Cyan", color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { name: "Orange", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { name: "Zinc/Muted", color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
];

export default function AdminServiceTypesTab() {
  const { data: typesData, isLoading: typesLoading, refetch: refetchTypes } =
    trpc.administrator.services.getTypes.useQuery(undefined, { refetchOnWindowFocus: false });

  const createMutation = trpc.administrator.services.createType.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setEditorOpen(false);
      refetchTypes();
    },
    onError: (err) => toast.error(err.message || "Tạo thất bại"),
  });

  const updateMutation = trpc.administrator.services.updateType.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setEditorOpen(false);
      refetchTypes();
    },
    onError: (err) => toast.error(err.message || "Cập nhật thất bại"),
  });

  const deleteMutation = trpc.administrator.services.deleteType.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      refetchTypes();
    },
    onError: (err) => toast.error(err.message || "Xóa thất bại"),
  });

  const typesList = typesData?.data || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingType, setEditingType] = useState<ServiceType | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    icon: "",
    description: "",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    order: 0,
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<ServiceType | null>(null);

  const openEditor = (typeItem: ServiceType | null) => {
    if (typeItem) {
      setEditingType(typeItem);
      setForm({
        name: typeItem.name,
        slug: typeItem.slug,
        icon: typeItem.icon || "",
        description: typeItem.description || "",
        color: typeItem.color || "text-blue-500",
        bg: typeItem.bg || "bg-blue-500/10",
        border: typeItem.border || "border-blue-500/20",
        order: typeItem.order,
      });
    } else {
      setEditingType(null);
      setForm({
        name: "",
        slug: "",
        icon: "solar:widget-line-duotone",
        description: "",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        order: (typesList[typesList.length - 1]?.order || 0) + 1,
      });
    }
    setEditorOpen(true);
  };

  const handleNameChange = (val: string) => {
    const slugified = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setForm((prev) => ({ ...prev, name: val, slug: slugified }));
  };

  const saveType = async () => {
    if (!form.name.trim()) return toast.error("Tên phân loại không được để trống");
    
    const finalSlug = form.slug.trim() || form.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const payload = {
      name: form.name.trim(),
      slug: finalSlug,
      icon: form.icon.trim() || null,
      description: form.description.trim() || null,
      color: form.color || null,
      bg: form.bg || null,
      border: form.border || null,
      order: form.order,
    };

    if (editingType) {
      updateMutation.mutate({
        id: editingType.id,
        data: payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredTypes = useMemo(() => {
    let result = [...typesList];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => a.order - b.order);
    return result;
  }, [typesList, searchQuery]);

  const paginatedTypes = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return filteredTypes.slice(start, start + pagination.pageSize);
  }, [filteredTypes, pagination]);

  const columns = useMemo<ColumnDef<ServiceType>[]>(() => [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-normal">
          {pagination.pageIndex * pagination.pageSize + row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: "name",
      meta: { title: "Tên phân loại" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const typeItem = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <div className={cn("size-8 rounded-lg flex items-center justify-center border shrink-0", typeItem.bg, typeItem.border)}>
              <Icon icon={typeItem.icon || "solar:widget-line-duotone"} className={cn("text-lg", typeItem.color)} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span
                className="text-[13px] font-semibold text-foreground hover:text-vanixjnk transition-colors cursor-pointer"
                onClick={() => openEditor(typeItem)}
              >
                {typeItem.name}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                /{typeItem.slug}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      meta: { title: "Mô tả" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <span className="text-[12px] text-muted-foreground line-clamp-2 max-w-[320px]">
          {row.getValue("description") || "Chưa có mô tả"}
        </span>
      ),
    },
    {
      accessorKey: "order",
      meta: { title: "Thứ tự sắp xếp" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue("order")}</span>,
    },
    {
      accessorKey: "preview",
      meta: { title: "Giao diện Badge" },
      cell: ({ row }) => {
        const typeItem = row.original;
        return (
          <Badge className={cn("font-semibold text-[11px] capitalize border shadow-none", typeItem.color, typeItem.bg, typeItem.border)}>
            {typeItem.name}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const typeItem = row.original;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <Icon icon="solar:menu-dots-bold-duotone" className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1 flex flex-col gap-0.5" align="end">
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2"
                onClick={() => openEditor(typeItem)}
              >
                <Icon icon="solar:pen-line-duotone" className="mr-2 size-3.5" />
                Chỉnh sửa
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                onClick={() => {
                  setTypeToDelete(typeItem);
                  setDeleteConfirmOpen(true);
                }}
              >
                <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5" />
                Xóa phân loại
              </Button>
            </PopoverContent>
          </Popover>
        );
      },
    },
  ], [pagination]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Phân loại dịch vụ</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Định nghĩa các danh mục dịch vụ công nghệ, thiết kế thẻ badge và các cấu hình liên quan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchTypes()} disabled={typesLoading} className="gap-1.5 shrink-0">
            <Icon icon="solar:restart-line-duotone" className={cn("text-base", typesLoading && "animate-spin")} />
            <span>Làm mới</span>
          </Button>
          <Button variant="vanixjnk" size="sm" onClick={() => openEditor(null)} className="gap-1.5 shrink-0">
            <Icon icon="solar:add-circle-line-duotone" className="text-base" />
            <span>Thêm phân loại</span>
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedTypes}
        isLoading={typesLoading}
        pageCount={Math.ceil(filteredTypes.length / pagination.pageSize)}
        totalRecords={filteredTypes.length}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        toolbarInput={
          <div className="relative flex-1 max-w-sm">
            <Icon icon="solar:magnifer-line-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input
              placeholder="Tìm kiếm phân loại..."
              className="pl-9 h-9 text-sm w-full bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        }
      />

      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent className="sm:max-w-[500px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6">
            <div className="size-10 rounded-xl bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0 mb-2">
              <Icon icon={editingType ? "solar:pen-new-square-line-duotone" : "solar:add-circle-line-duotone"} className="size-6 text-vanixjnk" />
            </div>
            <SheetTitle className="text-xl font-bold">
              {editingType ? "Chỉnh sửa phân loại" : "Thêm phân loại mới"}
            </SheetTitle>
            <SheetDescription>Thiết lập thông tin hiển thị, biểu tượng và các thẻ thuộc tính cho danh mục dịch vụ.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-background">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-foreground">Tên phân loại</label>
              <Input
                placeholder="Ví dụ: Minecraft Plugin"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-foreground">Mô tả ngắn</label>
              <Textarea
                placeholder="Nhập mô tả giới thiệu phân loại này..."
                rows={2}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                <Icon icon="solar:gallery-line-duotone" className="size-4 text-muted-foreground" />
                Iconify Icon Key
              </label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ví dụ: solar:palette-line-duotone"
                  value={form.icon}
                  onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                  className="h-9 shadow-sm text-[13px] flex-1 font-mono"
                />
                <div className="size-9 flex items-center justify-center bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20 rounded-md shrink-0">
                  <Icon icon={form.icon || "solar:widget-line-duotone"} className="text-base text-vanixjnk" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Sử dụng các mã icon từ Iconify (ví dụ: <code className="bg-muted px-1 rounded">solar:cpu-line-duotone</code>).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-foreground">Thứ tự sắp xếp</label>
                <Input
                  type="number"
                  placeholder="Ví dụ: 1"
                  value={form.order || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[13px] font-bold text-foreground">Bộ chọn phong cách (Preset Styles)</label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = form.color === preset.color && form.bg === preset.bg && form.border === preset.border;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, color: preset.color, bg: preset.bg, border: preset.border }))}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border text-left transition-all duration-200 text-xs",
                        isSelected ? "border-vanixjnk bg-vanixjnk/5 font-semibold" : "border-border/80 hover:bg-muted/30"
                      )}
                    >
                      <span className="truncate">{preset.name}</span>
                      <Badge className={cn("size-2 p-0 rounded-full shrink-0 border border-current shadow-none", preset.color, preset.bg)} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-muted-foreground">Tùy biến CSS Classes</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Text Color</label>
                  <Input
                    value={form.color}
                    onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                    className="h-8 text-[11px] font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Bg Color</label>
                  <Input
                    value={form.bg}
                    onChange={(e) => setForm((prev) => ({ ...prev, bg: e.target.value }))}
                    className="h-8 text-[11px] font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Border Color</label>
                  <Input
                    value={form.border}
                    onChange={(e) => setForm((prev) => ({ ...prev, border: e.target.value }))}
                    className="h-8 text-[11px] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-dashed border-border/85 bg-muted/15 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Xem trước hiển thị:</span>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card">
                <div className={cn("size-8 rounded-lg flex items-center justify-center border shrink-0", form.bg, form.border)}>
                  <Icon icon={form.icon || "solar:widget-line-duotone"} className={cn("text-lg", form.color)} />
                </div>
                <div>
                  <Badge className={cn("font-semibold text-[10px] capitalize border shadow-none", form.color, form.bg, form.border)}>
                    {form.name || "Tên phân loại"}
                  </Badge>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                    {form.description || "Chưa nhập mô tả..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Hủy bỏ</Button>
            <Button
              variant="vanixjnk"
              onClick={saveType}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <SheetContent className="sm:max-w-[400px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6">
            <div className="size-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mb-2">
              <Icon icon="solar:danger-triangle-line-duotone" className="size-6" />
            </div>
            <SheetTitle className="text-xl font-bold text-rose-500">
              Xác nhận xóa phân loại
            </SheetTitle>
            <SheetDescription>
              Hành động này sẽ xóa vĩnh viễn phân loại dịch vụ. Các dịch vụ thuộc phân loại này sẽ bị hủy liên kết phân loại.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 p-6 text-sm text-muted-foreground bg-background">
            Bạn có chắc chắn muốn xóa phân loại <strong className="text-foreground font-semibold">{typeToDelete?.name}</strong> không?
          </div>

          <div className="p-6 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (typeToDelete) {
                  deleteMutation.mutate({ id: typeToDelete.id });
                  setDeleteConfirmOpen(false);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              Xác nhận xóa
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
