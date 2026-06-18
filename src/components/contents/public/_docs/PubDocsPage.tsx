"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MdxRenderer } from "@/components/vanixjnk/mdx-builder";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PlaygroundPanel from "./PlaygroundPanel";

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  order: number;
  createdAt: Date;
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

  useEffect(() => {
    if (currentProductSlug) {
      setSelectedProductSlug(currentProductSlug);
    }
  }, [currentProductSlug]);

  const currentProduct = useMemo(() => {
    return initialProducts.find((p) => p.slug === selectedProductSlug);
  }, [initialProducts, selectedProductSlug]);
  
  const [activeDocType, setActiveDocType] = useState<"overview" | "endpoint">("overview");
  const [selectedOverviewSlug, setSelectedOverviewSlug] = useState<string>("");
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [activeSubTab, setActiveSubTab] = useState<"spec" | "playground">("spec");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  useEffect(() => {
    if (overviews.length > 0) {
      setSelectedOverviewSlug(overviews[0].slug);
      setActiveDocType("overview");
    } else {
      const firstGroupWithEndpoints = groupsWithEndpoints.find(g => g.endpoints && g.endpoints.length > 0);
      if (firstGroupWithEndpoints && firstGroupWithEndpoints.endpoints.length > 0) {
        setSelectedEndpointId(firstGroupWithEndpoints.endpoints[0].id);
        setActiveDocType("endpoint");
      }
    }
  }, [selectedProductSlug, overviews, groupsWithEndpoints]);

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
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
          {currentProduct?.thumbnail && (
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
              <img
                src={currentProduct.thumbnail}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-[0.5] dark:opacity-[0.5]"
              />
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/40 to-background" />
              <div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(circle at center, transparent 30%, hsl(var(--background)) 100%)",
                }}
              />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3 bg-background/60 backdrop-blur-md">
              <Icon icon="solar:programming-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-2.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground select-none">
                <Link href="/" className="hover:text-vanixjnk transition-colors flex items-center gap-1">
                  <Icon icon="solar:home-2-line-duotone" className="size-4" />
                  Trang chủ
                </Link>
                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                <Link href="/docs" className="hover:text-vanixjnk transition-colors">
                  Tài liệu API
                </Link>
                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                <span className="text-foreground font-semibold truncate max-w-[200px]">
                  {currentProduct?.name}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {currentProduct?.name}
              </h1>

              {currentProduct?.description && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                  {currentProduct.description}
                </p>
              )}

              {currentProduct?.createdAt && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 select-none">
                  <Icon icon="solar:calendar-line-duotone" className="size-4" />
                  <span>Cập nhật: {new Date(currentProduct.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              )}
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
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)",
          }}
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start grow">
            
            <aside className="lg:col-span-3 flex flex-col gap-4 self-stretch border-r border-dashed border-primary/10 pr-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground z-10">
                  <Icon icon="solar:magnifer-line-duotone" className="size-4" />
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm tài liệu & API..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-8 text-[13px] bg-background border border-border/60 rounded-xl focus:outline-hidden focus:border-vanixjnk/60"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <Icon icon="solar:close-circle-line-duotone" className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 pr-1 max-h-[70vh]">
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
                                ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk"
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
                                  ? "bg-vanixjnk/10 border-vanixjnk/25 text-vanixjnk"
                                  : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                              )}
                            >
                              <span className={cn(
                                "text-[9px] font-black tracking-wide uppercase px-1 rounded-sm font-mono scale-90 shrink-0",
                                getMethodBadgeClass(ep.method)
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

            <main className="lg:col-span-9 flex flex-col gap-6 self-stretch overflow-y-auto max-h-[78vh] pr-1">
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

                      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground/90">
                        <MdxRenderer content={endpointDetails.description} />
                      </div>

                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-fit whitespace-nowrap">
                        <button
                          onClick={() => setActiveSubTab("spec")}
                          className={cn(
                            "flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer",
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
                            "flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer",
                            activeSubTab === "playground"
                              ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-2xs"
                              : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          )}
                        >
                          <Icon icon="solar:play-line-duotone" className="size-4" />
                          <span>Chạy thử (Playground)</span>
                        </button>
                      </div>

                      {activeSubTab === "spec" && (
                        <div className="space-y-6">
                          <ParameterTable title="Request Headers" list={endpointDetails.headers || []} />

                          <ParameterTable title="Query Parameters" list={endpointDetails.queryParams || []} />

                          {["POST", "PUT", "PATCH", "DELETE"].includes(endpointDetails.method) && (
                            <ParameterTable title="JSON Body parameters" list={endpointDetails.requestBody || []} />
                          )}

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
                        <PlaygroundPanel endpointDetails={endpointDetails} />
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
