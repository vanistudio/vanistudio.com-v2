"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { type ApiEndpoint } from "./types";

interface PlaygroundSheetProps {
  endpoint: ApiEndpoint | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlaygroundSheet({ endpoint, isOpen, onClose }: PlaygroundSheetProps) {
  const [targetDomain, setTargetDomain] = useState("shoprandom247.com");
  const [playgroundHeaders, setPlaygroundHeaders] = useState<Array<{ name: string; value: string }>>([
    { name: "Content-Type", value: "application/json" }
  ]);
  const [playgroundQueryParams, setPlaygroundQueryParams] = useState<Record<string, string>>({});
  const [playgroundBody, setPlaygroundBody] = useState("");
  const [playgroundResponse, setPlaygroundResponse] = useState<{
    status: number;
    statusText: string;
    time: number;
    headers: Record<string, string>;
    body: any;
  } | null>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  // Reset/Prepopulate states when endpoint changes
  useEffect(() => {
    if (endpoint) {
      // Default headers
      const defaultHeaders = [
        { name: "Content-Type", value: "application/json" },
        ...(endpoint.headers || []).map(h => ({
          name: h.name,
          value: h.defaultValue ? String(h.defaultValue) : ""
        }))
      ];
      setPlaygroundHeaders(defaultHeaders);

      // Default query params
      const defaultQueryParams: Record<string, string> = {};
      (endpoint.queryParams || []).forEach(q => {
        defaultQueryParams[q.name] = q.defaultValue ? String(q.defaultValue) : "";
      });
      setPlaygroundQueryParams(defaultQueryParams);

      // Default body template
      if (endpoint.requestBody && endpoint.requestBody.length > 0) {
        const bodyObj: Record<string, any> = {};
        endpoint.requestBody.forEach(p => {
          bodyObj[p.name] = p.defaultValue !== undefined ? p.defaultValue : (p.type === "number" ? 0 : (p.type === "boolean" ? false : ""));
        });
        setPlaygroundBody(JSON.stringify(bodyObj, null, 2));
      } else {
        setPlaygroundBody("");
      }
      setPlaygroundResponse(null);
    }
  }, [endpoint]);

  const handleSendRequest = async () => {
    if (!endpoint) return;
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);

    const protocol = targetDomain.startsWith("http://") || targetDomain.startsWith("https://") ? "" : "https://";
    const cleanDomain = targetDomain.replace(/\/$/, "");
    const cleanPath = endpoint.path.startsWith("/") ? endpoint.path : `/${endpoint.path}`;

    // Query String Builder
    const queryPairs = Object.entries(playgroundQueryParams)
      .filter(([_, v]) => v.trim() !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    const url = `${protocol}${cleanDomain}${cleanPath}${queryPairs ? `?${queryPairs}` : ""}`;

    // Headers Builder
    const headersObj: Record<string, string> = {};
    playgroundHeaders
      .filter(h => h.name.trim() !== "")
      .forEach(h => {
        headersObj[h.name] = h.value;
      });

    const startTime = performance.now();
    try {
      const response = await fetch(url, {
        method: endpoint.method,
        headers: headersObj,
        body: ["POST", "PUT", "PATCH", "DELETE"].includes(endpoint.method) && playgroundBody
          ? playgroundBody
          : undefined,
        mode: "cors",
      });

      const endTime = performance.now();
      const timeElapsed = Math.round(endTime - startTime);

      let responseBody: any = "";
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      const resHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });

      setPlaygroundResponse({
        status: response.status,
        statusText: response.statusText,
        time: timeElapsed,
        headers: resHeaders,
        body: responseBody,
      });
    } catch (error: any) {
      const endTime = performance.now();
      const timeElapsed = Math.round(endTime - startTime);

      setPlaygroundResponse({
        status: 0,
        statusText: "Network Error / CORS Issue",
        time: timeElapsed,
        headers: {},
        body: {
          error: "Không thể kết nối với máy chủ mục tiêu.",
          reason: error.message || "CORS Policy hoặc Domain không tồn tại. Đảm bảo tên miền nguồn đã được cấu hình CORS cho phép vanistudio.com.",
          tip: "Vui lòng kiểm tra lại cấu hình CORS phía máy chủ của bạn (Allow Origin: https://vanistudio.com)."
        },
      });
    } finally {
      setPlaygroundLoading(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "POST": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "PUT": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "DELETE": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-card border-l border-border/60 p-0 flex flex-col h-full">
        {endpoint && (
          <>
            {/* Header info */}
            <div className="p-6 border-b border-border/40 shrink-0">
              <SheetHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-black uppercase border font-mono ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <span className="font-mono text-sm text-foreground/80 font-bold select-all">{endpoint.path}</span>
                </div>
                <SheetTitle className="text-lg font-bold text-foreground mt-2">{endpoint.name}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground line-clamp-2">
                  {endpoint.description}
                </SheetDescription>
              </SheetHeader>
            </div>

            {/* Content areas - split into documentation and playground */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                
                {/* 1. CONFIGURATION & PLAYGROUND INPUTS */}
                <div className="space-y-5 border border-border/60 rounded-2xl p-5 bg-muted/5">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 border-border/40">
                    <Icon icon="solar:play-line-duotone" className="text-vanixjnk text-base" />
                    Cấu hình gửi yêu cầu (Playground)
                  </h3>

                  {/* Target Domain Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Target Domain</label>
                    <div className="flex gap-2">
                      <div className="flex items-center bg-muted/40 border border-border/80 px-2.5 rounded-md text-[11px] text-muted-foreground select-none font-mono">
                        https://
                      </div>
                      <Input
                        value={targetDomain}
                        onChange={(e) => setTargetDomain(e.target.value)}
                        placeholder="shoprandom247.com"
                        className="h-9 text-[13px] font-mono"
                      />
                    </div>
                  </div>

                  {/* Headers Input */}
                  {playgroundHeaders.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span>HTTP Headers</span>
                        <button
                          onClick={() => setPlaygroundHeaders([...playgroundHeaders, { name: "", value: "" }])}
                          className="text-[10px] text-vanixjnk hover:underline flex items-center gap-1"
                        >
                          <Icon icon="solar:add-circle-line-duotone" /> Thêm Header
                        </button>
                      </label>
                      <div className="space-y-1.5">
                        {playgroundHeaders.map((hdr, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <Input
                              value={hdr.name}
                              onChange={(e) => {
                                const next = [...playgroundHeaders];
                                next[idx].name = e.target.value;
                                setPlaygroundHeaders(next);
                              }}
                              placeholder="Authorization"
                              className="h-8 text-[11px] font-mono w-1/3 shrink-0"
                            />
                            <Input
                              value={hdr.value}
                              onChange={(e) => {
                                const next = [...playgroundHeaders];
                                next[idx].value = e.target.value;
                                setPlaygroundHeaders(next);
                              }}
                              placeholder="Bearer token..."
                              className="h-8 text-[11px] font-mono flex-1"
                            />
                            <button
                              onClick={() => setPlaygroundHeaders(playgroundHeaders.filter((_, i) => i !== idx))}
                              className="text-muted-foreground hover:text-red-500"
                            >
                              <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Query Params Input */}
                  {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground font-semibold">Query Parameters</label>
                      <div className="space-y-2 border border-border/40 rounded-xl p-3 bg-muted/10">
                        {endpoint.queryParams.map(q => (
                          <div key={q.name} className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
                              <span className="font-bold text-foreground/80">{q.name}</span>
                              <span className="text-[9px] px-1 bg-border/60 rounded text-muted-foreground">{q.type}</span>
                              {q.required && <span className="text-red-500 font-bold">* bắt buộc</span>}
                            </span>
                            <Input
                              value={playgroundQueryParams[q.name] || ""}
                              onChange={(e) => setPlaygroundQueryParams({ ...playgroundQueryParams, [q.name]: e.target.value })}
                              placeholder={q.placeholder || ""}
                              className="h-8 text-[11px] font-mono"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Body Payload */}
                  {["POST", "PUT", "PATCH", "DELETE"].includes(endpoint.method) && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">JSON Request Body Payload</label>
                      <Textarea
                        value={playgroundBody}
                        onChange={(e) => setPlaygroundBody(e.target.value)}
                        placeholder="{}"
                        className="h-28 text-[11px] font-mono resize-y leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    variant="vanixjnk"
                    onClick={handleSendRequest}
                    disabled={playgroundLoading}
                    className="w-full gap-2 font-bold shadow-md h-10 mt-1"
                  >
                    {playgroundLoading ? (
                      <Icon icon="solar:restart-line-duotone" className="size-4 animate-spin" />
                    ) : (
                      <Icon icon="solar:play-line-duotone" className="size-4" />
                    )}
                    <span>Gửi yêu cầu API (Playground)</span>
                  </Button>
                </div>

                {/* 2. RESPONSE CONSOLE */}
                {playgroundResponse && (
                  <div className="border border-border/60 rounded-2xl overflow-hidden bg-card">
                    <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">Kết quả phản hồi (Response)</span>
                        <Badge variant={playgroundResponse.status >= 200 && playgroundResponse.status < 300 ? "success" : "destructive"}>
                          {playgroundResponse.status || "CORS ERROR"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">{playgroundResponse.time} ms</span>
                      </div>
                    </div>
                    <pre className="p-4 bg-muted/10 font-mono text-[11px] text-foreground overflow-x-auto leading-relaxed max-h-72">
                      <code>{typeof playgroundResponse.body === "object" ? JSON.stringify(playgroundResponse.body, null, 2) : String(playgroundResponse.body)}</code>
                    </pre>
                  </div>
                )}

                {/* 3. ENDPOINT SPEC DETAILS (DOCS ONLY) */}
                <div className="space-y-4 border border-border/40 rounded-2xl p-5 bg-card/40">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2 border-border/40 flex items-center gap-1.5">
                    <Icon icon="solar:document-text-line-duotone" className="text-muted-foreground text-base" />
                    Đặc tả tham số (Specification)
                  </h3>
                  
                  {/* Headers spec */}
                  {endpoint.headers && endpoint.headers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-foreground/80 font-mono">Headers Yêu Cầu:</h4>
                      <div className="text-[11px] space-y-1.5">
                        {endpoint.headers.map(h => (
                          <div key={h.name} className="flex justify-between border-b border-border/40 pb-1.5">
                            <span className="font-mono font-bold text-foreground/75">{h.name}</span>
                            <span className="text-muted-foreground">{h.description || "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Body params spec */}
                  {endpoint.requestBody && endpoint.requestBody.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-[11px] font-bold text-foreground/80 font-mono">Tham số Body JSON:</h4>
                      <div className="text-[11px] space-y-2">
                        {endpoint.requestBody.map(p => (
                          <div key={p.name} className="flex flex-col border-b border-border/40 pb-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-foreground/75">{p.name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono bg-border/40 px-1 rounded">{p.type}</span>
                            </div>
                            <p className="text-muted-foreground mt-0.5">{p.description || "—"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Response samples spec */}
                  {endpoint.responses && endpoint.responses.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[11px] font-bold text-foreground/80 font-mono">Mẫu phản hồi kết quả (Responses):</h4>
                      {endpoint.responses.map((res, i) => (
                        <div key={i} className="space-y-1.5 border border-border/40 rounded-xl overflow-hidden">
                          <div className="flex justify-between bg-muted/20 px-3 py-1.5 text-[10px] border-b border-border/40">
                            <Badge variant={res.status >= 200 && res.status < 300 ? "success" : "destructive"}>
                              Status: {res.status}
                            </Badge>
                            <span className="text-muted-foreground italic font-mono">{res.description}</span>
                          </div>
                          <pre className="p-3 bg-muted/5 font-mono text-[10px] text-foreground/85 max-h-40 overflow-y-auto">
                            <code>{typeof res.body === "object" ? JSON.stringify(res.body, null, 2) : String(res.body)}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
