"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

export interface TabData {
  title: string;
  icon?: string;
  content: React.ReactNode;
}

export const MintlifyTabsRenderer = ({ tabs }: { tabs: TabData[] }) => {
  const [activeTab, setActiveTab] = useState(0);
  if (tabs.length === 0) return null;

  return (
    <div className="not-prose my-4">
      <div className="flex items-center gap-0 border-b border-border/80 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all duration-150 border-b-2 whitespace-nowrap",
              activeTab === idx
                ? "border-vanixjnk text-vanixjnk"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
            )}
          >
            {tab.icon && <Icon icon={tab.icon} className="size-3.5" />}
            {tab.title}
          </button>
        ))}
      </div>
      <div className="p-4 border border-t-0 border-border/60 rounded-b-xl bg-background">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};
