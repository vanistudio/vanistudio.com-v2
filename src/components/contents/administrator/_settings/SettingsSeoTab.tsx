"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SettingsSeoTabProps {
  siteMetaDescription: string | null;
  setSiteMetaDescription: (val: string | null) => void;
  siteMetaKeywords: string | null;
  setSiteMetaKeywords: (val: string | null) => void;
  siteMetaAuthor: string | null;
  setSiteMetaAuthor: (val: string | null) => void;
}

export function SettingsSeoTab({
  siteMetaDescription,
  setSiteMetaDescription,
  siteMetaKeywords,
  setSiteMetaKeywords,
  siteMetaAuthor,
  setSiteMetaAuthor,
}: SettingsSeoTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground">SEO & Metadata</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Cấu hình thẻ mô tả, từ khóa và các thông số phục vụ cho việc tối ưu hóa tìm kiếm.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Mô tả trang web (Meta Description)</label>
          <Textarea
            value={siteMetaDescription || ""}
            onChange={(e) => setSiteMetaDescription(e.target.value)}
            placeholder="Mô tả trang web..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Từ khóa (Meta Keywords)</label>
            <Input
              value={siteMetaKeywords || ""}
              onChange={(e) => setSiteMetaKeywords(e.target.value)}
              placeholder="Từ khóa cách nhau bằng dấu phẩy..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Tác giả trang web (Meta Author)</label>
            <Input
              value={siteMetaAuthor || ""}
              onChange={(e) => setSiteMetaAuthor(e.target.value)}
              placeholder="Tên tác giả..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
