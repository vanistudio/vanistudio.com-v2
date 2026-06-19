"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Project } from "@/server/db/schemas/project.schema";
import type { Service } from "@/server/db/schemas/service.schema";

interface PubHomeProjectsProps {
  initialProjects: (Project & { service: Service | null })[];
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
        label: "Khách hàng",
        icon: "solar:case-minimalistic-line-duotone",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
      };
    default:
      return {
        label: "Khác",
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

const getLinkColor = (type: string) => {
  switch (type) {
    case "live":
      return "text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400";
    case "github":
      return "text-foreground hover:bg-foreground/10";
    case "figma":
      return "text-pink-500 hover:bg-pink-500/10 hover:text-pink-400";
    case "youtube":
      return "text-red-500 hover:bg-red-500/10 hover:text-red-400";
    case "docs":
      return "text-blue-500 hover:bg-blue-500/10 hover:text-blue-400";
    default:
      return "text-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-400";
  }
};

export default function PubHomeProjects({ initialProjects }: PubHomeProjectsProps) {
  if (initialProjects.length === 0) return null;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col items-center text-center gap-3 max-w-xl mx-auto">
        <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-2.5">
          <Icon icon="solar:layers-line-duotone" className="text-2xl" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-vanixjnk">Featured Projects</span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Dự án & Sản phẩm tiêu biểu
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {initialProjects.map((project) => {
          const typeMeta = getProjectTypeMeta(project.projectType);
          const statusMeta = getStatusMeta(project.status);
          return (
            <Card key={project.id} className="group relative flex flex-col h-full bg-card/30 border-border p-0!">
              <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-muted/20 border-b border-border/55 flex items-center justify-center">
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt={project.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-vanixjnk/5 to-vanixjnk/15 flex items-center justify-center">
                    <Icon icon="solar:layers-line-duotone" className="text-5xl text-vanixjnk opacity-30 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                )}

                <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border bg-background/90 backdrop-blur-md shadow-xs select-none",
                    typeMeta.color,
                    typeMeta.border
                  )}>
                    <Icon icon={typeMeta.icon} className="size-3" />
                    <span>{typeMeta.label}</span>
                  </div>

                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border bg-background/90 backdrop-blur-md shadow-xs select-none",
                    statusMeta.color,
                    statusMeta.border
                  )}>
                    <div className={cn("size-1.5 rounded-full animate-pulse", statusMeta.dot)} />
                    <span>{statusMeta.label}</span>
                  </div>
                </div>

                {project.service && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-vanixjnk text-white shadow-md z-10 select-none">
                    {project.service.name}
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1 p-5 gap-3">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground line-clamp-1">{project.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {project.description || "Chưa có mô tả ngắn gọn cho dự án này."}
                  </p>
                </div>

                {project.metrics && project.metrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {project.metrics.slice(0, 2).map((m, idx) => (
                      <div key={idx} className="flex flex-col p-2 bg-muted/20 border border-border/55 rounded-lg">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{m.label}</span>
                        <span className="text-xs font-black text-foreground mt-0.5">{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex-1" />

                {project.team && project.team.length > 0 && (
                  <div className="flex items-center justify-between pt-1 select-none border-t border-border/30 mt-auto">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Đội ngũ</span>
                    <div className="flex -space-x-2 overflow-hidden">
                      {project.team.slice(0, 4).map((member, idx) => (
                        <div
                          key={idx}
                          className="inline-block size-5.5 rounded-full ring-2 ring-card bg-muted border border-border/30 flex items-center justify-center overflow-hidden"
                          title={`${member.name} (${member.role})`}
                        >
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="size-full object-cover" />
                          ) : (
                            <span className="text-[8px] font-bold text-muted-foreground uppercase">
                              {member.name.charAt(0)}
                            </span>
                          )}
                        </div>
                      ))}
                      {project.team.length > 4 && (
                        <div className="size-5.5 rounded-full ring-2 ring-card bg-muted border border-border/30 flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                          +{project.team.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border px-5 py-4 flex items-center justify-between bg-muted/10 rounded-b-xl">
                <Link href={`/projects/${project.slug}`} className="text-xs font-bold text-foreground hover:text-vanixjnk flex items-center gap-1">
                  <span>Chi tiết dự án</span>
                  <Icon icon="solar:arrow-right-linear" className="text-sm" />
                </Link>

                {project.links && project.links.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {project.links.map((lnk, idx) => (
                      <a
                        key={idx}
                        href={lnk.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "size-7 rounded-lg border border-border/75 flex items-center justify-center transition-all duration-300",
                          getLinkColor(lnk.type)
                        )}
                        title={`${lnk.label} (${lnk.type})`}
                      >
                        <Icon icon={getLinkIcon(lnk.type)} className="size-3.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center mt-6">
        <Button variant="vanixjnk" asChild>
          <Link href="/projects">
            <Icon icon="solar:layers-line-duotone" className="text-base shrink-0" />
            <span>Xem tất cả dự án</span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
