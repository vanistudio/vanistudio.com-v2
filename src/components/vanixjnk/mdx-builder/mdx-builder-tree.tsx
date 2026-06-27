"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "motion/react";
import {
  DEFAULT_FILE_ICON,
  DEFAULT_FOLDER_ICON,
  DEFAULT_FOLDER_OPEN_ICON,
  DEFAULT_ROOT_FOLDER_ICON,
  DEFAULT_ROOT_FOLDER_OPEN_ICON,
  FILE_EXTENSION_ICONS,
  FILE_NAME_ICONS,
  FOLDER_NAME_ICONS,
  FOLDER_NAME_OPEN_ICONS,
} from "@/constants/file-icons.constant";

export const TreeContainer = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div className={cn("not-prose my-4 rounded-xl border border-border/80 bg-muted/5 p-3 font-mono text-[13px]", className)}>
    {children}
  </div>
);

export const TreeFolderRenderer = ({ name, defaultOpen, openable = true, isRoot = false, children }: { name: string; defaultOpen?: boolean; openable?: boolean; isRoot?: boolean; children?: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen !== false);
  const canToggle = openable !== false;

  let folderIcon = "";
  if (isRoot) {
    folderIcon = isOpen ? DEFAULT_ROOT_FOLDER_OPEN_ICON : DEFAULT_ROOT_FOLDER_ICON;
  } else {
    folderIcon = isOpen 
      ? (FOLDER_NAME_OPEN_ICONS[name.toLowerCase()] || DEFAULT_FOLDER_OPEN_ICON)
      : (FOLDER_NAME_ICONS[name.toLowerCase()] || DEFAULT_FOLDER_ICON);
  }

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
        <img
          src={folderIcon}
          alt=""
          className="size-4 shrink-0 object-contain select-none"
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
  let fileIcon = FILE_NAME_ICONS[name];
  
  if (!fileIcon) {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    fileIcon = FILE_EXTENSION_ICONS[ext] || DEFAULT_FILE_ICON;
  }

  return (
    <div className="flex items-center gap-1.5 py-0.5 px-1.5 ml-[18px] rounded-lg hover:bg-muted/30 transition-colors">
      <img
        src={fileIcon}
        alt=""
        className="size-4 shrink-0 object-contain select-none"
      />
      <span className="text-muted-foreground hover:text-foreground transition-colors">{name}</span>
    </div>
  );
};
