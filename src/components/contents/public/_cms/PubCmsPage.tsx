"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { MdxRenderer } from "@/components/vanixjnk/mdx-builder";
import type { CmsPage } from "@/server/db/schemas/cms-page.schema";

interface PubCmsPageProps {
  page: CmsPage;
}

export default function PubCmsPage({ page }: PubCmsPageProps) {
  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon="solar:document-text-line-duotone" className="text-3xl" />
            </div>
            
            <div className="flex flex-col items-center gap-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground select-none">
                <Link href="/" className="hover:text-vanixjnk transition-colors flex items-center gap-1">
                  <Icon icon="solar:home-2-line-duotone" className="size-4" />
                  Trang chủ
                </Link>
                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                <span className="text-foreground font-semibold truncate max-w-[200px]">{page.title}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{page.title}</h1>
              
              {page.description && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                  {page.description}
                </p>
              )}
              
              {page.publishedAt && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 select-none">
                  <Icon icon="solar:calendar-line-duotone" className="size-4" />
                  <span>Đăng ngày: {new Date(page.publishedAt).toLocaleDateString("vi-VN")}</span>
                </div>
              )}
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
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)",
          }}
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          <div className="prose dark:prose-invert max-w-none">
            <MdxRenderer content={page.content} scope={{ formData: page }} />
          </div>
        </div>
      </div>
    </div>
  );
}
