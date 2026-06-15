"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MdxRenderer, MdxEditor, insertMdxAtCursor } from "@/components/vanixjnk/mdx-builder";
import { cn } from "@/lib/utils";
import { type ApiOverview, type ApiGroup, type ApiEndpoint, type ApiParameter, type ApiResponseSample } from "@/server/db/schemas/api.schema";

export default function AdminDocs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainParam = searchParams.get("domain") || "";

  // Data fetching
  const { data: overviews, isLoading: isLoadingOverviews, refetch: refetchOverviews } = trpc.administrator.apiDocs.getOverviews.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { data: groups, isLoading: isLoadingGroups, refetch: refetchGroups } = trpc.administrator.apiDocs.getGroupsWithEndpoints.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const utils = trpc.useUtils();

  // Mutations
  const upsertOverviewMutation = trpc.administrator.apiDocs.upsertOverview.useMutation();
  const deleteOverviewMutation = trpc.administrator.apiDocs.deleteOverview.useMutation();
  const upsertGroupMutation = trpc.administrator.apiDocs.upsertGroup.useMutation();
  const deleteGroupMutation = trpc.administrator.apiDocs.deleteGroup.useMutation();
  const upsertEndpointMutation = trpc.administrator.apiDocs.upsertEndpoint.useMutation();
  const deleteEndpointMutation = trpc.administrator.apiDocs.deleteEndpoint.useMutation();

  // Selected item state
  const [selectedType, setSelectedType] = useState<"overview" | "endpoint" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Edit/Create states
  const [editingOverview, setEditingOverview] = useState<(Partial<ApiOverview> & { isNew?: boolean }) | null>(null);
  const [editingGroup, setEditingGroup] = useState<(Partial<ApiGroup> & { isNew?: boolean }) | null>(null);
  const [editingEndpoint, setEditingEndpoint] = useState<(Partial<ApiEndpoint> & { isNew?: boolean }) | null>(null);

  // Form sub-tabs
  const [overviewTab, setOverviewTab] = useState<"content" | "seo">("content");
  const [endpointTab, setEndpointTab] = useState<"general" | "params" | "responses">("general");

  // Playground State
  const [targetDomain, setTargetDomain] = useState(domainParam || "shoprandom247.com");
  const [playgroundHeaders, setPlaygroundHeaders] = useState<Array<{ name: string; value: string }>>([
    { name: "Content-Type", value: "application/json" }
  ]);
  const [playgroundQueryParams, setPlaygroundQueryParams] = useState<Record<string, string>>({});
  const [playgroundBody, setPlaygroundBody] = useState("");
  const [playgroundResponse, setPlaygroundResponse] = useState<{
    status: number;
    statusText: string;
    time: number;
    headers: Record<string, string>;
    body: any;
  } | null>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  // Ref for MDX editors
  const overviewTextareaRef = useRef<HTMLTextAreaElement>(null);
  const endpointTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-select first item when loaded
  useEffect(() => {
    if (overviews && overviews.length > 0 && !selectedId) {
      setSelectedType("overview");
      setSelectedId(overviews[0].id);
    } else if (groups && groups.length > 0 && !selectedId) {
      const firstGroup = groups.find(g => g.endpoints.length > 0);
      if (firstGroup) {
        setSelectedType("endpoint");
        setSelectedId(firstGroup.endpoints[0].id);
      }
    }
  }, [overviews, groups, selectedId]);

  // Sync target domain if query param changes
  useEffect(() => {
    if (domainParam) {
      setTargetDomain(domainParam);
    }
  }, [domainParam]);

  // Pre-populate playground inputs when active endpoint changes
  const activeEndpoint = groups?.flatMap(g => g.endpoints).find(ep => ep.id === selectedId);
  useEffect(() => {
    if (activeEndpoint) {
      // Default headers
      const defaultHeaders = [
        { name: "Content-Type", value: "application/json" },
        ...(activeEndpoint.headers || []).map(h => ({
          name: h.name,
          value: h.defaultValue ? String(h.defaultValue) : ""
        }))
      ];
      setPlaygroundHeaders(defaultHeaders);

      // Default query params
      const defaultQueryParams: Record<string, string> = {};
      (activeEndpoint.queryParams || []).forEach(q => {
        defaultQueryParams[q.name] = q.defaultValue ? String(q.defaultValue) : "";
      });
      setPlaygroundQueryParams(defaultQueryParams);

      // Default body template
      if (activeEndpoint.requestBody && activeEndpoint.requestBody.length > 0) {
        const bodyObj: Record<string, any> = {};
        activeEndpoint.requestBody.forEach(p => {
          bodyObj[p.name] = p.defaultValue !== undefined ? p.defaultValue : (p.type === "number" ? 0 : (p.type === "boolean" ? false : ""));
        });
        setPlaygroundBody(JSON.stringify(bodyObj, null, 2));
      } else {
        setPlaygroundBody("");
      }
      setPlaygroundResponse(null);
    }
  }, [activeEndpoint]);

  // Slugify helper
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // --- CRUD Handlers ---

  // Overview Save
  const handleSaveOverview = async () => {
    if (!editingOverview?.title?.trim()) {
      toast.error("Tiêu đề không được để trống");
      return;
    }
    if (!editingOverview?.slug?.trim()) {
      toast.error("Slug không được để trống");
      return;
    }
    if (!editingOverview?.content?.trim()) {
      toast.error("Nội dung MDX không được để trống");
      return;
    }

    try {
      const saved = await upsertOverviewMutation.mutateAsync({
        id: editingOverview.id,
        title: editingOverview.title,
        slug: editingOverview.slug,
        description: editingOverview.description || null,
        content: editingOverview.content,
        thumbnail: editingOverview.thumbnail || null,
        metaTitle: editingOverview.metaTitle || null,
        metaDescription: editingOverview.metaDescription || null,
        metaKeywords: editingOverview.metaKeywords || null,
        isActive: editingOverview.isActive ?? true,
      });

      toast.success("Lưu tài liệu tổng quan thành công!");
      setEditingOverview(null);
      refetchOverviews();
      setSelectedType("overview");
      setSelectedId(saved.id);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu tài liệu");
    }
  };

  const handleDeleteOverview = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    try {
      await deleteOverviewMutation.mutateAsync({ id });
      toast.success("Xóa tài liệu thành công!");
      if (selectedId === id) setSelectedId(null);
      refetchOverviews();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa tài liệu");
    }
  };

  // Group Save
  const handleSaveGroup = async () => {
    if (!editingGroup?.name?.trim()) {
      toast.error("Tên nhóm không được để trống");
      return;
    }
    if (!editingGroup?.slug?.trim()) {
      toast.error("Slug không được để trống");
      return;
    }

    try {
      await upsertGroupMutation.mutateAsync({
        id: editingGroup.id,
        name: editingGroup.name,
        slug: editingGroup.slug,
        description: editingGroup.description || null,
        order: editingGroup.order ?? 0,
      });
      toast.success("Lưu nhóm API thành công!");
      setEditingGroup(null);
      refetchGroups();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu nhóm API");
    }
  };

  const handleDeleteGroup = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa nhóm API này? Toàn bộ Endpoint con sẽ bị xóa theo!")) return;
    try {
      await deleteGroupMutation.mutateAsync({ id });
      toast.success("Xóa nhóm API thành công!");
      refetchGroups();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa nhóm API");
    }
  };

  // Endpoint Save
  const handleSaveEndpoint = async () => {
    if (!editingEndpoint?.name?.trim()) {
      toast.error("Tên API không được để trống");
      return;
    }
    if (!editingEndpoint?.groupId) {
      toast.error("Vui lòng chọn nhóm API");
      return;
    }
    if (!editingEndpoint?.path?.trim()) {
      toast.error("Đường dẫn không được để trống");
      return;
    }
    if (!editingEndpoint?.method) {
      toast.error("Phương thức không được để trống");
      return;
    }
    if (!editingEndpoint?.description?.trim()) {
      toast.error("Mô tả không được để trống");
      return;
    }

    try {
      const saved = await upsertEndpointMutation.mutateAsync({
        id: editingEndpoint.id,
        groupId: editingEndpoint.groupId,
        name: editingEndpoint.name,
        method: editingEndpoint.method as any,
        path: editingEndpoint.path,
        description: editingEndpoint.description,
        headers: editingEndpoint.headers || [],
        queryParams: editingEndpoint.queryParams || [],
        requestBody: editingEndpoint.requestBody || [],
        responses: editingEndpoint.responses || [],
        editionRequired: editingEndpoint.editionRequired || ["standard", "premium", "ultimate"],
        isActive: editingEndpoint.isActive ?? true,
      });
      toast.success("Lưu API Endpoint thành công!");
      setEditingEndpoint(null);
      refetchGroups();
      setSelectedType("endpoint");
      setSelectedId(saved.id);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu API Endpoint");
    }
  };

  const handleDeleteEndpoint = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa Endpoint này?")) return;
    try {
      await deleteEndpointMutation.mutateAsync({ id });
      toast.success("Xóa Endpoint thành công!");
      if (selectedId === id) setSelectedId(null);
      refetchGroups();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa Endpoint");
    }
  };

  // --- API Testing Trigger ---
  const handleSendRequest = async () => {
    if (!activeEndpoint) return;
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);

    const protocol = targetDomain.startsWith("http://") || targetDomain.startsWith("https://") ? "" : "https://";
    const cleanDomain = targetDomain.replace(/\/$/, "");
    const cleanPath = activeEndpoint.path.startsWith("/") ? activeEndpoint.path : `/${activeEndpoint.path}`;

    // Query String Builder
    const queryPairs = Object.entries(playgroundQueryParams)
      .filter(([_, v]) => v.trim() !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    const url = `${protocol}${cleanDomain}${cleanPath}${queryPairs ? `?${queryPairs}` : ""}`;

    // Headers Builder
    const headersObj: Record<string, string> = {};
    playgroundHeaders
      .filter(h => h.name.trim() !== "")
      .forEach(h => {
        headersObj[h.name] = h.value;
      });

    const startTime = performance.now();
    try {
      const response = await fetch(url, {
        method: activeEndpoint.method,
        headers: headersObj,
        body: ["POST", "PUT", "PATCH", "DELETE"].includes(activeEndpoint.method) && playgroundBody
          ? playgroundBody
          : undefined,
        mode: "cors",
      });

      const endTime = performance.now();
      const timeElapsed = Math.round(endTime - startTime);

      let responseBody: any = "";
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      const resHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });

      setPlaygroundResponse({
        status: response.status,
        statusText: response.statusText,
        time: timeElapsed,
        headers: resHeaders,
        body: responseBody,
      });
    } catch (error: any) {
      const endTime = performance.now();
      const timeElapsed = Math.round(endTime - startTime);

      setPlaygroundResponse({
        status: 0,
        statusText: "Network Error / CORS Issue",
        time: timeElapsed,
        headers: {},
        body: {
          error: "Không thể kết nối với máy chủ mục tiêu.",
          reason: error.message || "CORS Policy hoặc Domain không tồn tại. Đảm bảo tên miền nguồn đã được cấu hình CORS cho phép vanistudio.com.",
          tip: "Vui lòng kiểm tra lại cấu hình CORS phía máy chủ của bạn (Allow Origin: https://vanistudio.com)."
        },
      });
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Active overview doc
  const activeOverview = overviews?.find(o => o.id === selectedId);

  return (
    <div className="flex flex-col w-full flex-1">
      {/* Header section identical to VaniStudio design */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:document-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Tài liệu tích hợp & API</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý tài liệu kỹ thuật, đặc tả API và công cụ Playground thử nghiệm trực tiếp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative repeating linear separator */}
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

      {/* Main Content Area */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-b border-border/60 flex-1 min-h-[600px]">
            
            {/* Column 1: Sidebar Tree (30% width -> span 3 or 4) */}
            <div className="lg:col-span-3 p-4 border-b lg:border-b-0 lg:border-r border-border/60 flex flex-col gap-4 bg-muted/5">
              
              {/* Overviews Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tài liệu chung</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-vanixjnk/10 hover:text-vanixjnk"
                    onClick={() => {
                      setEditingOverview({
                        isNew: true,
                        title: "",
                        slug: "",
                        content: "",
                        isActive: true
                      });
                      setEditingEndpoint(null);
                    }}
                  >
                    <Icon icon="solar:add-circle-line-duotone" className="size-4" />
                  </Button>
                </div>

                {isLoadingOverviews ? (
                  <div className="space-y-1">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {overviews?.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setSelectedType("overview");
                          setSelectedId(doc.id);
                          setEditingOverview(null);
                          setEditingEndpoint(null);
                        }}
                        className={cn(
                          "group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150",
                          selectedType === "overview" && selectedId === doc.id
                            ? "bg-vanixjnk/15 border border-vanixjnk/20 text-vanixjnk"
                            : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon icon="solar:document-text-line-duotone" className="size-4 shrink-0" />
                          <span className="truncate">{doc.title}</span>
                          {!doc.isActive && <Badge variant="outline" className="text-[9px] px-1 h-3.5 border-amber-500/30 text-amber-500 bg-amber-500/5">Ẩn</Badge>}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingOverview(doc);
                              setEditingEndpoint(null);
                            }}
                            className="p-0.5 hover:text-vanixjnk transition-colors"
                            title="Sửa"
                          >
                            <Icon icon="solar:pen-2-line-duotone" className="size-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteOverview(doc.id, e)}
                            className="p-0.5 hover:text-red-500 transition-colors"
                            title="Xóa"
                          >
                            <Icon icon="solar:trash-bin-trash-line-duotone" className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* API Groups & Endpoints Section */}
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Đặc tả API</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-vanixjnk/10 hover:text-vanixjnk"
                    title="Thêm nhóm API"
                    onClick={() => setEditingGroup({ isNew: true, name: "", slug: "", order: 0 })}
                  >
                    <Icon icon="solar:add-circle-line-duotone" className="size-4" />
                  </Button>
                </div>

                {isLoadingGroups ? (
                  <div className="space-y-1">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groups?.map((group) => (
                      <div key={group.id} className="space-y-1">
                        {/* Group Header */}
                        <div className="group/grp flex items-center justify-between px-1.5 py-1 text-[11px] font-bold text-foreground bg-muted/30 rounded">
                          <span className="truncate">{group.name}</span>
                          <div className="opacity-0 group-hover/grp:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                            <button
                              onClick={() => setEditingEndpoint({ isNew: true, groupId: group.id, method: "GET", path: "", name: "", description: "" })}
                              className="p-0.5 hover:text-vanixjnk"
                              title="Thêm API Endpoint"
                            >
                              <Icon icon="solar:add-circle-line-duotone" className="size-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingGroup(group)}
                              className="p-0.5 hover:text-vanixjnk"
                              title="Sửa nhóm"
                            >
                              <Icon icon="solar:pen-2-line-duotone" className="size-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteGroup(group.id, e)}
                              className="p-0.5 hover:text-red-500"
                              title="Xóa nhóm"
                            >
                              <Icon icon="solar:trash-bin-trash-line-duotone" className="size-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Endpoints under Group */}
                        <div className="pl-2 flex flex-col gap-0.5 border-l border-dashed border-border/80">
                          {group.endpoints.map((ep) => (
                            <div
                              key={ep.id}
                              onClick={() => {
                                setSelectedType("endpoint");
                                setSelectedId(ep.id);
                                setEditingOverview(null);
                                setEditingEndpoint(null);
                              }}
                              className={cn(
                                "group flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all duration-150",
                                selectedType === "endpoint" && selectedId === ep.id
                                  ? "bg-vanixjnk/15 border border-vanixjnk/20 text-vanixjnk"
                                  : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                              )}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className={cn(
                                  "text-[8px] font-extrabold font-mono px-1 rounded shrink-0",
                                  ep.method === "GET" && "bg-green-500/10 text-green-500 border border-green-500/20",
                                  ep.method === "POST" && "bg-blue-500/10 text-blue-500 border border-blue-500/20",
                                  ep.method === "PUT" && "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
                                  ep.method === "DELETE" && "bg-red-500/10 text-red-500 border border-red-500/20",
                                  ep.method === "PATCH" && "bg-purple-500/10 text-purple-500 border border-purple-500/20",
                                )}>
                                  {ep.method}
                                </span>
                                <span className="truncate">{ep.name}</span>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingEndpoint(ep);
                                    setEditingOverview(null);
                                  }}
                                  className="p-0.5 hover:text-vanixjnk"
                                  title="Sửa API"
                                >
                                  <Icon icon="solar:pen-2-line-duotone" className="size-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteEndpoint(ep.id, e)}
                                  className="p-0.5 hover:text-red-500"
                                  title="Xóa API"
                                >
                                  <Icon icon="solar:trash-bin-trash-line-duotone" className="size-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {group.endpoints.length === 0 && (
                            <span className="text-[10px] italic text-muted-foreground/50 p-1.5">Chưa có API Endpoint</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Workspace (70% width or columns 2+3 combined) */}
            <div className="lg:col-span-9 flex flex-col">

              {/* A. EDITING OVERVIEW DOCUMENT */}
              {editingOverview && (
                <div className="p-6 flex flex-col gap-6 flex-1">
                  <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div>
                      <h2 className="text-base font-bold text-foreground">
                        {editingOverview.isNew ? "Thêm tài liệu hướng dẫn mới" : "Chỉnh sửa tài liệu hướng dẫn"}
                      </h2>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingOverview(null)}>Hủy</Button>
                      <Button variant="vanixjnk" size="sm" onClick={handleSaveOverview}>Lưu tài liệu</Button>
                    </div>
                  </div>

                  <div className="flex gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-fit">
                    <button
                      onClick={() => setOverviewTab("content")}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        overviewTab === "content" ? "bg-vanixjnk/15 text-vanixjnk border border-vanixjnk/25" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Nội dung bài viết
                    </button>
                    <button
                      onClick={() => setOverviewTab("seo")}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        overviewTab === "seo" ? "bg-vanixjnk/15 text-vanixjnk border border-vanixjnk/25" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Tối ưu SEO
                    </button>
                  </div>

                  {overviewTab === "content" ? (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Tiêu đề tài liệu</label>
                        <Input
                          value={editingOverview.title || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingOverview(prev => prev ? {
                              ...prev,
                              title: val,
                              slug: editingOverview.isNew ? slugify(val) : (prev.slug || "")
                            } : null);
                          }}
                          placeholder="Ví dụ: Hướng dẫn tích hợp tài liệu"
                          className="h-9 text-[13px]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Đường dẫn URL (Slug)</label>
                        <Input
                          value={editingOverview.slug || ""}
                          onChange={(e) => setEditingOverview(prev => prev ? { ...prev, slug: e.target.value } : null)}
                          placeholder="huong-dan-tich-hop"
                          className="h-9 text-[13px]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Mô tả ngắn</label>
                        <Textarea
                          value={editingOverview.description || ""}
                          onChange={(e) => setEditingOverview(prev => prev ? { ...prev, description: e.target.value } : null)}
                          placeholder="Mô tả ngắn về tài liệu này..."
                          className="h-16 text-[13px] resize-none"
                        />
                      </div>
                      <div className="flex items-center gap-3 py-2 border-b border-dashed border-border">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-foreground">Công khai bài viết</span>
                          <span className="text-[10px] text-muted-foreground">Hiển thị tài liệu này cho mọi người.</span>
                        </div>
                        <Switch
                          checked={editingOverview.isActive ?? true}
                          onCheckedChange={(val) => setEditingOverview(prev => prev ? { ...prev, isActive: val } : null)}
                        />
                      </div>

                      <MdxEditor
                        ref={overviewTextareaRef}
                        value={editingOverview.content || ""}
                        onChange={(val) => setEditingOverview(prev => prev ? { ...prev, content: val } : null)}
                        scope={{ editingOverview }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Meta Title</label>
                        <Input
                          value={editingOverview.metaTitle || ""}
                          onChange={(e) => setEditingOverview(prev => prev ? { ...prev, metaTitle: e.target.value } : null)}
                          placeholder="Tiêu đề SEO..."
                          className="h-9 text-[13px]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Meta Description</label>
                        <Textarea
                          value={editingOverview.metaDescription || ""}
                          onChange={(e) => setEditingOverview(prev => prev ? { ...prev, metaDescription: e.target.value } : null)}
                          placeholder="Mô tả SEO..."
                          className="h-20 text-[13px] resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Meta Keywords</label>
                        <Input
                          value={editingOverview.metaKeywords || ""}
                          onChange={(e) => setEditingOverview(prev => prev ? { ...prev, metaKeywords: e.target.value } : null)}
                          placeholder="Từ khóa SEO, ngăn cách bởi dấu phẩy..."
                          className="h-9 text-[13px]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* B. EDITING API ENDPOINT */}
              {editingEndpoint && (
                <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto max-h-[85vh]">
                  <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div>
                      <h2 className="text-base font-bold text-foreground">
                        {editingEndpoint.isNew ? "Thêm Endpoint API mới" : "Chỉnh sửa Endpoint API"}
                      </h2>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingEndpoint(null)}>Hủy</Button>
                      <Button variant="vanixjnk" size="sm" onClick={handleSaveEndpoint}>Lưu Endpoint</Button>
                    </div>
                  </div>

                  <div className="flex gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-fit">
                    <button
                      onClick={() => setEndpointTab("general")}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        endpointTab === "general" ? "bg-vanixjnk/15 text-vanixjnk border border-vanixjnk/25" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Thông tin cơ bản
                    </button>
                    <button
                      onClick={() => setEndpointTab("params")}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        endpointTab === "params" ? "bg-vanixjnk/15 text-vanixjnk border border-vanixjnk/25" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Tham số đầu vào
                    </button>
                    <button
                      onClick={() => setEndpointTab("responses")}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        endpointTab === "responses" ? "bg-vanixjnk/15 text-vanixjnk border border-vanixjnk/25" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Mẫu phản hồi
                    </button>
                  </div>

                  {endpointTab === "general" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground">Tên API</label>
                          <Input
                            value={editingEndpoint.name || ""}
                            onChange={(e) => setEditingEndpoint(prev => prev ? { ...prev, name: e.target.value } : null)}
                            placeholder="Ví dụ: Đăng nhập khách hàng"
                            className="h-9 text-[13px]"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground">Nhóm API</label>
                          <select
                            value={editingEndpoint.groupId || ""}
                            onChange={(e) => setEditingEndpoint(prev => prev ? { ...prev, groupId: e.target.value } : null)}
                            className="h-9 px-3 rounded-lg border border-border bg-background text-[13px] outline-none"
                          >
                            <option value="">-- Chọn Nhóm API --</option>
                            {groups?.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground">Phương thức HTTP</label>
                          <select
                            value={editingEndpoint.method || "GET"}
                            onChange={(e) => setEditingEndpoint(prev => prev ? { ...prev, method: e.target.value as any } : null)}
                            className="h-9 px-3 rounded-lg border border-border bg-background text-[13px] outline-none font-bold font-mono"
                          >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                          </select>
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground">Đường dẫn Path</label>
                          <Input
                            value={editingEndpoint.path || ""}
                            onChange={(e) => setEditingEndpoint(prev => prev ? { ...prev, path: e.target.value } : null)}
                            placeholder="/api/v1/auth/login"
                            className="h-9 text-[13px] font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-6 py-2 border-b border-dashed border-border">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-foreground">Công khai API</span>
                          <span className="text-[10px] text-muted-foreground">Kích hoạt đặc tả API này trên trang tài liệu.</span>
                        </div>
                        <Switch
                          checked={editingEndpoint.isActive ?? true}
                          onCheckedChange={(val) => setEditingEndpoint(prev => prev ? { ...prev, isActive: val } : null)}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Phiên bản Bản quyền Yêu cầu</label>
                        <div className="flex gap-4">
                          {["standard", "premium", "ultimate"].map(edition => {
                            const currentEditions = editingEndpoint.editionRequired || ["standard", "premium", "ultimate"];
                            const isChecked = currentEditions.includes(edition);
                            return (
                              <label key={edition} className="flex items-center gap-2 text-[13px] capitalize cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const next = e.target.checked
                                      ? [...currentEditions, edition]
                                      : currentEditions.filter(ed => ed !== edition);
                                    setEditingEndpoint(prev => prev ? { ...prev, editionRequired: next } : null);
                                  }}
                                  className="rounded border-border text-vanixjnk focus:ring-vanixjnk size-3.5"
                                />
                                <span>{edition}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Mô tả đặc tả (MDX hỗ trợ)</label>
                        <MdxEditor
                          ref={endpointTextareaRef}
                          value={editingEndpoint.description || ""}
                          onChange={(val) => setEditingEndpoint(prev => prev ? { ...prev, description: val } : null)}
                          scope={{ editingEndpoint }}
                        />
                      </div>
                    </div>
                  )}

                  {endpointTab === "params" && (
                    <div className="space-y-6">
                      {/* Headers Builder */}
                      <ParameterTableBuilder
                        title="Headers"
                        parameters={editingEndpoint.headers || []}
                        onChange={(params) => setEditingEndpoint(prev => prev ? { ...prev, headers: params } : null)}
                      />

                      {/* Query Parameters Builder */}
                      <ParameterTableBuilder
                        title="Query String Params"
                        parameters={editingEndpoint.queryParams || []}
                        onChange={(params) => setEditingEndpoint(prev => prev ? { ...prev, queryParams: params } : null)}
                      />

                      {/* Request Body Builder */}
                      {["POST", "PUT", "PATCH", "DELETE"].includes(editingEndpoint.method || "") && (
                        <ParameterTableBuilder
                          title="JSON Request Body Payload"
                          parameters={editingEndpoint.requestBody || []}
                          onChange={(params) => setEditingEndpoint(prev => prev ? { ...prev, requestBody: params } : null)}
                        />
                      )}
                    </div>
                  )}

                  {endpointTab === "responses" && (
                    <div className="space-y-4">
                      <ResponseSampleBuilder
                        responses={editingEndpoint.responses || []}
                        onChange={(responses) => setEditingEndpoint(prev => prev ? { ...prev, responses: responses } : null)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* C. VIEWER FOR OVERVIEW DOCUMENTS (Normal Reading Mode) */}
              {!editingOverview && !editingEndpoint && selectedType === "overview" && (
                <div className="p-6 md:p-8 flex-1 flex flex-col overflow-y-auto max-h-[80vh] border-b border-border/40">
                  {activeOverview ? (
                    <div className="max-w-[1000px] mx-auto w-full space-y-6">
                      <div className="flex justify-between items-start border-b border-border/80 pb-4">
                        <div>
                          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{activeOverview.title}</h1>
                          {activeOverview.description && (
                            <p className="text-sm text-muted-foreground mt-1.5">{activeOverview.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => {
                              setEditingOverview(activeOverview);
                              setEditingEndpoint(null);
                            }}
                          >
                            <Icon icon="solar:pen-2-line-duotone" />
                            <span>Sửa tài liệu</span>
                          </Button>
                        </div>
                      </div>

                      {/* MDX rendering */}
                      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground py-2">
                        <MdxRenderer content={activeOverview.content} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                      <Icon icon="solar:document-text-line-duotone" className="size-16 opacity-30 mb-2" />
                      <span>Chọn hoặc tạo tài liệu hướng dẫn ở menu bên trái.</span>
                    </div>
                  )}
                </div>
              )}

              {/* D. PLAYGROUND MODE & SPEC (Normal API mode) */}
              {!editingOverview && !editingEndpoint && selectedType === "endpoint" && (
                <div className="grid grid-cols-1 md:grid-cols-12 flex-1 border-b border-border/60">
                  
                  {/* Column 2: Spec Details (40% width -> span 7) */}
                  <div className="md:col-span-7 p-6 border-b md:border-b-0 md:border-r border-border/60 overflow-y-auto max-h-[80vh]">
                    {activeEndpoint ? (
                      <div className="space-y-6">
                        {/* Endpoint Path & Title */}
                        <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
                          <div className="space-y-2">
                            <h2 className="text-lg font-bold text-foreground">{activeEndpoint.name}</h2>
                            <div className="flex flex-wrap items-center gap-2.5">
                              <Badge className={cn(
                                "font-extrabold font-mono text-xs px-2.5 py-0.5",
                                activeEndpoint.method === "GET" && "bg-green-500/10 text-green-500 border border-green-500/25",
                                activeEndpoint.method === "POST" && "bg-blue-500/10 text-blue-500 border border-blue-500/25",
                                activeEndpoint.method === "PUT" && "bg-yellow-500/10 text-yellow-500 border border-yellow-500/25",
                                activeEndpoint.method === "DELETE" && "bg-red-500/10 text-red-500 border border-red-500/25",
                                activeEndpoint.method === "PATCH" && "bg-purple-500/10 text-purple-500 border border-purple-500/25",
                              )}>
                                {activeEndpoint.method}
                              </Badge>
                              <span className="text-[13px] font-mono text-foreground font-bold">{activeEndpoint.path}</span>
                            </div>
                            <div className="flex gap-1.5 mt-2">
                              {activeEndpoint.editionRequired.map(ed => (
                                <Badge key={ed} variant="outline" className="text-[9px] capitalize px-1.5 py-0">Edition: {ed}</Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingEndpoint(activeEndpoint);
                              setEditingOverview(null);
                            }}
                          >
                            <Icon icon="solar:pen-2-line-duotone" className="size-4 mr-1.5" />
                            <span>Sửa API</span>
                          </Button>
                        </div>

                        {/* MDX Spec description */}
                        <div className="prose prose-sm dark:prose-invert max-w-none border-b border-border/40 pb-4">
                          <MdxRenderer content={activeEndpoint.description} />
                        </div>

                        {/* Table of Headers */}
                        {activeEndpoint.headers && activeEndpoint.headers.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <Icon icon="solar:shield-keyhole-line-duotone" className="text-vanixjnk text-base" />
                              Custom Headers
                            </h3>
                            <div className="border border-border/60 rounded-xl overflow-hidden">
                              <table className="w-full border-collapse text-left text-[12px]">
                                <thead className="bg-muted/30 border-b border-border/60">
                                  <tr>
                                    <th className="p-2.5 font-bold text-muted-foreground w-1/3">Tham số</th>
                                    <th className="p-2.5 font-bold text-muted-foreground w-1/6">Kiểu</th>
                                    <th className="p-2.5 font-bold text-muted-foreground w-1/2">Mô tả</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                  {activeEndpoint.headers.map(h => (
                                    <tr key={h.name}>
                                      <td className="p-2.5 font-mono font-bold text-foreground">
                                        {h.name} {h.required && <span className="text-red-500">*</span>}
                                      </td>
                                      <td className="p-2.5 text-muted-foreground capitalize">{h.type}</td>
                                      <td className="p-2.5 text-muted-foreground leading-relaxed">{h.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Table of Query String */}
                        {activeEndpoint.queryParams && activeEndpoint.queryParams.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <Icon icon="solar:link-broken-line-duotone" className="text-vanixjnk text-base" />
                              Query String Parameters
                            </h3>
                            <div className="border border-border/60 rounded-xl overflow-hidden">
                              <table className="w-full border-collapse text-left text-[12px]">
                                <thead className="bg-muted/30 border-b border-border/60">
                                  <tr>
                                    <th className="p-2.5 font-bold text-muted-foreground w-1/3">Tham số</th>
                                    <th className="p-2.5 font-bold text-muted-foreground w-1/6">Kiểu</th>
                                    <th className="p-2.5 font-bold text-muted-foreground w-1/2">Mô tả</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                  {activeEndpoint.queryParams.map(q => (
                                    <tr key={q.name}>
                                      <td className="p-2.5 font-mono font-bold text-foreground">
                                        {q.name} {q.required && <span className="text-red-500">*</span>}
                                      </td>
                                      <td className="p-2.5 text-muted-foreground capitalize">{q.type}</td>
                                      <td className="p-2.5 text-muted-foreground leading-relaxed">{q.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Table of Request Body */}
                        {activeEndpoint.requestBody && activeEndpoint.requestBody.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <Icon icon="solar:box-minimalistic-line-duotone" className="text-vanixjnk text-base" />
                              JSON Request Body
                            </h3>
                            <div className="border border-border/60 rounded-xl overflow-hidden">
                              <table className="w-full border-collapse text-left text-[12px]">
                                <thead className="bg-muted/30 border-b border-border/60">
                                  <tr>
                                    <th className="p-2.5 font-bold text-muted-foreground w-1/3">Tham số</th>
                                    <th className="p-2.5 font-bold text-muted-foreground w-1/6">Kiểu</th>
                                    <th className="p-2.5 font-bold text-muted-foreground w-1/2">Mô tả</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                  {activeEndpoint.requestBody.map(p => (
                                    <tr key={p.name}>
                                      <td className="p-2.5 font-mono font-bold text-foreground">
                                        {p.name} {p.required && <span className="text-red-500">*</span>}
                                      </td>
                                      <td className="p-2.5 text-muted-foreground capitalize">{p.type}</td>
                                      <td className="p-2.5 text-muted-foreground leading-relaxed">{p.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Response Samples Block */}
                        {activeEndpoint.responses && activeEndpoint.responses.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <Icon icon="solar:server-path-line-duotone" className="text-vanixjnk text-base" />
                              Mẫu phản hồi kết quả (Sample Responses)
                            </h3>
                            {activeEndpoint.responses.map((res, idx) => (
                              <div key={idx} className="border border-border/60 rounded-xl overflow-hidden bg-card/40">
                                <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-3 py-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={res.status >= 200 && res.status < 300 ? "success" : "danger"} className="font-mono text-[10px] font-bold">
                                      {res.status}
                                    </Badge>
                                    <span className="text-muted-foreground font-semibold">{res.description}</span>
                                  </div>
                                </div>
                                <pre className="p-3 bg-muted/10 font-mono text-[11px] text-foreground overflow-x-auto leading-relaxed max-h-60">
                                  <code>{typeof res.body === "object" ? JSON.stringify(res.body, null, 2) : String(res.body)}</code>
                                </pre>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                        <Icon icon="solar:code-line-duotone" className="size-16 opacity-30 mb-2" />
                        <span>Chọn hoặc tạo API Endpoint ở menu bên trái.</span>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Playground / Test Console (30% width -> span 5) */}
                  <div className="md:col-span-5 p-6 overflow-y-auto max-h-[80vh] flex flex-col gap-5 bg-muted/5">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 border-border/60">
                      <Icon icon="solar:play-line-duotone" className="text-vanixjnk text-base" />
                      Công cụ Playground (Cross-Domain)
                    </h3>

                    {activeEndpoint ? (
                      <div className="space-y-4">
                        {/* Target Domain Input */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground">Target Domain (Khách hàng tự nhập)</label>
                          <div className="flex gap-2">
                            <div className="flex items-center bg-muted/40 border border-border/80 px-2.5 rounded-md text-[11px] text-muted-foreground select-none font-mono">
                              https://
                            </div>
                            <Input
                              value={targetDomain}
                              onChange={(e) => setTargetDomain(e.target.value)}
                              placeholder="shoprandom247.com"
                              className="h-9 text-[13px] font-mono"
                            />
                          </div>
                        </div>

                        {/* Request Headers input */}
                        {playgroundHeaders.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground flex items-center justify-between">
                              <span>HTTP Headers</span>
                              <button
                                onClick={() => setPlaygroundHeaders([...playgroundHeaders, { name: "", value: "" }])}
                                className="text-[10px] text-vanixjnk hover:underline flex items-center gap-1"
                              >
                                <Icon icon="solar:add-circle-line-duotone" /> Thêm Header
                              </button>
                            </label>
                            <div className="space-y-1.5">
                              {playgroundHeaders.map((hdr, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <Input
                                    value={hdr.name}
                                    onChange={(e) => {
                                      const next = [...playgroundHeaders];
                                      next[idx].name = e.target.value;
                                      setPlaygroundHeaders(next);
                                    }}
                                    placeholder="Authorization"
                                    className="h-8 text-[11px] font-mono w-1/3 shrink-0"
                                  />
                                  <Input
                                    value={hdr.value}
                                    onChange={(e) => {
                                      const next = [...playgroundHeaders];
                                      next[idx].value = e.target.value;
                                      setPlaygroundHeaders(next);
                                    }}
                                    placeholder="Bearer token..."
                                    className="h-8 text-[11px] font-mono flex-1"
                                  />
                                  <button
                                    onClick={() => setPlaygroundHeaders(playgroundHeaders.filter((_, i) => i !== idx))}
                                    className="text-muted-foreground hover:text-red-500"
                                  >
                                    <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Request Query Params input */}
                        {activeEndpoint.queryParams && activeEndpoint.queryParams.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground">Query Parameters</label>
                            <div className="space-y-1.5">
                              {activeEndpoint.queryParams.map(q => (
                                <div key={q.name} className="flex flex-col gap-1">
                                  <span className="text-[10px] font-mono text-muted-foreground">
                                    {q.name} ({q.type}){q.required && <span className="text-red-500">*</span>}
                                  </span>
                                  <Input
                                    value={playgroundQueryParams[q.name] || ""}
                                    onChange={(e) => setPlaygroundQueryParams({ ...playgroundQueryParams, [q.name]: e.target.value })}
                                    placeholder={q.placeholder || ""}
                                    className="h-8 text-[11px] font-mono"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Request Body Payload */}
                        {["POST", "PUT", "PATCH", "DELETE"].includes(activeEndpoint.method) && (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-foreground">JSON Request Body Payload</label>
                            <Textarea
                              value={playgroundBody}
                              onChange={(e) => setPlaygroundBody(e.target.value)}
                              placeholder="{}"
                              className="h-24 text-[11px] font-mono resize-none leading-relaxed"
                            />
                          </div>
                        )}

                        {/* Submit Button */}
                        <Button
                          variant="vanixjnk"
                          onClick={handleSendRequest}
                          disabled={playgroundLoading}
                          className="w-full gap-2 font-bold shadow-md mt-2"
                        >
                          {playgroundLoading ? (
                            <Icon icon="solar:restart-line-duotone" className="size-4 animate-spin" />
                          ) : (
                            <Icon icon="solar:play-line-duotone" className="size-4" />
                          )}
                          <span>Gửi yêu cầu API (Playground)</span>
                        </Button>

                        {/* Response Block */}
                        {playgroundResponse && (
                          <div className="border border-border/60 rounded-xl overflow-hidden bg-card/60 mt-4">
                            <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-3 py-2 text-xs">
                              <div className="flex items-center gap-2">
                                <Badge variant={playgroundResponse.status >= 200 && playgroundResponse.status < 300 ? "success" : "destructive"}>
                                  {playgroundResponse.status || "CORS ERROR"}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-mono">{playgroundResponse.time} ms</span>
                              </div>
                            </div>
                            <pre className="p-3 bg-muted/10 font-mono text-[11px] text-foreground overflow-x-auto leading-relaxed max-h-60">
                              <code>{typeof playgroundResponse.body === "object" ? JSON.stringify(playgroundResponse.body, null, 2) : String(playgroundResponse.body)}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Vui lòng chọn Endpoint API</span>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* API GROUP CREATE/EDIT DIALOG */}
      <Dialog open={editingGroup !== null} onOpenChange={(open) => !open && setEditingGroup(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGroup?.isNew ? "Tạo nhóm API mới" : "Chỉnh sửa nhóm API"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Tên nhóm API</label>
              <Input
                value={editingGroup?.name || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingGroup(prev => prev ? {
                    ...prev,
                    name: val,
                    slug: prev.isNew ? slugify(val) : (prev.slug || "")
                  } : null);
                }}
                placeholder="Ví dụ: Module Tài khoản"
                className="h-9 text-[13px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Đường dẫn nhóm (Slug)</label>
              <Input
                value={editingGroup?.slug || ""}
                onChange={(e) => setEditingGroup(prev => prev ? { ...prev, slug: e.target.value } : null)}
                placeholder="module-tai-khoan"
                className="h-9 text-[13px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Mô tả ngắn</label>
              <Textarea
                value={editingGroup?.description || ""}
                onChange={(e) => setEditingGroup(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="Mô tả nhóm API..."
                className="h-16 text-[13px] resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Số thứ tự sắp xếp</label>
              <Input
                type="number"
                value={editingGroup?.order ?? 0}
                onChange={(e) => setEditingGroup(prev => prev ? { ...prev, order: parseInt(e.target.value) || 0 } : null)}
                placeholder="0"
                className="h-9 text-[13px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setEditingGroup(null)}>Hủy</Button>
            <Button variant="vanixjnk" size="sm" onClick={handleSaveGroup}>Lưu nhóm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component builder for API parameters
function ParameterTableBuilder({
  title,
  parameters,
  onChange,
}: {
  title: string;
  parameters: ApiParameter[];
  onChange: (params: ApiParameter[]) => void;
}) {
  const handleAddParam = () => {
    const newParam: ApiParameter = {
      name: "",
      type: "string",
      required: false,
      description: "",
      placeholder: "",
    };
    onChange([...parameters, newParam]);
  };

  const handleRemoveParam = (index: number) => {
    onChange(parameters.filter((_, i) => i !== index));
  };

  const handleUpdateParam = (index: number, fields: Partial<ApiParameter>) => {
    const next = [...parameters];
    next[index] = { ...next[index], ...fields };
    onChange(next);
  };

  return (
    <div className="space-y-3 p-4 border border-border/60 rounded-xl bg-card/40">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1"
          onClick={handleAddParam}
        >
          <Icon icon="solar:add-circle-line-duotone" />
          <span>Thêm tham số</span>
        </Button>
      </div>

      {parameters.length === 0 ? (
        <span className="text-[11px] text-muted-foreground/60 italic block">Chưa định nghĩa tham số nào.</span>
      ) : (
        <div className="space-y-3">
          {parameters.map((param, idx) => (
            <div key={idx} className="flex flex-col gap-2 p-3 border border-border/40 bg-muted/10 rounded-lg relative group">
              <button
                type="button"
                onClick={() => handleRemoveParam(idx)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground">Tên tham số</span>
                  <Input
                    value={param.name}
                    onChange={(e) => handleUpdateParam(idx, { name: e.target.value })}
                    placeholder="Ví dụ: token"
                    className="h-8 text-[11px] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground">Kiểu dữ liệu</span>
                  <select
                    value={param.type}
                    onChange={(e) => handleUpdateParam(idx, { type: e.target.value as any })}
                    className="h-8 px-2 rounded border border-border bg-background text-[11px] outline-none"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="object">Object</option>
                    <option value="array">Array</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground">Mặc định</span>
                  <Input
                    value={param.defaultValue !== undefined ? String(param.defaultValue) : ""}
                    onChange={(e) => handleUpdateParam(idx, { defaultValue: e.target.value })}
                    placeholder="Ví dụ: 10"
                    className="h-8 text-[11px] font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    checked={param.required}
                    onChange={(e) => handleUpdateParam(idx, { required: e.target.checked })}
                    className="rounded border-border text-vanixjnk focus:ring-vanixjnk size-3.5"
                    id={`req-${idx}`}
                  />
                  <label htmlFor={`req-${idx}`} className="text-[11px] font-bold text-foreground cursor-pointer select-none">Bắt buộc</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground">Mô tả chi tiết</span>
                  <Input
                    value={param.description}
                    onChange={(e) => handleUpdateParam(idx, { description: e.target.value })}
                    placeholder="Mô tả công dụng của tham số..."
                    className="h-8 text-[11px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground">Placeholder</span>
                  <Input
                    value={param.placeholder || ""}
                    onChange={(e) => handleUpdateParam(idx, { placeholder: e.target.value })}
                    placeholder="Gợi ý nhập..."
                    className="h-8 text-[11px]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-component builder for API responses sample list
function ResponseSampleBuilder({
  responses,
  onChange,
}: {
  responses: ApiResponseSample[];
  onChange: (responses: ApiResponseSample[]) => void;
}) {
  const handleAddResponse = () => {
    const newRes: ApiResponseSample = {
      status: 200,
      description: "Thành công",
      body: JSON.stringify({ success: true, data: {} }, null, 2),
    };
    onChange([...responses, newRes]);
  };

  const handleRemoveResponse = (index: number) => {
    onChange(responses.filter((_, i) => i !== index));
  };

  const handleUpdateResponse = (index: number, fields: Partial<ApiResponseSample>) => {
    const next = [...responses];
    next[index] = { ...next[index], ...fields };
    onChange(next);
  };

  return (
    <div className="space-y-3 p-4 border border-border/60 rounded-xl bg-card/40">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Mẫu phản hồi kết quả (Responses)</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1"
          onClick={handleAddResponse}
        >
          <Icon icon="solar:add-circle-line-duotone" />
          <span>Thêm kết quả mẫu</span>
        </Button>
      </div>

      {responses.length === 0 ? (
        <span className="text-[11px] text-muted-foreground/60 italic block">Chưa định nghĩa mẫu phản hồi nào.</span>
      ) : (
        <div className="space-y-3">
          {responses.map((res, idx) => {
            const bodyStr = typeof res.body === "object" ? JSON.stringify(res.body, null, 2) : String(res.body);
            return (
              <div key={idx} className="flex flex-col gap-2.5 p-3 border border-border/40 bg-muted/10 rounded-lg relative group">
                <button
                  type="button"
                  onClick={() => handleRemoveResponse(idx)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground">HTTP Status</span>
                    <Input
                      type="number"
                      value={res.status}
                      onChange={(e) => handleUpdateResponse(idx, { status: parseInt(e.target.value) || 200 })}
                      placeholder="200"
                      className="h-8 text-[11px]"
                    />
                  </div>
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground">Mô tả</span>
                    <Input
                      value={res.description}
                      onChange={(e) => handleUpdateResponse(idx, { description: e.target.value })}
                      placeholder="Ví dụ: Trả về thông tin đăng nhập thành công"
                      className="h-8 text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground">JSON Body Sample (Payload)</span>
                  <Textarea
                    value={bodyStr}
                    onChange={(e) => {
                      const val = e.target.value;
                      try {
                        const parsed = JSON.parse(val);
                        handleUpdateResponse(idx, { body: parsed });
                      } catch {
                        handleUpdateResponse(idx, { body: val });
                      }
                    }}
                    placeholder='{"success": true}'
                    className="h-32 text-[11px] font-mono resize-none leading-relaxed"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
