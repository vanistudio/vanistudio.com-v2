import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ArrowLeft, ExternalLink, Github, Figma, Star, ChevronLeft, ChevronRight, Calendar, User, Briefcase } from 'lucide-react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  content: string | null;
  thumbnail: string | null;
  coverImage: string | null;
  images: string[];
  videoUrl: string | null;
  liveUrl: string | null;
  sourceUrl: string | null;
  figmaUrl: string | null;
  category: string | null;
  techStack: string[];
  tags: string[];
  type: string;
  startDate: string | null;
  endDate: string | null;
  isOngoing: boolean;
  clientName: string | null;
  role: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

const typeMap: Record<string, { label: string; color: string; bg: string }> = {
  personal: { label: "Cá nhân", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  freelance: { label: "Freelance", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  "open-source": { label: "Open Source", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  collaboration: { label: "Hợp tác", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
};

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [current, setCurrent] = useState(0);
  if (!images.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative rounded-lg overflow-hidden border border-border bg-muted/20 aspect-video">
        <img src={images[current]} alt={`${name} - ${current + 1}`} className="w-full h-full object-contain" />
        {images.length > 1 && (
          <>
            <button onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-background transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setCurrent((c) => (c + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-background transition-colors">
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={cn("w-2 h-2 rounded-full transition-all", i === current ? "bg-primary w-5" : "bg-muted-foreground/30 hover:bg-muted-foreground/50")} />
              ))}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={cn("shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all", i === current ? "border-primary" : "border-border opacity-60 hover:opacity-100")}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", { month: "short", year: "numeric" });
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageTitle(project?.name || "Dự án");

  useEffect(() => {
    if (!slug) return;
    (api.api.app.projects as any)({ slug }).get()
      .then(({ data }: any) => {
        if (data?.success && data.project) {
          setProject(data.project);
        } else {
          setError(data?.error || "Không tìm thấy dự án");
        }
      })
      .catch(() => setError("Lỗi khi tải dự án"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <AppDashed noTopBorder>
          <div className="flex items-center justify-center py-32">
            <Icon icon="svg-spinners:ring-resize" className="text-3xl text-muted-foreground animate-spin" />
          </div>
        </AppDashed>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col w-full">
        <AppDashed noTopBorder>
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Icon icon="solar:case-round-bold-duotone" className="text-6xl text-muted-foreground/20" />
            <p className="text-muted-foreground">{error || "Không tìm thấy dự án"}</p>
            <Link to="/projects">
              <Button variant="outline" size="sm">
                <ArrowLeft size={14} className="mr-1.5" />
                Quay lại
              </Button>
            </Link>
          </div>
        </AppDashed>
      </div>
    );
  }

  const typeInfo = typeMap[project.type] || typeMap.personal;
  const allImages = [
    ...(project.coverImage ? [project.coverImage] : []),
    ...(project.images || []),
  ];
  const links = [
    project.liveUrl && { icon: <ExternalLink size={14} />, label: "Xem trực tiếp", href: project.liveUrl },
    project.sourceUrl && { icon: <Github size={14} />, label: "Mã nguồn", href: project.sourceUrl },
    project.figmaUrl && { icon: <Figma size={14} />, label: "Figma Design", href: project.figmaUrl },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; href: string }[];

  const dateRange = (() => {
    if (!project.startDate) return null;
    const start = formatDate(project.startDate);
    if (project.isOngoing) return `${start} — Hiện tại`;
    if (project.endDate) return `${start} — ${formatDate(project.endDate)}`;
    return start;
  })();

  return (
    <div className="flex flex-col w-full">
      {/* Back button */}
      <AppDashed noTopBorder padding="p-3">
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} />
          <span>Dự án</span>
        </Link>
      </AppDashed>

      {/* Hero: Cover image */}
      {project.coverImage && (
        <AppDashed noTopBorder padding="p-0">
          <div className="relative w-full aspect-[21/9] overflow-hidden">
            <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          </div>
        </AppDashed>
      )}

      {/* Header */}
      <AppDashed noTopBorder padding="p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-4">
            {project.thumbnail && (
              <img src={project.thumbnail} alt={project.name} className="w-16 h-16 rounded-xl border border-border object-cover shrink-0" />
            )}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-title">{project.name}</h1>
                <Badge variant="outline" className={cn("text-[10px] font-semibold border", typeInfo.bg, typeInfo.color)}>
                  {typeInfo.label}
                </Badge>
                {project.isFeatured && (
                  <Badge variant="secondary" className="text-[10px]">
                    <Star size={10} className="mr-1" />
                    Nổi bật
                  </Badge>
                )}
                {project.isOngoing && (
                  <Badge variant="outline" className="text-[10px] font-semibold border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                    Đang phát triển
                  </Badge>
                )}
              </div>
              {project.tagline && (
                <p className="text-sm text-muted-foreground">{project.tagline}</p>
              )}
              {dateRange && (
                <p className="text-xs text-muted-foreground/70">{dateRange}</p>
              )}
            </div>
          </div>

          {/* CTA */}
          {links.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm">
                    <ExternalLink size={14} className="mr-1.5" />
                    Xem trực tiếp
                  </Button>
                </a>
              )}
              {project.sourceUrl && (
                <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Github size={14} className="mr-1.5" />
                    Source
                  </Button>
                </a>
              )}
              {project.figmaUrl && (
                <a href={project.figmaUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Figma size={14} className="mr-1.5" />
                    Figma
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </AppDashed>

      {/* Description */}
      {project.description && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-title">Mô tả</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
          </div>
        </AppDashed>
      )}

      {/* Gallery */}
      {allImages.length > 0 && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-title">Hình ảnh</h2>
            <ImageGallery images={allImages} name={project.name} />
          </div>
        </AppDashed>
      )}

      {/* Video */}
      {project.videoUrl && (project.videoUrl.includes('youtube.com') || project.videoUrl.includes('youtu.be')) && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-title">Video</h2>
            <div className="aspect-video rounded-lg overflow-hidden border border-border">
              <iframe
                src={project.videoUrl.replace("watch?v=", "embed/")}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </AppDashed>
      )}

      {/* Content (rich text) */}
      {project.content && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-title">Chi tiết dự án</h2>
            <article
              className="prose dark:prose-invert prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: project.content }}
            />
          </div>
        </AppDashed>
      )}

      {/* Tech Stack */}
      {project.techStack && project.techStack.length > 0 && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-title">Công nghệ sử dụng</h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
              ))}
            </div>
          </div>
        </AppDashed>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-title">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
              ))}
            </div>
          </div>
        </AppDashed>
      )}

      {/* Project Info */}
      {(project.category || project.clientName || project.role || dateRange) && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-title">Thông tin dự án</h2>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4">
                {project.category && (
                  <InfoRow icon={<Icon icon="solar:folder-bold-duotone" className="text-base" />} label="Danh mục" value={project.category} />
                )}
                {project.clientName && (
                  <InfoRow icon={<User size={14} />} label="Khách hàng" value={project.clientName} />
                )}
                {project.role && (
                  <InfoRow icon={<Briefcase size={14} />} label="Vai trò" value={project.role} />
                )}
                {dateRange && (
                  <InfoRow icon={<Calendar size={14} />} label="Thời gian" value={dateRange} />
                )}
                <InfoRow
                  icon={<Icon icon="solar:calendar-bold-duotone" className="text-base" />}
                  label="Cập nhật"
                  value={new Date(project.updatedAt).toLocaleDateString("vi-VN")}
                />
              </div>
            </div>
          </div>
        </AppDashed>
      )}

      {/* Links */}
      {links.length > 0 && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-title">Liên kết</h2>
            <div className="flex flex-col gap-2">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-border hover:bg-muted-background transition-colors group"
                >
                  <span className="text-muted-foreground group-hover:text-primary transition-colors">{link.icon}</span>
                  <span className="text-sm text-foreground">{link.label}</span>
                  <ExternalLink size={12} className="ml-auto text-muted-foreground/50" />
                </a>
              ))}
            </div>
          </div>
        </AppDashed>
      )}
    </div>
  );
}
