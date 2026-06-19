"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { MdxRenderer } from "@/components/vanixjnk/mdx-builder";
import type { Blog } from "@/server/db/schemas/blog.schema";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { BlogComments } from "./BlogComments";

interface PubBlogPageProps {
  blog: Blog & { author?: { name: string | null } | null };
}

export default function PubBlogPage({ blog }: PubBlogPageProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likes ?? 0);
  const [viewsCount, setViewsCount] = useState(blog.views ?? 0);

  const incrementViewMutation = trpc.blog.incrementView.useMutation({
    onSuccess: () => {
      setViewsCount((prev) => prev + 1);
    },
  });

  const likeBlogMutation = trpc.blog.likeBlog.useMutation();

  useEffect(() => {
    incrementViewMutation.mutate({ id: blog.id });
  }, [blog.id]);

  useEffect(() => {
    const hasLiked = localStorage.getItem(`liked_blog_${blog.id}`);
    if (hasLiked) {
      setIsLiked(true);
    }
  }, [blog.id]);

  const handleLike = () => {
    if (isLiked) return;
    setIsLiked(true);
    setLikesCount((prev) => prev + 1);
    localStorage.setItem(`liked_blog_${blog.id}`, "true");
    likeBlogMutation.mutate({ id: blog.id });
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="flex flex-col items-center gap-2.5 max-w-2xl">
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

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground mt-2 select-none">
                {blog.authorId && (
                  <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-full border border-border/40">
                    <div className="size-4.5 rounded-full bg-vanixjnk/15 flex items-center justify-center text-[10px] font-bold text-vanixjnk overflow-hidden shrink-0">
                      <span>{blog.author?.name ? blog.author.name[0].toUpperCase() : "A"}</span>
                    </div>
                    <span className="font-semibold text-foreground/90">{blog.author?.name || "Vani Studio"}</span>
                  </div>
                )}
                
                {blog.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:calendar-line-duotone" className="size-4" />
                    <span>{new Date(blog.publishedAt).toLocaleDateString("vi-VN")}</span>
                  </span>
                )}
                
                {blog.readingTime && blog.readingTime > 0 ? (
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:clock-circle-line-duotone" className="size-4" />
                    <span>{blog.readingTime} phút đọc</span>
                  </span>
                ) : null}

                <span className="flex items-center gap-1">
                  <Icon icon="solar:eye-line-duotone" className="size-4" />
                  <span>{viewsCount} lượt xem</span>
                </span>

                <button
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-1 transition-all duration-300 active:scale-95",
                    isLiked ? "text-rose-500 font-bold" : "hover:text-rose-500"
                  )}
                  disabled={isLiked}
                >
                  <Icon icon={isLiked ? "solar:heart-bold" : "solar:heart-line-duotone"} className={cn("size-4", isLiked && "animate-pulse")} />
                  <span>{likesCount} lượt thích</span>
                </button>
              </div>
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                  {blog.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20 select-none">
                      #{tag}
                    </span>
                  ))}
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

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          <div className="prose dark:prose-invert max-w-none flex-1">
            <MdxRenderer content={blog.content} scope={{ formData: blog }} />
          </div>
          <BlogComments blogId={blog.id} />
        </div>
      </div>
    </div>
  );
}
