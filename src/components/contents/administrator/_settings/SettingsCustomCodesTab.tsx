"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { Textarea } from "@/components/ui/textarea";

interface SettingsCustomCodesTabProps {
  siteCustomCodesHead: string;
  setSiteCustomCodesHead: (val: string) => void;
  siteCustomCodesBody: string;
  setSiteCustomCodesBody: (val: string) => void;
  siteCustomCodesCss: string;
  setSiteCustomCodesCss: (val: string) => void;
  siteCustomCodesJs: string;
  setSiteCustomCodesJs: (val: string) => void;
}

export function SettingsCustomCodesTab({
  siteCustomCodesHead,
  setSiteCustomCodesHead,
  siteCustomCodesBody,
  setSiteCustomCodesBody,
  siteCustomCodesCss,
  setSiteCustomCodesCss,
  siteCustomCodesJs,
  setSiteCustomCodesJs,
}: SettingsCustomCodesTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground">Mã tùy chỉnh</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Chèn các đoạn mã tracking, CSS hoặc JavaScript tùy biến trực tiếp vào website.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Icon icon="solar:code-line-duotone" className="size-4 text-muted-foreground" />
            Mã chèn vào thẻ Head (Mã Header)
          </label>
          <Textarea
            value={siteCustomCodesHead}
            onChange={(e) => setSiteCustomCodesHead(e.target.value)}
            placeholder="<!-- Ví dụ: <script async src='...'></script> -->"
            rows={4}
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground">Thích hợp cho mã Google Analytics, Tag Manager, Custom Meta tags.</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Icon icon="solar:code-line-duotone" className="size-4 text-muted-foreground" />
            Mã chèn vào cuối thẻ Body (Mã Footer)
          </label>
          <Textarea
            value={siteCustomCodesBody}
            onChange={(e) => setSiteCustomCodesBody(e.target.value)}
            placeholder="<!-- Ví dụ: Code widget Chat, popup hỗ trợ -->"
            rows={4}
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground">Thích hợp cho các mã script tải chậm, widget liên hệ, chat hỗ trợ trực tuyến.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Icon icon="solar:css3-line-duotone" className="size-4 text-muted-foreground" />
              CSS tùy chỉnh (Custom CSS)
            </label>
            <Textarea
              value={siteCustomCodesCss}
              onChange={(e) => setSiteCustomCodesCss(e.target.value)}
              placeholder="/* CSS tùy chỉnh cho trang web */&#10;body { ... }"
              rows={6}
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">Ghi đè styles CSS mặc định mà không cần chỉnh sửa source code.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Icon icon="solar:javascript-line-duotone" className="size-4 text-muted-foreground" />
              JavaScript tùy chỉnh (Custom JS)
            </label>
            <Textarea
              value={siteCustomCodesJs}
              onChange={(e) => setSiteCustomCodesJs(e.target.value)}
              placeholder="/* JS chạy khi tải trang */&#10;console.log('Custom JS');"
              rows={6}
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">Mã Javascript chạy sau khi toàn bộ trang được tải xong.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
