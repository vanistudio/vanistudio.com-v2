"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ShikiCodeBlock } from "./shiki-code-block";
import { MdxASTNode } from "../types";

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

export const CodeGroupRenderer = ({ blocks }: { blocks: ParsedCodeBlock[] }) => {
  const [activeTab, setActiveTab] = useState(0);
  if (blocks.length === 0) return null;

  return (
    <div className="not-prose my-4 rounded-xl border border-border/80 overflow-hidden bg-background">
      <div className="flex items-center gap-0 border-b border-border/80 bg-muted/20 px-1 overflow-x-auto">
        {blocks.map((block, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={cn(
              "px-3 py-2 text-xs font-bold transition-all duration-150 border-b-2 whitespace-nowrap",
              activeTab === idx
                ? "border-vanixjnk text-vanixjnk bg-vanixjnk/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            {block.title}
          </button>
        ))}
      </div>
      <div className="[&_.shiki-code-block-wrapper]:my-0! [&_.shiki-code-block-wrapper]:rounded-none! [&_.shiki-code-block-wrapper]:border-0! [&>pre]:my-0! [&>pre]:rounded-none! [&>pre]:border-0!">
        <ShikiCodeBlock code={blocks[activeTab].code} lang={blocks[activeTab].lang} />
      </div>
    </div>
  );
};
