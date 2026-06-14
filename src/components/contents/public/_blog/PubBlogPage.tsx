"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { MdxRenderer } from "@/components/vanixjnk/mdx-builder";
import type { Blog } from "@/server/db/schemas/blog.schema";

interface PubBlogPageProps {
  blog: Blog;
}

export default function PubBlogPage({ blog }: PubBlogPageProps) {
  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
          {blog.thumbnail && (
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
              <img
                src={blog.thumbnail}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-[0.5] dark:opacity-[0.5]"
              />
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/40 to-background" />
              <div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(circle at center, transparent 30%, hsl(var(--background)) 100%)",
                }}
              />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3 bg-background/60 backdrop-blur-md">
              <Icon icon="solar:document-text-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground select-none">
                <Link href="/" className="flex items-center gap-1">
                  <Icon icon="solar:home-2-line-duotone" className="size-4" />
                  Trang chủ
                </Link>
                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                <Link href="/blog">
                  Blog
                </Link>
                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                <span className="text-foreground font-semibold truncate max-w-[200px]">{blog.title}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{blog.title}</h1>
              
              {blog.description && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                  {blog.description}
                </p>
              )}
              
              {blog.publishedAt && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 select-none">
                  <Icon icon="solar:calendar-line-duotone" className="size-4" />
                  <span>Đăng ngày: {new Date(blog.publishedAt).toLocaleDateString("vi-VN")}</span>
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
            <MdxRenderer content={blog.content} scope={{ formData: blog }} />
          </div>
        </div>
      </div>
    </div>
  );
}
