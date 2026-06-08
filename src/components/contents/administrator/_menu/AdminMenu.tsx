"use client";

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MenuGroup {
  id: string;
  name: string;
  key: string;
  description: string | null;
  isActive: boolean;
}

interface Menu {
  id: string;
  groupId: string;
  parentId: string | null;
  name: string;
  url: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
}

interface TreeItem extends Menu {
  depth: number;
  children: TreeItem[];
}

// Helper functions for trees
function buildTree(items: Menu[], parentId: string | null = null, depth = 0): TreeItem[] {
  return items
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      ...item,
      depth,
      children: buildTree(items, item.id, depth + 1),
    }));
}

function flattenTree(tree: TreeItem[]): TreeItem[] {
  const result: TreeItem[] = [];
  function recurse(nodes: TreeItem[]) {
    for (const node of nodes) {
      result.push(node);
      if (node.children.length > 0) {
        recurse(node.children);
      }
    }
  }
  recurse(tree);
  return result;
}

function isDescendant(items: Menu[], childId: string, parentId: string): boolean {
  let current = items.find((i) => i.id === childId);
  while (current && current.parentId) {
    if (current.parentId === parentId) {
      return true;
    }
    current = items.find((i) => i.id === current!.parentId);
  }
  return false;
}

function getParentOptions(flatItems: TreeItem[], currentId?: string): TreeItem[] {
  return flatItems.filter((item) => {
    if (currentId) {
      if (item.id === currentId) return false;
      if (isDescendant(flatItems, item.id, currentId)) return false;
    }
    return true;
  });
}

function SmoothAccordion({ children, open }: { children: React.ReactNode; open: boolean }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (open) {
      el.style.display = "block";
      el.style.overflow = "hidden";
      const height = el.scrollHeight;
      const anim = el.animate(
        [
          { opacity: 0, transform: "translateY(-8px)", maxHeight: "0px" },
          { opacity: 1, transform: "translateY(0)", maxHeight: `${height}px` },
        ],
        { duration: 450, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "forwards" }
      );
      anim.onfinish = () => {
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.maxHeight = "none";
        el.style.overflow = "visible";
        anim.cancel();
      };
    } else {
      el.style.overflow = "hidden";
      const currentHeight = el.scrollHeight;
      const anim = el.animate(
        [
          { opacity: 1, transform: "translateY(0)", maxHeight: `${currentHeight}px` },
          { opacity: 0, transform: "translateY(-6px)", maxHeight: "0px" },
        ],
        { duration: 350, easing: "cubic-bezier(0.87,0,0.13,1)", fill: "forwards" }
      );
      anim.onfinish = () => {
        el.style.display = "none";
        anim.cancel();
      };
    }
  }, [open]);

  return (
    <div ref={contentRef} className="hidden">
      {children}
    </div>
  );
}

export default function AdminMenu() {
  // Queries
  const { data: groups, refetch: refetchGroups, isLoading: loadingGroups } = trpc.administrator.menu.getGroups.useQuery();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const { data: serverMenus, refetch: refetchMenus, isLoading: loadingMenus } = trpc.administrator.menu.getMenus.useQuery(
    { groupId: selectedGroupId || "" },
    { enabled: !!selectedGroupId }
  );

  const [menuItems, setMenuItems] = useState<Menu[]>([]);
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});

  // Reset collapsed state when group changes
  useEffect(() => {
    setCollapsedIds({});
  }, [selectedGroupId]);

  // Update local menu items when server data changes
  useEffect(() => {
    if (serverMenus) {
      setMenuItems(serverMenus);
    } else {
      setMenuItems([]);
    }
  }, [serverMenus]);

  // Set default selected group
  useEffect(() => {
    if (groups && groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  // Mutations
  const createGroupMutation = trpc.administrator.menu.createGroup.useMutation();
  const updateGroupMutation = trpc.administrator.menu.updateGroup.useMutation();
  const deleteGroupMutation = trpc.administrator.menu.deleteGroup.useMutation();

  const createMenuMutation = trpc.administrator.menu.createMenu.useMutation();
  const updateMenuMutation = trpc.administrator.menu.updateMenu.useMutation();
  const deleteMenuMutation = trpc.administrator.menu.deleteMenu.useMutation();
  const updateOrderMutation = trpc.administrator.menu.updateOrder.useMutation();

  // Dialog states for Group
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<MenuGroup | null>(null);
  const [groupForm, setGroupForm] = useState({ name: "", key: "", description: "", isActive: true });

  // Dialog states for Menu Item
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    url: "",
    icon: "",
    parentId: "none",
    isActive: true,
  });

  // Delete confirmations
  const [deletingGroup, setDeletingGroup] = useState<MenuGroup | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<Menu | null>(null);

  // Drag and Drop States
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<"before" | "after" | "inside" | null>(null);

  // Tree calculations
  const tree = buildTree(menuItems);
  const flatTree = flattenTree(tree);

  // Group Handlers
  const handleOpenGroupDialog = (group: MenuGroup | null = null) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({
        name: group.name,
        key: group.key,
        description: group.description || "",
        isActive: group.isActive,
      });
    } else {
      setEditingGroup(null);
      setGroupForm({ name: "", key: "", description: "", isActive: true });
    }
    setIsGroupDialogOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await updateGroupMutation.mutateAsync({
          id: editingGroup.id,
          ...groupForm,
        });
        toast.success("Đã cập nhật nhóm menu thành công");
      } else {
        const newGroup = await createGroupMutation.mutateAsync(groupForm);
        setSelectedGroupId(newGroup.id);
        toast.success("Đã tạo nhóm menu mới");
      }
      setIsGroupDialogOpen(false);
      refetchGroups();
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi");
    }
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;
    try {
      await deleteGroupMutation.mutateAsync({ id: deletingGroup.id });
      toast.success("Đã xóa nhóm menu thành công");
      setDeletingGroup(null);
      if (selectedGroupId === deletingGroup.id) {
        setSelectedGroupId(null);
      }
      refetchGroups();
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi");
    }
  };

  // Menu Item Handlers
  const handleOpenMenuDialog = (menu: Menu | null = null) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuForm({
        name: menu.name,
        url: menu.url || "",
        icon: menu.icon || "",
        parentId: menu.parentId || "none",
        isActive: menu.isActive,
      });
    } else {
      setEditingMenu(null);
      setMenuForm({
        name: "",
        url: "",
        icon: "",
        parentId: "none",
        isActive: true,
      });
    }
    setIsMenuDialogOpen(true);
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;
    try {
      const payloadParentId = menuForm.parentId === "none" ? null : menuForm.parentId;

      if (editingMenu) {
        await updateMenuMutation.mutateAsync({
          id: editingMenu.id,
          parentId: payloadParentId,
          name: menuForm.name,
          url: menuForm.url || null,
          icon: menuForm.icon || null,
          isActive: menuForm.isActive,
        });
        toast.success("Đã cập nhật menu thành công");
      } else {
        // Calculate order: max order + 10
        const siblings = menuItems.filter((m) => m.parentId === payloadParentId);
        const maxOrder = siblings.length > 0 ? Math.max(...siblings.map((s) => s.order)) : 0;
        await createMenuMutation.mutateAsync({
          groupId: selectedGroupId,
          parentId: payloadParentId,
          name: menuForm.name,
          url: menuForm.url || null,
          icon: menuForm.icon || null,
          order: maxOrder + 10,
          isActive: menuForm.isActive,
        });
        toast.success("Đã thêm menu item mới");
      }
      setIsMenuDialogOpen(false);
      refetchMenus();
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi");
    }
  };

  const handleDeleteMenu = async () => {
    if (!deletingMenu) return;
    try {
      await deleteMenuMutation.mutateAsync({ id: deletingMenu.id });
      toast.success("Đã xóa menu item thành công");
      setDeletingMenu(null);
      refetchMenus();
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi");
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    if (isDescendant(menuItems, targetId, draggedId)) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const height = rect.height;

    let position: "before" | "after" | "inside" = "inside";
    if (relativeY < height * 0.25) {
      position = "before";
    } else if (relativeY > height * 0.75) {
      position = "after";
    }

    setDragOverId(targetId);
    setDragPosition(position);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
    setDragPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    setDragPosition(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !dragPosition) return;
    if (isDescendant(menuItems, targetId, draggedId)) return;

    const targetItem = menuItems.find((i) => i.id === targetId);
    const draggedItem = menuItems.find((i) => i.id === draggedId);
    if (!targetItem || !draggedItem) return;

    let newParentId: string | null = null;
    let newOrder = 0;
    let updatedItems = [...menuItems];

    if (dragPosition === "inside") {
      newParentId = targetId;
      const siblings = menuItems.filter((i) => i.parentId === targetId);
      newOrder = siblings.length > 0 ? Math.max(...siblings.map((s) => s.order)) + 10 : 0;

      updatedItems = updatedItems.map((item) =>
        item.id === draggedId ? { ...item, parentId: newParentId, order: newOrder } : item
      );
    } else {
      newParentId = targetItem.parentId;
      const siblings = menuItems
        .filter((i) => i.parentId === newParentId && i.id !== draggedId)
        .sort((a, b) => a.order - b.order);

      const targetIndex = siblings.findIndex((s) => s.id === targetId);

      if (dragPosition === "before") {
        siblings.splice(targetIndex, 0, { ...draggedItem, parentId: newParentId });
      } else {
        siblings.splice(targetIndex + 1, 0, { ...draggedItem, parentId: newParentId });
      }

      siblings.forEach((sib, idx) => {
        sib.order = idx * 10;
      });

      updatedItems = updatedItems.map((item) => {
        const sibUpdate = siblings.find((s) => s.id === item.id);
        if (sibUpdate) {
          return { ...item, parentId: sibUpdate.parentId, order: sibUpdate.order };
        }
        return item;
      });
    }

    setMenuItems(updatedItems);

    try {
      const payload = updatedItems.map((item) => ({
        id: item.id,
        order: item.order,
        parentId: item.parentId,
      }));
      await updateOrderMutation.mutateAsync(payload);
      toast.success("Đã cập nhật vị trí menu");
    } catch (err) {
      toast.error("Không thể lưu vị trí menu mới");
      refetchMenus();
    }
  };

  // Switch toggles
  const handleToggleGroupStatus = async (group: MenuGroup, checked: boolean) => {
    try {
      await updateGroupMutation.mutateAsync({
        id: group.id,
        isActive: checked,
      });
      refetchGroups();
      toast.success(`Đã ${checked ? "kích hoạt" : "vô hiệu hóa"} nhóm menu`);
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleToggleMenuStatus = async (menu: Menu, checked: boolean) => {
    try {
      await updateMenuMutation.mutateAsync({
        id: menu.id,
        isActive: checked,
      });
      refetchMenus();
      toast.success(`Đã ${checked ? "kích hoạt" : "vô hiệu hóa"} menu item`);
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật trạng thái");
    }
  };

  const renderNode = (node: TreeItem) => {
    const isOver = dragOverId === node.id;
    const isSelfDragged = draggedId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!collapsedIds[node.id];

    return (
      <div key={node.id} className="flex flex-col gap-1.5 w-full">
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDragLeave={handleDragLeave}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, node.id)}
          className={cn(
            "group flex items-center justify-between p-3 rounded-lg border bg-background/60 hover:bg-muted/30 select-none transition-all duration-150 relative",
            isSelfDragged && "opacity-40 border-dashed border-muted-foreground",
            !isSelfDragged && "border-border",
            isOver && dragPosition === "inside" && "bg-vanixjnk/15 border-vanixjnk/30 scale-[1.01]",
            isOver && dragPosition === "before" && "border-t-2 border-t-vanixjnk/30",
            isOver && dragPosition === "after" && "border-b-2 border-b-vanixjnk/30"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground shrink-0 py-1 px-0.5">
              <Icon icon="solar:reorder-line-duotone" className="text-lg" />
            </div>

            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsedIds((prev) => ({
                    ...prev,
                    [node.id]: !prev[node.id],
                  }));
                }}
                className="size-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 transition-colors"
              >
                <Icon
                  icon="solar:alt-arrow-down-line-duotone"
                  className={cn("text-base transition-transform duration-200", !isExpanded && "-rotate-90")}
                />
              </button>
            ) : (
              <div className="size-6 shrink-0" />
            )}

            <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
              <Icon icon={node.icon || "solar:link-round-angle-line-duotone"} className="text-lg" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">{node.name}</span>
              <span className="text-[11px] text-muted-foreground font-mono truncate">
                {node.url || "—"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={node.isActive}
              onCheckedChange={(checked) => handleToggleMenuStatus(node, checked)}
              className="scale-75"
            />
            <button
              type="button"
              onClick={() => handleOpenMenuDialog(node)}
              className="size-8 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon icon="solar:pen-line-duotone" className="text-base" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingMenu(node)}
              className="size-8 rounded-md flex items-center justify-center hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Icon icon="solar:trash-bin-trash-line-duotone" className="text-base" />
            </button>
          </div>
        </div>

        {hasChildren && (
          <SmoothAccordion open={isExpanded}>
            <div className="pl-6 border-l border-dashed border-border/70 flex flex-col gap-1.5 mt-1.5 ml-[36px]">
              {node.children.map((child) => renderNode(child))}
            </div>
          </SmoothAccordion>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:hamburger-menu-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý Menu</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Thiết lập cấu trúc nhóm menu và sơ đồ cây các liên kết điều hướng DND.
                </p>
              </div>
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
            backgroundImage: "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)"
          }}
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-b border-border/60 flex-1">
            {/* Left Column: Menu Groups */}
            <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-border/60 flex flex-col gap-4">
              <div className="pb-3 border-b border-border/60">
                <h3 className="text-base font-bold text-foreground">Nhóm Menu</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chọn nhóm menu để quản lý các liên kết bên trong.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                {loadingGroups ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                    <Icon icon="solar:spinner-line-duotone" className="text-xl animate-spin text-vanixjnk" />
                    <span className="text-sm font-semibold">Đang tải nhóm menu...</span>
                  </div>
                ) : !groups || groups.length === 0 ? (
                  <Empty className="py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Icon icon="solar:folder-open-line-duotone" className="text-lg text-muted-foreground" />
                      </EmptyMedia>
                      <EmptyTitle className="text-xs">Chưa có nhóm menu</EmptyTitle>
                      <EmptyDescription className="text-xxs">
                        Tạo nhóm menu đầu tiên để bắt đầu thêm liên kết.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                        selectedGroupId === group.id
                          ? "text-vanixjnk bg-vanixjnk/10 border-vanixjnk/25"
                          : "border-border bg-background/50 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-sm truncate">{group.name}</span>
                        <span className="text-[10px] opacity-75 font-mono truncate">{group.key}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={group.isActive}
                          onCheckedChange={(checked) => handleToggleGroupStatus(group, checked)}
                          className="scale-75"
                        />
                        <button
                          onClick={() => handleOpenGroupDialog(group)}
                          className="size-7 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Icon icon="solar:pen-line-duotone" className="text-sm" />
                        </button>
                        <button
                          onClick={() => setDeletingGroup(group)}
                          className="size-7 rounded-md flex items-center justify-center hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Icon icon="solar:trash-bin-trash-line-duotone" className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="lg:col-span-8 p-6 flex flex-col gap-4">
              <div className="pb-3 border-b border-border/60 flex flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Cấu trúc Menu</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Kéo thả các phần tử để thay đổi thứ tự và cấp bậc hiển thị.
                  </p>
                </div>
                {selectedGroupId && (
                  <Button variant="vanixjnk" size="sm" onClick={() => handleOpenMenuDialog(null)} className="gap-1.5">
                    <Icon icon="solar:add-circle-line-duotone" className="text-base" />
                    <span>Thêm liên kết</span>
                  </Button>
                )}
              </div>
              <div className="flex-1">
                {!selectedGroupId ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                    <Icon icon="solar:info-circle-line-duotone" className="text-3xl text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold">Vui lòng chọn một nhóm menu bên trái để tiếp tục thiết lập</p>
                  </div>
                ) : loadingMenus ? (
                  <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                    <Icon icon="solar:spinner-line-duotone" className="text-xl animate-spin text-vanixjnk" />
                    <span className="text-sm font-semibold">Đang tải danh sách menu...</span>
                  </div>
                ) : flatTree.length === 0 ? (
                  <Empty className="py-16">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Icon icon="solar:link-round-angle-line-duotone" className="text-lg text-muted-foreground" />
                      </EmptyMedia>
                      <EmptyTitle className="text-sm">Chưa có liên kết nào</EmptyTitle>
                      <EmptyDescription className="text-xs">
                        Nhấp vào nút "Thêm liên kết" ở trên để bắt đầu xây dựng cây menu.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <div className="flex flex-col gap-1.5 min-h-[300px]">
                    {tree.map((node) => renderNode(node))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Group Create/Edit Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2.5">
              <div className="size-8 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:folder-open-line-duotone" className="size-4.5" />
              </div>
              <span>{editingGroup ? "Cập nhật nhóm menu" : "Tạo nhóm menu mới"}</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveGroup} className="space-y-4 py-2 flex-1 overflow-y-auto">
            <div className="space-y-1.5">
              <Label htmlFor="group-name">Tên nhóm</Label>
              <Input
                id="group-name"
                required
                placeholder="Ví dụ: Header Main Menu"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="group-key">Key định danh (Duy nhất)</Label>
              <Input
                id="group-key"
                required
                placeholder="Ví dụ: intro, services, explore, contact"
                value={groupForm.key}
                onChange={(e) => setGroupForm({ ...groupForm, key: e.target.value })}
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Các key tương ứng với Footer: <code className="font-semibold text-primary">intro</code>, <code className="font-semibold text-primary">services</code>, <code className="font-semibold text-primary">explore</code>, <code className="font-semibold text-primary">contact</code>
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="group-desc">Mô tả chi tiết</Label>
              <Textarea
                id="group-desc"
                placeholder="Nhập mô tả về phạm vi sử dụng nhóm menu..."
                value={groupForm.description}
                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="group-active" className="cursor-pointer">Kích hoạt nhóm</Label>
                <span className="text-[11px] text-muted-foreground">Nhóm menu không hoạt động sẽ bị ẩn khỏi website</span>
              </div>
              <Switch
                id="group-active"
                checked={groupForm.isActive}
                onCheckedChange={(checked) => setGroupForm({ ...groupForm, isActive: checked })}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" variant="vanixjnk">
                {editingGroup ? "Lưu thay đổi" : "Tạo nhóm"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Menu Item Create/Edit Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2.5">
              <div className="size-8 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:link-round-angle-line-duotone" className="size-4.5" />
              </div>
              <span>{editingMenu ? "Cập nhật liên kết" : "Thêm liên kết mới"}</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveMenu} className="space-y-4 py-2 flex-1 overflow-y-auto">
            <div className="space-y-1.5">
              <Label htmlFor="menu-name">Tên hiển thị</Label>
              <Input
                id="menu-name"
                required
                placeholder="Ví dụ: Giới thiệu"
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="menu-url">Đường dẫn liên kết (URL)</Label>
              <Input
                id="menu-url"
                placeholder="Ví dụ: /about hoặc https://..."
                value={menuForm.url}
                onChange={(e) => setMenuForm({ ...menuForm, url: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="menu-icon">Biểu tượng (Iconify Key)</Label>
              <div className="flex gap-2">
                <Input
                  id="menu-icon"
                  placeholder="Ví dụ: solar:home-2-line-duotone"
                  value={menuForm.icon}
                  onChange={(e) => setMenuForm({ ...menuForm, icon: e.target.value })}
                  className="font-mono text-xs w-full"
                />
                <div className="size-8 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <Icon icon={menuForm.icon || "solar:link-round-angle-line-duotone"} className="text-lg" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="menu-parent">Liên kết cha</Label>
              <Select
                value={menuForm.parentId}
                onValueChange={(val) => setMenuForm({ ...menuForm, parentId: val })}
              >
                <SelectTrigger id="menu-parent" className="w-full">
                  <SelectValue placeholder="Chọn liên kết cha..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="font-semibold text-primary">
                    Không có (Mục gốc)
                  </SelectItem>
                  {getParentOptions(flatTree, editingMenu?.id).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {"— ".repeat(item.depth)}
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="menu-active" className="cursor-pointer">Trạng thái hoạt động</Label>
                <span className="text-[11px] text-muted-foreground">Ẩn/Hiện mục liên kết này trên menu</span>
              </div>
              <Switch
                id="menu-active"
                checked={menuForm.isActive}
                onCheckedChange={(checked) => setMenuForm({ ...menuForm, isActive: checked })}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsMenuDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" variant="vanixjnk">
                {editingMenu ? "Lưu thay đổi" : "Thêm liên kết"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation Dialog */}
      <Dialog open={!!deletingGroup} onOpenChange={(open) => !open && setDeletingGroup(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              <span>Xác nhận xóa nhóm menu</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Hành động này sẽ xóa vĩnh viễn nhóm menu <strong className="text-foreground">"{deletingGroup?.name}"</strong> và tất cả các mục liên kết nằm bên trong nó.
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeletingGroup(null)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDeleteGroup}>
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Menu Item Confirmation Dialog */}
      <Dialog open={!!deletingMenu} onOpenChange={(open) => !open && setDeletingMenu(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              <span>Xác nhận xóa liên kết</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Hành động này sẽ xóa vĩnh viễn liên kết <strong className="text-foreground">"{deletingMenu?.name}"</strong> và các liên kết con trực thuộc của nó (nếu có).
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeletingMenu(null)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDeleteMenu}>
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
