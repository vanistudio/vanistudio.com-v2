"use client";

import React from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

type MdxToken = 
  | { type: "tag-start"; name: string; props: Record<string, any>; selfClosing: boolean }
  | { type: "tag-end"; name: string }
  | { type: "text"; content: string };

export interface MdxTemplate {
  name: string;
  icon: string;
  description: string;
  template: string;
  variants?: { name: string; template: string }[];
}

export const UI_COMPONENTS_TEMPLATES: MdxTemplate[] = [
  {
    name: "Thẻ Card",
    icon: "solar:box-minimalistic-line-duotone",
    description: "Khung Card chứa tiêu đề & nội dung",
    template: `<Card className="border-border/60 bg-card">
  <CardHeader>
    <CardTitle>Tiêu đề thẻ</CardTitle>
    <CardDescription>Mô tả ngắn của thẻ</CardDescription>
  </CardHeader>
  <CardContent>
    Nội dung chi tiết của thẻ nằm ở đây.
  </CardContent>
  <CardFooter>
    <Button size="sm">Nút hành động</Button>
  </CardFooter>
</Card>\n`
  },
  {
    name: "Cảnh báo Alert",
    icon: "solar:danger-triangle-line-duotone",
    description: "Hộp cảnh báo thông tin/lưu ý",
    template: `<Alert variant="default" className="border-vanixjnk/20 bg-vanixjnk/5 text-foreground my-4">
  <Icon icon="solar:info-square-line-duotone" className="size-5 text-vanixjnk" />
  <AlertTitle className="text-vanixjnk font-bold">Tiêu đề cảnh báo</AlertTitle>
  <AlertDescription>Nội dung chi tiết của cảnh báo này.</AlertDescription>
</Alert>\n`,
    variants: [
      {
        name: "Default Info",
        template: `<Alert variant="default" className="border-vanixjnk/20 bg-vanixjnk/5 text-foreground my-4">
  <Icon icon="solar:info-square-line-duotone" className="size-5 text-vanixjnk" />
  <AlertTitle className="text-vanixjnk font-bold">Thông tin</AlertTitle>
  <AlertDescription>Nội dung chi tiết của cảnh báo thông tin.</AlertDescription>
</Alert>\n`
      },
      {
        name: "Destructive",
        template: `<Alert variant="destructive" className="my-4">
  <Icon icon="solar:danger-triangle-line-duotone" className="size-5" />
  <AlertTitle className="font-bold">Cảnh báo lỗi</AlertTitle>
  <AlertDescription>Đã xảy ra lỗi nghiêm trọng hoặc hành động nguy hiểm cần lưu ý.</AlertDescription>
</Alert>\n`
      }
    ]
  },
  {
    name: "Accordion (Sập mở)",
    icon: "solar:alt-arrow-down-line-duotone",
    description: "Bộ câu hỏi FAQ sập mở tiện lợi",
    template: `<Accordion type="single" collapsible className="w-full border border-border/60 rounded-xl px-4 py-2 bg-muted/10">
  <AccordionItem value="item-1">
    <AccordionTrigger>Câu hỏi số 1?</AccordionTrigger>
    <AccordionContent>Nội dung câu trả lời số 1.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Câu hỏi số 2?</AccordionTrigger>
    <AccordionContent>Nội dung câu trả lời số 2.</AccordionContent>
  </AccordionItem>
</Accordion>\n`
  },
  {
    name: "Bộ Tabs",
    icon: "solar:folder-open-line-duotone",
    description: "Phân chia nội dung theo tab",
    template: `<Tabs defaultValue="tab1" className="w-full">
  <TabsList className="bg-muted/40 p-1">
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1" className="p-4 border rounded-xl mt-2">Nội dung của Tab 1</TabsContent>
  <TabsContent value="tab2" className="p-4 border rounded-xl mt-2">Nội dung của Tab 2</TabsContent>
</Tabs>\n`
  },
  {
    name: "Nút bấm Button",
    icon: "solar:add-circle-line-duotone",
    description: "Nút bấm hành động tương tác",
    template: `<Button variant="default">Button</Button>\n`,
    variants: [
      { name: "default", template: `<Button variant="default">Button</Button>\n` },
      { name: "vanixjnk", template: `<Button variant="vanixjnk">Button</Button>\n` },
      { name: "secondary", template: `<Button variant="secondary">Button</Button>\n` },
      { name: "outline", template: `<Button variant="outline">Button</Button>\n` },
      { name: "ghost", template: `<Button variant="ghost">Button</Button>\n` },
      { name: "destructive", template: `<Button variant="destructive">Button</Button>\n` },
      { name: "link", template: `<Button variant="link">Button</Button>\n` },
      { name: "success", template: `<Button variant="success">Button</Button>\n` },
      { name: "danger", template: `<Button variant="danger">Button</Button>\n` },
      { name: "warning", template: `<Button variant="warning">Button</Button>\n` },
      { name: "sky", template: `<Button variant="sky">Button</Button>\n` },
      { name: "fuschia", template: `<Button variant="fuschia">Button</Button>\n` },
      { name: "rose", template: `<Button variant="rose">Button</Button>\n` },
      { name: "indigo", template: `<Button variant="indigo">Button</Button>\n` },
      { name: "violet", template: `<Button variant="violet">Button</Button>\n` },
      { name: "orange", template: `<Button variant="orange">Button</Button>\n` },
      { name: "pink", template: `<Button variant="pink">Button</Button>\n` },
      { name: "lime", template: `<Button variant="lime">Button</Button>\n` },
      { name: "emerald", template: `<Button variant="emerald">Button</Button>\n` },
      { name: "teal", template: `<Button variant="teal">Button</Button>\n` },
      { name: "cyan", template: `<Button variant="cyan">Button</Button>\n` }
    ]
  },
  {
    name: "Nhãn Badge",
    icon: "solar:star-fall-line-duotone",
    description: "Huy hiệu/Nhãn đính kèm nhỏ gọn",
    template: `<Badge variant="outline" className="border-vanixjnk/30 text-vanixjnk bg-vanixjnk/5">Nhãn mác</Badge>\n`,
    variants: [
      { name: "default", template: `<Badge variant="default">Badge</Badge>\n` },
      { name: "secondary", template: `<Badge variant="secondary">Badge</Badge>\n` },
      { name: "destructive", template: `<Badge variant="destructive">Badge</Badge>\n` },
      { name: "danger", template: `<Badge variant="danger">Badge</Badge>\n` },
      { name: "success", template: `<Badge variant="success">Badge</Badge>\n` },
      { name: "outline", template: `<Badge variant="outline">Badge</Badge>\n` },
      { name: "ghost", template: `<Badge variant="ghost">Badge</Badge>\n` },
      { name: "link", template: `<Badge variant="link">Badge</Badge>\n` }
    ]
  },
  {
    name: "Công tắc Switch",
    icon: "solar:tuning-line-duotone",
    description: "Công tắc bật tắt trạng thái",
    template: `<Switch checked={true} />\n`
  },
  {
    name: "Tooltip (Gợi ý)",
    icon: "solar:info-circle-line-duotone",
    description: "Gợi ý hiển thị khi rê chuột",
    template: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Rê chuột vào đây</TooltipTrigger>
    <TooltipContent>Nội dung gợi ý hiển thị ở đây</TooltipContent>
  </Tooltip>
</TooltipProvider>\n`
  },
  {
    name: "Bố cục Grid",
    icon: "solar:widget-3-line-duotone",
    description: "Chia cột nội dung song song",
    template: `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
  <div>Cột trái</div>
  <div>Cột phải</div>
</div>\n`
  },
  {
    name: "Đường kẻ Separator",
    icon: "solar:minimize-line-duotone",
    description: "Đường phân tách ngang thanh lịch",
    template: `<Separator className="my-4" />\n`
  }
];

export function insertMdxAtCursor(
  textarea: HTMLTextAreaElement | null,
  template: string,
  content: string,
  setContent: (val: string) => void
) {
  if (!textarea) {
    setContent(content + template);
    return;
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const before = text.substring(0, start);
  const after = text.substring(end, text.length);

  setContent(before + template + after);

  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + template.length;
  }, 0);
}

interface MdxASTNode {
  type: "tag" | "text";
  name?: string;
  props?: Record<string, any>;
  children?: MdxASTNode[];
  content?: string;
}

function highlightInlineMarkup(text: string): React.ReactNode {
  let tokens: { text: string; type?: string }[] = [{ text }];
  
  const applyRule = (regex: RegExp, type: string) => {
    const newTokens: { text: string; type?: string }[] = [];
    for (const t of tokens) {
      if (t.type) {
        newTokens.push(t);
        continue;
      }
      let lastIdx = 0;
      t.text.replace(regex, (match, ...args) => {
        const offset = args[args.length - 2] as number;
        if (offset > lastIdx) {
          newTokens.push({ text: t.text.slice(lastIdx, offset) });
        }
        newTokens.push({ text: match, type });
        lastIdx = offset + match.length;
        return match;
      });
      if (lastIdx < t.text.length) {
        newTokens.push({ text: t.text.slice(lastIdx) });
      }
    }
    tokens = newTokens;
  };

  // MDX Tags: <Tag ...> or </Tag>
  applyRule(/(<\/?[a-zA-Z0-9_-]+(?:\s+[a-zA-Z0-9_-]+(?:=(?:"[^"]*"|'[^']*'|\{[^}]+\}))?)*\s*\/?>)/g, "tag");
  // Links/images
  applyRule(/(!?\[[^\]]*\]\([^)]+\))/g, "link");
  // Inline code
  applyRule(/(`[^`]+`)/g, "inline-code");
  // Bold
  applyRule(/(\*\*[^*]+\*\*|__[^_]+__)/g, "bold");
  // Italic
  applyRule(/(\*[^*]+\*|_[^_]+_)/g, "italic");

  return (
    <>
      {tokens.map((t, idx) => {
        if (!t.type) return t.text;
        if (t.type === "tag") return <span key={idx} className="text-vanixjnk">{t.text}</span>;
        if (t.type === "link") return <span key={idx} className="text-sky-500">{t.text}</span>;
        if (t.type === "inline-code") return <span key={idx} className="text-emerald-500 font-mono bg-emerald-500/5">{t.text}</span>;
        if (t.type === "bold") return <span key={idx} className="text-foreground bg-foreground/5">{t.text}</span>;
        if (t.type === "italic") return <span key={idx} className="text-muted-foreground/90">{t.text}</span>;
        return t.text;
      })}
    </>
  );
}

function highlightMarkdownMdx(text: string): React.ReactNode {
  if (!text) return "";
  
  const lines = text.split("\n");
  let inCodeBlock = false;
  
  return (
    <>
      {lines.map((line, lineIdx) => {
        const isLast = lineIdx === lines.length - 1;
        
        if (inCodeBlock) {
          if (line.trim().startsWith("```")) {
            inCodeBlock = false;
            return (
              <span key={lineIdx} className="text-vanixjnk">
                {line}
                {!isLast && "\n"}
              </span>
            );
          }
          return (
            <span key={lineIdx} className="text-emerald-500/70 dark:text-emerald-400/70 bg-emerald-500/5">
              {line}
              {!isLast && "\n"}
            </span>
          );
        }
        
        if (line.trim().startsWith("```")) {
          inCodeBlock = true;
          return (
            <span key={lineIdx} className="text-vanixjnk">
              {line}
              {!isLast && "\n"}
            </span>
          );
        }
        
        if (line.startsWith("#")) {
          const match = line.match(/^(#{1,6}\s+)(.*)$/);
          if (match) {
            return (
              <span key={lineIdx} className="text-vanixjnk">
                <span className="opacity-50 select-none">{match[1]}</span>
                {highlightInlineMarkup(match[2])}
                {!isLast && "\n"}
              </span>
            );
          }
        }
        
        if (line.startsWith(">")) {
          return (
            <span key={lineIdx} className="text-muted-foreground/80">
              {line}
              {!isLast && "\n"}
            </span>
          );
        }
        
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ") || /^\s*\d+\.\s/.test(line.trim())) {
          const match = line.match(/^(\s*[-*+]|\s*\d+\.)\s(.*)$/);
          if (match) {
            return (
              <span key={lineIdx}>
                <span className="text-vanixjnk">{match[1]} </span>
                {highlightInlineMarkup(match[2])}
                {!isLast && "\n"}
              </span>
            );
          }
        }
        
        return (
          <span key={lineIdx}>
            {highlightInlineMarkup(line)}
            {!isLast && "\n"}
          </span>
        );
      })}
    </>
  );
}
function highlightCode(code: string, lang: string): React.ReactNode {
  if (!code) return "";
  if (!lang) return code;
  const l = lang.toLowerCase();

  if (l === "markdown" || l === "md" || l === "mdx") {
    return highlightMarkdownMdx(code);
  }
  
  if (l === "javascript" || l === "typescript" || l === "js" || l === "ts" || l === "json") {
    let tokens: { text: string; type?: string }[] = [{ text: code }];
    
    const applyRule = (regex: RegExp, type: string) => {
      const newTokens: { text: string; type?: string }[] = [];
      for (const t of tokens) {
        if (t.type) {
          newTokens.push(t);
          continue;
        }
        let lastIdx = 0;
        t.text.replace(regex, (match, ...args) => {
          const offset = args[args.length - 2] as number;
          if (offset > lastIdx) {
            newTokens.push({ text: t.text.slice(lastIdx, offset) });
          }
          newTokens.push({ text: match, type });
          lastIdx = offset + match.length;
          return match;
        });
        if (lastIdx < t.text.length) {
          newTokens.push({ text: t.text.slice(lastIdx) });
        }
      }
      tokens = newTokens;
    };

    applyRule(/(\/\/.*|\/\*[\s\S]*?\*\/)/g, "comment");
    applyRule(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, "string");
    applyRule(/\b(const|let|var|function|return|import|export|from|default|class|extends|if|else|for|while|do|switch|case|break|continue|new|try|catch|finally|throw|async|await|type|interface|as|enum|public|private|protected|static|readonly|keyof|typeof|any|string|number|boolean|void|never|unknown)\b/g, "keyword");
    applyRule(/\b(console|window|document|process|Object|Array|String|Number|Boolean|Function|Promise|Map|Set|Error|React|useState|useEffect|useRef|useMemo|useCallback)\b/g, "builtin");
    applyRule(/\b(\d+(?:\.\d+)?)\b/g, "number");
    applyRule(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g, "fn");

    return (
      <>
        {tokens.map((t, idx) => {
          if (!t.type) return t.text;
          let colorClass = "";
          if (t.type === "comment") colorClass = "text-muted-foreground italic opacity-75";
          else if (t.type === "string") colorClass = "text-emerald-500 font-medium dark:text-emerald-400";
          else if (t.type === "keyword") colorClass = "text-vanixjnk font-semibold dark:text-vanixjnk/90";
          else if (t.type === "builtin") colorClass = "text-sky-500 font-medium dark:text-sky-400";
          else if (t.type === "number") colorClass = "text-amber-500 dark:text-amber-400";
          else if (t.type === "fn") colorClass = "text-violet-500 dark:text-violet-400";
          return <span key={idx} className={colorClass}>{t.text}</span>;
        })}
      </>
    );
  }

  if (l === "html" || l === "xml" || l === "svg") {
    let tokens: { text: string; type?: string }[] = [{ text: code }];
    
    const applyRule = (regex: RegExp, type: string) => {
      const newTokens: { text: string; type?: string }[] = [];
      for (const t of tokens) {
        if (t.type) {
          newTokens.push(t);
          continue;
        }
        let lastIdx = 0;
        t.text.replace(regex, (match, ...args) => {
          const offset = args[args.length - 2] as number;
          if (offset > lastIdx) {
            newTokens.push({ text: t.text.slice(lastIdx, offset) });
          }
          newTokens.push({ text: match, type });
          lastIdx = offset + match.length;
          return match;
        });
        if (lastIdx < t.text.length) {
          newTokens.push({ text: t.text.slice(lastIdx) });
        }
      }
      tokens = newTokens;
    };

    applyRule(/(<!--[\s\S]*?-->)/g, "comment");
    applyRule(/(<\/?[a-zA-Z0-9_:-]+)/g, "tag");
    applyRule(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, "string");
    applyRule(/([a-zA-Z0-9_-]+)(?=\s*=)/g, "attr");

    return (
      <>
        {tokens.map((t, idx) => {
          if (!t.type) return t.text;
          let colorClass = "";
          if (t.type === "comment") colorClass = "text-muted-foreground opacity-75";
          else if (t.type === "tag") colorClass = "text-vanixjnk dark:text-vanixjnk/90";
          else if (t.type === "string") colorClass = "text-emerald-500 dark:text-emerald-400";
          else if (t.type === "attr") colorClass = "text-sky-500 dark:text-sky-400";
          return <span key={idx} className={colorClass}>{t.text}</span>;
        })}
      </>
    );
  }

  if (l === "css") {
    let tokens: { text: string; type?: string }[] = [{ text: code }];
    
    const applyRule = (regex: RegExp, type: string) => {
      const newTokens: { text: string; type?: string }[] = [];
      for (const t of tokens) {
        if (t.type) {
          newTokens.push(t);
          continue;
        }
        let lastIdx = 0;
        t.text.replace(regex, (match, ...args) => {
          const offset = args[args.length - 2] as number;
          if (offset > lastIdx) {
            newTokens.push({ text: t.text.slice(lastIdx, offset) });
          }
          newTokens.push({ text: match, type });
          lastIdx = offset + match.length;
          return match;
        });
        if (lastIdx < t.text.length) {
          newTokens.push({ text: t.text.slice(lastIdx) });
        }
      }
      tokens = newTokens;
    };

    applyRule(/(\/\*[\s\S]*?\*\/)/g, "comment");
    applyRule(/([.#]?[a-zA-Z0-9_*-]+)(?=\s*\{)/g, "selector");
    applyRule(/([a-zA-Z0-9_-]+)(?=\s*:)/g, "property");
    applyRule(/(:\s*[^;\n]+)/g, "value");

    return (
      <>
        {tokens.map((t, idx) => {
          if (!t.type) return t.text;
          let colorClass = "";
          if (t.type === "comment") colorClass = "text-muted-foreground opacity-75";
          else if (t.type === "selector") colorClass = "text-vanixjnk dark:text-vanixjnk/90";
          else if (t.type === "property") colorClass = "text-sky-500 dark:text-sky-400";
          else if (t.type === "value") {
            const valueStr = t.text;
            return (
              <span key={idx}>
                <span className="text-foreground">:</span>
                <span className="text-emerald-500 dark:text-emerald-400">{valueStr.slice(1)}</span>
              </span>
            );
          }
          return <span key={idx} className={colorClass}>{t.text}</span>;
        })}
      </>
    );
  }

  return code;
}

interface MdxRendererProps {
  content: string;
  scope?: Record<string, any>;
  className?: string;
}

export function MdxRenderer({ content, scope = {}, className }: MdxRendererProps) {
  if (!content) {
    return <p className="text-muted-foreground italic text-xs">Chưa có nội dung soạn thảo...</p>;
  }

  const evaluatePropValue = (val: string): any => {
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

  const parseTagContent = (tagStr: string): { name: string; props: Record<string, any> } => {
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
        props[key] = evaluatePropValue(curlyVal);
      } else {
        props[key] = true;
      }
    }
    
    return { name, props };
  };

  const tokenizeMdx = (input: string): MdxToken[] => {
    const tokens: MdxToken[] = [];
    let idx = 0;
    
    while (idx < input.length) {
      const nextTagStart = input.indexOf("<", idx);
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
        const { name, props } = parseTagContent(cleanContent);
        tokens.push({ type: "tag-start", name, props, selfClosing });
      }
    }
    
    return tokens;
  };

  const renderInlineMarkdown = (text: string): React.ReactNode => {
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

  const MarkdownBlockRenderer = ({ text }: { text: string }): React.ReactNode => {
    if (!text) return null;
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: string[] = [];
    let inCodeBlock = false;
    let codeContent = "";
    let codeLang = "";
    let keyIdx = 0;
    
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
    
    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const trimmed = line.trim();
      
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${keyIdx++}`} className="not-prose p-4 rounded-xl bg-muted/30 border border-border/80 font-mono text-xs overflow-x-auto my-4 text-foreground leading-relaxed">
              <code className={codeLang ? `language-${codeLang}` : ""}>
                {highlightCode(codeContent.trim(), codeLang)}
              </code>
            </pre>
          );
          inCodeBlock = false;
          codeContent = "";
        } else {
          inCodeBlock = true;
          codeLang = trimmed.slice(3).trim();
        }
        continue;
      }
      
      if (inCodeBlock) {
        codeContent += line + "\n";
        continue;
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
    return <>{elements}</>;
  };

  const renderMdxComponent = (tagName: string, props: any, children: any, key: string | number): React.ReactNode => {
    const { className: itemClassName, ...otherProps } = props;
    
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
      default:
        const HtmlTag = tagName.toLowerCase() as any;
        const validHtmlTags = ["div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "br", "hr", "img", "a", "strong", "em", "code", "pre", "blockquote", "table", "thead", "tbody", "tr", "th", "td"];
        if (validHtmlTags.includes(HtmlTag)) {
          return React.createElement(HtmlTag, { ...props, key }, children);
        }
        return <div key={key} className={itemClassName} {...otherProps}>{children}</div>;
    }
  };

  try {
    const tokens = tokenizeMdx(content);
    
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
    
    const renderASTNode = (node: MdxASTNode, key: string | number, isInline = false): React.ReactNode => {
      if (node.type === "text") {
        if (isInline) {
          return <React.Fragment key={key}>{renderInlineMarkdown(node.content || "")}</React.Fragment>;
        }
        return <MarkdownBlockRenderer text={node.content || ""} key={key} />;
      }
      
      const tagName = node.name || "";
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

const commonSmallStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  margin: 0,
  padding: "16px",
  border: "none",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "var(--font-geist-mono, ui-monospace, monospace)",
  fontSize: "12px",
  lineHeight: "20px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  overflowWrap: "break-word",
  overflowY: "scroll",
  overflowX: "hidden",
  textRendering: "optimizeLegibility",
  letterSpacing: "normal",
  wordSpacing: "normal",
  textTransform: "none",
  textIndent: "0px",
  textShadow: "none",
  textAlign: "start",
  fontVariantLigatures: "none",
  fontFeatureSettings: '"liga" 0, "clig" 0, "calt" 0',
};

const smallOverlayStyle: React.CSSProperties = {
  ...commonSmallStyle,
  pointerEvents: "none",
  userSelect: "none",
  backgroundColor: "transparent",
  color: "inherit",
};

const smallTextareaStyle: React.CSSProperties = {
  ...commonSmallStyle,
  resize: "none",
  color: "transparent",
  backgroundColor: "transparent",
  caretColor: "var(--foreground, currentColor)",
};

const commonMaximizedStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  margin: 0,
  padding: "24px",
  border: "none",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "var(--font-geist-mono, ui-monospace, monospace)",
  fontSize: "14px",
  lineHeight: "24px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  overflowWrap: "break-word",
  overflowY: "scroll",
  overflowX: "hidden",
  textRendering: "optimizeLegibility",
  letterSpacing: "normal",
  wordSpacing: "normal",
  textTransform: "none",
  textIndent: "0px",
  textShadow: "none",
  textAlign: "start",
  fontVariantLigatures: "none",
  fontFeatureSettings: '"liga" 0, "clig" 0, "calt" 0',
};

const maximizedOverlayStyle: React.CSSProperties = {
  ...commonMaximizedStyle,
  pointerEvents: "none",
  userSelect: "none",
  backgroundColor: "transparent",
  color: "inherit",
};

const maximizedTextareaStyle: React.CSSProperties = {
  ...commonMaximizedStyle,
  resize: "none",
  color: "transparent",
  backgroundColor: "transparent",
  caretColor: "var(--foreground, currentColor)",
};

export interface MdxEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  onOpenGallery?: () => void;
  scope?: Record<string, any>;
}

export const MdxEditor = React.forwardRef<HTMLTextAreaElement, MdxEditorProps>(({
  value,
  onChange,
  placeholder = "Soạn thảo nội dung trang bằng định dạng Markdown hoặc văn bản thuần...",
  className,
  onOpenGallery,
  scope = {}
}, ref) => {
  const [contentTab, setContentTab] = React.useState<"write" | "preview">("write");
  const [isMaximized, setIsMaximized] = React.useState(false);
  const localRef = React.useRef<HTMLTextAreaElement>(null);
  
  const smallOverlayRef = React.useRef<HTMLPreElement>(null);
  const maximizedOverlayRef = React.useRef<HTMLPreElement>(null);

  const setRef = React.useCallback((node: HTMLTextAreaElement | null) => {
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      (ref as any).current = node;
    }
    (localRef as any).current = node;
  }, [ref]);

  const handleSmallScroll = React.useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (smallOverlayRef.current) {
      smallOverlayRef.current.scrollTop = e.currentTarget.scrollTop;
      smallOverlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  const handleMaximizedScroll = React.useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (maximizedOverlayRef.current) {
      maximizedOverlayRef.current.scrollTop = e.currentTarget.scrollTop;
      maximizedOverlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  React.useEffect(() => {
    if (isMaximized) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMaximized]);

  const handleInsert = (textToInsert: string) => {
    insertMdxAtCursor(localRef.current, textToInsert, value, onChange);
  };

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = localRef.current;
    if (!textarea) {
      onChange(value + prefix + suffix);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = prefix + (selectedText || "văn bản") + suffix;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    onChange(before + replacement + after);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + (selectedText || "văn bản").length;
    }, 0);
  };

  return (
    <div className={cn("border border-border/80 rounded-xl overflow-hidden bg-background", className)}>
      <div className="flex items-center justify-between border-b border-border/80 bg-muted/10 p-2 select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => insertFormatting("**", "**")}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
            title="Đậm"
          >
            <Icon icon="solar:text-bold-line-duotone" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("*", "*")}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
            title="Nghiêng"
          >
            <Icon icon="solar:text-italic-line-duotone" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("# ", "")}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
            title="Tiêu đề 1"
          >
            <Icon icon="solar:text-square-line-duotone" className="size-4" />
          </button>
          <div className="w-px h-4 bg-border/80 mx-1 shrink-0" />
          <button
            type="button"
            onClick={() => insertFormatting("\n- ", "")}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
            title="Danh sách"
          >
            <Icon icon="solar:list-down-minimalistic-line-duotone" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("\n```javascript\n// code\n```\n", "")}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
            title="Khối mã"
          >
            <Icon icon="solar:code-line-duotone" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("[", "](url)")}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
            title="Đường dẫn"
          >
            <Icon icon="solar:link-broken-line-duotone" className="size-4" />
          </button>

          {onOpenGallery && (
            <button
              type="button"
              onClick={onOpenGallery}
              className="p-1 rounded hover:bg-muted text-vanixjnk hover:text-vanixjnk flex items-center gap-0.5 shrink-0"
              title="Thêm ảnh từ thư viện"
            >
              <Icon icon="solar:gallery-line-duotone" className="size-4" />
              <span className="text-[9px] font-bold hidden sm:inline">Thêm ảnh</span>
            </button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="p-1 rounded hover:bg-muted text-vanixjnk hover:text-vanixjnk flex items-center gap-0.5 shrink-0"
                title="Chèn nhanh component Shadcn/MDX"
              >
                <Icon icon="solar:widget-add-line-duotone" className="size-4" />
                <span className="text-[9px] font-bold hidden sm:inline">Component UI</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3 flex flex-col gap-2 bg-popover border-border" align="start">
              <div className="flex flex-col gap-0.5 border-b pb-1 border-border/60 mb-1">
                <span className="text-xs font-bold text-foreground">Thư viện thành phần UI</span>
                <span className="text-[10px] text-muted-foreground">Click để chèn vào vị trí con trỏ</span>
              </div>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {UI_COMPONENTS_TEMPLATES.map((comp) => (
                  <div
                    key={`pop-${comp.name}`}
                    className="flex flex-col p-2 rounded-xl border border-border/60 bg-muted/10 hover:bg-muted/30 transition-all duration-150 group"
                  >
                    <div
                      role="button"
                      onClick={() => handleInsert(comp.template)}
                      className="flex items-center justify-between w-full cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-vanixjnk/15 group-hover:text-vanixjnk shrink-0 transition-colors">
                          <Icon icon={comp.icon} className="size-4" />
                        </div>
                        <span className="text-[11px] font-bold text-foreground group-hover:text-vanixjnk transition-colors">
                          {comp.name}
                        </span>
                      </div>
                      <span className="text-[9px] text-muted-foreground line-clamp-1 max-w-[145px]">
                        {comp.description}
                      </span>
                    </div>

                    {comp.variants && (
                      <div className="flex flex-wrap gap-1 mt-2 pl-8">
                        {comp.variants.map((v) => (
                          <button
                            key={v.name}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsert(v.template);
                            }}
                            className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-background hover:bg-vanixjnk/10 hover:text-vanixjnk border border-border/80 hover:border-vanixjnk/30 transition-all"
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/20 border border-border/60">
            <button
              type="button"
              onClick={() => setContentTab("write")}
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all duration-200 shrink-0",
                contentTab === "write"
                  ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-xs"
                  : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <span>Viết</span>
            </button>
            <button
              type="button"
              onClick={() => setContentTab("preview")}
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all duration-200 shrink-0",
                contentTab === "preview"
                  ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-xs"
                  : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <span>Xem trước</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMaximized(true)}
            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 shrink-0"
            title="Phóng to toàn màn hình"
          >
            <Icon icon="solar:maximize-line-duotone" className="size-4" />
          </button>
        </div>
      </div>

      {contentTab === "write" ? (
        <div className="relative w-full h-[300px] border-0 rounded-none overflow-hidden bg-background">
          <pre
            ref={smallOverlayRef}
            className="absolute inset-0 pointer-events-none select-none text-foreground bg-transparent"
            style={smallOverlayStyle}
          >
            {highlightMarkdownMdx(value)}
            {value.endsWith("\n") ? "\n" : ""}
          </pre>
          <textarea
            ref={setRef}
            value={value}
            onScroll={handleSmallScroll}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="absolute inset-0 bg-transparent text-transparent caret-foreground outline-none focus:outline-none focus:ring-0"
            style={smallTextareaStyle}
          />
        </div>
      ) : (
        <div className="h-[300px] overflow-y-auto p-4 bg-muted/5 font-sans prose dark:prose-invert max-w-none">
          <MdxRenderer content={value} scope={scope} />
        </div>
      )}

      <AnimatePresence>
        {isMaximized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden transition-colors duration-300 font-sans"
          >
            <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b bg-background/50 backdrop-blur-md z-20">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMaximized(false)}
                  className="rounded-full"
                  title="Thu nhỏ"
                >
                  <Icon icon="solar:arrow-left-line-duotone" className="size-5" />
                </Button>
                
                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-2">
                  <Icon icon="solar:pen-2-line-duotone" className="size-4 text-vanixjnk" />
                  <h1 className="text-sm font-bold uppercase tracking-widest truncate max-w-[400px]">
                    {scope?.formData?.title ? `Biên tập: ${scope.formData.title}` : "Soạn thảo bài viết (Mở rộng)"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMaximized(false)}
                  className="h-8 px-4"
                >
                  <Icon icon="solar:minimize-line-duotone" className="size-4 mr-2" />
                  <span>Thu nhỏ</span>
                </Button>
              </div>
            </header>

            <div className="flex-1 flex flex-row overflow-hidden relative">
              <aside className="w-[300px] shrink-0 border-r bg-muted/5 hidden md:flex flex-col overflow-y-auto p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Icon icon="solar:widget-add-line-duotone" className="size-4 text-vanixjnk" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/80">Thành phần UI</span>
                  </div>
                  <Separator className="opacity-50" />
                  <div className="grid grid-cols-1 gap-2">
                    {UI_COMPONENTS_TEMPLATES.map((comp) => (
                      <div
                        key={`max-pop-${comp.name}`}
                        className="flex flex-col p-2.5 rounded-xl border border-border/60 hover:border-vanixjnk/20 transition-all duration-150 bg-background group"
                      >
                        <div
                          role="button"
                          onClick={() => handleInsert(comp.template)}
                          className="flex flex-col gap-1 w-full cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div className="size-6 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-vanixjnk/15 group-hover:text-vanixjnk shrink-0 transition-colors">
                              <Icon icon={comp.icon} className="size-4" />
                            </div>
                            <span className="text-[11px] font-bold text-foreground group-hover:text-vanixjnk truncate">
                              {comp.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground pl-8 line-clamp-1">
                            {comp.description}
                          </span>
                        </div>

                        {comp.variants && (
                          <div className="flex flex-wrap gap-1 mt-2 pl-8">
                            {comp.variants.map((v) => (
                              <button
                                key={v.name}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInsert(v.template);
                                }}
                                className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-muted hover:bg-vanixjnk/10 hover:text-vanixjnk border border-border/80 hover:border-vanixjnk/30 transition-all"
                              >
                                {v.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              <section className="flex-1 flex flex-col relative h-full bg-background overflow-hidden">
                <div className="h-12 shrink-0 flex items-center justify-between px-4 border-b bg-muted/10">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      type="button"
                      onClick={() => insertFormatting("**", "**")}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                      title="Đậm"
                    >
                      <Icon icon="solar:text-bold-line-duotone" className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("*", "*")}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                      title="Nghiêng"
                    >
                      <Icon icon="solar:text-italic-line-duotone" className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("# ", "")}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                      title="Tiêu đề 1"
                    >
                      <Icon icon="solar:text-square-line-duotone" className="size-4" />
                    </button>
                    <div className="w-px h-4 bg-border/80 mx-1 shrink-0" />
                    <button
                      type="button"
                      onClick={() => insertFormatting("\n- ", "")}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                      title="Danh sách"
                    >
                      <Icon icon="solar:list-down-minimalistic-line-duotone" className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("\n```javascript\n// code\n```\n", "")}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                      title="Khối mã"
                    >
                      <Icon icon="solar:code-line-duotone" className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("[", "](url)")}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                      title="Đường dẫn"
                    >
                      <Icon icon="solar:link-broken-line-duotone" className="size-4" />
                    </button>
                    {onOpenGallery && (
                      <button
                        type="button"
                        onClick={onOpenGallery}
                        className="p-1 rounded hover:bg-muted text-vanixjnk hover:text-vanixjnk flex items-center gap-0.5 shrink-0"
                        title="Thêm ảnh từ thư viện"
                      >
                        <Icon icon="solar:gallery-line-duotone" className="size-4" />
                        <span className="text-[9px] font-bold hidden sm:inline">Thêm ảnh</span>
                      </button>
                    )}

                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="p-1 rounded hover:bg-muted text-vanixjnk hover:text-vanixjnk flex items-center gap-0.5 shrink-0 md:hidden"
                          title="Chèn nhanh component Shadcn/MDX"
                        >
                          <Icon icon="solar:widget-add-line-duotone" className="size-4" />
                          <span className="text-[9px] font-bold">Thành phần UI</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-3 flex flex-col gap-2 bg-popover border-border z-50" align="start">
                        <div className="flex flex-col gap-0.5 border-b pb-1 border-border/60 mb-1">
                          <span className="text-xs font-bold text-foreground">Thư viện thành phần UI</span>
                          <span className="text-[10px] text-muted-foreground">Click để chèn vào vị trí con trỏ</span>
                        </div>
                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                          {UI_COMPONENTS_TEMPLATES.map((comp) => (
                            <div
                              key={`pop-max-${comp.name}`}
                              className="flex flex-col p-2 rounded-xl border border-border/60 bg-muted/10 hover:bg-muted/30 transition-all duration-150 group"
                            >
                              <div
                                role="button"
                                onClick={() => handleInsert(comp.template)}
                                className="flex items-center justify-between w-full cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="size-6 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-vanixjnk/15 group-hover:text-vanixjnk shrink-0 transition-colors">
                                    <Icon icon={comp.icon} className="size-4" />
                                  </div>
                                  <span className="text-[11px] font-bold text-foreground group-hover:text-vanixjnk transition-colors">
                                    {comp.name}
                                  </span>
                                </div>
                                <span className="text-[9px] text-muted-foreground line-clamp-1 max-w-[145px]">
                                  {comp.description}
                                </span>
                              </div>

                              {comp.variants && (
                                <div className="flex flex-wrap gap-1 mt-2 pl-8">
                                  {comp.variants.map((v) => (
                                    <button
                                      key={v.name}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleInsert(v.template);
                                      }}
                                      className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-background hover:bg-vanixjnk/10 hover:text-vanixjnk border border-border/80 hover:border-vanixjnk/30 transition-all"
                                    >
                                      {v.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-muted/20 border border-border/60 whitespace-nowrap shrink-0">
                    <button
                      type="button"
                      onClick={() => setContentTab("write")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all duration-200 shrink-0",
                        contentTab === "write"
                          ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-xs"
                          : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <Icon icon="solar:pen-2-line-duotone" className="size-3.5" />
                      <span>Biên tập</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentTab("preview")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all duration-200 shrink-0",
                        contentTab === "preview"
                          ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-xs"
                          : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <Icon icon="solar:eye-line-duotone" className="size-3.5" />
                      <span>Preview song song</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-row overflow-hidden min-h-0">
                  <div className={cn(
                    "flex-1 flex transition-all duration-300 min-h-0 min-w-0",
                    contentTab === "preview" ? "flex-col lg:flex-row" : "flex-row"
                  )}>
                    <div className={cn(
                      "flex-1 relative bg-background overflow-hidden min-h-0",
                      contentTab === "preview" && "lg:w-1/2 lg:border-r border-border/60"
                    )}>
                      <pre
                        ref={maximizedOverlayRef}
                        className="absolute inset-0 pointer-events-none select-none text-foreground bg-transparent"
                        style={maximizedOverlayStyle}
                      >
                        {highlightMarkdownMdx(value)}
                        {value.endsWith("\n") ? "\n" : ""}
                      </pre>
                      <textarea
                        ref={setRef}
                        value={value}
                        onScroll={handleMaximizedScroll}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="absolute inset-0 bg-transparent text-transparent caret-foreground outline-none focus:outline-none focus:ring-0"
                        style={maximizedTextareaStyle}
                      />
                    </div>

                    {contentTab === "preview" && (
                      <div className="flex-1 overflow-y-auto bg-muted/5 min-h-0 lg:w-1/2">
                        <div className="max-w-3xl mx-auto p-8 md:p-12 min-h-full">
                          <div className="prose dark:prose-invert max-w-none">
                            <div className="mb-8 space-y-3 not-prose">
                              <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">
                                {scope?.formData?.title || "Bản xem trước"}
                              </h2>
                              <div className="h-1 w-12 bg-vanixjnk rounded-full" />
                            </div>
                            <MdxRenderer content={value} scope={scope} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
MdxEditor.displayName = "MdxEditor";
