"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { GalleryDialog } from "@/components/vanixjnk/gallery-dialog";
import { toast } from "sonner";
import { MdxEditor, UI_COMPONENTS_TEMPLATES, insertMdxAtCursor } from "@/components/vanixjnk/mdx-builder";
import { cn } from "@/lib/utils";
import { type ApiParameter, type ApiResponseSample } from "@/server/db/schemas/api.schema";

interface EndpointEditorProps {
  mode: "create" | "edit";
  initialId?: string;
}

export default function EndpointEditor({ mode, initialId }: EndpointEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiTypeFromUrl = searchParams.get("apiType") || "";

  const [mounted, setMounted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"general" | "params" | "responses">("general");
  const [galleryOpen, setGalleryOpen] = useState(false);

  const [formData, setFormData] = useState({
    groupId: "",
    name: "",
    method: "GET" as "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    path: "",
    description: "",
    headers: [] as ApiParameter[],
    queryParams: [] as ApiParameter[],
    requestBody: [] as ApiParameter[],
    responses: [] as ApiResponseSample[],
    isActive: true,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: groups = [], isLoading: isLoadingGroups } =
    trpc.administrator.apiDocs.getGroupsWithEndpoints.useQuery(
      apiTypeFromUrl ? { apiType: apiTypeFromUrl } : undefined,
      { refetchOnWindowFocus: false }
    );

  const { data: endpoint, isLoading: isLoadingEndpoint } =
    trpc.administrator.apiDocs.getEndpointById.useQuery(
      { id: initialId! },
      {
        enabled: mode === "edit" && !!initialId,
        refetchOnWindowFocus: false,
      }
    );

  useEffect(() => {
    if (mode === "edit" && endpoint) {
      setFormData({
        groupId: endpoint.groupId,
        name: endpoint.name,
        method: endpoint.method as any,
        path: endpoint.path,
        description: endpoint.description,
        headers: endpoint.headers || [],
        queryParams: endpoint.queryParams || [],
        requestBody: endpoint.requestBody || [],
        responses: endpoint.responses || [],
        isActive: endpoint.isActive,
      });
    }
  }, [endpoint, mode]);

  useEffect(() => {
    if (mode === "create" && groups.length > 0 && !formData.groupId) {
      setFormData((prev) => ({ ...prev, groupId: groups[0].id }));
    }
  }, [groups, mode, formData.groupId]);

  const upsertEndpointMutation = trpc.administrator.apiDocs.upsertEndpoint.useMutation();

  const insertAtCursor = (textToInsert: string) => {
    insertMdxAtCursor(textareaRef.current, textToInsert, formData.description || "", (val) => {
      setFormData((prev) => ({ ...prev, description: val }));
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên API");
      return;
    }
    if (!formData.groupId) {
      toast.error("Vui lòng chọn nhóm API");
      return;
    }
    if (!formData.path.trim()) {
      toast.error("Vui lòng nhập đường dẫn API");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Nội dung mô tả API không được để trống");
      return;
    }

    try {
      await upsertEndpointMutation.mutateAsync({
        id: mode === "edit" ? initialId : undefined,
        groupId: formData.groupId,
        name: formData.name,
        method: formData.method,
        path: formData.path,
        description: formData.description,
        headers: formData.headers,
        queryParams: formData.queryParams,
        requestBody: formData.requestBody,
        responses: formData.responses,
        isActive: formData.isActive,
      });

      toast.success(mode === "create" ? "Đã tạo API Endpoint mới thành công!" : "Đã cập nhật API Endpoint thành công!");
      router.push("/adminPanel/docs");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu API Endpoint");
    }
  };

  if (!mounted || (mode === "edit" && isLoadingEndpoint) || isLoadingGroups) {
    return (
      <div className="flex flex-col w-full flex-1">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                  <Icon icon="solar:document-text-line-duotone" className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">API Endpoints</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Quản lý các tài liệu kỹ thuật, danh mục API, API Endpoints và các phiên bản sản phẩm/API.
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

        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
          <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-40 animate-pulse" />
                  <Skeleton className="h-3 w-60 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Skeleton className="h-8 w-14 animate-pulse" />
                <Skeleton className="h-8 w-28 animate-pulse" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-fit whitespace-nowrap">
              <Skeleton className="h-8 w-32 rounded-lg animate-pulse" />
              <Skeleton className="h-8 w-32 rounded-lg animate-pulse" />
              <Skeleton className="h-8 w-32 rounded-lg animate-pulse" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-9 space-y-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-24 animate-pulse" />
                      <Skeleton className="h-9 w-full animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-24 animate-pulse" />
                      <Skeleton className="h-9 w-full animate-pulse" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-24 animate-pulse" />
                      <Skeleton className="h-9 w-full animate-pulse" />
                    </div>
                    <div className="col-span-2 flex flex-col gap-2">
                      <Skeleton className="h-4 w-24 animate-pulse" />
                      <Skeleton className="h-9 w-full animate-pulse" />
                    </div>
                  </div>

                  <div className="border border-border/60 rounded-xl overflow-hidden bg-background space-y-2">
                    <div className="flex items-center justify-between border-b border-border/80 bg-muted/10 p-2">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-6 w-6 rounded animate-pulse" />
                        <Skeleton className="h-6 w-6 rounded animate-pulse" />
                        <Skeleton className="h-6 w-6 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-[90%] animate-pulse" />
                      <Skeleton className="h-4 w-[80%] animate-pulse" />
                      <Skeleton className="h-4 w-[50%] animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                  <Skeleton className="h-4 w-28 animate-pulse border-b pb-2" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 animate-pulse" />
                    <Skeleton className="h-6 w-10 rounded-full animate-pulse" />
                  </div>
                </div>

                <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                  <Skeleton className="h-4 w-36 animate-pulse border-b pb-2" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 animate-pulse" />
                    <Skeleton className="h-4 w-24 animate-pulse" />
                    <Skeleton className="h-4 w-24 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:document-text-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">API Endpoints</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý các tài liệu kỹ thuật, danh mục API, API Endpoints và các phiên bản sản phẩm/API.
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

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/adminPanel/docs")}
                className="size-8 rounded-lg p-0 shrink-0"
                title="Quay lại danh sách"
              >
                <Icon icon="solar:arrow-left-line-duotone" className="size-5" />
              </Button>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {mode === "edit" ? "Chỉnh sửa API Endpoint" : "Tạo API Endpoint mới"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {mode === "edit" ? `Đang chỉnh sửa API: ${formData.name}` : "Điền thông tin và cấu hình API Endpoint mới."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/adminPanel/docs")}
                className="text-xs font-semibold"
              >
                Hủy
              </Button>
              <Button
                variant="vanixjnk"
                size="sm"
                onClick={handleSave}
                disabled={upsertEndpointMutation.isPending}
                className="gap-1.5 font-bold shadow-md text-xs"
              >
                {upsertEndpointMutation.isPending ? (
                  <Icon icon="solar:restart-line-duotone" className="size-4 animate-spin" />
                ) : (
                  <Icon icon="solar:diskette-line-duotone" className="size-4" />
                )}
                <span>Lưu API Endpoint</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-full sm:w-auto sm:self-start whitespace-nowrap overflow-x-auto">
            <button
              onClick={() => setActiveSubTab("general")}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                activeSubTab === "general"
                  ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                  : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Icon icon="solar:info-circle-line-duotone" className="size-4" />
              <span>Thông tin cơ bản</span>
            </button>
            <button
              onClick={() => setActiveSubTab("params")}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                activeSubTab === "params"
                  ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                  : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Icon icon="solar:programming-line-duotone" className="size-4" />
              <span>Tham số đầu vào</span>
            </button>
            <button
              onClick={() => setActiveSubTab("responses")}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                activeSubTab === "responses"
                  ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                  : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Icon icon="solar:mailbox-line-duotone" className="size-4" />
              <span>Phản hồi mẫu (Responses)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-9 space-y-6">
              {activeSubTab === "general" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Tên API</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Ví dụ: Lấy danh sách sản phẩm"
                        className="h-9 text-[13px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Nhóm API trực thuộc</label>
                      <Select
                        value={formData.groupId}
                        onValueChange={(val) => setFormData((prev) => ({ ...prev, groupId: val }))}
                      >
                        <SelectTrigger className="h-9 w-full bg-background border-border text-[13px]">
                          <SelectValue placeholder="Chọn nhóm API..." />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map((g) => (
                            <SelectItem key={g.id} value={g.id} className="text-xs">
                              {g.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">HTTP Method</label>
                      <Select
                        value={formData.method}
                        onValueChange={(val: any) => setFormData((prev) => ({ ...prev, method: val }))}
                      >
                        <SelectTrigger className="h-9 w-full bg-background border-border font-mono font-bold text-[13px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="font-mono">
                          {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
                            <SelectItem key={m} value={m} className="font-bold font-mono text-xs">
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Đường dẫn API (Path)</label>
                      <Input
                        value={formData.path}
                        onChange={(e) => setFormData((prev) => ({ ...prev, path: e.target.value }))}
                        placeholder="Ví dụ: /api/v1/store/products"
                        className="h-9 text-[13px]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Mô tả đặc tả API (Markdown / MDX)</label>
                    <MdxEditor
                      ref={textareaRef}
                      value={formData.description}
                      onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
                      onOpenGallery={() => {
                        setGalleryOpen(true);
                      }}
                      scope={{}}
                    />
                  </div>
                </div>
              )}
              {activeSubTab === "params" && (
                <div className="space-y-6">
                  <ParameterTableBuilder
                    title="HTTP Request Headers"
                    parameters={formData.headers}
                    onChange={(val) => setFormData((prev) => ({ ...prev, headers: val }))}
                  />

                  <ParameterTableBuilder
                    title="URL Query String Parameters"
                    parameters={formData.queryParams}
                    onChange={(val) => setFormData((prev) => ({ ...prev, queryParams: val }))}
                  />

                  {["POST", "PUT", "PATCH", "DELETE"].includes(formData.method) && (
                    <ParameterTableBuilder
                      title="JSON Request Body Fields"
                      parameters={formData.requestBody}
                      onChange={(val) => setFormData((prev) => ({ ...prev, requestBody: val }))}
                    />
                  )}
                </div>
              )}
              {activeSubTab === "responses" && (
                <div className="space-y-4">
                  <ResponseSampleBuilder
                    responses={formData.responses}
                    onChange={(val) => setFormData((prev) => ({ ...prev, responses: val }))}
                  />
                </div>
              )}
            </div>
            <div className="lg:col-span-3 space-y-6">
              <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b pb-2 border-border/60">
                  <Icon icon="solar:settings-line-duotone" className="size-4 text-vanixjnk" />
                  Cấu hình hoạt động
                </h4>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-bold text-foreground">Kích hoạt API</span>
                    <span className="text-[10px] text-muted-foreground">Hiển thị đặc tả này</span>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(val) => setFormData((prev) => ({ ...prev, isActive: val }))}
                  />
                </div>
              </div>
              {activeSubTab === "general" && (
                <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                  <div className="flex flex-col gap-0.5 border-b pb-2 border-border/60">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Icon icon="solar:widget-add-line-duotone" className="size-4 text-vanixjnk" />
                      Thành phần UI (MDX & Shadcn)
                    </h4>
                    <span className="text-[10px] text-muted-foreground">Click để chèn nhanh component tại con trỏ</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {UI_COMPONENTS_TEMPLATES.map((comp) => (
                      <button
                        key={`side-${comp.name}`}
                        type="button"
                        onClick={() => insertAtCursor(comp.template)}
                        className="flex flex-col items-start gap-1 p-2 rounded-lg bg-background border border-border/60 hover:border-vanixjnk/40 hover:bg-vanixjnk/5 transition-all duration-200 group text-left w-full shadow-2xs"
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          <div className="size-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-vanixjnk/10 group-hover:text-vanixjnk transition-colors shrink-0">
                            <Icon icon={comp.icon} className="size-4" />
                          </div>
                          <span className="text-[11px] font-bold text-foreground group-hover:text-vanixjnk transition-colors truncate">
                            {comp.name}
                          </span>
                        </div>
                        <span className="text-[9px] text-muted-foreground line-clamp-1">
                          {comp.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <GalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={(url) => {
          insertAtCursor(`\n![Hình ảnh](${url})\n`);
          setGalleryOpen(false);
          toast.success("Đã chèn ảnh vào văn bản thành công!");
        }}
      />
    </div>
  );
}
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
    <div className="space-y-3 p-4 border border-border/60 rounded-2xl bg-muted/5">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h4 className="text-xs font-extrabold text-foreground/95 uppercase tracking-wider font-mono">{title}</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[10px] gap-1 font-bold"
          onClick={handleAddParam}
        >
          <Icon icon="solar:add-circle-line-duotone" />
          <span>Thêm tham số</span>
        </Button>
      </div>

      {parameters.length === 0 ? (
        <span className="text-[11px] text-muted-foreground/60 italic block py-2">Chưa định nghĩa tham số nào.</span>
      ) : (
        <div className="space-y-4">
          {parameters.map((param, idx) => (
            <div key={idx} className="flex flex-col gap-3 p-3.5 border border-border/60 bg-card/30 rounded-xl relative group">
              <button
                type="button"
                onClick={() => handleRemoveParam(idx)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-4 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground">Tên tham số</span>
                  <Input
                    value={param.name}
                    onChange={(e) => handleUpdateParam(idx, { name: e.target.value })}
                    placeholder="Ví dụ: authorization"
                    className="h-8 text-[11px] font-mono"
                  />
                </div>
                <div className="md:col-span-3 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground">Kiểu dữ liệu</span>
                  <Select
                    value={param.type}
                    onValueChange={(val: any) => handleUpdateParam(idx, { type: val })}
                  >
                    <SelectTrigger className="h-8 bg-background border-border text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["string", "number", "boolean", "object", "array"].map((t) => (
                        <SelectItem key={t} value={t} className="text-xs font-mono">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3 flex items-center gap-2 pt-4">
                  <Checkbox
                    id={`req-${title}-${idx}`}
                    checked={param.required}
                    onCheckedChange={(checked) => handleUpdateParam(idx, { required: !!checked })}
                  />
                  <label htmlFor={`req-${title}-${idx}`} className="text-[11px] font-bold text-foreground/80 cursor-pointer select-none">
                    Bắt buộc (Required)
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground">Mô tả chi tiết</span>
                  <Input
                    value={param.description || ""}
                    onChange={(e) => handleUpdateParam(idx, { description: e.target.value })}
                    placeholder="Mô tả ý nghĩa của tham số..."
                    className="h-8 text-[11px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground">Placeholder</span>
                  <Input
                    value={param.placeholder || ""}
                    onChange={(e) => handleUpdateParam(idx, { placeholder: e.target.value })}
                    placeholder="Ví dụ: Bearer ..."
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
    <div className="space-y-3 p-4 border border-border/60 rounded-2xl bg-muted/5">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h4 className="text-xs font-extrabold text-foreground/95 uppercase tracking-wider font-mono">Mẫu phản hồi kết quả</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[10px] gap-1 font-bold"
          onClick={handleAddResponse}
        >
          <Icon icon="solar:add-circle-line-duotone" />
          <span>Thêm kết quả mẫu</span>
        </Button>
      </div>

      {responses.length === 0 ? (
        <span className="text-[11px] text-muted-foreground/60 italic block py-2">Chưa định nghĩa mẫu phản hồi nào.</span>
      ) : (
        <div className="space-y-4">
          {responses.map((res, idx) => {
            const bodyStr = typeof res.body === "object" ? JSON.stringify(res.body, null, 2) : String(res.body);
            return (
              <div key={idx} className="flex flex-col gap-3 p-3.5 border border-border/60 bg-card/30 rounded-xl relative group">
                <button
                  type="button"
                  onClick={() => handleRemoveResponse(idx)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                    <span className="text-[10px] font-bold text-muted-foreground">Mô tả kết quả</span>
                    <Input
                      value={res.description}
                      onChange={(e) => handleUpdateResponse(idx, { description: e.target.value })}
                      placeholder="Ví dụ: Thành công"
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
                    className="h-36 text-[11px] font-mono resize-y leading-relaxed"
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
