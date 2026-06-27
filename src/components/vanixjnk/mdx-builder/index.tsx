"use client";

import React from "react";
import { useTheme } from "next-themes";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { markdown } from "@codemirror/lang-markdown";
import { javascript } from "@codemirror/lang-javascript";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

import { UI_COMPONENTS_TEMPLATES } from "./templates";
import { MdxRenderer } from "./parser";
import { MdxTemplate } from "./types";

export { MdxRenderer };
export type { MdxRendererProps } from "./parser";
export type { MdxTemplate };

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
  const { resolvedTheme } = useTheme();
  
  const smallCodeMirrorRef = React.useRef<ReactCodeMirrorRef>(null);
  const maximizedCodeMirrorRef = React.useRef<ReactCodeMirrorRef>(null);
  const activeEditorRef = isMaximized ? maximizedCodeMirrorRef : smallCodeMirrorRef;

  const mockTextarea = React.useMemo(() => {
    const getActiveView = () => activeEditorRef.current?.view;
    return {
      focus: () => {
        getActiveView()?.focus();
      },
      get value() {
        return value;
      },
      get selectionStart() {
        const view = getActiveView();
        if (!view) return 0;
        return view.state.selection.main.from;
      },
      set selectionStart(val: number) {
        const view = getActiveView();
        if (!view) return;
        view.dispatch({
          selection: { anchor: val, head: view.state.selection.main.to }
        });
      },
      get selectionEnd() {
        const view = getActiveView();
        if (!view) return 0;
        return view.state.selection.main.to;
      },
      set selectionEnd(val: number) {
        const view = getActiveView();
        if (!view) return;
        view.dispatch({
          selection: { anchor: view.state.selection.main.from, head: val }
        });
      }
    } as unknown as HTMLTextAreaElement;
  }, [value, isMaximized]);

  React.useImperativeHandle(ref, () => mockTextarea, [mockTextarea]);

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
    insertMdxAtCursor(mockTextarea, textToInsert, value, onChange);
  };

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = mockTextarea;
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
        <div className="relative w-full h-[300px] md:h-[600px] border-0 rounded-none overflow-hidden bg-background">
          <CodeMirror
            ref={smallCodeMirrorRef}
            value={value}
            height="100%"
            theme={resolvedTheme === "light" ? "light" : oneDark}
            extensions={[markdown({ defaultCodeLanguage: javascript() })]}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full h-full text-xs font-mono"
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
            }}
          />
        </div>
      ) : (
        <div className="h-[300px] md:h-[600px] overflow-y-auto p-4 bg-muted/5 font-sans prose dark:prose-invert max-w-none">
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
                      <CodeMirror
                        ref={maximizedCodeMirrorRef}
                        value={value}
                        height="100%"
                        theme={resolvedTheme === "light" ? "light" : oneDark}
                        extensions={[markdown({ defaultCodeLanguage: javascript() })]}
                        onChange={onChange}
                        placeholder={placeholder}
                        className="w-full h-full text-sm font-mono"
                        basicSetup={{
                          lineNumbers: true,
                          foldGutter: true,
                          dropCursor: true,
                          allowMultipleSelections: true,
                          indentOnInput: true,
                        }}
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
