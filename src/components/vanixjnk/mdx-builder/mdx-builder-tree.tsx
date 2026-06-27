"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "motion/react";

export const TreeContainer = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div className={cn("not-prose my-4 rounded-xl border border-border/80 bg-muted/5 p-3 font-mono text-[13px]", className)}>
    {children}
  </div>
);

export const TreeFolderRenderer = ({ name, defaultOpen, openable = true, children }: { name: string; defaultOpen?: boolean; openable?: boolean; children?: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen !== false);
  const canToggle = openable !== false;
  return (
    <div className="select-none">
      <button
        type="button"
        onClick={canToggle ? () => setIsOpen(!isOpen) : undefined}
        className={cn(
          "flex items-center gap-1.5 py-1 px-1.5 rounded-lg hover:bg-muted/50 transition-colors w-full text-left group",
          !canToggle && "cursor-default"
        )}
      >
        {canToggle && (
          <Icon
            icon={isOpen ? "solar:alt-arrow-down-line-duotone" : "solar:alt-arrow-right-line-duotone"}
            className="size-3 text-muted-foreground shrink-0"
          />
        )}
        <Icon
          icon={isOpen ? "solar:folder-open-line-duotone" : "solar:folder-line-duotone"}
          className="size-4 text-vanixjnk shrink-0"
        />
        <span className="text-foreground font-semibold group-hover:text-vanixjnk transition-colors">{name}</span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden ml-2.5 pl-3 border-l border-border/40"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const TreeFileRenderer = ({ name }: { name: string }) => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const iconMap: Record<string, string> = {
    ts: "solar:code-line-duotone", tsx: "solar:code-line-duotone",
    js: "solar:code-line-duotone", jsx: "solar:code-line-duotone",
    json: "solar:document-text-line-duotone",
    css: "solar:palette-line-duotone", scss: "solar:palette-line-duotone",
    html: "solar:code-line-duotone",
    md: "solar:document-text-line-duotone", mdx: "solar:document-text-line-duotone",
    yml: "solar:settings-line-duotone", yaml: "solar:settings-line-duotone", toml: "solar:settings-line-duotone",
    env: "solar:lock-line-duotone", gitignore: "solar:eye-closed-line-duotone",
    png: "solar:gallery-line-duotone", jpg: "solar:gallery-line-duotone", svg: "solar:gallery-line-duotone",
  };
  return (
    <div className="flex items-center gap-1.5 py-0.5 px-1.5 ml-[18px] rounded-lg hover:bg-muted/30 transition-colors">
      <Icon icon={iconMap[ext] || "solar:file-line-duotone"} className="size-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground hover:text-foreground transition-colors">{name}</span>
    </div>
  );
};
