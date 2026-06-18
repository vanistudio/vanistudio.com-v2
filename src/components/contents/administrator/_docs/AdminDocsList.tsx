"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminDocsOverviewTab from "./AdminDocsOverviewTab";
import AdminDocsEndpointsTab from "./AdminDocsEndpointsTab";
import AdminDocsGroupsTab from "./AdminDocsGroupsTab";
import AdminDocsProductsTab from "./AdminDocsProductsTab";

type ActiveTab = "overview" | "endpoint" | "group" | "product";

const TABS = [
  {
    id: "overview" as const,
    title: "Tài liệu chung",
    icon: "solar:document-text-line-duotone",
  },
  {
    id: "endpoint" as const,
    title: "Danh sách API",
    icon: "solar:programming-line-duotone",
  },
  {
    id: "group" as const,
    title: "Nhóm API",
    icon: "solar:folder-2-line-duotone",
  },
  {
    id: "product" as const,
    title: "Loại sản phẩm/API",
    icon: "solar:widget-line-duotone",
  },
];

export default function AdminDocsList() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [apiType, setApiType] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: apiProducts = [], isLoading: isLoadingProducts, refetch: refetchProducts } =
    trpc.administrator.apiDocs.getApiProducts.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const { data: overviewsData, isLoading: isLoadingOverviews } =
    trpc.administrator.apiDocs.getOverviews.useQuery({ apiType }, {
      enabled: !!apiType,
      refetchOnWindowFocus: false,
    });

  const { data: groupsData, isLoading: isLoadingGroups } =
    trpc.administrator.apiDocs.getGroupsWithEndpoints.useQuery({ apiType }, {
      enabled: !!apiType,
      refetchOnWindowFocus: false,
    });

  const overviewsLoading = isLoadingOverviews || !apiType;
  const groupsLoading = isLoadingGroups || !apiType;
  const totalEndpoints = groupsData?.reduce((acc, group) => acc + (group.endpoints?.length || 0), 0) || 0;

  useEffect(() => {
    if (mounted && apiProducts.length > 0) {
      const savedType = localStorage.getItem("vanistudio_admin_api_type");
      const isValid = apiProducts.some((p) => p.slug === savedType);
      if (isValid && savedType) {
        setApiType(savedType);
      } else {
        const firstSlug = apiProducts[0].slug;
        setApiType(firstSlug);
        localStorage.setItem("vanistudio_admin_api_type", firstSlug);
      }
    }
  }, [mounted, apiProducts]);

  const handleApiTypeChange = (newVal: string) => {
    setApiType(newVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("vanistudio_admin_api_type", newVal);
    }
  };

  const handleProductsChanged = () => {
    refetchProducts();
  };

  if (!mounted) {
    return (
      <div className="flex flex-col w-full flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
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
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:document-text-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Quản lý Tài liệu API
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý các tài liệu tổng quan, định nghĩa các API Endpoints và nhóm chức năng cho từng phiên bản/sản phẩm.
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
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)",
          }}
        />
      </div>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          <div className="p-6 pb-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Sản phẩm/Dịch vụ API</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {isLoadingProducts ? <Skeleton className="h-8 w-16" /> : apiProducts.length}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-indigo-500 bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:widget-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tài liệu hướng dẫn</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {overviewsLoading ? <Skeleton className="h-8 w-16" /> : overviewsData?.length || 0}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:document-text-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">API Endpoints</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {groupsLoading ? <Skeleton className="h-8 w-16" /> : totalEndpoints}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:programming-line-duotone" className="text-xl" />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-vanixjnk/15 border-vanixjnk/25 text-vanixjnk shadow-sm"
                        : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <Icon
                      icon={tab.icon}
                      className={`size-4 ${isActive ? "text-vanixjnk" : "text-muted-foreground"}`}
                    />
                    <span>{tab.title}</span>
                  </button>
                );
              })}
            </div>
            {activeTab !== "product" && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Loại sản phẩm/API:
                </span>
                {isLoadingProducts ? (
                  <Skeleton className="h-9 w-44 rounded-lg" />
                ) : (
                  <Select value={apiType} onValueChange={handleApiTypeChange}>
                    <SelectTrigger className="w-48 bg-background border-border text-[13px] h-9">
                      <SelectValue placeholder="Chọn Loại API..." />
                    </SelectTrigger>
                    <SelectContent>
                      {apiProducts.map((p) => (
                        <SelectItem key={p.id} value={p.slug} className="text-xs font-semibold">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
          {activeTab === "overview" && (
            <AdminDocsOverviewTab apiType={apiType} />
          )}

          {activeTab === "endpoint" && (
            <AdminDocsEndpointsTab apiType={apiType} />
          )}

          {activeTab === "group" && (
            <AdminDocsGroupsTab apiType={apiType} />
          )}

          {activeTab === "product" && (
            <AdminDocsProductsTab onProductsChanged={handleProductsChanged} />
          )}
        </div>
      </div>
    </div>
  );
}
