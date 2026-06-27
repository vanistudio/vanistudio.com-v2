"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { ShikiCodeBlock } from "./components/shiki-code-block";
import { CodeGroupRenderer, parseCodeGroupBlocks } from "./components/code-group";
import { TreeContainer, TreeFolderRenderer, TreeFileRenderer } from "./components/tree";
import { MintlifyTabsRenderer } from "./components/tabs";
import { MdxToken, MdxASTNode } from "./types";

export interface MdxRendererProps {
  content: string;
  scope?: Record<string, any>;
  className?: string;
}

export const evaluatePropValue = (val: string, scope: Record<string, any>): any => {
  const trimmed = val.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (!isNaN(Number(trimmed))) return Number(trimmed);
  
  if (trimmed.includes(".")) {
    const parts = trimmed.split(".");
    let resolved: any = scope;
    for (const part of parts) {
      if (resolved && typeof resolved === "object") {
        resolved = resolved[part];
      } else {
        resolved = undefined;
        break;
      }
    }
    if (resolved !== undefined) return resolved;
  } else if (scope[trimmed] !== undefined) {
    return scope[trimmed];
  }
  
  return trimmed;
};

export const parseTagContent = (tagStr: string, scope: Record<string, any>): { name: string; props: Record<string, any> } => {
  const parts = tagStr.split(/\s+/);
  const name = parts[0];
  const props: Record<string, any> = {};
  const attrString = tagStr.slice(name.length).trim();
  const attrRegex = /([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]+)\}))?/g;
  
  let match;
  while ((match = attrRegex.exec(attrString)) !== null) {
    const key = match[1];
    const doubleVal = match[2];
    const singleVal = match[3];
    const curlyVal = match[4];
    
    if (doubleVal !== undefined) {
      props[key] = doubleVal;
    } else if (singleVal !== undefined) {
      props[key] = singleVal;
    } else if (curlyVal !== undefined) {
      props[key] = evaluatePropValue(curlyVal, scope);
    } else {
      props[key] = true;
    }
  }
  
  return { name, props };
};

export const tokenizeMdx = (input: string, scope: Record<string, any>): MdxToken[] => {
  const tokens: MdxToken[] = [];
  let idx = 0;
  
  while (idx < input.length) {
    const nextTagStart = input.indexOf("<", idx);
    const nextCodeBlockStart = input.indexOf("```", idx);
    
    if (nextCodeBlockStart !== -1 && (nextTagStart === -1 || nextCodeBlockStart < nextTagStart)) {
      if (nextCodeBlockStart > idx) {
        tokens.push({ type: "text", content: input.slice(idx, nextCodeBlockStart) });
      }
      const nextCodeBlockEnd = input.indexOf("```", nextCodeBlockStart + 3);
      if (nextCodeBlockEnd === -1) {
        const remaining = input.slice(nextCodeBlockStart);
        if (remaining) tokens.push({ type: "text", content: remaining });
        break;
      }
      const codeBlockContent = input.slice(nextCodeBlockStart, nextCodeBlockEnd + 3);
      tokens.push({ type: "text", content: codeBlockContent });
      idx = nextCodeBlockEnd + 3;
      continue;
    }
    
    if (nextTagStart === -1) {
      const remaining = input.slice(idx);
      if (remaining) tokens.push({ type: "text", content: remaining });
      break;
    }
    
    if (nextTagStart > idx) {
      tokens.push({ type: "text", content: input.slice(idx, nextTagStart) });
    }
    
    if (input.startsWith("<!--", nextTagStart)) {
      const commentEnd = input.indexOf("-->", nextTagStart);
      if (commentEnd === -1) {
        tokens.push({ type: "text", content: input.slice(nextTagStart) });
        break;
      }
      idx = commentEnd + 3;
      continue;
    }
    
    let tagEnd = -1;
    let inQuote = false;
    let quoteChar = "";
    for (let j = nextTagStart + 1; j < input.length; j++) {
      const char = input[j];
      if ((char === "\"" || char === "'") && input[j - 1] !== "\\") {
        if (!inQuote) {
          inQuote = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuote = false;
        }
      }
      if (char === ">" && !inQuote) {
        tagEnd = j;
        break;
      }
    }
    
    if (tagEnd === -1) {
      tokens.push({ type: "text", content: input.slice(nextTagStart, nextTagStart + 1) });
      idx = nextTagStart + 1;
      continue;
    }
    
    const tagContent = input.slice(nextTagStart + 1, tagEnd).trim();
    idx = tagEnd + 1;
    
    if (tagContent.startsWith("/")) {
      tokens.push({ type: "tag-end", name: tagContent.slice(1).trim() });
    } else {
      const selfClosing = tagContent.endsWith("/");
      const cleanContent = selfClosing ? tagContent.slice(0, -1).trim() : tagContent;
      const { name, props } = parseTagContent(cleanContent, scope);
      tokens.push({ type: "tag-start", name, props, selfClosing });
    }
  }
  
  return tokens;
};

export const renderInlineMarkdown = (text: string): React.ReactNode => {
  if (!text) return "";
  const parts: React.ReactNode[] = [];
  let current = text;
  let keyIdx = 0;
  
  while (current) {
    const imgMatch = current.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      parts.push(
        <img 
          key={`img-${keyIdx++}`} 
          src={imgMatch[2]} 
          alt={imgMatch[1]} 
          className="max-h-60 rounded-xl my-3 object-contain border border-border/40 shadow-sm" 
        />
      );
      current = current.slice(imgMatch[0].length);
      continue;
    }
    
    const linkMatch = current.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a 
          key={`link-${keyIdx++}`} 
          href={linkMatch[2]} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-vanixjnk hover:underline font-semibold"
        >
          {linkMatch[1]}
        </a>
      );
      current = current.slice(linkMatch[0].length);
      continue;
    }
    
    const boldMatch = current.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={`b-${keyIdx++}`} className="font-bold text-foreground">{boldMatch[1]}</strong>);
      current = current.slice(boldMatch[0].length);
      continue;
    }
    
    const boldUnderscoreMatch = current.match(/^__([^_]+)__/);
    if (boldUnderscoreMatch) {
      parts.push(<strong key={`b-${keyIdx++}`} className="font-bold text-foreground">{boldUnderscoreMatch[1]}</strong>);
      current = current.slice(boldUnderscoreMatch[0].length);
      continue;
    }
    
    const italicMatch = current.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      parts.push(<em key={`em-${keyIdx++}`} className="italic">{italicMatch[1]}</em>);
      current = current.slice(italicMatch[0].length);
      continue;
    }
    
    const codeMatch = current.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code 
          key={`code-${keyIdx++}`} 
          className="not-prose px-1.5 py-0.5 rounded bg-muted/60 border border-border/50 font-mono text-xs text-foreground font-semibold"
        >
          {codeMatch[1]}
        </code>
      );
      current = current.slice(codeMatch[0].length);
      continue;
    }
    
    const nextSpec = current.search(/[*!_`[]/);
    if (nextSpec === -1) {
      parts.push(current);
      break;
    } else if (nextSpec === 0) {
      parts.push(current[0]);
      current = current.slice(1);
    } else {
      parts.push(current.slice(0, nextSpec));
      current = current.slice(nextSpec);
    }
  }
  
  return parts;
};

export const MarkdownBlockRenderer = ({ text }: { text: string }): React.ReactNode => {
  if (!text) return null;
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: string[] = [];
  let inCodeBlock = false;
  let codeContent = "";
  let codeLang = "";
  let keyIdx = 0;

  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];
  let tableAlignments: ("left" | "center" | "right" | null)[] = [];

  const parseTableRow = (rowText: string) => {
    const parts = rowText.split("|");
    if (parts[0] === "") parts.shift();
    if (parts[parts.length - 1] === "") parts.pop();
    return parts.map((cell) => cell.trim());
  };

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${keyIdx++}`} className="list-disc list-inside ml-4 my-3 space-y-1.5 text-[13px] text-muted-foreground">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      inList = false;
      listItems = [];
    }
  };

  const flushTable = () => {
    if (inTable && (tableHeaders.length > 0 || tableRows.length > 0)) {
      elements.push(
        <div key={`table-wrapper-${keyIdx++}`} className="my-4 overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full border-collapse text-left text-[13px]">
            {tableHeaders.length > 0 && (
              <thead className="bg-muted/40 border-b border-border/80">
                <tr>
                  {tableHeaders.map((header, hIdx) => {
                    const align = tableAlignments[hIdx] || "left";
                    return (
                      <th
                        key={hIdx}
                        className="px-4 py-2.5 font-bold text-foreground text-xs uppercase tracking-wider"
                        style={{ textAlign: align }}
                      >
                        {renderInlineMarkdown(header)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-border/40">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/10 transition-colors">
                  {row.map((cell, cIdx) => {
                    const align = tableAlignments[cIdx] || "left";
                    return (
                      <td
                        key={cIdx}
                        className="px-4 py-2.5 text-muted-foreground leading-relaxed"
                        style={{ textAlign: align }}
                      >
                        {renderInlineMarkdown(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeaders = [];
      tableRows = [];
      tableAlignments = [];
    }
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmed = line.trim();

    if (inCodeBlock) {
      if (trimmed.startsWith("```")) {
        elements.push(
          <ShikiCodeBlock
            key={`code-${keyIdx++}`}
            code={codeContent.trim()}
            lang={codeLang}
          />
        );
        inCodeBlock = false;
        codeContent = "";
      } else {
        codeContent += line + "\n";
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushList();
      flushTable();
      inCodeBlock = true;
      codeLang = trimmed.slice(3).trim();
      continue;
    }

    if (trimmed.startsWith("|")) {
      flushList();
      if (!inTable) {
        const nextLine = lines[idx + 1];
        const nextTrimmed = nextLine ? nextLine.trim() : "";
        const isSeparator = nextTrimmed.startsWith("|") && /^[|:\s-]+$/.test(nextTrimmed);

        if (isSeparator) {
          inTable = true;
          tableHeaders = parseTableRow(line);

          const cells = parseTableRow(nextTrimmed);
          tableAlignments = cells.map((cell) => {
            const left = cell.startsWith(":");
            const right = cell.endsWith(":");
            if (left && right) return "center";
            if (right) return "right";
            if (left) return "left";
            return "left";
          });

          idx++; 
          continue;
        } else {
          flushTable();
        }
      } else {
        tableRows.push(parseTableRow(line));
        continue;
      }
    } else {
      flushTable();
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(<h1 key={`h1-${keyIdx++}`} className="text-2xl font-extrabold text-foreground mt-6 mb-3 border-b pb-1.5 tracking-tight">{renderInlineMarkdown(trimmed.slice(2))}</h1>);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(<h2 key={`h2-${keyIdx++}`} className="text-xl font-bold text-foreground mt-5 mb-2.5 tracking-tight">{renderInlineMarkdown(trimmed.slice(3))}</h2>);
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(<h3 key={`h3-${keyIdx++}`} className="text-lg font-bold text-foreground mt-4 mb-2 tracking-tight">{renderInlineMarkdown(trimmed.slice(4))}</h3>);
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      flushList();
      elements.push(<h4 key={`h4-${keyIdx++}`} className="text-base font-bold text-foreground mt-3.5 mb-1.5 tracking-tight">{renderInlineMarkdown(trimmed.slice(5))}</h4>);
      continue;
    }

    if (trimmed === "---") {
      flushList();
      elements.push(<hr key={`hr-${keyIdx++}`} className="my-6 border-t border-border/60" />);
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushList();
      elements.push(
        <blockquote key={`bq-${keyIdx++}`} className="border-l-4 border-vanixjnk/40 pl-4 py-2 my-4 italic text-muted-foreground bg-vanixjnk/5 rounded-r-lg">
          {renderInlineMarkdown(trimmed.slice(1).trim())}
        </blockquote>
      );
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(trimmed.slice(2));
      continue;
    }

    if (trimmed === "") {
      flushList();
      continue;
    }

    flushList();
    elements.push(<p key={`p-${keyIdx++}`} className="text-[13px] leading-relaxed text-muted-foreground my-2">{renderInlineMarkdown(line)}</p>);
  }

  flushList();
  flushTable();
  return <>{elements}</>;
};

export const renderMdxComponent = (tagName: string, props: any, children: any, key: string | number): React.ReactNode => {
  const { className: itemClassName, key: _, ...otherProps } = props;
  
  switch (tagName) {
    case "Button":
      return (
        <span key={key} className="not-prose inline-block my-1 mr-2">
          <Button className={itemClassName} {...otherProps}>{children}</Button>
        </span>
      );
    case "Badge":
      return (
        <span key={key} className="not-prose inline-block my-1 mr-2">
          <Badge className={itemClassName} {...otherProps}>{children}</Badge>
        </span>
      );
    case "Switch":
      return (
        <span key={key} className="not-prose inline-flex items-center my-1">
          <Switch className={itemClassName} {...otherProps} />
        </span>
      );
    case "Input":
      return (
        <div key={key} className="not-prose my-2">
          <Input className={cn("max-w-md", itemClassName)} {...otherProps} />
        </div>
      );
    case "Textarea":
      return (
        <div key={key} className="not-prose my-2">
          <Textarea className={itemClassName} {...otherProps} />
        </div>
      );
    case "Icon":
      return <Icon key={key} className={itemClassName} {...otherProps} />;
    case "Card":
      return (
        <div key={key} className="not-prose my-4">
          <Card className={itemClassName} {...otherProps}>{children}</Card>
        </div>
      );
    case "CardHeader":
      return <CardHeader key={key} className={itemClassName} {...otherProps}>{children}</CardHeader>;
    case "CardTitle":
      return <CardTitle key={key} className={itemClassName} {...otherProps}>{children}</CardTitle>;
    case "CardDescription":
      return <CardDescription key={key} className={itemClassName} {...otherProps}>{children}</CardDescription>;
    case "CardContent":
      return <CardContent key={key} className={itemClassName} {...otherProps}>{children}</CardContent>;
    case "CardFooter":
      return <CardFooter key={key} className={itemClassName} {...otherProps}>{children}</CardFooter>;
    case "Accordion":
      return (
        <div key={key} className="not-prose my-4">
          <Accordion className={itemClassName} {...otherProps}>{children}</Accordion>
        </div>
      );
    case "AccordionItem":
      return <AccordionItem key={key} className={itemClassName} {...otherProps}>{children}</AccordionItem>;
    case "AccordionTrigger":
      return <AccordionTrigger key={key} className={itemClassName} {...otherProps}>{children}</AccordionTrigger>;
    case "AccordionContent":
      return <AccordionContent key={key} className={itemClassName} {...otherProps}>{children}</AccordionContent>;
    case "Alert":
      return (
        <div key={key} className="not-prose my-4">
          <Alert className={itemClassName} {...otherProps}>{children}</Alert>
        </div>
      );
    case "AlertTitle":
      return <AlertTitle key={key} className={itemClassName} {...otherProps}>{children}</AlertTitle>;
    case "AlertDescription":
      return <AlertDescription key={key} className={itemClassName} {...otherProps}>{children}</AlertDescription>;
    case "Separator":
      return <Separator key={key} className={cn("my-4", itemClassName)} {...otherProps} />;
    case "Tabs":
      return (
        <div key={key} className="not-prose my-4">
          <Tabs className={itemClassName} {...otherProps}>{children}</Tabs>
        </div>
      );
    case "TabsList":
      return <TabsList key={key} className={itemClassName} {...otherProps}>{children}</TabsList>;
    case "TabsTrigger":
      return <TabsTrigger key={key} className={itemClassName} {...otherProps}>{children}</TabsTrigger>;
    case "TabsContent":
      return <TabsContent key={key} className={itemClassName} {...otherProps}>{children}</TabsContent>;
    case "Tooltip":
      return <Tooltip key={key} className={itemClassName} {...otherProps}>{children}</Tooltip>;
    case "TooltipTrigger":
      return <TooltipTrigger key={key} className={itemClassName} {...otherProps}>{children}</TooltipTrigger>;
    case "TooltipContent":
      return <TooltipContent key={key} className={itemClassName} {...otherProps}>{children}</TooltipContent>;
    case "TooltipProvider":
      return <TooltipProvider key={key} className={itemClassName} {...otherProps}>{children}</TooltipProvider>;
    // === Mintlify-style Components ===
    case "Tree":
      return (
        <div key={key} className="not-prose my-4">
          <TreeContainer className={itemClassName}>{children}</TreeContainer>
        </div>
      );
    case "Tree.Folder":
      return <TreeFolderRenderer key={key} name={props.name || "folder"} defaultOpen={props.defaultOpen} openable={props.openable}>{children}</TreeFolderRenderer>;
    case "Tree.File":
      return <TreeFileRenderer key={key} name={props.name || "file"} />;
    case "Step": {
      const stepNumber = props._stepNumber || props.stepNumber;
      return (
        <div key={key} className="relative pl-10 pb-8 last:pb-2 group/step">
          <div className="absolute left-[11px] top-[26px] bottom-0 w-px bg-border/60 group-last/step:hidden" />
          <div className="absolute left-0 top-0.5 size-[23px] rounded-full bg-vanixjnk text-white flex items-center justify-center text-[11px] font-black ring-4 ring-background z-10">
            {stepNumber || "•"}
          </div>
          <div>
            {props.title && <h3 className="text-sm font-bold text-foreground mb-1.5 tracking-tight leading-[23px]">{props.title}</h3>}
            <div className="text-[13px] text-muted-foreground leading-relaxed [&_p]:my-1 space-y-2">{children}</div>
          </div>
        </div>
      );
    }
    case "Tab":
      return (
        <div key={key} className="not-prose p-4 border border-border/60 rounded-xl my-2">
          {props.title && <h4 className="text-sm font-bold text-foreground mb-2">{props.title}</h4>}
          <div>{children}</div>
        </div>
      );
    case "Note":
      return (
        <div key={key} className="not-prose my-4 flex gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
          <Icon icon="solar:notes-line-duotone" className="size-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-[13px] text-foreground leading-relaxed [&_p]:my-0 space-y-2 flex-1">{children}</div>
        </div>
      );
    case "Warning":
      return (
        <div key={key} className="not-prose my-4 flex gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <Icon icon="solar:danger-triangle-line-duotone" className="size-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[13px] text-foreground leading-relaxed [&_p]:my-0 space-y-2 flex-1">{children}</div>
        </div>
      );
    case "Info":
      return (
        <div key={key} className="not-prose my-4 flex gap-3 p-4 rounded-xl border border-sky-500/20 bg-sky-500/5">
          <Icon icon="solar:info-circle-line-duotone" className="size-5 text-sky-500 shrink-0 mt-0.5" />
          <div className="text-[13px] text-foreground leading-relaxed [&_p]:my-0 space-y-2 flex-1">{children}</div>
        </div>
      );
    case "Tip":
      return (
        <div key={key} className="not-prose my-4 flex gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <Icon icon="solar:lightbulb-line-duotone" className="size-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-[13px] text-foreground leading-relaxed [&_p]:my-0 space-y-2 flex-1">{children}</div>
        </div>
      );
    case "Check":
      return (
        <div key={key} className="not-prose my-4 flex gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
          <Icon icon="solar:check-circle-line-duotone" className="size-5 text-green-500 shrink-0 mt-0.5" />
          <div className="text-[13px] text-foreground leading-relaxed [&_p]:my-0 space-y-2 flex-1">{children}</div>
        </div>
      );
    case "Danger":
      return (
        <div key={key} className="not-prose my-4 flex gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <Icon icon="solar:danger-circle-line-duotone" className="size-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-[13px] text-foreground leading-relaxed [&_p]:my-0 space-y-2 flex-1">{children}</div>
        </div>
      );
    case "Callout": {
      const iconName = typeof props.icon === "string" ? props.icon : "solar:chat-round-line-duotone";
      const calloutColor = (props.color as string) || null;
      if (calloutColor) {
        return (
          <div key={key} className="not-prose my-4 flex gap-3 p-4 rounded-xl border" style={{ borderColor: `color-mix(in srgb, ${calloutColor} 20%, transparent)`, backgroundColor: `color-mix(in srgb, ${calloutColor} 5%, transparent)` }}>
            <Icon icon={iconName} className="size-5 shrink-0 mt-0.5" style={{ color: calloutColor }} />
            <div className="text-[13px] text-foreground leading-relaxed [&_p]:my-0 space-y-2 flex-1">{children}</div>
          </div>
        );
      }
      return (
        <div key={key} className="not-prose my-4 flex gap-3 p-4 rounded-xl border border-vanixjnk/20 bg-vanixjnk/5">
          <Icon icon={iconName} className="size-5 text-vanixjnk shrink-0 mt-0.5" />
          <div className="text-[13px] text-foreground leading-relaxed [&_p]:my-0 space-y-2 flex-1">{children}</div>
        </div>
      );
    }
    case "Columns": {
      const cols = Number(props.cols) || 2;
      const colsMap: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-1 md:grid-cols-2", 3: "grid-cols-1 md:grid-cols-3", 4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" };
      return (
        <div key={key} className={cn("not-prose grid gap-4 my-4", colsMap[cols] || colsMap[2], itemClassName)}>
          {children}
        </div>
      );
    }
    case "Column":
      return (
        <div key={key} className={cn("min-w-0", itemClassName)}>
          {children}
        </div>
      );
    default:
      const HtmlTag = tagName.toLowerCase() as any;
      const validHtmlTags = ["div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "br", "hr", "img", "a", "strong", "em", "code", "pre", "blockquote", "table", "thead", "tbody", "tr", "th", "td"];
      if (validHtmlTags.includes(HtmlTag)) {
        const { key: _, ...cleanProps } = props;
        const voidTags = ["br", "hr", "img"];
        if (voidTags.includes(HtmlTag)) {
          return React.createElement(HtmlTag, { ...cleanProps, key });
        }
        return React.createElement(HtmlTag, { ...cleanProps, key }, children);
      }
      return <div key={key} className={itemClassName} {...otherProps}>{children}</div>;
  }
};

export const renderASTNode = (node: MdxASTNode, key: string | number, isInline = false): React.ReactNode => {
  if (node.type === "text") {
    if (isInline) {
      return <React.Fragment key={key}>{renderInlineMarkdown(node.content || "")}</React.Fragment>;
    }
    return <MarkdownBlockRenderer text={node.content || ""} key={key} />;
  }
  
  const tagName = node.name || "";

  // === Special Mintlify-style component handling (needs raw AST access) ===
  if (tagName === "CodeGroup") {
    const blocks = parseCodeGroupBlocks(node.children || []);
    return <CodeGroupRenderer key={key} blocks={blocks} />;
  }

  if (tagName === "Steps") {
    let stepIdx = 0;
    const stepsChildren = (node.children || []).map((child, idx) => {
      if (child.type === "tag" && child.name === "Step") {
        stepIdx++;
        return renderASTNode({ ...child, props: { ...child.props, _stepNumber: stepIdx } }, `${key}-${idx}`, false);
      }
      return renderASTNode(child, `${key}-${idx}`, false);
    });
    return (
      <div key={key} className="not-prose my-6 relative pl-0.5">
        {stepsChildren}
      </div>
    );
  }

  if (tagName === "Tabs") {
    const hasTabChildren = node.children?.some(c => c.type === "tag" && c.name === "Tab");
    if (hasTabChildren) {
      const tabs = (node.children || [])
        .filter(c => c.type === "tag" && c.name === "Tab")
        .map((tab, idx) => ({
          title: (tab.props?.title as string) || `Tab ${idx + 1}`,
          icon: tab.props?.icon as string | undefined,
          content: (tab.children || []).map((child, cidx) => renderASTNode(child, `mintab-${idx}-${cidx}`))
        }));
      return <MintlifyTabsRenderer key={key} tabs={tabs} />;
    }
  }
  // === End special handling ===

  const props = { ...node.props };
  
  const inlineTags = [
    "Button",
    "Badge",
    "AlertTitle",
    "AlertDescription",
    "AccordionTrigger",
    "TabsTrigger",
    "TooltipTrigger",
    "CardTitle",
    "CardDescription",
    "span",
    "a",
    "strong",
    "em",
    "code",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6"
  ];
  const childIsInline = inlineTags.includes(tagName);
  const children = node.children 
    ? node.children.map((child, idx) => renderASTNode(child, `${key}-${idx}`, childIsInline)) 
    : null;
  
  return renderMdxComponent(tagName, props, children, key);
};

export function MdxRenderer({ content, scope = {}, className }: MdxRendererProps) {
  if (!content) {
    return <p className="text-muted-foreground italic text-xs">Chưa có nội dung soạn thảo...</p>;
  }

  try {
    const tokens = tokenizeMdx(content, scope);
    
    const root: MdxASTNode[] = [];
    const stack: { node: MdxASTNode; children: MdxASTNode[] }[] = [];
    
    for (const token of tokens) {
      if (token.type === "tag-start") {
        const node: MdxASTNode = {
          type: "tag",
          name: token.name,
          props: token.props,
          children: []
        };
        
        if (token.selfClosing) {
          if (stack.length > 0) {
            stack[stack.length - 1].children.push(node);
          } else {
            root.push(node);
          }
        } else {
          stack.push({ node, children: node.children! });
        }
      } else if (token.type === "tag-end") {
        let matchedIndex = -1;
        for (let j = stack.length - 1; j >= 0; j--) {
          if (stack[j].node.name === token.name) {
            matchedIndex = j;
            break;
          }
        }
        
        if (matchedIndex !== -1) {
          const matched = stack[matchedIndex];
          stack.splice(matchedIndex);
          
          if (stack.length > 0) {
            stack[stack.length - 1].children.push(matched.node);
          } else {
            root.push(matched.node);
          }
        } else {
          const textNode: MdxASTNode = {
            type: "text",
            content: `</${token.name}>`
          };
          if (stack.length > 0) {
            stack[stack.length - 1].children.push(textNode);
          } else {
            root.push(textNode);
          }
        }
      } else {
        const node: MdxASTNode = {
          type: "text",
          content: token.content
        };
        if (stack.length > 0) {
          stack[stack.length - 1].children.push(node);
        } else {
          root.push(node);
        }
      }
    }
    
    while (stack.length > 0) {
      const item = stack.pop()!;
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(item.node);
      } else {
        root.push(item.node);
      }
    }
    
    return (
      <div className={cn("mdx-builder-renderer", className)}>
        <TooltipProvider>
          {root.map((node, idx) => renderASTNode(node, idx))}
        </TooltipProvider>
      </div>
    );
  } catch (err) {
    console.error("Failed to parse MDX/Markdown", err);
    return <p className="text-destructive font-mono text-xs">Lỗi khi biên dịch nội dung MDX: {(err as Error).message}</p>;
  }
}
