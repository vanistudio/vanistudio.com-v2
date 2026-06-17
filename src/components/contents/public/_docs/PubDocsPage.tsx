"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MdxRenderer } from "@/components/vanixjnk/mdx-builder";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
}

interface ApiParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  description: string;
  placeholder?: string;
  defaultValue?: any;
}

interface ApiResponseSample {
  status: number;
  description: string;
  body: any;
}

interface PubDocsPageProps {
  initialProducts: ApiProduct[];
  currentProductSlug?: string;
}

export default function PubDocsPage({ initialProducts, currentProductSlug }: PubDocsPageProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>(
    currentProductSlug || initialProducts[0]?.slug || ""
  );

  // Sync selected product slug if prop changes
  useEffect(() => {
    if (currentProductSlug) {
      setSelectedProductSlug(currentProductSlug);
    }
  }, [currentProductSlug]);

  const currentProduct = useMemo(() => {
    return initialProducts.find((p) => p.slug === selectedProductSlug);
  }, [initialProducts, selectedProductSlug]);
  
  // Navigation states
  const [activeDocType, setActiveDocType] = useState<"overview" | "endpoint">("overview");
  const [selectedOverviewSlug, setSelectedOverviewSlug] = useState<string>("");
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("");

  // Search states (debounced)
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Sub-tabs for endpoint view
  const [activeSubTab, setActiveSubTab] = useState<"spec" | "playground">("spec");

  // Playground execution states
  const [targetDomain, setTargetDomain] = useState("shoprandom247.com");
  const [playgroundHeaders, setPlaygroundHeaders] = useState<Array<{ name: string; value: string }>>([]);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search logic (exactly 300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Queries using publicApiDocsRouter
  const { data: overviews = [], isLoading: isLoadingOverviews } =
    trpc.apiDocs.getOverviews.useQuery(
      { apiType: selectedProductSlug },
      { enabled: !!selectedProductSlug, refetchOnWindowFocus: false }
    );

  const { data: groupsWithEndpoints = [], isLoading: isLoadingGroups } =
    trpc.apiDocs.getGroupsWithEndpoints.useQuery(
      { apiType: selectedProductSlug },
      { enabled: !!selectedProductSlug, refetchOnWindowFocus: false }
    );

  const { data: endpointDetails, isLoading: isLoadingEndpointDetails } =
    trpc.apiDocs.getEndpointById.useQuery(
      { id: selectedEndpointId },
      { enabled: activeDocType === "endpoint" && !!selectedEndpointId, refetchOnWindowFocus: false }
    );

  // Default selection when product changes or overviews loaded
  useEffect(() => {
    if (overviews.length > 0) {
      setSelectedOverviewSlug(overviews[0].slug);
      setActiveDocType("overview");
    } else {
      // Find first group with endpoints
      const firstGroupWithEndpoints = groupsWithEndpoints.find(g => g.endpoints && g.endpoints.length > 0);
      if (firstGroupWithEndpoints && firstGroupWithEndpoints.endpoints.length > 0) {
        setSelectedEndpointId(firstGroupWithEndpoints.endpoints[0].id);
        setActiveDocType("endpoint");
      }
    }
  }, [selectedProductSlug, overviews, groupsWithEndpoints]);

  // Sync playground forms when endpoint changes
  useEffect(() => {
    if (endpointDetails) {
      const defaultHeaders = [
        { name: "Content-Type", value: "application/json" },
        ...(endpointDetails.headers || []).map((h: ApiParameter) => ({
          name: h.name,
          value: h.defaultValue ? String(h.defaultValue) : ""
        }))
      ];
      setPlaygroundHeaders(defaultHeaders);

      const defaultQueryParams: Record<string, string> = {};
      (endpointDetails.queryParams || []).forEach((q: ApiParameter) => {
        defaultQueryParams[q.name] = q.defaultValue ? String(q.defaultValue) : "";
      });
      setPlaygroundQueryParams(defaultQueryParams);

      if (endpointDetails.requestBody && endpointDetails.requestBody.length > 0) {
        const bodyObj: Record<string, any> = {};
        endpointDetails.requestBody.forEach((p: ApiParameter) => {
          bodyObj[p.name] = p.defaultValue !== undefined ? p.defaultValue : (p.type === "number" ? 0 : (p.type === "boolean" ? false : ""));
        });
        setPlaygroundBody(JSON.stringify(bodyObj, null, 2));
      } else {
        setPlaygroundBody("");
      }
      setPlaygroundResponse(null);
    }
  }, [endpointDetails]);

  // Filter groups and endpoints based on search query
  const filteredGroups = useMemo(() => {
    if (!debouncedSearch.trim()) return groupsWithEndpoints;
    return groupsWithEndpoints
      .map(group => ({
        ...group,
        endpoints: (group.endpoints || []).filter(
          ep =>
            ep.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            ep.path.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
      }))
      .filter(group => group.endpoints.length > 0);
  }, [groupsWithEndpoints, debouncedSearch]);

  const filteredOverviews = useMemo(() => {
    if (!debouncedSearch.trim()) return overviews;
    return overviews.filter(ov =>
      ov.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (ov.description && ov.description.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );
  }, [overviews, debouncedSearch]);

  const activeOverview = useMemo(() => {
    if (activeDocType !== "overview") return null;
    return overviews.find(ov => ov.slug === selectedOverviewSlug) || null;
  }, [activeDocType, overviews, selectedOverviewSlug]);

  const handleSendRequest = async () => {
    if (!endpointDetails) return;
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);

    const protocol = targetDomain.startsWith("http://") || targetDomain.startsWith("https://") ? "" : "https://";
    const cleanDomain = targetDomain.replace(/\/$/, "");
    const cleanPath = endpointDetails.path.startsWith("/") ? endpointDetails.path : `/${endpointDetails.path}`;
    const queryPairs = Object.entries(playgroundQueryParams)
      .filter(([_, v]) => v.trim() !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    
    const url = `${protocol}${cleanDomain}${cleanPath}${queryPairs ? `?${queryPairs}` : ""}`;
    const headersObj: Record<string, string> = {};
    playgroundHeaders
      .filter(h => h.name.trim() !== "")
      .forEach(h => {
        headersObj[h.name] = h.value;
      });

    const startTime = performance.now();
    try {
      const response = await fetch(url, {
        method: endpointDetails.method,
        headers: headersObj,
        body: ["POST", "PUT", "PATCH", "DELETE"].includes(endpointDetails.method) && playgroundBody
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
          tip: "Vui lòng cấu hình CORS trên máy chủ của bạn (Allow Origin: https://vanistudio.com) hoặc thử một tên miền khác."
        },
      });
    } finally {
      setPlaygroundLoading(false);
    }
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25";
      case "POST":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/25";
      case "PUT":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/25";
      case "DELETE":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/25";
      case "PATCH":
        return "bg-purple-500/10 text-purple-500 border border-purple-500/25";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  const handleCopyPath = (pathText: string) => {
    navigator.clipboard.writeText(pathText);
    toast.success("Đã sao chép đường dẫn API!");
  };

  if (!mounted) {
    return (
      <div className="flex flex-col w-full flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full flex-1">
      {/* 1. Header Section */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="flex items-center justify-center size-9 rounded-lg border border-border bg-muted/40 hover:bg-muted transition-colors shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Quay lại danh sách tài liệu"
            >
              <Icon icon="solar:arrow-left-line-duotone" className="text-xl" />
            </Link>
            <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
              <Icon icon="solar:document-text-line-duotone" className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {currentProduct?.name || "Tài liệu Tích hợp API"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {currentProduct?.description || "Đọc tài liệu, đặc tả tham số và thử nghiệm chạy API trực tuyến."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Diagonal Stripe Divider */}
      <div
        className="relative w-full border-t border-b border-dashed border-primary/20 overflow-hidden text-primary/20"
        style={{ height: "36px" }}
      >
        <div
          className="absolute inset-y-0 left-[-100vw] w-[300vw]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)",
          }}
        />
      </div>

      {/* 3. Main Content Split Pane */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start grow">
            
            {/* LEFT SIDEBAR NAVIGATION */}
            <aside className="lg:col-span-3 flex flex-col gap-4 self-stretch border-r border-dashed border-primary/10 pr-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground z-10">
                  <Icon icon="solar:magnifer-line-duotone" className="size-4" />
                </span>
                <Input
                  type="text"
                  placeholder="Tìm kiếm tài liệu & API..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-8 text-[13px]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground"
                    title="Xóa tìm kiếm"
                  >
                    <Icon icon="solar:close-circle-line-duotone" className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 pr-1 max-h-[70vh]">
                {/* 1. Overviews Group */}
                {filteredOverviews.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2.5">
                      Hướng dẫn chung
                    </h3>
                    <div className="flex flex-col gap-0.5">
                      {filteredOverviews.map((ov) => {
                        const isSelected = activeDocType === "overview" && selectedOverviewSlug === ov.slug;
                        return (
                          <button
                            key={ov.id}
                            onClick={() => {
                              setActiveDocType("overview");
                              setSelectedOverviewSlug(ov.slug);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-left transition-all duration-200 cursor-pointer",
                              isSelected
                                ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk font-semibold"
                                : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                            )}
                          >
                            <Icon icon="solar:document-text-line-duotone" className="size-4 shrink-0" />
                            <span className="truncate">{ov.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. API Groups */}
                {isLoadingGroups ? (
                  <div className="space-y-3 px-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-8 w-full rounded-lg" />
                    <Skeleton className="h-8 w-full rounded-lg" />
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground/60 italic">
                    Không tìm thấy API nào khớp
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <div key={group.id} className="space-y-1.5">
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2.5 truncate" title={group.name}>
                        {group.name}
                      </h3>
                      <div className="flex flex-col gap-0.5">
                        {group.endpoints.map((ep) => {
                          const isSelected = activeDocType === "endpoint" && selectedEndpointId === ep.id;
                          return (
                            <button
                              key={ep.id}
                              onClick={() => {
                                setActiveDocType("endpoint");
                                setSelectedEndpointId(ep.id);
                              }}
                              className={cn(
                                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-200 cursor-pointer border",
                                isSelected
                                  ? "bg-vanixjnk/10 border-vanixjnk/25 text-vanixjnk font-bold"
                                  : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                              )}
                            >
                              <span className={cn(
                                "text-[9px] font-black tracking-wide uppercase px-1 rounded-sm font-mono scale-90 shrink-0",
                                isSelected ? "bg-vanixjnk/15 border border-vanixjnk/20" : getMethodBadgeClass(ep.method)
                              )}>
                                {ep.method}
                              </span>
                              <span className="text-[12.5px] truncate grow">{ep.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>

            {/* RIGHT DETAIL CONTENT AREA */}
            <main className="lg:col-span-9 flex flex-col gap-6 self-stretch overflow-y-auto max-h-[78vh] pr-1">
              {/* OVERVIEW CONTENT VIEW */}
              {activeDocType === "overview" && (
                <>
                  {isLoadingOverviews ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-72" />
                      <Skeleton className="h-4 w-96" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  ) : activeOverview ? (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="border-b border-border/60 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="border-vanixjnk/30 text-vanixjnk bg-vanixjnk/5 text-[10px] font-bold">
                            Tài liệu hướng dẫn
                          </Badge>
                        </div>
                        <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                          {activeOverview.title}
                        </h2>
                        {activeOverview.description && (
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            {activeOverview.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:tracking-tight">
                        <MdxRenderer content={activeOverview.content} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                      <div className="size-14 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
                        <Icon icon="solar:document-text-line-duotone" className="text-2xl" />
                      </div>
                      <span className="text-xs text-muted-foreground/60 italic">Vui lòng chọn một tài liệu ở thanh bên.</span>
                    </div>
                  )}
                </>
              )}

              {/* API ENDPOINT VIEW */}
              {activeDocType === "endpoint" && (
                <>
                  {isLoadingEndpointDetails ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-80" />
                      </div>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-48 w-full" />
                    </div>
                  ) : endpointDetails ? (
                    <div className="space-y-6 animate-fadeIn">
                      {/* API Header & Path */}
                      <div className="border-b border-border/60 pb-4 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded text-[11px] font-black uppercase border font-mono tracking-wide shadow-2xs",
                            getMethodBadgeClass(endpointDetails.method)
                          )}>
                            {endpointDetails.method}
                          </span>
                          <div className="flex items-center gap-1.5 bg-muted/30 border border-border/80 rounded-lg pl-3 pr-1 py-0.5 font-mono text-xs select-all w-full sm:w-auto mt-1 sm:mt-0">
                            <span className="text-muted-foreground/60 select-none">https://domain.com</span>
                            <span className="text-foreground/85 font-semibold">{endpointDetails.path}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyPath(endpointDetails.path)}
                              className="size-6 p-0 hover:bg-muted ml-2 cursor-pointer"
                              title="Copy path"
                            >
                              <Icon icon="solar:copy-line-duotone" className="size-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                        <h2 className="text-lg font-bold text-foreground mt-2">{endpointDetails.name}</h2>
                      </div>

                      {/* MDX Endpoint Description */}
                      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground/90">
                        <MdxRenderer content={endpointDetails.description} />
                      </div>

                      {/* Spec vs Playground Tabs */}
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-fit whitespace-nowrap">
                        <button
                          onClick={() => setActiveSubTab("spec")}
                          className={cn(
                            "flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer",
                            activeSubTab === "spec"
                              ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-2xs"
                              : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          )}
                        >
                          <Icon icon="solar:document-text-line-duotone" className="size-4" />
                          <span>Đặc tả tham số</span>
                        </button>
                        <button
                          onClick={() => setActiveSubTab("playground")}
                          className={cn(
                            "flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer",
                            activeSubTab === "playground"
                              ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-2xs"
                              : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          )}
                        >
                          <Icon icon="solar:play-line-duotone" className="size-4" />
                          <span>Chạy thử (Playground)</span>
                        </button>
                      </div>

                      {/* SUB CONTENT VIEW */}
                      {activeSubTab === "spec" && (
                        <div className="space-y-6">
                          {/* 1. Headers Parameter Table */}
                          <ParameterTable title="Request Headers" list={endpointDetails.headers || []} />

                          {/* 2. Query Parameter Table */}
                          <ParameterTable title="Query Parameters" list={endpointDetails.queryParams || []} />

                          {/* 3. Request Body Parameter Table */}
                          {["POST", "PUT", "PATCH", "DELETE"].includes(endpointDetails.method) && (
                            <ParameterTable title="JSON Body parameters" list={endpointDetails.requestBody || []} />
                          )}

                          {/* 4. Response Samples */}
                          {endpointDetails.responses && endpointDetails.responses.length > 0 && (
                            <div className="space-y-4 border border-border/40 rounded-2xl p-5 bg-card/20">
                              <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider border-b pb-2 border-border/40 flex items-center gap-1.5">
                                <Icon icon="solar:mailbox-line-duotone" className="text-muted-foreground text-base" />
                                Mẫu kết quả phản hồi (Responses)
                              </h3>
                              <div className="space-y-4">
                                {endpointDetails.responses.map((res: ApiResponseSample, i: number) => (
                                  <div key={i} className="border border-border/60 rounded-xl overflow-hidden bg-background">
                                    <div className="flex justify-between items-center bg-muted/20 px-4 py-2 border-b border-border/60 text-xs">
                                      <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider",
                                        res.status >= 200 && res.status < 300
                                          ? "bg-green-500/15 text-green-500 border border-green-500/25"
                                          : "bg-red-500/15 text-red-500 border border-red-500/25"
                                      )}>
                                        Status: {res.status}
                                      </span>
                                      <span className="text-muted-foreground italic font-medium">{res.description}</span>
                                    </div>
                                    <pre className="p-4 bg-muted/5 font-mono text-[11px] text-foreground/85 max-h-52 overflow-y-auto leading-relaxed select-all">
                                      <code>
                                        {typeof res.body === "object" ? JSON.stringify(res.body, null, 2) : String(res.body)}
                                      </code>
                                    </pre>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeSubTab === "playground" && (
                        <div className="space-y-6 border border-border/60 rounded-2xl p-6 bg-muted/5">
                          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2.5 border-border/40 flex items-center gap-2">
                            <Icon icon="solar:play-line-duotone" className="text-vanixjnk text-base" />
                            Giao diện Thử nghiệm (API Runner)
                          </h3>

                          {/* Domain Configuration */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-foreground">Target Domain</label>
                            <div className="flex gap-2">
                              <div className="flex items-center bg-muted/40 border border-border/80 px-3 rounded-lg text-[11px] text-muted-foreground select-none font-mono font-medium">
                                https://
                              </div>
                              <Input
                                value={targetDomain}
                                onChange={(e) => setTargetDomain(e.target.value)}
                                placeholder="shoprandom247.com"
                                className="h-9 text-[13px] font-mono flex-1"
                              />
                            </div>
                          </div>

                          {/* Headers Panel */}
                          {playgroundHeaders.length > 0 && (
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-foreground">HTTP Headers</label>
                              <div className="space-y-2 border border-border/40 rounded-xl p-3.5 bg-muted/10">
                                {playgroundHeaders.map((hdr, idx) => (
                                  <div key={idx} className="flex gap-3 items-center">
                                    <Input
                                      value={hdr.name}
                                      onChange={(e) => {
                                        const next = [...playgroundHeaders];
                                        next[idx].name = e.target.value;
                                        setPlaygroundHeaders(next);
                                      }}
                                      placeholder="Header Key"
                                      className="h-8 text-[11px] font-mono w-1/3 shrink-0"
                                    />
                                    <Input
                                      value={hdr.value}
                                      onChange={(e) => {
                                        const next = [...playgroundHeaders];
                                        next[idx].value = e.target.value;
                                        setPlaygroundHeaders(next);
                                      }}
                                      placeholder="Header Value"
                                      className="h-8 text-[11px] font-mono flex-1"
                                    />
                                    <button
                                      onClick={() => setPlaygroundHeaders(playgroundHeaders.filter((_, i) => i !== idx))}
                                      className="text-muted-foreground hover:text-red-500 cursor-pointer"
                                    >
                                      <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                                    </button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[10px] font-bold text-vanixjnk p-0 hover:bg-transparent"
                                  onClick={() => setPlaygroundHeaders([...playgroundHeaders, { name: "", value: "" }])}
                                >
                                  <Icon icon="solar:add-circle-line-duotone" className="mr-1" />
                                  Thêm Custom Header
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Query params Panel */}
                          {endpointDetails.queryParams && endpointDetails.queryParams.length > 0 && (
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-foreground">Query Parameters</label>
                              <div className="space-y-3.5 border border-border/40 rounded-xl p-4 bg-muted/10">
                                {endpointDetails.queryParams.map((q: ApiParameter) => (
                                  <div key={q.name} className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-2">
                                      <span className="font-bold text-foreground/80">{q.name}</span>
                                      <span className="text-[9px] px-1 bg-border/60 rounded text-muted-foreground font-mono">{q.type}</span>
                                      {q.required && <span className="text-rose-500 font-bold">* bắt buộc</span>}
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
                          {["POST", "PUT", "PATCH", "DELETE"].includes(endpointDetails.method) && (
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-foreground">JSON Body Payload</label>
                              <Textarea
                                value={playgroundBody}
                                onChange={(e) => setPlaygroundBody(e.target.value)}
                                placeholder="{}"
                                className="h-32 text-[11px] font-mono resize-y leading-relaxed"
                              />
                            </div>
                          )}

                          {/* Send Request Trigger */}
                          <Button
                            variant="vanixjnk"
                            onClick={handleSendRequest}
                            disabled={playgroundLoading}
                            className="w-full gap-2 font-bold shadow-md h-10 cursor-pointer"
                          >
                            {playgroundLoading ? (
                              <Icon icon="solar:restart-line-duotone" className="size-4 animate-spin" />
                            ) : (
                              <Icon icon="solar:play-line-duotone" className="size-4" />
                            )}
                            <span>Gửi yêu cầu thử nghiệm</span>
                          </Button>

                          {/* Playground Response Viewer */}
                          {playgroundResponse && (
                            <div className="border border-border/60 rounded-xl overflow-hidden bg-card animate-fadeIn">
                              <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2.5 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-foreground">Response Payload</span>
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-bold",
                                    playgroundResponse.status >= 200 && playgroundResponse.status < 300
                                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                                  )}>
                                    {playgroundResponse.status || "CORS/Network Error"}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-mono">{playgroundResponse.time} ms</span>
                                </div>
                              </div>
                              <pre className="p-4 bg-muted/5 font-mono text-[11px] text-foreground overflow-x-auto leading-relaxed max-h-80 select-all">
                                <code>
                                  {typeof playgroundResponse.body === "object"
                                    ? JSON.stringify(playgroundResponse.body, null, 2)
                                    : String(playgroundResponse.body)}
                                </code>
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                      <div className="size-14 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
                        <Icon icon="solar:programming-line-duotone" className="text-2xl" />
                      </div>
                      <span className="text-xs text-muted-foreground/60 italic">Chọn một API ở thanh bên để xem đặc tả kỹ thuật.</span>
                    </div>
                  )}
                </>
              )}
            </main>

          </div>
        </div>
      </div>
    </div>
  );
}

function ParameterTable({ title, list }: { title: string; list: ApiParameter[] }) {
  if (list.length === 0) return null;
  return (
    <div className="space-y-3 border border-border/40 rounded-2xl p-5 bg-card/20">
      <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider border-b pb-2 border-border/40 flex items-center gap-1.5">
        <Icon icon="solar:list-line-duotone" className="text-muted-foreground text-base" />
        {title}
      </h3>
      <div className="overflow-x-auto w-full border border-border/60 rounded-xl bg-background">
        <table className="min-w-full text-left text-xs divide-y divide-border/60">
          <thead className="bg-muted/10 font-bold text-muted-foreground/80">
            <tr>
              <th className="px-4 py-3 font-mono">Tham số</th>
              <th className="px-4 py-3 font-mono">Kiểu</th>
              <th className="px-4 py-3 font-mono">Yêu cầu</th>
              <th className="px-4 py-3 font-mono">Mô tả</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-foreground/80">
            {list.map((param) => (
              <tr key={param.name} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-foreground/75 select-all">{param.name}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] bg-border/40 px-1.5 py-0.5 rounded text-muted-foreground font-mono">{param.type}</span>
                </td>
                <td className="px-4 py-3 font-semibold">
                  {param.required ? (
                    <span className="text-rose-500 bg-rose-500/5 px-1.5 py-0.5 rounded text-[10px] border border-rose-500/20">Bắt buộc</span>
                  ) : (
                    <span className="text-muted-foreground/60 bg-muted/20 px-1.5 py-0.5 rounded text-[10px]">Tùy chọn</span>
                  )}
                </td>
                <td className="px-4 py-3 leading-relaxed">
                  <div>{param.description}</div>
                  {param.defaultValue !== undefined && (
                    <div className="text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-1">
                      <span className="font-bold">Mặc định:</span>
                      <code className="font-mono bg-border/20 px-1 rounded">{String(param.defaultValue)}</code>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
