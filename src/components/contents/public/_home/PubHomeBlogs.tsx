"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Blog } from "@/server/db/schemas/blog.schema";

interface PubHomeBlogsProps {
  initialBlogs: Blog[];
}

export default function PubHomeBlogs({ initialBlogs }: PubHomeBlogsProps) {
  if (initialBlogs.length === 0) return null;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col items-center text-center gap-3 max-w-xl mx-auto">
        <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-2.5">
          <Icon icon="solar:bookmark-line-duotone" className="text-2xl" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-vanixjnk">Latest Articles</span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Bài viết mới nhất
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {initialBlogs.map((blog) => {
          return (
            <Card key={blog.id} className="group relative flex flex-col h-full bg-card/30 border-border p-0!">
              <div className="absolute top-[-6px] right-3 z-20 w-8 h-12 pointer-events-none">
                <div
                  className="absolute top-[6px] left-[-4px] w-1 h-[6px]"
                  style={{
                    backgroundColor: "var(--vanixjnk)",
                    clipPath: "polygon(100% 0, 100% 100%, 0% 100%)",
                    filter: "brightness(0.55)",
                  }}
                />
                <div
                  className="absolute top-[6px] right-[-4px] w-1 h-[6px]"
                  style={{
                    backgroundColor: "var(--vanixjnk)",
                    clipPath: "polygon(0 0, 0 100%, 100% 100%)",
                    filter: "brightness(0.55)",
                  }}
                />
                <div
                  className="relative w-8 h-11 shadow-[0_4px_8px_rgba(0,0,0,0.35)] flex flex-col justify-between rounded-t-[1px]"
                  style={{
                    backgroundColor: "var(--vanixjnk)",
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 82%, 0% 100%)",
                    backgroundImage: "linear-gradient(to bottom, rgba(255, 255, 255, 0.15), rgba(0, 0, 0, 0.2))",
                    backgroundBlendMode: "overlay",
                  }}
                >
                  <div className="w-full h-[6px] bg-black/15 border-b border-black/10" />
                  <div className="flex-1 flex items-center justify-center -mt-1.5">
                    <Icon icon="solar:document-text-line-duotone" className="size-4 text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)]" />
                  </div>
                </div>
              </div>

              <Link href={`/blog/${blog.slug}`} className="flex flex-col h-full">
                <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-muted/20 border-b border-border/55 flex items-center justify-center">
                  {blog.thumbnail ? (
                    <img src={blog.thumbnail} alt={blog.title} className="object-cover w-full h-full" />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-vanixjnk/5 to-vanixjnk/15 flex items-center justify-center">
                      <Icon icon="solar:document-text-line-duotone" className="text-5xl text-vanixjnk opacity-30 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                  {/* Tags instead of category */}
                </div>

                <div className="flex flex-col flex-1 p-5 gap-3">
                  <div className="space-y-2">
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-sm font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="text-base font-bold text-foreground line-clamp-1">{blog.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {blog.description || "Nhấp chuột để xem chi tiết nội dung của bài viết này."}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground/80 pt-1.5 select-none font-medium border-t border-border/30">
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:eye-line-duotone" className="size-3.5" />
                        {blog.views ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:heart-line-duotone" className="size-3.5 text-rose-500" />
                        {blog.likes ?? 0}
                      </span>
                      {blog.readingTime && blog.readingTime > 0 ? (
                        <span className="flex items-center gap-1 ml-auto text-vanixjnk">
                          <Icon icon="solar:clock-circle-line-duotone" className="size-3.5" />
                          {blog.readingTime} phút đọc
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border px-5 py-4 flex items-center justify-between bg-muted/10 rounded-b-xl group-hover:bg-muted/15 transition-colors">
                  <div>
                    <div className="text-sm font-bold text-foreground flex items-center gap-1">
                      <Icon icon="solar:calendar-line-duotone" className="size-3.5 text-muted-foreground" />
                      <span>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("vi-VN") : "Nháp"}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Ngày đăng tải
                    </span>
                  </div>

                  <div className="relative flex items-center justify-end h-8 min-w-[85px] overflow-hidden">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground group-hover:-translate-y-8 group-hover:opacity-0 transition-all duration-300">
                      <Icon icon="solar:document-text-line-duotone" className="text-xs" />
                      Bài viết
                    </div>
                    <div className="absolute flex items-center gap-1 text-[13px] font-bold text-vanixjnk translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span>Đọc bài</span>
                      <Icon icon="solar:arrow-right-linear" className="text-xs" />
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center mt-6">
        <Button variant="vanixjnk" asChild>
          <Link href="/blog">
            <Icon icon="solar:bookmark-line-duotone" className="text-base shrink-0" />
            <span>Xem tất cả bài viết</span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
