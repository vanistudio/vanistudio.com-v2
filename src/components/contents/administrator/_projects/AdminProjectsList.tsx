"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import AdminProjectsTab from "./AdminProjectsTab";

const TABS = [
  {
    id: "projects" as const,
    title: "Danh mục Dự án",
    icon: "solar:case-round-line-duotone",
  },
];

export default function AdminProjectsList() {
  const [activeTab, setActiveTab] = useState<"projects">("projects");

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:folder-open-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Dự án Showcase</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý danh sách các dự án thực tế, các sản phẩm cá nhân, hợp tác, thời gian thực hiện, và các số liệu hiệu quả.
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
          </div>

          {activeTab === "projects" && <AdminProjectsTab />}
        </div>
      </div>
    </div>
  );
}
