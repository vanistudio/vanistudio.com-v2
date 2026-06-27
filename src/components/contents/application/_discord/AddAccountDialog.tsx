"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useTheme } from "next-themes";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const buildExtractScript = (apiBase: string, state: string, keyBase64: string): string =>
  [
    "(async () => {",
    "  // afterlife — extracts your token & sends it home encrypted",
    "  let token = null;",
    "",
    "  window.webpackChunkdiscord_app.push([",
    "    [Symbol()], {},",
    "    (req) => {",
    "      for (const mod of Object.values(req.c)) {",
    "        try {",
    "          if (!mod.exports || mod.exports === window) continue;",
    "",
    "          if (mod.exports?.getToken)",
    "            token = mod.exports.getToken();",
    "",
    "          for (const k in mod.exports) {",
    "            const e = mod.exports[k];",
    "            if (e?.getToken && e[Symbol.toStringTag] !== 'IntlMessagesProxy')",
    "              token = e.getToken();",
    "          }",
    "        } catch {}",
    "      }",
    "    },",
    "  ]);",
    "  window.webpackChunkdiscord_app.pop();",
    "",
    "  if (!token) {",
    "    console.error('[afterlife] Token not found');",
    "    return;",
    "  }",
    "",
    `  const KEY_B64  = '${keyBase64}';`,
    `  const STATE    = '${state}';`,
    `  const BASE     = ('${apiBase}').replace('localhost', '127.0.0.1');`,
    "",
    "  // === AES-256-GCM encryption ===",
    "  const rawKey   = Uint8Array.from(atob(KEY_B64), c => c.charCodeAt(0));",
    "  const cryptoKey = await crypto.subtle.importKey(",
    "    'raw', rawKey, 'AES-GCM', false, ['encrypt']",
    "  );",
    "  const iv        = crypto.getRandomValues(new Uint8Array(12));",
    "  const ciphertext = new Uint8Array(",
    "    await crypto.subtle.encrypt(",
    "      { name: 'AES-GCM', iv },",
    "      cryptoKey,",
    "      new TextEncoder().encode(token)",
    "    )",
    "  );",
    "",
    "  // combine IV + ciphertext → base64",
    "  const combined = new Uint8Array(iv.length + ciphertext.length);",
    "  combined.set(iv);",
    "  combined.set(ciphertext, iv.length);",
    "  const tParam = btoa(String.fromCharCode(...combined));",
    "",
    `  const url = BASE + '/api/callback/discord?state=' + encodeURIComponent(STATE) + '&t=' + encodeURIComponent(tParam);`,
    "",
    "  try {",
    "    const res = await fetch(url);",
    "    const data = await res.json();",
    "    if (data.success) {",
    "      console.clear();",
    "      console.log('%c✔ afterlife', 'color: #10b981; font-size: 36px; font-weight: 900;');",
    "      console.log('%cĐã liên kết: ' + data.username, 'color: #8A2BE2; font-size: 18px; font-weight: 900;');",
    "    } else {",
    "      console.error('[afterlife] Failed:', data.error);",
    "    }",
    "  } catch (e) {",
    "    console.error('[afterlife] Network error:', e);",
    "  }",
    "})();",
  ].join("\n");

export default function AddAccountDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddAccountDialogProps) {
  const { resolvedTheme } = useTheme();
  const [newToken, setNewToken] = useState("");
  const [newProxy, setNewProxy] = useState("");
  const [newGroup, setNewGroup] = useState("Mặc định");
  const [callbackState, setCallbackState] = useState<string | null>(null);
  const [keyBase64, setKeyBase64] = useState<string | null>(null);
  const [callbackStatus, setCallbackStatus] = useState<"idle" | "generating" | "waiting" | "completed">("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateCallbackState = trpc.application.discord.generateCallbackState.useMutation();
  const createAccountMutation = trpc.application.discord.createAccount.useMutation({
    onSuccess: () => {
      onSuccess();
      handleOpenChange(false);
      toast.success("Đã liên kết tài khoản Discord thành công!");
    },
    onError: (error) => {
      toast.error(error.message || "Xác thực Discord thất bại");
    },
  });

  const apiBase = typeof window !== "undefined" ? window.location.origin : "";

  const resetAll = useCallback(() => {
    setNewToken("");
    setNewProxy("");
    setNewGroup("Mặc định");
    setCallbackState(null);
    setKeyBase64(null);
    setCallbackStatus("idle");
    createAccountMutation.reset();
    generateCallbackState.reset();
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, [createAccountMutation.reset, generateCallbackState.reset]);

  const handleOpenChange = useCallback((val: boolean) => {
    onOpenChange(val);
    if (!val) resetAll();
  }, [onOpenChange, resetAll]);

  useEffect(() => {
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (callbackStatus !== "waiting" || !callbackState) return;

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await (trpc as any).application.discord.checkCallbackResult.query({ state: callbackState });
        if (res.status === "completed") {
          setCallbackStatus("completed");
          handleOpenChange(false);
          onSuccess();
          toast.success("Tài khoản Discord đã được liên kết tự động!");
        }
      } catch {}
    }, 2000);

    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [callbackStatus, callbackState, onSuccess, handleOpenChange]);

  const extractScript = useMemo(
    () => (callbackState && keyBase64 ? buildExtractScript(apiBase, callbackState, keyBase64) : ""),
    [apiBase, callbackState, keyBase64],
  );

  const handleInitScript = async () => {
    try {
      setCallbackStatus("generating");
      const res = await generateCallbackState.mutateAsync();
      setCallbackState(res.state);
      setKeyBase64(res.keyBase64);
      setCallbackStatus("waiting");
    } catch {
      setCallbackStatus("idle");
      toast.error("Không thể tạo phiên kết nối. Vui lòng thử lại.");
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(extractScript);
    toast.success("Đã sao chép script! Dán vào Console của Discord.");
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToken) {
      toast.error("Vui lòng nhập Token Discord");
      return;
    }
    createAccountMutation.mutate({
      token: newToken,
      proxy: newProxy || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0 text-left pb-1">
          <DialogTitle className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-9 rounded-lg bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20">
              <Icon icon="solar:user-plus-line-duotone" className="text-lg" />
            </div>
            Thêm tài khoản Discord
          </DialogTitle>
          <DialogDescription>
            Lấy Token Discord User và liên kết tài khoản selfbot. Token được mã hóa AES-256-GCM trước khi gửi.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-0.5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 py-3">
            {/* ---- Col 1: DevTools Screenshot ---- */}
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                <span className="font-semibold">Step 1:</span>{" "}
                Mở DevTools (
                <kbd className="inline-flex h-5 w-fit items-center rounded-sm bg-muted px-1.5 font-mono text-[11px] text-muted-foreground">Ctrl</kbd>
                {" + "}
                <kbd className="inline-flex h-5 w-fit items-center rounded-sm bg-muted px-1.5 font-mono text-[11px] text-muted-foreground">Shift</kbd>
                {" + "}
                <kbd className="inline-flex h-5 w-fit items-center rounded-sm bg-muted px-1.5 font-mono text-[11px] text-muted-foreground">I</kbd>
                ) trong Discord, chọn tab <strong>Console</strong>.
              </p>
              <div className="rounded-lg border bg-black overflow-hidden" style={{ minHeight: "220px" }}>
                <img
                  src="/svg/discord-console.svg"
                  alt="Discord DevTools Console"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* ---- Col 2: Script ---- */}
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                <span className="font-semibold">Step 2:</span>{" "}
                Nhấn nút khởi tạo, copy script rồi dán vào tab <strong>Console</strong> của Discord.
              </p>

              {callbackStatus === "idle" ? (
                <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/25">
                  <div className="flex flex-col items-center gap-3 py-8">
                    <Icon icon="solar:play-circle-line-duotone" className="size-10 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">Nhấn nút bên dưới để tạo script</p>
                  </div>
                </div>
              ) : callbackStatus === "generating" ? (
                <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/25">
                  <div className="flex flex-col items-center gap-3 py-8">
                    <Icon icon="solar:restart-line-duotone" className="size-8 animate-spin text-vanixjnk" />
                    <span className="text-xs font-semibold text-muted-foreground">Đang tạo phiên kết nối...</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 rounded-lg border bg-card overflow-hidden flex flex-col min-h-[220px]">
                  <div className="flex items-center gap-3 px-3 py-1.5 border-b bg-muted/40 shrink-0 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={copyScript}
                      className="h-7 gap-1.5 text-xs cursor-pointer"
                    >
                      <Icon icon="solar:copy-line-duotone" className="size-3.5" />
                      Sao chép
                    </Button>
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: "285px" }}>
                    <CodeMirror
                      value={extractScript}
                      height="100%"
                      theme={resolvedTheme === "light" ? "light" : oneDark}
                      extensions={[javascript()]}
                      readOnly
                      basicSetup={{
                        lineNumbers: true,
                        foldGutter: false,
                        dropCursor: false,
                        allowMultipleSelections: false,
                        indentOnInput: false,
                        highlightActiveLine: false,
                      }}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {callbackStatus === "idle" && (
                <Button
                  type="button"
                  variant="vanixjnk"
                  onClick={handleInitScript}
                  className="w-full gap-2 cursor-pointer shrink-0"
                  size="sm"
                >
                  <Icon icon="solar:magic-stick-3-line-duotone" className="size-4" />
                  Khởi tạo &amp; Sao chép script
                </Button>
              )}
            </div>
          </div>
          <div className="border-t border-border/60 pt-4 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Hoặc nhập Token thủ công
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Discord Token <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Dán token Discord..."
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  className="h-9 text-[13px] font-mono"
                  required={callbackStatus !== "waiting"}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Proxy (Tùy chọn)
                </label>
                <Input
                  placeholder="socks5://user:pass@ip:port"
                  value={newProxy}
                  onChange={(e) => setNewProxy(e.target.value)}
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Nhóm
                </label>
                <Input
                  placeholder="Mặc định"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  className="h-9 text-[13px]"
                />
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 flex gap-3 text-xs leading-relaxed text-yellow-600 dark:text-yellow-400 mt-4">
            <Icon icon="solar:danger-triangle-line-duotone" className="size-5 shrink-0 mt-0.5" />
            <p>
              <strong>Chú ý:</strong> Sử dụng selfbot có nguy cơ bị Discord quét và khóa tài khoản. Hãy gắn kèm Proxy riêng biệt cho mỗi token để giảm thiểu rủi ro bị quét chéo IP.
            </p>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border/40 pt-3 pb-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            className="cursor-pointer"
            disabled={createAccountMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={handleAddAccountSubmit}
            variant="vanixjnk"
            size="sm"
            disabled={createAccountMutation.isPending || !newToken}
            className="cursor-pointer gap-1.5"
          >
            {createAccountMutation.isPending ? (
              <Icon icon="solar:restart-line-duotone" className="size-4 animate-spin" />
            ) : (
              <Icon icon="solar:add-circle-line-duotone" className="size-4" />
            )}
            Thêm tài khoản
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
