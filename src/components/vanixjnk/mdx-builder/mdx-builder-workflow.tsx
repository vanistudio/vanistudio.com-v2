"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export interface WorkflowNodeProps {
  id?: string;
  title: string;
  description?: string;
  details?: string;
  logs?: string[];
  icon?: string;
  status?: "active" | "success" | "warning" | "error" | "pending";
  duration?: string;
  method?: string;
  badge?: string;
  badgeVariant?: "primary" | "success" | "warning" | "info" | "default";
  className?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  index?: number;
  onClick?: () => void;
}

export interface WorkflowConnectorProps {
  label?: string;
  className?: string;
  type?: "solid" | "dashed" | "dotted";
  isFlowing?: boolean;
  color?: "primary" | "success" | "warning" | "error" | "default";
  speed?: "fast" | "normal" | "slow";
}

export interface WorkflowProps {
  children?: React.ReactNode;
  className?: string;
  direction?: "horizontal" | "vertical" | "responsive";
  interactive?: boolean | string;
}

export function WorkflowNode({
  title,
  description,
  icon,
  status = "pending",
  duration,
  method,
  badge,
  badgeVariant = "default",
  className,
  isActive = false,
  isCompleted = false,
  onClick,
  index
}: WorkflowNodeProps) {
  
  const resolvedStatus = isActive 
    ? "active" 
    : isCompleted 
      ? "success" 
      : status;

  const statusConfig = {
    active: {
      bg: "border-vanixjnk bg-vanixjnk/[0.04] dark:bg-vanixjnk/[0.06] ring-1 ring-vanixjnk/25",
      dot: "bg-vanixjnk shadow-[0_0_8px_rgba(var(--vanixjnk-rgb),0.6)] animate-pulse",
      iconBg: "bg-vanixjnk/15 text-vanixjnk"
    },
    success: {
      bg: "border-emerald-500/40 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]",
      dot: "bg-emerald-500",
      iconBg: "bg-emerald-500/15 text-emerald-500"
    },
    warning: {
      bg: "border-amber-500/40 bg-amber-500/[0.02] dark:bg-amber-500/[0.04]",
      dot: "bg-amber-500",
      iconBg: "bg-amber-500/15 text-amber-500"
    },
    error: {
      bg: "border-red-500/40 bg-red-500/[0.02] dark:bg-red-500/[0.04]",
      dot: "bg-red-500",
      iconBg: "bg-red-500/15 text-red-500"
    },
    pending: {
      bg: "border-border/60 bg-muted/10",
      dot: "bg-muted-foreground/30",
      iconBg: "bg-muted/60 text-muted-foreground"
    }
  };

  const currentStatus = statusConfig[resolvedStatus] || statusConfig.pending;

  const badgeStyles = {
    primary: "bg-vanixjnk/10 text-vanixjnk border-vanixjnk/20",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    info: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    default: "bg-muted text-muted-foreground border-border/80"
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex flex-col p-3.5 rounded-xl border bg-card/80 backdrop-blur-xs shadow-xs transition-all duration-300 w-full shrink-0 select-none cursor-pointer text-left md:max-w-[280px]",
        isActive && "scale-[1.02] -translate-y-0.5 shadow-md",
        !isActive && "hover:-translate-y-0.5 hover:shadow-xs",
        currentStatus.bg,
        className
      )}
    >
      <div className="flex items-center gap-2.5 justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <div className={cn("size-7.5 rounded-lg flex items-center justify-center shrink-0 transition-colors", currentStatus.iconBg)}>
              <Icon icon={icon} className="size-4" />
            </div>
          )}
          <div className="min-w-0">
            {method && (
              <span className="text-[9px] font-black mr-1 px-1 py-0.25 bg-muted-foreground/15 text-muted-foreground rounded uppercase">
                {method}
              </span>
            )}
            <h4 className="text-xs font-extrabold text-foreground inline-block truncate align-middle">
              {title}
            </h4>
          </div>
        </div>
        <span className={cn("size-2 rounded-full shrink-0 transition-all", currentStatus.dot)} />
      </div>

      {description && (
        <p className="text-[10.5px] text-muted-foreground leading-relaxed mt-2.5 line-clamp-2">
          {description}
        </p>
      )}

      {(duration || badge) && (
        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-border/40 text-[9px] font-semibold">
          {duration && (
            <div className="flex items-center gap-1 text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-md border border-border/40">
              <Icon icon="solar:clock-circle-linear" className="size-3" />
              <span>{duration}</span>
            </div>
          )}
          {badge && (
            <span className={cn("px-1.5 py-0.5 rounded-md border", badgeStyles[badgeVariant])}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function WorkflowConnector({
  label,
  className,
  type = "dashed",
  isFlowing = false,
  color = "default",
  speed = "normal"
}: WorkflowConnectorProps) {

  const colorMap = {
    primary: "stroke-vanixjnk/75",
    success: "stroke-emerald-500/75",
    warning: "stroke-amber-500/75",
    error: "stroke-red-500/75",
    default: "stroke-muted-foreground/30"
  };

  const activeColorMap = {
    primary: "stroke-vanixjnk",
    success: "stroke-emerald-500",
    warning: "stroke-amber-500",
    error: "stroke-red-500",
    default: "stroke-vanixjnk"
  };

  const lineStroke = isFlowing ? activeColorMap[color] : colorMap[color];
  const markerId = `arrow-${isFlowing ? "active" : "inactive"}-${color}`;

  const speedDuration = {
    fast: "0.8s",
    normal: "1.4s",
    slow: "2.2s"
  }[speed];

  return (
    <div className={cn("flex items-center justify-center shrink-0 min-w-[75px] w-full md:w-auto", className)}>
      <div className="hidden md:flex flex-col items-center justify-center w-full relative py-4 px-1.5 select-none">
        {label && (
          <span className={cn(
            "text-[9px] font-black tracking-wide uppercase px-2 py-0.5 rounded-full z-10 border max-w-[120px] truncate mb-1 transition-all",
            isFlowing 
              ? "bg-vanixjnk/15 text-vanixjnk border-vanixjnk/30 scale-105 shadow-xs" 
              : "bg-muted/80 text-muted-foreground/80 border-border/60"
          )}>
            {label}
          </span>
        )}
        <svg className="w-full h-4 overflow-visible" fill="none" viewBox="0 0 100 16">
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,1.5 L8,5 L0,8.5 Z" className={isFlowing ? "fill-vanixjnk" : "fill-muted-foreground/40"} />
            </marker>
          </defs>
          <line 
            x1="0" 
            y1="8" 
            x2="94" 
            y2="8" 
            className={cn(
              "stroke-[2] transition-colors duration-300",
              lineStroke,
              isFlowing && "flowing-line",
              type === "dashed" && "stroke-dasharray-dashed",
              type === "dotted" && "stroke-dasharray-dotted"
            )} 
            style={{ animationDuration: speedDuration }}
            markerEnd={`url(#${markerId})`} 
          />
        </svg>
      </div>
      
      <div className="flex md:hidden flex-row items-center justify-center h-12 w-full relative px-4 py-1 select-none">
        <svg className="h-full w-4 overflow-visible" fill="none" viewBox="0 0 16 48">
          <defs>
            <marker id={`${markerId}-v`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M1.5,0 L5,8 L8.5,0 Z" className={isFlowing ? "fill-vanixjnk" : "fill-muted-foreground/40"} />
            </marker>
          </defs>
          <line 
            x1="8" 
            y1="0" 
            x2="8" 
            y2="40" 
            className={cn(
              "stroke-[2] transition-colors duration-300",
              lineStroke,
              isFlowing && "flowing-line-vertical",
              type === "dashed" && "stroke-dasharray-dashed-v",
              type === "dotted" && "stroke-dasharray-dotted-v"
            )} 
            style={{ animationDuration: speedDuration }}
            markerEnd={`url(#${markerId}-v)`} 
          />
        </svg>
        {label && (
          <span className={cn(
            "ml-2.5 text-[9px] font-black tracking-wide uppercase px-2 py-0.5 rounded-full z-10 border max-w-[160px] truncate transition-all",
            isFlowing 
              ? "bg-vanixjnk/15 text-vanixjnk border-vanixjnk/30 scale-105" 
              : "bg-muted/80 text-muted-foreground/80 border-border/60"
          )}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

function parseTextWorkflow(text: string): React.ReactNode[] {
  const cleanText = text.replace(/\r/g, "").trim();
  const items = cleanText.split(/\s*(?:-+>|=+>)\s*/);
  
  const elements: React.ReactNode[] = [];
  
  items.forEach((item, idx) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    
    if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
      const label = trimmed.slice(1, -1).trim();
      elements.push(<WorkflowConnector key={`conn-${idx}`} label={label} />);
    } else {
      let nodeContent = trimmed;
      if (nodeContent.startsWith("[") && nodeContent.endsWith("]")) {
        nodeContent = nodeContent.slice(1, -1).trim();
      }

      const segments = nodeContent.split("|");
      const mainSegment = segments[0].trim();
      
      let title = mainSegment;
      let desc = "";
      if (mainSegment.includes(":")) {
        const parts = mainSegment.split(":");
        title = parts[0].trim();
        desc = parts.slice(1).join(":").trim();
      }

      let duration = "";
      let method = "";
      let badge = "";
      let badgeVariant: any = "default";
      let details = "";
      let logs: string[] = [];

      segments.slice(1).forEach(seg => {
        const cleanSeg = seg.trim();
        if (cleanSeg.startsWith("duration=")) {
          duration = cleanSeg.replace("duration=", "").trim();
        } else if (cleanSeg.startsWith("method=")) {
          method = cleanSeg.replace("method=", "").trim();
        } else if (cleanSeg.startsWith("badge=")) {
          badge = cleanSeg.replace("badge=", "").trim();
        } else if (cleanSeg.startsWith("badgeVariant=")) {
          badgeVariant = cleanSeg.replace("badgeVariant=", "").trim();
        } else if (cleanSeg.startsWith("details=")) {
          details = cleanSeg.replace("details=", "").trim();
        } else if (cleanSeg.startsWith("logs=")) {
          const logsStr = cleanSeg.replace("logs=", "").trim();
          logs = logsStr.split(",").map(l => l.trim().replace(/^['"]|['"]$/g, ""));
        }
      });
      
      let icon = "solar:notes-line-duotone";
      let status: "active" | "success" | "pending" = "pending";
      
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes("click") || lowerTitle.includes("nhấn")) {
        icon = "solar:mouse-line-duotone";
        status = "active";
      } else if (lowerTitle.includes("shell") || lowerTitle.includes("tải") || lowerTitle.includes("cache")) {
        icon = "solar:ghost-line-duotone";
        status = "active";
      } else if (lowerTitle.includes("server") || lowerTitle.includes("database") || lowerTitle.includes("render")) {
        icon = "solar:server-line-duotone";
        status = "pending";
      } else if (lowerTitle.includes("suspense") || lowerTitle.includes("hoàn tất") || lowerTitle.includes("hiển thị") || lowerTitle.includes("điền")) {
        icon = "solar:check-circle-line-duotone";
        status = "success";
      }

      if (!details) {
        if (lowerTitle.includes("click")) {
          details = "Người dùng bắt đầu quá trình điều hướng bằng cách click vào một link. Lúc này client chặn sự kiện click và kích hoạt render song song.";
          logs = logs.length ? logs : [
            "🕒 0ms - Click event intercepted on client-side",
            "🚀 Loading static template shell from cache...",
            "📡 Establishing HTTP connection streams with the server..."
          ];
        } else if (lowerTitle.includes("shell")) {
          details = "Trình duyệt lấy giao diện khung xương (Static Shell) từ Client Cache và render ngay lập tức trong 0ms. Người dùng thấy giao diện tức thì.";
          logs = logs.length ? logs : [
            "🕒 0.5ms - Cache HIT for path /products/sneaker-ultra",
            "🖼️ Rendering static skeleton layout...",
            "🔒 Mounting layout Shell without dynamic data elements"
          ];
        } else if (lowerTitle.includes("server")) {
          details = "Server song song thực thi phần dynamic segments. Sau khi tính toán xong, Server gửi dần dữ liệu qua đường truyền HTTP stream.";
          logs = logs.length ? logs : [
            "🕒 45ms - Server received streaming data request",
            "🔍 Resolving Database query: Fetching product metadata",
            "📦 Streamed: HTTP Chunk [Product Details] (2.4kb)"
          ];
        } else if (lowerTitle.includes("suspense") || lowerTitle.includes("giải phóng")) {
          details = "React Client nhận được dữ liệu hoàn tất từ HTTP stream. Thẻ Suspense được giải phóng (resolved) và điền nốt phần UI động vào vị trí tương ứng.";
          logs = logs.length ? logs : [
            "🕒 120ms - Final HTTP stream chunks received",
            "🔄 Resolving React Suspense boundary...",
            "✨ UI hydrated successfully. Navigation finished in 120ms!"
          ];
        }
      }
      
      elements.push(
        <WorkflowNode
          key={`node-${idx}`}
          title={title}
          description={desc || undefined}
          icon={icon}
          status={status}
          duration={duration || undefined}
          method={method || undefined}
          badge={badge || undefined}
          badgeVariant={badgeVariant}
          details={details || undefined}
          logs={logs.length ? logs : undefined}
        />
      );
      
      const nextItem = items[idx + 1];
      if (nextItem && !(nextItem.trim().startsWith("(") && nextItem.trim().endsWith(")"))) {
        elements.push(<WorkflowConnector key={`conn-default-${idx}`} />);
      }
    }
  });
  
  return elements;
}

export function Workflow({ children, className, direction = "responsive", interactive = false }: WorkflowProps) {
  const isInteractive = interactive === true || interactive === "true";
  
  let resolvedChildrenList: React.ReactNode[] = [];
  
  if (typeof children === "string") {
    resolvedChildrenList = parseTextWorkflow(children);
  } else if (React.isValidElement(children) && typeof (children.props as any)?.children === "string") {
    resolvedChildrenList = parseTextWorkflow((children.props as any).children);
  } else {
    resolvedChildrenList = React.Children.toArray(children);
  }

  const nodesOnly: React.ReactElement[] = [];
  const renderedElements: React.ReactNode[] = [];
  
  resolvedChildrenList.forEach((child) => {
    if (React.isValidElement(child)) {
      const typeName = (child.type as any).name || "";
      if (child.type === WorkflowNode || typeName === "WorkflowNode") {
        nodesOnly.push(child);
      }
    }
  });

  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      if (activeStep >= nodesOnly.length - 1) {
        setIsPlaying(false);
        return;
      }
      playTimer.current = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, 2000);
    } else if (playTimer.current) {
      clearTimeout(playTimer.current);
    }

    return () => {
      if (playTimer.current) clearTimeout(playTimer.current);
    };
  }, [isPlaying, activeStep, nodesOnly.length]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (activeStep >= nodesOnly.length - 1) {
        setActiveStep(0);
      }
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (activeStep < nodesOnly.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStep(0);
  };

  let nodeIndexCounter = 0;
  let elementIndexCounter = 0;
  
  resolvedChildrenList.forEach((child) => {
    if (React.isValidElement(child)) {
      const childProps = child.props as any;
      const typeName = (child.type as any).name || "";
      if (child.type === WorkflowNode || typeName === "WorkflowNode") {
        const currentIdx = nodeIndexCounter;
        nodeIndexCounter++;

        renderedElements.push(
          React.cloneElement(child as React.ReactElement<any>, {
            key: `node-injected-${elementIndexCounter++}`,
            index: currentIdx,
            isActive: isInteractive ? (activeStep === currentIdx) : (childProps.isActive || childProps.status === "active"),
            isCompleted: isInteractive ? (currentIdx < activeStep) : (childProps.isCompleted || childProps.status === "success"),
            onClick: isInteractive ? () => { setIsPlaying(false); setActiveStep(currentIdx); } : childProps.onClick
          })
        );
      } else if (child.type === WorkflowConnector || typeName === "WorkflowConnector") {
        const correspondingNodeIdx = nodeIndexCounter - 1;
        const isFlowing = isInteractive && (correspondingNodeIdx === activeStep);
        const isCompleted = isInteractive && (correspondingNodeIdx < activeStep);

        renderedElements.push(
          React.cloneElement(child as React.ReactElement<any>, {
            key: `connector-injected-${elementIndexCounter++}`,
            isFlowing: isInteractive ? isFlowing : childProps.isFlowing,
            color: isInteractive 
              ? (isCompleted ? "success" : isFlowing ? "primary" : "default") 
              : childProps.color
          })
        );
      } else {
        renderedElements.push(child);
      }
    } else {
      renderedElements.push(child);
    }
  });

  const isResponsive = direction === "responsive";
  const isHorizontal = direction === "horizontal";
  const isVertical = direction === "vertical";

  const activeNodeProps = (nodesOnly[activeStep]?.props as any) || {};
  const inspectorTitle = activeNodeProps.title || "Chưa chọn bước";
  const inspectorDetails = activeNodeProps.details || activeNodeProps.description || "Bấm chọn các khối ở trên để xem chi tiết hoạt động.";
  const inspectorLogs: string[] = activeNodeProps.logs || [];
  const inspectorDuration = activeNodeProps.duration;
  const inspectorMethod = activeNodeProps.method;
  const inspectorBadge = activeNodeProps.badge;

  const [activeConsoleTab, setActiveConsoleTab] = useState<"terminal" | "details">("terminal");

  return (
    <div className="my-6 border border-border/80 rounded-2xl bg-muted/20 p-4 md:p-5 shadow-xs relative">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes workflow-flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        .flowing-line {
          stroke-dasharray: 6, 4;
          animation: workflow-flow 1.2s linear infinite;
        }
        .flowing-line-vertical {
          stroke-dasharray: 6, 4;
          animation: workflow-flow 1.2s linear infinite;
        }
        .stroke-dasharray-dashed {
          stroke-dasharray: 5, 5;
        }
        .stroke-dasharray-dotted {
          stroke-dasharray: 2, 3;
        }
        .stroke-dasharray-dashed-v {
          stroke-dasharray: 5, 5;
        }
        .stroke-dasharray-dotted-v {
          stroke-dasharray: 2, 3;
        }
      `}} />

      {isInteractive && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-border/80 select-none">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vanixjnk opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2.5 bg-vanixjnk"></span>
            </span>
            <span className="text-[11px] font-black tracking-wider uppercase text-muted-foreground">
              Mô phỏng Lifecycle (Bước {activeStep + 1}/{nodesOnly.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-background/60 border border-border/80 p-1 rounded-xl">
            <button 
              onClick={handlePrev}
              disabled={activeStep === 0}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
              title="Bước trước"
            >
              <Icon icon="solar:double-alt-arrow-left-bold-duotone" className="size-4" />
            </button>
            <button 
              onClick={handlePlayToggle}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors select-none",
                isPlaying 
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/15" 
                  : "bg-vanixjnk text-white hover:bg-vanixjnk/95"
              )}
            >
              <Icon icon={isPlaying ? "solar:pause-bold-duotone" : "solar:play-bold-duotone"} className="size-3.5" />
              <span>{isPlaying ? "Tạm dừng" : "Chạy mô phỏng"}</span>
            </button>
            <button 
              onClick={handleNext}
              disabled={activeStep === nodesOnly.length - 1}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
              title="Bước sau"
            >
              <Icon icon="solar:double-alt-arrow-right-bold-duotone" className="size-4" />
            </button>
            <button 
              onClick={handleReset}
              disabled={activeStep === 0 && !isPlaying}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
              title="Reset"
            >
              <Icon icon="solar:restart-bold-duotone" className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div className={cn(
        "w-full flex overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent select-none",
        isResponsive && "flex-col md:flex-row md:items-center md:justify-start gap-1 md:gap-0",
        isHorizontal && "flex-row items-center justify-start gap-0",
        isVertical && "flex-col gap-1",
        className
      )}>
        {renderedElements}
      </div>

      {isInteractive && nodesOnly.length > 0 && (
        <div className="mt-4 border border-border/80 rounded-xl overflow-hidden bg-card shadow-xs flex flex-col md:flex-row min-h-[160px]">
          
          <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-border/60 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="text-[10px] bg-vanixjnk/15 text-vanixjnk px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Bước {activeStep + 1}
                </span>
                {inspectorMethod && (
                  <span className="text-[9px] bg-muted-foreground/15 text-muted-foreground px-1.5 py-0.5 rounded uppercase font-black">
                    {inspectorMethod}
                  </span>
                )}
                {inspectorBadge && (
                  <span className="text-[9px] bg-muted border text-muted-foreground px-1.5 py-0.5 rounded font-bold">
                    {inspectorBadge}
                  </span>
                )}
              </div>
              <h5 className="text-sm font-black text-foreground mb-2">
                {inspectorTitle}
              </h5>
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                {inspectorDetails}
              </p>
            </div>
            
            {inspectorDuration && (
              <div className="mt-3 text-[10px] text-muted-foreground/80 flex items-center gap-1">
                <Icon icon="solar:clock-circle-bold-duotone" className="size-3.5 text-vanixjnk" />
                <span>Thời gian thực thi: <strong className="text-foreground">{inspectorDuration}</strong></span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col bg-zinc-950 text-zinc-300 font-mono text-[11px] min-h-[140px] md:min-h-0">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 bg-zinc-900 select-none">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-red-500/80" />
                <div className="size-2 rounded-full bg-yellow-500/80" />
                <div className="size-2 rounded-full bg-green-500/80" />
                <span className="text-[10px] text-zinc-400 font-bold ml-2">devconsole.log</span>
              </div>
              <div className="text-[10px] text-zinc-500">
                127.0.0.1:3000
              </div>
            </div>

            <div className="flex-1 p-3.5 overflow-y-auto space-y-1.5 max-h-[180px] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {inspectorLogs.length > 0 ? (
                inspectorLogs.map((log, lIdx) => (
                  <div key={lIdx} className="leading-relaxed flex items-start gap-1.5">
                    <span className="text-zinc-500 shrink-0 select-none">&gt;</span>
                    <span className={cn(
                      log.includes("error") || log.includes("❌") ? "text-red-400" :
                      log.includes("warn") || log.includes("⚠️") ? "text-yellow-400" :
                      log.includes("success") || log.includes("✨") || log.includes("HIT") ? "text-emerald-400" :
                      "text-zinc-300"
                    )}>
                      {log}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 italic">No logs generated for this step.</div>
              )}
              <div className="flex items-center">
                <span className="text-zinc-500 mr-1.5 select-none">&gt;</span>
                <span className="w-1.5 h-3 bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
