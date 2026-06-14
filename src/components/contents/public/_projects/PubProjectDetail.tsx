"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import type { Project, ProjectLink, ProjectMetric, ProjectHighlight, ProjectMedia, ProjectContributor, ProjectTestimonial } from "@/server/db/schemas/project.schema";
import type { Service } from "@/server/db/schemas/service.schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MdxRenderer } from "@/components/vanixjnk/mdx-builder";
import { cn } from "@/lib/utils";

interface PubProjectDetailProps {
  project: Project & { service: Service | null };
}

const getProjectTypeMeta = (type: string) => {
  switch (type) {
    case "personal":
      return {
        label: "Cá nhân",
        icon: "solar:user-line-duotone",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      };
    case "collaborative":
      return {
        label: "Hợp tác / Team",
        icon: "solar:users-group-two-rounded-line-duotone",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
      };
    case "client":
      return {
        label: "Khách hàng / Đối tác",
        icon: "solar:case-minimalistic-line-duotone",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
      };
    default:
      return {
        label: "Dự án khác",
        icon: "solar:folder-open-line-duotone",
        color: "text-zinc-500",
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/20",
      };
  }
};

const getStatusMeta = (status: string) => {
  switch (status) {
    case "completed":
      return {
        label: "Hoàn thành",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        dot: "bg-emerald-500",
      };
    case "developing":
      return {
        label: "Đang phát triển",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        dot: "bg-amber-500",
      };
    default:
      return {
        label: "Bản nháp",
        color: "text-zinc-500",
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/20",
        dot: "bg-zinc-500",
      };
  }
};

const getLinkIcon = (type: string) => {
  switch (type) {
    case "live":
      return "solar:globus-line-duotone";
    case "github":
      return "simple-icons:github";
    case "figma":
      return "simple-icons:figma";
    case "youtube":
      return "simple-icons:youtube";
    case "docs":
      return "solar:document-text-line-duotone";
    default:
      return "solar:link-round-angle-line-duotone";
  }
};

const getLinkActionLabel = (type: string) => {
  switch (type) {
    case "live":
      return "Truy cập ứng dụng";
    case "github":
      return "Xem mã nguồn GitHub";
    case "figma":
      return "Xem bản thiết kế Figma";
    case "youtube":
      return "Xem video giới thiệu";
    case "docs":
      return "Xem tài liệu hướng dẫn";
    default:
      return "Liên kết dự án";
  }
};

const formatDate = (dateString: string | Date | null | undefined) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" });
};

export default function PubProjectDetail({ project }: PubProjectDetailProps) {
  const typeMeta = getProjectTypeMeta(project.projectType);
  const statusMeta = getStatusMeta(project.status);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const mediaGalleryList: ProjectMedia[] = React.useMemo(() => {
    const list: ProjectMedia[] = [];
    if (project.thumbnail) {
      list.push({ url: project.thumbnail, type: "image", caption: "Ảnh bìa dự án" });
    }
    if (project.mediaGallery && project.mediaGallery.length > 0) {
      list.push(...project.mediaGallery);
    }
    return list;
  }, [project.thumbnail, project.mediaGallery]);

  const renderMediaContent = (media: ProjectMedia) => {
    if (media.type === "video") {
      const url = media.url;
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let embedUrl = url;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
          embedUrl = `https://www.youtube.com/embed/${match[2]}`;
        }
        return (
          <iframe
            src={embedUrl}
            className="size-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={media.caption || "Video giới thiệu"}
          />
        );
      }
      return (
        <video src={url} controls className="size-full object-cover">
          Trình duyệt không hỗ trợ xem video này.
        </video>
      );
    }
    return (
      <img
        src={media.url}
        alt={media.caption || project.name}
        className="size-full object-cover transition-all duration-500"
      />
    );
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon={typeMeta.icon} className="text-3xl" />
            </div>

            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground select-none">
                <Link href="/" className="hover:text-vanixjnk transition-colors flex items-center gap-1">
                  <Icon icon="solar:home-2-line-duotone" className="size-4" />
                  Trang chủ
                </Link>
                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                <Link href="/projects" className="hover:text-vanixjnk transition-colors">
                  Dự án
                </Link>
                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                <span className="text-foreground font-semibold truncate max-w-[200px]">{project.name}</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>

              {project.description && (
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 mt-1 select-none">
                <Badge className={cn("px-2.5 py-0.5 text-[10px] font-bold border", typeMeta.bg, typeMeta.color, typeMeta.border)}>
                  <Icon icon={typeMeta.icon} className="mr-1 size-3 shrink-0" />
                  {typeMeta.label}
                </Badge>
                <Badge className={cn("px-2.5 py-0.5 text-[10px] font-bold border", statusMeta.bg, statusMeta.color, statusMeta.border)}>
                  <span className={cn("size-1.5 rounded-full mr-1.5", statusMeta.dot)} />
                  {statusMeta.label}
                </Badge>
                {project.role && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Icon icon="solar:user-speak-line-duotone" className="size-4 text-vanixjnk" />
                    <span>Vai trò: <strong>{project.role}</strong></span>
                  </div>
                )}
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
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)",
          }}
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            
            <div className="lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1">
              
              {mediaGalleryList.length > 0 && (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="aspect-video w-full rounded-xl border border-border bg-background overflow-hidden relative group">
                    {renderMediaContent(mediaGalleryList[activeMediaIndex])}
                    
                    {mediaGalleryList[activeMediaIndex].caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/80 via-black/40 to-transparent flex items-end p-4 pointer-events-none">
                        <span className="text-xs font-semibold text-white/95">
                          {mediaGalleryList[activeMediaIndex].caption}
                        </span>
                      </div>
                    )}
                  </div>
                  
                   {mediaGalleryList.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {mediaGalleryList.map((media, idx) => {
                        let ytId = null;
                        if (media.type === "video") {
                          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                          const match = media.url.match(regExp);
                          if (match && match[2].length === 11) {
                            ytId = match[2];
                          }
                        }
                        const thumbUrl = ytId
                          ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
                          : media.url;
                        const isActive = activeMediaIndex === idx;

                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveMediaIndex(idx)}
                            className={cn(
                              "group aspect-video rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer relative bg-muted/20 shadow-xs",
                              isActive
                                ? "border-vanixjnk opacity-100"
                                : "border-border hover:border-muted-foreground/40 opacity-60 hover:opacity-100"
                            )}
                          >
                            <div className="size-full overflow-hidden relative">
                              {media.type === "video" ? (
                                <div className="size-full flex items-center justify-center">
                                  <div className="absolute size-7 rounded-full bg-background/80 backdrop-blur-xs flex items-center justify-center border border-border/50 text-vanixjnk shadow-md z-10 transition-transform duration-300 group-hover:scale-115">
                                    <Icon icon="solar:play-bold" className="size-3 translate-x-px" />
                                  </div>
                                  {ytId ? (
                                    <img
                                      src={thumbUrl}
                                      alt="video thumbnail"
                                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="size-full bg-slate-950" />
                                  )}
                                </div>
                              ) : (
                                <img
                                  src={thumbUrl}
                                  alt="gallery thumbnail"
                                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              )}

              <Card className="p-5 bg-card/30 border-border">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:document-text-line-duotone" className="text-base text-vanixjnk" />
                  <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Mô tả dự án</h3>
                </div>
                <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base leading-relaxed">
                  <MdxRenderer content={project.content} scope={{ project }} />
                </div>
              </Card>

              {project.highlights && project.highlights.length > 0 && (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
                    <Icon icon="solar:stars-line-duotone" className="text-base text-vanixjnk" />
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Điểm nổi bật của dự án</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.highlights.map((h: ProjectHighlight, idx) => (
                      <div key={idx} className="flex flex-col rounded-lg bg-muted/15 border border-border/55 overflow-hidden">
                        {h.image && (
                          <div className="aspect-video w-full overflow-hidden border-b border-border/50">
                            <img src={h.image} alt={h.title} className="size-full object-cover" />
                          </div>
                        )}
                        <div className="p-4 space-y-1">
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                            <Icon icon="solar:verified-check-line-duotone" className="text-emerald-500 size-4 shrink-0" />
                            {h.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground leading-normal pl-6">
                            {h.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {project.testimonials && project.testimonials.length > 0 && (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
                    <Icon icon="solar:chat-round-line-duotone" className="text-base text-vanixjnk" />
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Đánh giá & Phản hồi</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    {project.testimonials.map((t: ProjectTestimonial, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-muted/20 border border-border/40 flex flex-col gap-3 relative">
                        <Icon icon="solar:double-alt-arrow-right-bold" className="absolute top-4 right-4 text-3xl text-muted-foreground/10 rotate-180" />
                        <p className="text-xs text-foreground italic leading-relaxed">
                          "{t.content}"
                        </p>
                        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                          <div className="size-8 rounded-full bg-muted overflow-hidden flex items-center justify-center border border-border/40">
                            {t.avatar ? (
                              <img src={t.avatar} alt={t.author} className="size-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-muted-foreground">{t.author.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex flex-col text-[11px]">
                            <span className="font-bold text-foreground">{t.author}</span>
                            <span className="text-muted-foreground">{t.role}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2">
              
              {project.links && project.links.length > 0 && (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-border/40 mb-1 select-none">
                    <Icon icon="solar:square-share-line-duotone" className="text-base text-vanixjnk" />
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Liên kết dự án</h3>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {project.links.map((lnk: ProjectLink, idx) => (
                      <Button
                        key={idx}
                        variant={lnk.type === "live" ? "vanixjnk" : "outline"}
                        size="sm"
                        asChild
                        className="w-full font-bold text-xs py-4.5 justify-start gap-2.5"
                      >
                        <a href={lnk.url} target="_blank" rel="noopener noreferrer">
                          <Icon icon={getLinkIcon(lnk.type)} className="size-4 shrink-0" />
                          <span>{lnk.label || getLinkActionLabel(lnk.type)}</span>
                          <Icon icon="solar:arrow-right-linear" className="size-3 ml-auto opacity-60" />
                        </a>
                      </Button>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                  <Icon icon="solar:info-circle-line-duotone" className="text-base text-vanixjnk" />
                  <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Thông tin dự án</h3>
                </div>

                <div className="flex flex-col gap-3.5 text-xs">
                  {project.clientName && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Khách hàng / Đối tác</span>
                      {project.clientUrl ? (
                        <a
                          href={project.clientUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-vanixjnk hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Icon icon="solar:globus-line-duotone" className="size-3.5 shrink-0" />
                          {project.clientName}
                        </a>
                      ) : (
                        <span className="font-bold text-foreground mt-0.5">
                          {project.clientName}
                        </span>
                      )}
                    </div>
                  )}

                  {(project.startDate || project.endDate) && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Thời gian thực hiện</span>
                      <span className="font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                        <Icon icon="solar:calendar-date-line-duotone" className="text-vanixjnk text-sm" />
                        {formatDate(project.startDate) || "Bắt đầu"} - {formatDate(project.endDate) || "Hiện tại"}
                      </span>
                    </div>
                  )}

                  {project.difficulty !== undefined && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Độ phức tạp / Quy mô</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Icon
                            key={idx}
                            icon="solar:star-bold"
                            className={cn(
                              "size-4",
                              idx < project.difficulty
                                ? "text-amber-500 animate-pulse"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {project.metrics && project.metrics.length > 0 && (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                    <Icon icon="solar:ranking-line-duotone" className="text-base text-vanixjnk" />
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Thông số kỹ thuật / Hiệu năng</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {project.metrics.map((m: ProjectMetric, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/15 border border-border/55 flex items-center gap-3">
                        <div className="size-8 rounded-lg text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/20 flex items-center justify-center shrink-0">
                          <Icon icon={m.icon || "solar:graph-line-duotone"} className="size-4.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {m.label}
                          </span>
                          <span className="text-sm font-black text-foreground mt-0.5">
                            {m.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {project.service && (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-3.5 select-none">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-border/40 mb-0.5">
                    <Icon icon="solar:case-round-line-duotone" className="text-base text-vanixjnk" />
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Dịch vụ liên kết</h3>
                  </div>
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Dự án này được phát triển dựa trên gói dịch vụ chuyên nghiệp của chúng tôi.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full text-xs font-bold gap-2 py-4 hover:bg-vanixjnk hover:text-white hover:border-vanixjnk transition-colors"
                    >
                      <Link href={`/services/${project.service.slug}`}>
                        <Icon icon="solar:hand-stars-line-duotone" className="size-4 shrink-0" />
                        <span>Xem chi tiết dịch vụ</span>
                      </Link>
                    </Button>
                  </div>
                </Card>
              )}

              {project.team && project.team.length > 0 && (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                    <Icon icon="solar:users-group-two-rounded-line-duotone" className="text-base text-vanixjnk" />
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Thành viên tham gia</h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {project.team.map((member: ProjectContributor, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8.5 rounded-full bg-muted border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.name} className="size-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-muted-foreground uppercase">
                                {member.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{member.name}</span>
                            <span className="text-[10px] text-muted-foreground">{member.role}</span>
                          </div>
                        </div>

                        {member.profileUrl && (
                          <a
                            href={member.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
                            title={`Xem hồ sơ của ${member.name}`}
                          >
                            <Icon icon="solar:link-round-angle-linear" className="size-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
