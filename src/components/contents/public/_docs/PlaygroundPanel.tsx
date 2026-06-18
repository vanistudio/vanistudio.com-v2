"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ApiParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  description: string;
  placeholder?: string;
  defaultValue?: any;
}

interface ApiResponseSample {
  status: number;
  description: string;
  body: any;
}

interface PlaygroundPanelProps {
  endpointDetails: {
    id: string;
    groupId: string;
    name: string;
    method: string;
    path: string;
    description: string;
    headers?: ApiParameter[];
    queryParams?: ApiParameter[];
    requestBody?: ApiParameter[];
    responses?: ApiResponseSample[];
    isActive: boolean;
  };
}

interface ParamRow {
  enabled: boolean;
  name: string;
  value: string;
  description: string;
  required?: boolean;
  type?: string;
  isCustom?: boolean;
}

export default function PlaygroundPanel({ endpointDetails }: PlaygroundPanelProps) {
  const [targetDomain, setTargetDomain] = useState("shoprandom247.com");
  const [queryParams, setQueryParams] = useState<ParamRow[]>([]);
  const [headers, setHeaders] = useState<ParamRow[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    time: number;
    size: string;
    headers: Record<string, string>;
    body: any;
  } | null>(null);

  useEffect(() => {
    if (endpointDetails) {
      const initialParams = (endpointDetails.queryParams || []).map((q) => ({
        enabled: true,
        name: q.name,
        value: q.defaultValue !== undefined ? String(q.defaultValue) : "",
        description: q.description || "",
        required: q.required,
        type: q.type,
      }));
      setQueryParams(initialParams);

      const initialHeaders = [
        {
          enabled: true,
          name: "Content-Type",
          value: "application/json",
          description: "Định dạng dữ liệu yêu cầu",
          required: true,
          type: "string",
        },
        ...(endpointDetails.headers || []).map((h) => ({
          enabled: true,
          name: h.name,
          value: h.defaultValue !== undefined ? String(h.defaultValue) : "",
          description: h.description || "",
          required: h.required,
          type: h.type,
        })),
      ];
      setHeaders(initialHeaders);

      if (endpointDetails.requestBody && endpointDetails.requestBody.length > 0) {
        const bodyObj: Record<string, any> = {};
        endpointDetails.requestBody.forEach((p) => {
          bodyObj[p.name] = p.defaultValue !== undefined ? p.defaultValue : (p.type === "number" ? 0 : (p.type === "boolean" ? false : ""));
        });
        setBody(JSON.stringify(bodyObj, null, 2));
      } else {
        setBody("");
      }

      setResponse(null);
    }
  }, [endpointDetails]);

  const handleAddQueryParam = () => {
    setQueryParams([...queryParams, { enabled: true, name: "", value: "", description: "", isCustom: true }]);
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { enabled: true, name: "", value: "", description: "", isCustom: true }]);
  };

  const handleRemoveQueryParam = (idx: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== idx));
  };

  const handleRemoveHeader = (idx: number) => {
    setHeaders(headers.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);

    const protocol = targetDomain.startsWith("http://") || targetDomain.startsWith("https://") ? "" : "https://";
    const cleanDomain = targetDomain.replace(/\/$/, "");
    const cleanPath = endpointDetails.path.startsWith("/") ? endpointDetails.path : `/${endpointDetails.path}`;

    const queryPairs = queryParams
      .filter((q) => q.enabled && q.name.trim() !== "")
      .map((q) => `${encodeURIComponent(q.name.trim())}=${encodeURIComponent(q.value.trim())}`)
      .join("&");

    const url = `${protocol}${cleanDomain}${cleanPath}${queryPairs ? `?${queryPairs}` : ""}`;

    const headersObj: Record<string, string> = {};
    headers
      .filter((h) => h.enabled && h.name.trim() !== "")
      .forEach((h) => {
        headersObj[h.name.trim()] = h.value.trim();
      });

    const startTime = performance.now();
    try {
      const res = await fetch(url, {
        method: endpointDetails.method,
        headers: headersObj,
        body: ["POST", "PUT", "PATCH", "DELETE"].includes(endpointDetails.method) && body
          ? body
          : undefined,
        mode: "cors",
      });
      const endTime = performance.now();
      const timeElapsed = Math.round(endTime - startTime);

      let responseBody: any = "";
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseBody = await res.json();
      } else {
        responseBody = await res.text();
      }

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });

      const bodyStr = typeof responseBody === "object" ? JSON.stringify(responseBody) : String(responseBody);
      const sizeBytes = new Blob([bodyStr]).size;
      const sizeStr = sizeBytes < 1024 ? `${sizeBytes} B` : `${(sizeBytes / 1024).toFixed(2)} KB`;

      setResponse({
        status: res.status,
        statusText: res.statusText,
        time: timeElapsed,
        size: sizeStr,
        headers: resHeaders,
        body: responseBody,
      });
    } catch (err: any) {
      const endTime = performance.now();
      const timeElapsed = Math.round(endTime - startTime);
      setResponse({
        status: 0,
        statusText: "Network Error / CORS Issue",
        time: timeElapsed,
        size: "0 B",
        headers: {},
        body: {
          error: "Không thể kết nối với máy chủ mục tiêu.",
          reason: err.message || "CORS Policy hoặc tên miền không hợp lệ.",
          tip: "Vui lòng cấu hình CORS trên máy chủ của bạn (Allow Origin: https://vanistudio.com) hoặc thử một tên miền khác.",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const getMethodClass = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/25";
      case "POST": return "text-blue-500 bg-blue-500/10 border-blue-500/25";
      case "PUT": return "text-amber-500 bg-amber-500/10 border-amber-500/25";
      case "DELETE": return "text-rose-500 bg-rose-500/10 border-rose-500/25";
      case "PATCH": return "text-purple-500 bg-purple-500/10 border-purple-500/25";
      default: return "text-muted-foreground bg-muted/10 border-border/25";
    }
  };

  const getStatusBadgeClass = (status: number) => {
    if (status >= 200 && status < 300) {
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/25";
    }
    if (status >= 300 && status < 400) {
      return "text-sky-500 bg-sky-500/10 border-sky-500/25";
    }
    return "text-rose-500 bg-rose-500/10 border-rose-500/25";
  };

  const handleCopyResponse = () => {
    if (!response) return;
    const content = typeof response.body === "object" ? JSON.stringify(response.body, null, 2) : String(response.body);
    navigator.clipboard.writeText(content);
    toast.success("Đã copy dữ liệu phản hồi!");
  };

  const supportsBody = ["POST", "PUT", "PATCH", "DELETE"].includes(endpointDetails.method);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex items-center border border-border bg-background/50 rounded-lg shadow-xs flex-1">
          <Badge
            className={cn(
              "h-9 px-4 rounded-none rounded-l-lg text-[13px] font-extrabold tracking-wider uppercase border-y-0 border-l-0 border-r border-border shrink-0 select-none",
              getMethodClass(endpointDetails.method)
            )}
          >
            {endpointDetails.method}
          </Badge>
          <div className="flex items-center px-3 bg-muted/20 text-[13px] text-muted-foreground border-r border-border shrink-0 select-none h-9">
            https://
          </div>
          <Input
            value={targetDomain}
            onChange={(e) => setTargetDomain(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-9 text-[13px] px-3 bg-transparent min-w-[150px] flex-1"
            placeholder="shoprandom247.com"
          />
          <div className="flex items-center px-3 bg-muted/10 text-[13px] text-foreground font-semibold shrink-0 border-l border-border select-all h-9 max-w-xs truncate" title={endpointDetails.path}>
            {endpointDetails.path}
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSend}
                disabled={loading}
                variant="vanixjnk"
                className="h-9 px-6 gap-2 font-bold shrink-0 cursor-pointer text-[13px]"
              >
                {loading ? (
                  <Icon icon="solar:restart-line-duotone" className="size-4 animate-spin" />
                ) : (
                  <Icon icon="solar:play-line-duotone" className="size-4" />
                )}
                <span>Send</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Gửi yêu cầu thử nghiệm</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Tabs defaultValue="params" className="w-full border border-border dark:bg-card/10 rounded-lg overflow-hidden">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/20 h-10 px-2" variant="line">
          <TabsTrigger value="params" className="text-[13px] gap-2 px-3">
            <Icon icon="solar:settings-line-duotone" className="size-4" />
            <span>Params</span>
            {queryParams.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-vanixjnk/15 text-vanixjnk border border-vanixjnk/20 rounded-full font-sans">
                {queryParams.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="headers" className="text-[13px] gap-2 px-3">
            <Icon icon="solar:letter-line-duotone" className="size-4" />
            <span>Headers</span>
            {headers.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-vanixjnk/15 text-vanixjnk border border-vanixjnk/20 rounded-full font-sans">
                {headers.length}
              </Badge>
            )}
          </TabsTrigger>
          {supportsBody && (
            <TabsTrigger value="body" className="text-[13px] gap-2 px-3">
              <Icon icon="solar:document-text-line-duotone" className="size-4" />
              <span>Body</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="params" className="p-4 space-y-4">
          <div className="border border-border rounded-lg overflow-hidden bg-background/50">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow>
                  <TableHead className="w-12 text-center"></TableHead>
                  <TableHead className="w-1/4">Key</TableHead>
                  <TableHead className="w-1/4">Value</TableHead>
                  <TableHead className="w-5/12">Description</TableHead>
                  <TableHead className="w-12 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryParams.map((param, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/5">
                    <TableCell className="text-center p-1 px-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Checkbox
                                checked={param.enabled}
                                onCheckedChange={(checked) => {
                                  const next = [...queryParams];
                                  next[idx].enabled = !!checked;
                                  setQueryParams(next);
                                }}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Bật/Tắt tham số</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="p-1 px-2">
                      <div className="flex items-center gap-1.5 w-full">
                        <Input
                          value={param.name}
                          readOnly={!param.isCustom}
                          onChange={(e) => {
                            if (!param.isCustom) return;
                            const next = [...queryParams];
                            next[idx].name = e.target.value;
                            setQueryParams(next);
                          }}
                          placeholder="Key"
                          className={cn(
                            "h-9 text-[13px] px-2",
                            !param.isCustom && "font-semibold text-foreground/80 cursor-default"
                          )}
                        />
                        {!param.isCustom && param.required && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-rose-500 cursor-help shrink-0 flex items-center pr-2">
                                  <Icon icon="solar:lock-keyhole-line-duotone" className="size-4" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Bắt buộc</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-1 px-2">
                      <Input
                        value={param.value}
                        onChange={(e) => {
                          const next = [...queryParams];
                          next[idx].value = e.target.value;
                          setQueryParams(next);
                        }}
                        placeholder="Value"
                        className="h-9 text-[13px] px-2"
                      />
                    </TableCell>
                    <TableCell className="p-1 px-2">
                      <Input
                        value={param.description}
                        readOnly={!param.isCustom}
                        onChange={(e) => {
                          if (!param.isCustom) return;
                          const next = [...queryParams];
                          next[idx].description = e.target.value;
                          setQueryParams(next);
                        }}
                        placeholder="Description"
                        className="h-9 text-[13px] px-2"
                      />
                    </TableCell>
                    <TableCell className="text-center p-1 px-2">
                      {param.isCustom && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveQueryParam(idx)}
                                className="size-8 text-muted-foreground hover:text-rose-500 cursor-pointer"
                              >
                                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xóa tham số</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddQueryParam}
            className="h-8 text-xs font-semibold cursor-pointer border-dashed border-border/80 hover:bg-muted/40"
          >
            <Icon icon="solar:add-circle-line-duotone" className="mr-1.5 size-4" />
            Thêm tham số
          </Button>
        </TabsContent>

        <TabsContent value="headers" className="p-4 space-y-4">
          <div className="border border-border rounded-lg overflow-hidden bg-background/50">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow>
                  <TableHead className="w-12 text-center"></TableHead>
                  <TableHead className="w-1/4">Key</TableHead>
                  <TableHead className="w-1/4">Value</TableHead>
                  <TableHead className="w-5/12">Description</TableHead>
                  <TableHead className="w-12 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {headers.map((h, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/5">
                    <TableCell className="text-center p-1 px-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Checkbox
                                checked={h.enabled}
                                onCheckedChange={(checked) => {
                                  const next = [...headers];
                                  next[idx].enabled = !!checked;
                                  setHeaders(next);
                                }}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Bật/Tắt Header</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="p-1 px-2">
                      <div className="flex items-center gap-1.5 w-full">
                        <Input
                          value={h.name}
                          readOnly={!h.isCustom}
                          onChange={(e) => {
                            if (!h.isCustom) return;
                            const next = [...headers];
                            next[idx].name = e.target.value;
                            setHeaders(next);
                          }}
                          placeholder="Key"
                          className={cn(
                            "h-9 text-[13px] shadow-none px-2",
                            !h.isCustom && "font-semibold text-foreground/80 cursor-default"
                          )}
                        />
                        {!h.isCustom && h.required && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-rose-500 cursor-help shrink-0 flex items-center pr-2">
                                  <Icon icon="solar:lock-keyhole-line-duotone" className="size-4" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Bắt buộc</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-1 px-2">
                      <Input
                        value={h.value}
                        onChange={(e) => {
                          const next = [...headers];
                          next[idx].value = e.target.value;
                          setHeaders(next);
                        }}
                        placeholder="Value"
                        className="h-9 text-[13px] px-2.5"
                      />
                    </TableCell>
                    <TableCell className="p-1 px-2">
                      <Input
                        value={h.description}
                        readOnly={!h.isCustom}
                        onChange={(e) => {
                          if (!h.isCustom) return;
                          const next = [...headers];
                          next[idx].description = e.target.value;
                          setHeaders(next);
                        }}
                        placeholder="Description"
                        className="h-9 text-[13px] px-2"
                      />
                    </TableCell>
                    <TableCell className="text-center p-1 px-2">
                      {h.isCustom && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveHeader(idx)}
                                className="size-8 text-muted-foreground hover:text-rose-500 cursor-pointer"
                              >
                                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xóa Header</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddHeader}
            className="h-8 text-xs font-semibold cursor-pointer border-dashed border-border/80 hover:bg-muted/40"
          >
            <Icon icon="solar:add-circle-line-duotone" className="mr-1.5 size-4" />
            Thêm Header
          </Button>
        </TabsContent>

        <TabsContent value="body" className="p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono select-none px-1">
            <Icon icon="solar:code-line-duotone" className="size-4" />
            <span>raw (JSON)</span>
          </div>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="{}"
            className="min-h-44 text-[13px] font-mono leading-relaxed"
          />
        </TabsContent>
      </Tabs>

      {response && (
        <div className="flex flex-col border border-border dark:bg-card/10 rounded-lg overflow-hidden mt-6">
          <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3">
            <div className="text-[13px] font-extrabold text-foreground uppercase tracking-wider select-none flex items-center gap-1.5">
              <Icon icon="solar:info-circle-line-duotone" className="text-vanixjnk size-4" />
              <span>Kết quả phản hồi (Response)</span>
            </div>
            <div className="flex items-center gap-2 select-none flex-wrap">
              <Badge
                className={cn(
                  "h-6 px-2 text-[11px] font-black uppercase font-mono tracking-wider border",
                  getStatusBadgeClass(response.status)
                )}
              >
                Status: {response.status} {response.statusText}
              </Badge>
              <Badge
                variant="outline"
                className="h-6 px-2 text-[11px] text-muted-foreground font-mono bg-muted/30 border border-border/40"
              >
                Time: {response.time} ms
              </Badge>
              <Badge
                variant="outline"
                className="h-6 px-2 text-[11px] text-muted-foreground font-mono bg-muted/30 border border-border/40"
              >
                Size: {response.size}
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="responseBody" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/10 h-10 px-2" variant="line">
              <TabsTrigger value="responseBody" className="text-[13px] gap-2 px-3">
                <Icon icon="solar:document-text-line-duotone" className="size-4" />
                <span>Body</span>
              </TabsTrigger>
              <TabsTrigger value="responseHeaders" className="text-[13px] gap-2 px-3">
                <Icon icon="solar:letter-line-duotone" className="size-4" />
                <span>Headers</span>
                {Object.keys(response.headers).length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-muted/40 text-muted-foreground border-none rounded-full font-sans">
                    {Object.keys(response.headers).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="responseBody" className="p-4 relative bg-background/25">
              <div className="relative">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleCopyResponse}
                        variant="outline"
                        size="icon"
                        className="absolute right-3 top-3 size-8 bg-background/60 hover:bg-background border border-border/60 cursor-pointer shadow-2xs z-10"
                      >
                        <Icon icon="solar:copy-line-duotone" className="size-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy toàn bộ phản hồi</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <pre className="p-4 bg-muted/5 rounded-lg font-mono text-[12px] text-foreground overflow-x-auto leading-relaxed max-h-96 select-all border border-border/40">
                  <code>
                    {typeof response.body === "object"
                      ? JSON.stringify(response.body, null, 2)
                      : String(response.body)}
                  </code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="responseHeaders" className="p-4 bg-background/25">
              <div className="border border-border/50 rounded-lg overflow-hidden bg-background/50">
                <Table>
                  <TableHeader className="bg-muted/15 font-mono">
                    <TableRow>
                      <TableHead className="w-1/3 font-semibold text-muted-foreground">Header</TableHead>
                      <TableHead className="w-2/3 font-semibold text-muted-foreground">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="font-mono text-[12px] text-foreground/80 select-all">
                    {Object.entries(response.headers).map(([key, val]) => (
                      <TableRow key={key} className="hover:bg-muted/5">
                        <TableCell className="font-bold text-foreground/75 truncate max-w-xs">{key}</TableCell>
                        <TableCell className="break-all">{val}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
