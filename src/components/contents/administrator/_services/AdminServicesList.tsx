"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import AdminServicesTab from "./AdminServicesTab";
import AdminServiceTypesTab from "./AdminServiceTypesTab";
import AdminRequestsTab from "./AdminRequestsTab";

const TABS = [
  {
    id: "services" as const,
    title: "Danh mục Dịch vụ",
    icon: "solar:case-round-line-duotone",
  },
  {
    id: "service_types" as const,
    title: "Phân loại Dịch vụ",
    icon: "solar:widget-line-duotone",
  },
  {
    id: "requests" as const,
    title: "Đơn yêu cầu đặt hàng",
    icon: "solar:inbox-in-line-duotone",
  },
];

export default function AdminServicesList() {
  const [activeTab, setActiveTab] = useState<"services" | "service_types" | "requests">("services");

  const { data: servicesData, isLoading: servicesLoading } = trpc.administrator.services.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { data: typesData, isLoading: typesLoading } = trpc.administrator.services.getTypes.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { data: requestsData, isLoading: requestsLoading } = trpc.administrator.services.getRequests.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const requestsList = requestsData || [];
  const pendingRequestsCount = requestsList.filter((r) => r.status === "pending").length;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "services" || tab === "service_types" || tab === "requests") {
        setActiveTab(tab);
      }
    }
  }, []);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:case-round-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Dịch vụ & Đơn yêu cầu</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý danh mục các dịch vụ kỹ thuật, các phân loại, các gói tiers định giá và phê duyệt đơn yêu cầu từ khách hàng.
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

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          <div className="p-6 pb-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng số dịch vụ</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {servicesLoading ? <Skeleton className="h-8 w-16" /> : servicesData?.length || 0}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-indigo-500 bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:case-round-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Phân loại dịch vụ</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {typesLoading ? <Skeleton className="h-8 w-16" /> : typesData?.data?.length || 0}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:widget-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Yêu cầu chờ duyệt</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {requestsLoading ? <Skeleton className="h-8 w-16" /> : pendingRequestsCount}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:inbox-in-line-duotone" className="text-xl" />
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
                    {tab.id === "requests" && pendingRequestsCount > 0 && (
                      <span className="ml-1.5 size-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">
                        {pendingRequestsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "services" && <AdminServicesTab />}
          {activeTab === "service_types" && <AdminServiceTypesTab />}
          {activeTab === "requests" && <AdminRequestsTab />}
        </div>
      </div>
    </div>
  );
}
