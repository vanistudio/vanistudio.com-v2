"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { ShikiCodeBlock } from "./mdx-builder-shiki-code-block";
import { MdxASTNode } from "./mdx-builder-types";

export interface ParsedCodeBlock {
  lang: string;
  title: string;
  code: string;
}

export function parseCodeGroupBlocks(childNodes: MdxASTNode[]): ParsedCodeBlock[] {
  const blocks: ParsedCodeBlock[] = [];
  for (const child of childNodes) {
    if (child.type === "text" && child.content) {
      const content = child.content;
      const regex = /```(\S*)[ \t]*(.*?)\n([\s\S]*?)```/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const lang = match[1] || "text";
        const title = match[2]?.trim() || lang || "Code";
        const code = match[3]?.trimEnd() || "";
        blocks.push({ lang, title, code });
      }
    }
  }
  return blocks;
}

import {
  FILE_NAME_ICONS,
  FILE_EXTENSION_ICONS,
} from "@/constants/file-icons.constant";

interface TabIconResult {
  type: "url" | "iconify";
  value: string;
}

function getTabIcon(title: string): TabIconResult | null {
  const t = title.toLowerCase().trim();

  if (t === "npm") {
    const url = FILE_NAME_ICONS[".npmrc"] || "https://storage.vanistudio.com/otquUXm7i2X2WTIU/icons/flow-icons/dim/npm.svg";
    return { type: "url", value: url };
  }
  if (t === "pnpm") {
    const url = FILE_NAME_ICONS["pnpm-workspace.yaml"] || "https://storage.vanistudio.com/otquUXm7i2X2WTIU/icons/flow-icons/dim/pnpm.svg";
    return { type: "url", value: url };
  }
  if (t === "yarn") {
    const url = FILE_NAME_ICONS[".yarnrc"] || "https://storage.vanistudio.com/otquUXm7i2X2WTIU/icons/flow-icons/dim/yarn.svg";
    return { type: "url", value: url };
  }
  if (t === "bun") {
    const url = FILE_NAME_ICONS["bunfig.toml"] || "https://storage.vanistudio.com/otquUXm7i2X2WTIU/icons/flow-icons/dim/bun.svg";
    return { type: "url", value: url };
  }
  if (
    t === "bash" ||
    t === "cli" ||
    t === "shell" ||
    t === "terminal" ||
    t === "cmd" ||
    t === "powershell" ||
    t === "ps1" ||
    t.includes("lệnh") ||
    t.includes("command")
  ) {
    const url = FILE_EXTENSION_ICONS["sh"] || FILE_EXTENSION_ICONS["bash"] || "https://storage.vanistudio.com/otquUXm7i2X2WTIU/icons/flow-icons/dim/bash.svg";
    return { type: "url", value: url };
  }

  if (FILE_EXTENSION_ICONS[t]) {
    return { type: "url", value: FILE_EXTENSION_ICONS[t] };
  }

  if (FILE_NAME_ICONS[title]) {
    return { type: "url", value: FILE_NAME_ICONS[title] };
  }
  if (FILE_NAME_ICONS[t]) {
    return { type: "url", value: FILE_NAME_ICONS[t] };
  }

  if (t === "ts" || t === "typescript") return { type: "iconify", value: "logos:typescript-icon" };
  if (t === "js" || t === "javascript") return { type: "iconify", value: "logos:javascript" };
  if (t === "json") return { type: "iconify", value: "vscode-icons:file-type-json" };

  return null;
}

export const CodeGroupRenderer = ({ blocks }: { blocks: ParsedCodeBlock[] }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  if (blocks.length === 0) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(blocks[activeTab].code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="not-prose my-4 rounded-md border border-border/80 overflow-hidden bg-background">
      <div className="flex items-center justify-between border-b border-border/80 bg-muted/20 pr-2 pl-1 overflow-hidden">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {blocks.map((block, idx) => {
            const icon = getTabIcon(block.title);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all duration-150 border-b-2 whitespace-nowrap",
                  activeTab === idx
                    ? "text-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                {icon && icon.type === "url" && (
                  <img
                    src={icon.value}
                    alt={block.title}
                    className="size-4 shrink-0 object-contain"
                  />
                )}
                {icon && icon.type === "iconify" && (
                  <Icon icon={icon.value} className="size-4 shrink-0" />
                )}
                <span>{block.title}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-150 shrink-0"
          title="Copy code"
        >
          <Icon
            icon={copied ? "solar:check-circle-line-duotone" : "solar:copy-line-duotone"}
            className={cn("size-4 shrink-0 transition-transform duration-200", copied && "text-green-500 scale-110")}
          />
        </button>
      </div>
      <div className="[&_.shiki-code-block-wrapper]:my-0! [&_.shiki-code-block-wrapper]:rounded-none! [&_.shiki-code-block-wrapper]:border-0! [&>pre]:my-0! [&>pre]:rounded-none! [&>pre]:border-0!">
        <ShikiCodeBlock code={blocks[activeTab].code} lang={blocks[activeTab].lang} />
      </div>
    </div>
  );
};

