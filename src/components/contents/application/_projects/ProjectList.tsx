import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router-dom';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  thumbnail: string | null;
  coverImage: string | null;
  category: string | null;
  techStack: string[];
  type: string;
  liveUrl: string | null;
  isFeatured: boolean;
  isOngoing: boolean;
  startDate: string | null;
  endDate: string | null;
}

const typeMap: Record<string, { label: string; color: string; dotColor: string }> = {
  personal: { label: "Cá nhân", color: "text-blue-500", dotColor: "bg-blue-500" },
  freelance: { label: "Freelance", color: "text-emerald-500", dotColor: "bg-emerald-500" },
  "open-source": { label: "Open Source", color: "text-amber-500", dotColor: "bg-amber-500" },
  collaboration: { label: "Hợp tác", color: "text-purple-500", dotColor: "bg-purple-500" },
};

const typeFilters = [
  { key: "", label: "Tất cả" },
  { key: "personal", label: "Cá nhân" },
  { key: "freelance", label: "Freelance" },
  { key: "open-source", label: "Open Source" },
  { key: "collaboration", label: "Hợp tác" },
];

function ProjectCard({ project }: { project: Project }) {
  const typeInfo = typeMap[project.type] || typeMap.personal;

  return (
    <Link to={`/projects/${project.slug}`} className="flex flex-col gap-2 cursor-pointer group w-full p-3">
      <div className="p-[4px] rounded-[10px] border border-border">
        <div className="relative w-full bg-muted-background rounded-[6px] border border-border h-[180px] overflow-hidden select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="bg-background rounded-t-[6px] absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[75%] group-hover:h-[70%] transition-all duration-300 p-[2px] pb-0">
            <div className="w-full h-full rounded-t-[4px] overflow-hidden">
              {project.thumbnail ? (
                <img alt={project.name} loading="lazy" className="w-full h-full object-cover" src={project.thumbnail} />
              ) : project.coverImage ? (
                <img alt={project.name} loading="lazy" className="w-full h-full object-cover" src={project.coverImage} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/30">
                  <Icon icon="solar:case-round-bold-duotone" className="text-4xl text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-2 left-2">
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", typeInfo.dotColor.replace('bg-', 'border-').replace('500', '500/30'), typeInfo.dotColor.replace('500', '500/15'), typeInfo.color)}>
              {typeInfo.label}
            </span>
          </div>
          {project.isOngoing && (
            <div className="absolute top-2 right-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-500">
                Đang phát triển
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="px-1 flex flex-col gap-1">
        <h3 className="text-sm font-bold text-title truncate">{project.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{project.tagline || project.description}</p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 select-none">
            <span className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-title">Xem chi tiết</span>
            <ArrowUpRight size={12} className="text-muted-foreground transition-all duration-300 group-hover:rotate-45 group-hover:text-title" />
          </div>
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex items-center gap-1">
              {project.techStack.slice(0, 2).map((t) => (
                <Badge key={t} variant="secondary" className="text-[9px] font-normal h-4 px-1.5">{t}</Badge>
              ))}
              {project.techStack.length > 2 && (
                <span className="text-[9px] text-muted-foreground">+{project.techStack.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProjectList() {
  usePageTitle("Dự án");
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const activeType = searchParams.get("type") || "";

  useEffect(() => {
    setLoading(true);
    const queryParams: Record<string, string> = { limit: '50' };
    if (activeType) queryParams.type = activeType;

    (api.api.app.projects as any).get({ query: queryParams })
      .then(({ data }: any) => {
        if (data?.success) setProjects(data.projects || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeType]);

  const handleTypeClick = (type: string) => {
    if (type === activeType) {
      searchParams.delete("type");
    } else if (type) {
      searchParams.set("type", type);
    } else {
      searchParams.delete("type");
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-5">
        <div className="flex flex-col items-center gap-1.5">
          <div className="p-3 rounded-xl bg-primary/10 mb-1">
            <Icon icon="solar:code-bold-duotone" className="text-3xl text-primary" />
          </div>
          <h1 className="text-xl font-bold text-title">Dự án</h1>
          <p className="text-sm text-muted-foreground text-center max-w-lg">
            Các dự án đã và đang thực hiện bởi Vani Studio
          </p>
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {typeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => handleTypeClick(f.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                (f.key === "" ? !activeType : activeType === f.key)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Icon icon="solar:case-round-bold-duotone" className="text-5xl text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">
              {activeType ? "Không có dự án thuộc loại này" : "Chưa có dự án nào"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </AppDashed>
    </div>
  );
}
