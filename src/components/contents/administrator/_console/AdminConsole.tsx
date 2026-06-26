"use client";

import React, { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "motion/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function formatDuration(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

function parseAnsiTerminal(text: string): string {
  if (!text) return "";

  const grid: { char: string; fg?: string; bg?: string; bold?: boolean }[][] = [];
  
  let row = 0;
  let col = 0;
  let fg = "";
  let bg = "";
  let bold = false;

  let i = 0;
  const len = text.length;

  const colorMap: Record<string, string> = {
    "30": "ansi-fg-30",
    "31": "ansi-fg-31",
    "32": "ansi-fg-32",
    "33": "ansi-fg-33",
    "34": "ansi-fg-34",
    "35": "ansi-fg-35",
    "36": "ansi-fg-36",
    "37": "ansi-fg-37",
    "90": "ansi-fg-90",
    "91": "ansi-fg-91",
    "92": "ansi-fg-92",
    "93": "ansi-fg-93",
    "94": "ansi-fg-94",
    "95": "ansi-fg-95",
    "96": "ansi-fg-96",
    "97": "ansi-fg-97",
    "40": "ansi-bg-40",
    "41": "ansi-bg-41",
    "42": "ansi-bg-42",
    "43": "ansi-bg-43",
    "44": "ansi-bg-44",
    "45": "ansi-bg-45",
    "46": "ansi-bg-46",
    "47": "ansi-bg-47",
    "100": "ansi-bg-100",
    "101": "ansi-bg-101",
    "102": "ansi-bg-102",
    "103": "ansi-bg-103",
    "104": "ansi-bg-104",
    "105": "ansi-bg-105",
    "106": "ansi-bg-106",
    "107": "ansi-bg-107",
  };

  while (i < len) {
    const char = text[i];

    if (char === "\u001b" || char === "\x1B") {
      i++;
      if (text[i] === "[") {
        i++;
        let seq = "";
        while (i < len && !/[a-zA-Z]/.test(text[i])) {
          seq += text[i];
          i++;
        }
        const cmd = text[i];
        i++;

        const params = seq.split(";").map(p => parseInt(p, 10) || 0);
        const val = params[0] || 0;

        if (cmd === "m") {
          for (const param of seq.split(";")) {
            const p = param.trim();
            if (p === "0" || p === "") {
              fg = "";
              bg = "";
              bold = false;
            } else if (p === "1") {
              bold = true;
            } else if (colorMap[p]) {
              if (parseInt(p, 10) >= 40 && parseInt(p, 10) <= 107) {
                bg = colorMap[p];
              } else {
                fg = colorMap[p];
              }
            }
          }
        } else if (cmd === "A") {
          row = Math.max(0, row - (val || 1));
        } else if (cmd === "B") {
          row = row + (val || 1);
        } else if (cmd === "C") {
          col = col + (val || 1);
        } else if (cmd === "D") {
          col = Math.max(0, col - (val || 1));
        } else if (cmd === "G") {
          col = Math.max(0, val - 1);
        } else if (cmd === "H" || cmd === "f") {
          const r = params[0] || 1;
          const c = params[1] || 1;
          row = Math.max(0, r - 1);
          col = Math.max(0, c - 1);
        } else if (cmd === "K") {
          if (grid[row]) {
            grid[row] = grid[row].slice(0, col);
          }
        }
      } else {
        writeChar(char);
        writeChar(text[i]);
        i++;
      }
    } else if (char === "\n") {
      row++;
      col = 0;
      i++;
    } else if (char === "\r") {
      col = 0;
      i++;
    } else if (char === "\t") {
      col = Math.floor((col + 8) / 8) * 8;
      i++;
    } else {
      writeChar(char);
      i++;
    }
  }

  function writeChar(c: string) {
    if (!grid[row]) {
      grid[row] = [];
    }
    while (grid[row].length < col) {
      grid[row].push({ char: " " });
    }
    grid[row][col] = { char: c, fg, bg, bold };
    col++;
  }

  let html = "";
  for (let r = 0; r < grid.length; r++) {
    const line = grid[r];
    if (!line) {
      html += "\n";
      continue;
    }

    let currentFg = "";
    let currentBg = "";
    let currentBold = false;
    let spanBuffer = "";

    for (let c = 0; c < line.length; c++) {
      const cell = line[c] || { char: " " };
      const cellFg = cell.fg || "";
      const cellBg = cell.bg || "";
      const cellBold = cell.bold || false;

      if (cellFg !== currentFg || cellBg !== currentBg || cellBold !== currentBold) {
        if (spanBuffer) {
          html += renderSpan(spanBuffer, currentFg, currentBg, currentBold);
          spanBuffer = "";
        }
        currentFg = cellFg;
        currentBg = cellBg;
        currentBold = cellBold;
      }
      spanBuffer += cell.char;
    }

    if (spanBuffer) {
      html += renderSpan(spanBuffer, currentFg, currentBg, currentBold);
    }
    html += "\n";
  }

  return html;

  function renderSpan(text: string, fgColor: string, bgColor: string, isBold: boolean): string {
    const escapedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    const classes = [];
    if (fgColor) classes.push(fgColor);
    if (bgColor) classes.push(bgColor);
    if (isBold) classes.push("font-bold");

    if (classes.length > 0) {
      return `<span class="${classes.join(" ")}">${escapedText}</span>`;
    }
    return escapedText;
  }
}

export default function AdminConsole() {
  const [selectedCommand, setSelectedCommand] = useState("git status");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const maximizedTerminalRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, refetch, isFetching } = trpc.administrator.console.getSystemInfo.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
    }
  );

  const runCommandMutation = trpc.administrator.console.runCommand.useMutation();

  useEffect(() => {
    setTerminalLogs([
      "Welcome to Vani Studio System Console [v1.0.0]",
      "Select a whitelisted command above and click 'Thực thi' to run diagnostic tools.",
      "--------------------------------------------------------------------------------",
    ]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    if (maximizedTerminalRef.current) {
      maximizedTerminalRef.current.scrollTop = maximizedTerminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  useEffect(() => {
    if (isMaximized) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMaximized]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Đã làm mới thông tin hệ thống");
    } catch {
      toast.error("Có lỗi xảy ra khi tải lại thông tin hệ thống");
    }
  };

  const handleExecute = async () => {
    if (!selectedCommand) {
      toast.warning("Vui lòng chọn lệnh để thực thi");
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [
      ...prev,
      `[${timestamp}] $ ${selectedCommand}`,
      "Running...",
    ]);

    try {
      const response = await runCommandMutation.mutateAsync({
        command: selectedCommand,
      });

      setTerminalLogs((prev) => {
        const cleaned = prev.slice(0, -1);
        const newLogs = [...cleaned];
        if (response.data.stdout) {
          newLogs.push(parseAnsiTerminal(response.data.stdout));
        }
        if (response.data.stderr) {
          newLogs.push(`<span class="text-rose-600 dark:text-rose-400 font-bold">Error Output:</span>\n${parseAnsiTerminal(response.data.stderr)}`);
        }
        if (!response.data.stdout && !response.data.stderr) {
          newLogs.push("(No output returned)");
        }
        newLogs.push("--------------------------------------------------------------------------------");
        return newLogs;
      });

      if (response.resultCode === 0) {
        toast.success("Thực thi lệnh thành công");
      } else {
        toast.error("Lệnh thực thi trả về mã lỗi");
      }
    } catch (err: any) {
      setTerminalLogs((prev) => {
        const cleaned = prev.slice(0, -1);
        return [
          ...cleaned,
          `Fatal Error:\n${err.message || "Command execution request failed"}`,
          "--------------------------------------------------------------------------------",
        ];
      });
      toast.error(err.message || "Thực thi lệnh thất bại");
    }
  };

  const handleClearLogs = () => {
    setTerminalLogs([
      "Console cleared.",
      "--------------------------------------------------------------------------------",
    ]);
    toast.success("Đã xóa màn hình console");
  };

  const handleCopyLogs = () => {
    if (terminalLogs.length === 0) return;
    navigator.clipboard.writeText(terminalLogs.join("\n"));
    toast.success("Đã sao chép nhật ký console vào Clipboard");
  };

  const system = data?.data?.system;
  const proc = data?.data?.process;
  const git = data?.data?.git;

  const memoryPercentage = system ? Math.round(((system.totalMem - system.freeMem) / system.totalMem) * 100) : 0;

  return (
    <div className="flex flex-col w-full flex-1">
      <style dangerouslySetInnerHTML={{ __html: `
        .terminal-window {
          background-color: #fafafa;
          border-color: #e4e4e7;
          color: #18181b;
        }
        .terminal-header {
          background-color: #f4f4f5;
          border-bottom-color: #e4e4e7;
          color: #71717a;
        }
        .terminal-logs {
          color: #18181b;
        }

        .ansi-fg-30 { color: #18181b; }
        .ansi-fg-31 { color: #dc2626; }
        .ansi-fg-32 { color: #16a34a; }
        .ansi-fg-33 { color: #ca8a04; }
        .ansi-fg-34 { color: #2563eb; }
        .ansi-fg-35 { color: #d946ef; }
        .ansi-fg-36 { color: #0891b2; }
        .ansi-fg-37 { color: #52525b; }
        .ansi-fg-90 { color: #71717a; }
        .ansi-fg-91 { color: #ef4444; }
        .ansi-fg-92 { color: #22c55e; }
        .ansi-fg-93 { color: #eab308; }
        .ansi-fg-94 { color: #3b82f6; }
        .ansi-fg-95 { color: #f43f5e; }
        .ansi-fg-96 { color: #06b6d4; }
        .ansi-fg-97 { color: #09090b; }

        .ansi-bg-40 { background-color: #f4f4f5; }
        .ansi-bg-41 { background-color: #fca5a5; }
        .ansi-bg-42 { background-color: #86efac; }
        .ansi-bg-43 { background-color: #fde047; }
        .ansi-bg-44 { background-color: #93c5fd; }
        .ansi-bg-45 { background-color: #f9a8d4; }
        .ansi-bg-46 { background-color: #67e8f9; }
        .ansi-bg-47 { background-color: #e4e4e7; }
        .ansi-bg-100 { background-color: #a1a1aa; }
        .ansi-bg-101 { background-color: #f87171; }
        .ansi-bg-102 { background-color: #4ade80; }
        .ansi-bg-103 { background-color: #facc15; }
        .ansi-bg-104 { background-color: #60a5fa; }
        .ansi-bg-105 { background-color: #f472b6; }
        .ansi-bg-106 { background-color: #22d3ee; }
        .ansi-bg-107 { background-color: #ffffff; }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d8;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1aa;
        }

        .dark .terminal-window {
          background-color: #0d0e12;
          border-color: #27272a;
          color: #e5e7eb;
        }
        .dark .terminal-header {
          background-color: #16171d;
          border-bottom-color: #27272a;
          color: #a1a1aa;
        }
        .dark .terminal-logs {
          color: #e5e7eb;
        }

        .dark .ansi-fg-30 { color: #4b5563; }
        .dark .ansi-fg-31 { color: #ef4444; }
        .dark .ansi-fg-32 { color: #22c55e; }
        .dark .ansi-fg-33 { color: #eab308; }
        .dark .ansi-fg-34 { color: #3b82f6; }
        .dark .ansi-fg-35 { color: #ec4899; }
        .dark .ansi-fg-36 { color: #06b6d4; }
        .dark .ansi-fg-37 { color: #e5e7eb; }
        .dark .ansi-fg-90 { color: #9ca3af; }
        .dark .ansi-fg-91 { color: #f87171; }
        .dark .ansi-fg-92 { color: #4ade80; }
        .dark .ansi-fg-93 { color: #facc15; }
        .dark .ansi-fg-94 { color: #60a5fa; }
        .dark .ansi-fg-95 { color: #f472b6; }
        .dark .ansi-fg-96 { color: #22d3ee; }
        .dark .ansi-fg-97 { color: #ffffff; }

        .dark .ansi-bg-40 { background-color: #111827; }
        .dark .ansi-bg-41 { background-color: #ef4444; }
        .dark .ansi-bg-42 { background-color: #22c55e; }
        .dark .ansi-bg-43 { background-color: #eab308; }
        .dark .ansi-bg-44 { background-color: #3b82f6; }
        .dark .ansi-bg-45 { background-color: #ec4899; }
        .dark .ansi-bg-46 { background-color: #06b6d4; }
        .dark .ansi-bg-47 { background-color: #e5e7eb; }
        .dark .ansi-bg-100 { background-color: #4b5563; }
        .dark .ansi-bg-101 { background-color: #f87171; }
        .dark .ansi-bg-102 { background-color: #4ade80; }
        .dark .ansi-bg-103 { background-color: #facc15; }
        .dark .ansi-bg-104 { background-color: #60a5fa; }
        .dark .ansi-bg-105 { background-color: #f472b6; }
        .dark .ansi-bg-106 { background-color: #22d3ee; }
        .dark .ansi-bg-107 { background-color: #ffffff; }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2b2d3a;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f4255;
        }
      ` }} />
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:code-square-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Console hệ thống</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Theo dõi trạng thái tài nguyên máy chủ, kiểm tra biến môi trường và thực thi các lệnh chẩn đoán.
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
            backgroundImage: "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)"
          }}
        />
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-b border-border/60 flex-1">
            <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-border/60 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Giám sát máy chủ</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cấu hình phần cứng và tình trạng tải CPU, bộ nhớ.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading || isFetching}
                  className="gap-1.5 shrink-0"
                >
                  <Icon
                    icon="solar:restart-line-duotone"
                    className={cn("text-base", (isLoading || isFetching) && "animate-spin")}
                  />
                  <span>Làm mới</span>
                </Button>
              </div>

              {isLoading ? (
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Card className="p-4 bg-background/60 border-border/80 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Bộ nhớ (RAM)</p>
                        <h4 className="text-sm font-bold text-foreground">
                          {formatBytes(system ? system.totalMem - system.freeMem : 0)} / {formatBytes(system?.totalMem || 0)}
                        </h4>
                      </div>
                      <div className="size-10 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                        <Icon icon="solar:server-square-line-duotone" className="text-xl" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${memoryPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                        <span>Đã dùng: {memoryPercentage}%</span>
                        <span>Trống: {formatBytes(system?.freeMem || 0)}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-background/60 border-border/80 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Node.js Process</p>
                        <h4 className="text-sm font-bold text-foreground font-mono mt-0.5">
                          {proc?.nodeVersion}
                        </h4>
                      </div>
                      <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                        <Icon icon="solar:programming-line-duotone" className="text-xl" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-border/40 pt-2 mt-1">
                      <div>
                        <span className="text-muted-foreground">RAM Heap Used:</span>
                        <p className="font-semibold font-mono text-foreground">{formatBytes(proc?.memoryUsage.heapUsed || 0)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">RAM RSS:</span>
                        <p className="font-semibold font-mono text-foreground">{formatBytes(proc?.memoryUsage.rss || 0)}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-background/60 border-border/80 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái Runtime</p>
                      </div>
                      <div className="size-8 rounded-lg text-sky-500 bg-sky-500/10 border border-sky-500/25 flex items-center justify-center shrink-0">
                        <Icon icon="solar:history-line-duotone" className="text-lg" />
                      </div>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between items-center py-1 border-b border-border/30">
                        <span className="text-muted-foreground">Git Repository:</span>
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <Icon icon="solar:git-branch-line-duotone" className="text-sm text-sky-500" />
                          {git?.branch} <span className="text-[10px] text-muted-foreground font-mono">({git?.commit})</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-border/30">
                        <span className="text-muted-foreground">Uptime máy chủ:</span>
                        <span className="font-semibold text-foreground">{formatDuration(system?.uptime || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Uptime tiến trình:</span>
                        <span className="font-semibold text-foreground">{formatDuration(proc?.uptime || 0)}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
            <div className="lg:col-span-7 p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Bảng thực thi lệnh chẩn đoán</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Thực thi lệnh kiểm tra mã nguồn, dung lượng disk và trạng thái repository.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
                  <div className="flex-grow w-full relative">
                    <Input
                      value={selectedCommand}
                      onChange={(e) => setSelectedCommand(e.target.value)}
                      disabled={runCommandMutation.isPending}
                      placeholder="Nhập lệnh custom tại đây (ví dụ: ls -la, git status...)"
                      className="h-9 text-xs pr-28 w-full"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-auto">
                      <Select
                        value=""
                        onValueChange={(val) => val && setSelectedCommand(val)}
                        disabled={runCommandMutation.isPending}
                      >
                        <SelectTrigger className="h-7 border-0 bg-transparent text-muted-foreground hover:text-foreground text-[10px] font-bold py-0 px-2 gap-1 focus:ring-0 focus:ring-offset-0 w-auto shadow-none">
                          <SelectValue placeholder="Gợi ý lệnh" />
                        </SelectTrigger>
                        <SelectContent className="w-56">
                          <SelectItem value="git status" className="text-xs font-mono">git status</SelectItem>
                          <SelectItem value="git branch" className="text-xs font-mono">git branch</SelectItem>
                          <SelectItem value="git log -n 5 --oneline" className="text-xs font-mono">git log -n 5</SelectItem>
                          <SelectItem value="df -h" className="text-xs font-mono">df -h (Disk Space)</SelectItem>
                          <SelectItem value="node -v" className="text-xs font-mono">node -v</SelectItem>
                          <SelectItem value="npm -v" className="text-xs font-mono">npm -v</SelectItem>
                          <SelectItem value="npm list --depth=0" className="text-xs font-mono">npm list --depth=0</SelectItem>
                          <SelectItem value="npx tsc --noEmit" className="text-xs font-mono text-amber-500 font-bold">npx tsc --noEmit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    variant="vanixjnk"
                    size="sm"
                    className="font-bold text-xs shrink-0 h-9"
                    onClick={handleExecute}
                    disabled={runCommandMutation.isPending || !selectedCommand.trim()}
                  >
                    {runCommandMutation.isPending ? (
                      <>
                        <Icon icon="solar:spinner-line-duotone" className="size-4 animate-spin mr-1.5" />
                        <span>Đang chạy...</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:play-line-duotone" className="size-4 mr-1.5" />
                        <span>Thực thi</span>
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto sm:ml-auto">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
                      title="Sao chép nhật ký"
                      onClick={handleCopyLogs}
                      disabled={terminalLogs.length <= 3}
                    >
                      <Icon icon="solar:copy-line-duotone" className="text-base" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Xóa nhật ký"
                      onClick={handleClearLogs}
                      disabled={terminalLogs.length <= 2}
                    >
                      <Icon icon="solar:trash-bin-trash-line-duotone" className="text-base" />
                    </Button>
                  </div>
                </div>
                <div className="terminal-window relative rounded-xl border overflow-hidden shadow-md flex flex-col">
                  <div className="terminal-header flex items-center justify-between px-4 py-2.5 border-b select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-[#ff5f56]" />
                      <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
                      <span className="size-2.5 rounded-full bg-[#27c93f]" />
                      <span className="text-[10px] font-bold font-mono tracking-wider ml-2 uppercase">Terminal - diagnostics</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMaximized(true)}
                      className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all duration-150 shrink-0"
                      title="Phóng to toàn màn hình"
                    >
                      <Icon icon="solar:maximize-line-duotone" className="size-3.5" />
                    </button>
                  </div>
                  <div
                    ref={terminalRef}
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                    className="terminal-logs p-4 h-[350px] overflow-y-auto text-[12px] whitespace-pre leading-[1.35] select-text custom-scrollbar scroll-smooth"
                  >
                    {terminalLogs.map((log, index) => {
                      let color = "text-neutral-800 dark:text-neutral-200";
                      let isHtml = false;

                      if (log.startsWith("[") && log.includes("$ ")) {
                        color = "text-sky-600 dark:text-sky-400 font-bold";
                      } else if (log.startsWith("Error Output:") || log.startsWith("Fatal Error:")) {
                        color = "text-rose-600 dark:text-rose-400 font-bold";
                      } else if (log.startsWith("Running...")) {
                        color = "text-amber-600 dark:text-amber-400 italic animate-pulse";
                      } else if (log.startsWith("Welcome") || log.startsWith("Select") || log.startsWith("Console") || log.startsWith("----")) {
                        color = "text-neutral-400 dark:text-neutral-500";
                      } else {
                        isHtml = true;
                      }
                      
                      if (isHtml) {
                        return (
                          <div
                            key={index}
                            className={color}
                            dangerouslySetInnerHTML={{ __html: log }}
                          />
                        );
                      }

                      return (
                        <div key={index} className={color}>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  <Icon icon="solar:code-square-line-duotone" className="size-4 text-vanixjnk" />
                  <h1 className="text-sm font-bold uppercase tracking-widest truncate max-w-[400px]">
                    Terminal
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
            <div className="p-4 border-b bg-muted/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="flex-grow w-full relative">
                <Input
                  value={selectedCommand}
                  onChange={(e) => setSelectedCommand(e.target.value)}
                  disabled={runCommandMutation.isPending}
                  placeholder="Nhập lệnh custom tại đây (ví dụ: ls -la, git status...)"
                  className="h-9 text-xs pr-28 w-full"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-auto">
                  <Select
                    value=""
                    onValueChange={(val) => val && setSelectedCommand(val)}
                    disabled={runCommandMutation.isPending}
                  >
                    <SelectTrigger className="h-7 border-0 bg-transparent text-muted-foreground hover:text-foreground text-[10px] font-bold py-0 px-2 gap-1 focus:ring-0 focus:ring-offset-0 w-auto shadow-none">
                      <SelectValue placeholder="Gợi ý lệnh" />
                    </SelectTrigger>
                    <SelectContent className="w-56">
                      <SelectItem value="git status" className="text-xs font-mono">git status</SelectItem>
                      <SelectItem value="git branch" className="text-xs font-mono">git branch</SelectItem>
                      <SelectItem value="git log -n 5 --oneline" className="text-xs font-mono">git log -n 5</SelectItem>
                      <SelectItem value="df -h" className="text-xs font-mono">df -h (Disk Space)</SelectItem>
                      <SelectItem value="node -v" className="text-xs font-mono">node -v</SelectItem>
                      <SelectItem value="npm -v" className="text-xs font-mono">npm -v</SelectItem>
                      <SelectItem value="npm list --depth=0" className="text-xs font-mono">npm list --depth=0</SelectItem>
                      <SelectItem value="npx tsc --noEmit" className="text-xs font-mono text-amber-500 font-bold">npx tsc --noEmit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="vanixjnk"
                size="sm"
                className="font-bold text-xs shrink-0 h-9"
                onClick={handleExecute}
                disabled={runCommandMutation.isPending || !selectedCommand.trim()}
              >
                {runCommandMutation.isPending ? (
                  <>
                    <Icon icon="solar:spinner-line-duotone" className="size-4 animate-spin mr-1.5" />
                    <span>Đang chạy...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="solar:play-line-duotone" className="size-4 mr-1.5" />
                    <span>Thực thi</span>
                  </>
                )}
              </Button>

              <div className="flex items-center gap-1.5 self-end sm:self-auto sm:ml-auto">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
                  title="Sao chép nhật ký"
                  onClick={handleCopyLogs}
                  disabled={terminalLogs.length <= 3}
                >
                  <Icon icon="solar:copy-line-duotone" className="text-base" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  title="Xóa nhật ký"
                  onClick={handleClearLogs}
                  disabled={terminalLogs.length <= 2}
                >
                  <Icon icon="solar:trash-bin-trash-line-duotone" className="text-base" />
                </Button>
              </div>
            </div>

            <div className="terminal-window flex-1 p-6 overflow-hidden flex flex-col border-t">
              <div
                ref={maximizedTerminalRef}
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                className="terminal-logs flex-1 overflow-y-auto text-[13px] whitespace-pre leading-[1.35] select-text custom-scrollbar scroll-smooth"
              >
                {terminalLogs.map((log, index) => {
                  let color = "text-neutral-800 dark:text-neutral-200";
                  let isHtml = false;

                  if (log.startsWith("[") && log.includes("$ ")) {
                    color = "text-sky-600 dark:text-sky-400 font-bold";
                  } else if (log.startsWith("Error Output:") || log.startsWith("Fatal Error:")) {
                    color = "text-rose-600 dark:text-rose-400 font-bold";
                  } else if (log.startsWith("Running...")) {
                    color = "text-amber-600 dark:text-amber-400 italic animate-pulse";
                  } else if (log.startsWith("Welcome") || log.startsWith("Select") || log.startsWith("Console") || log.startsWith("----")) {
                    color = "text-neutral-400 dark:text-neutral-500";
                  } else {
                    isHtml = true;
                  }
                  
                  if (isHtml) {
                    return (
                      <div
                        key={index}
                        className={color}
                        dangerouslySetInnerHTML={{ __html: log }}
                      />
                    );
                  }

                  return (
                    <div key={index} className={color}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
