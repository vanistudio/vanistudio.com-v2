"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import type { Project, ProjectLink, ProjectMetric } from "@/server/db/schemas/project.schema";
import type { Service } from "@/server/db/schemas/service.schema";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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


export default function PubProjectsList({
  initialProjects,
}: {
  initialProjects: (Project & { service: Service | null })[];
}) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const projectTypesList = [
    { id: "all", name: "Tất cả loại hình", icon: "solar:widget-line-duotone" },
    { id: "personal", name: "Cá nhân", icon: "solar:user-line-duotone" },
    { id: "collaborative", name: "Hợp tác / Team", icon: "solar:users-group-two-rounded-line-duotone" },
    { id: "client", name: "Khách hàng", icon: "solar:case-minimalistic-line-duotone" },
    { id: "other", name: "Khác", icon: "solar:folder-open-line-duotone" },
  ];

  const linkedServices = useMemo(() => {
    const map = new Map<string, string>();
    initialProjects.forEach((p) => {
      if (p.service) {
        map.set(p.service.id, p.service.name);
      }
    });
    return [
      { id: "all", name: "Tất cả dịch vụ" },
      ...Array.from(map.entries()).map(([id, name]) => ({ id, name })),
    ];
  }, [initialProjects]);

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      const matchesType = typeFilter === "all" || project.projectType === typeFilter;

      const matchesService =
        serviceFilter === "all" || (project.serviceId && project.serviceId === serviceFilter);

      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.clientName && project.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.role && project.role.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesService && matchesSearch;
    });
  }, [initialProjects, typeFilter, serviceFilter, searchQuery]);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon="solar:folder-with-files-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Sản Phẩm & Dự Án</h1>
              <p className="text-sm text-muted-foreground">
                Nơi lưu trữ và giới thiệu các sản phẩm, dự án thực tế do chúng tôi thiết kế, phát triển và vận hành.
              </p>
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
          
          <div className="flex flex-col items-center justify-center gap-4 w-full">
            <div className="flex items-center gap-2 w-full max-w-md">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground z-10">
                  <Icon icon="solar:magnifer-line-duotone" className="size-4" />
                </span>
                <Input
                  type="text"
                  placeholder="Tìm kiếm dự án..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 z-10"
                    title="Xóa nhập liệu"
                  >
                    <Icon icon="solar:close-circle-line-duotone" className="size-4" />
                  </button>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-10 w-10 border-border bg-background hover:bg-muted/50 shrink-0",
                      (typeFilter !== "all" || serviceFilter !== "all") && "text-vanixjnk border-vanixjnk/30 bg-vanixjnk/5 hover:bg-vanixjnk/10"
                    )}
                    title="Lọc dự án"
                  >
                    <Icon icon="solar:filter-line-duotone" className="size-4 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 flex flex-col gap-3.5" align="end">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
                      Loại dự án
                    </label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full h-9 justify-between bg-background border-border text-xs">
                        <SelectValue placeholder="Chọn loại hình" />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start">
                        {projectTypesList.map((type) => (
                          <SelectItem key={type.id} value={type.id} className="text-xs">
                            <span className="flex items-center gap-2">
                              <Icon icon={type.icon} className="size-3.5 shrink-0" />
                              <span>{type.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
                      Dịch vụ liên kết
                    </label>
                    <Select value={serviceFilter} onValueChange={setServiceFilter}>
                      <SelectTrigger className="w-full h-9 justify-between bg-background border-border text-xs">
                        <SelectValue placeholder="Chọn dịch vụ" />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start">
                        {linkedServices.map((svc) => (
                          <SelectItem key={svc.id} value={svc.id} className="text-xs">
                            <span className="truncate max-w-[190px] block">{svc.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="size-16 rounded-2xl bg-muted/40 border border-border flex items-center justify-center">
                <Icon icon="solar:folder-error-line-duotone" className="text-3xl text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base text-foreground">Không tìm thấy dự án nào</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm dự án phù hợp.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map((project) => {
                const typeMeta = getProjectTypeMeta(project.projectType);
                const statusMeta = getStatusMeta(project.status);

                return (
                  <Card key={project.id} className="group relative flex flex-col h-full bg-card/30 border-border p-0!">
                    <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-muted/20 border-b border-border/55 flex items-center justify-center select-none">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-vanixjnk/5 to-vanixjnk/15 flex items-center justify-center">
                          <Icon icon={typeMeta.icon} className={`text-5xl ${typeMeta.color} opacity-40`} />
                        </div>
                      )}
                      
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shadow-md border z-10",
                          typeMeta.color,
                          typeMeta.bg,
                          typeMeta.border
                        )}>
                          {typeMeta.label}
                        </span>
                        
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shadow-md border z-10 flex items-center gap-1",
                          statusMeta.color,
                          statusMeta.bg,
                          statusMeta.border
                        )}>
                          <span className={cn("size-1.5 rounded-full", statusMeta.dot)} />
                          {statusMeta.label}
                        </span>
                      </div>

                      {project.difficulty !== undefined && project.difficulty > 0 && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shadow-md border z-10 flex items-center gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20">
                          <Icon icon="solar:star-bold" className="size-3 shrink-0" />
                          <span>Độ khó: {project.difficulty}/5</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 p-5 gap-3">
                      <div className="space-y-1">
                        <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:z-10">
                          <h3 className="text-base font-bold text-foreground line-clamp-1">
                            {project.name}
                          </h3>
                        </Link>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {project.description || "Chưa có mô tả ngắn gọn cho dự án này."}
                        </p>
                      </div>

                      {project.service && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/20 border border-border/30 rounded px-2 py-1 w-fit select-none">
                          <Icon icon="solar:link-round-angle-line-duotone" className="text-vanixjnk" />
                          <span className="font-medium truncate max-w-[180px]">
                            {project.service.name}
                          </span>
                        </div>
                      )}

                      {project.metrics && project.metrics.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-3 mt-1">
                          {project.metrics.slice(0, 2).map((m: ProjectMetric, idx) => (
                            <div key={idx} className="flex flex-col p-2 bg-muted/10 border border-border/30 rounded-lg">
                              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider line-clamp-1">
                                {m.label}
                              </span>
                              <span className="text-xs font-bold text-foreground mt-0.5 truncate flex items-center gap-1">
                                {m.icon && <Icon icon={m.icon} className="size-3 text-vanixjnk shrink-0" />}
                                {m.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {project.team && project.team.length > 0 && (
                        <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-auto">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Đội ngũ</span>
                          <div className="flex -space-x-2 overflow-hidden select-none">
                            {project.team.slice(0, 4).map((member, idx) => (
                              <div
                                className="size-5.5 rounded-full ring-2 ring-card bg-muted flex items-center justify-center overflow-hidden border border-border/30"
                                title={`${member.name} (${member.role})`}
                                key={idx}
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

                    <div className="border-t border-border px-5 py-4 flex items-center justify-between bg-muted/10 rounded-b-xl group-hover:bg-muted/15 transition-colors">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-xs font-bold text-vanixjnk hover:text-vanixjnk/80 transition-colors flex items-center gap-1 relative z-20"
                      >
                        Chi tiết
                        <Icon icon="solar:arrow-right-linear" className="text-[10px]" />
                      </Link>

                      {project.links && project.links.length > 0 && (
                        <div className="flex items-center gap-2 relative z-20">
                          {project.links.slice(0, 4).map((lnk: ProjectLink, idx) => (
                            <a
                              key={idx}
                              href={lnk.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "p-1.5 rounded border border-border/50 bg-background/50 hover:bg-background transition-all shadow-xs",
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
          )}
        </div>
      </div>
    </div>
  );
}
