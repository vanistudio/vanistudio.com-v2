import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ArrowLeft, ExternalLink, Github, Figma, FileText, History, Download, Shield, Mail, Star, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';

interface Product {
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
  demoUrl: string | null;
  sourceUrl: string | null;
  documentationUrl: string | null;
  changelogUrl: string | null;
  type: string;
  status: string;
  price: string;
  salePrice: string | null;
  currency: string;
  techStack: string[];
  tags: string[];
  frameworks: string[];
  features: string[];
  highlights: { icon: string; title: string; description: string }[];
  version: string | null;
  compatibility: string | null;
  requirements: string | null;
  fileSize: string | null;
  viewCount: number;
  downloadCount: number;
  rating: string;
  ratingCount: number;
  warrantyMonths: number | null;
  supportEmail: string | null;
  supportIncluded: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

const typeMap: Record<string, { label: string; color: string; bg: string }> = {
  free: { label: "Miễn phí", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  premium: { label: "Premium", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  enterprise: { label: "Enterprise", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
};

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [current, setCurrent] = useState(0);

  if (!images.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative rounded-lg overflow-hidden border border-border bg-muted/20 aspect-video">
        <img
          src={images[current]}
          alt={`${name} - ${current + 1}`}
          className="w-full h-full object-contain"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-background transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-background transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === current ? "bg-primary w-5" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all",
                i === current ? "border-primary" : "border-border opacity-60 hover:opacity-100"
              )}
            >
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

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageTitle(product?.name || "Sản phẩm");

  useEffect(() => {
    if (!slug) return;
    (api.api.app.products as any)({ slug }).get()
      .then(({ data }: any) => {
        if (data?.success) {
          setProduct(data.product);
        } else {
          setError(data?.error || "Không tìm thấy sản phẩm");
        }
      })
      .catch(() => setError("Lỗi khi tải sản phẩm"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <AppDashed noTopBorder>
          <div className="flex items-center justify-center py-32">
            <Icon icon="solar:spinner-bold-duotone" className="text-3xl text-muted-foreground animate-spin" />
          </div>
        </AppDashed>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col w-full">
        <AppDashed noTopBorder>
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Icon icon="solar:box-bold-duotone" className="text-6xl text-muted-foreground/20" />
            <p className="text-muted-foreground">{error || "Không tìm thấy sản phẩm"}</p>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft size={14} className="mr-1.5" />
                Quay lại trang chủ
              </Button>
            </Link>
          </div>
        </AppDashed>
      </div>
    );
  }

  const typeInfo = typeMap[product.type] || typeMap.premium;
  const hasDiscount = product.salePrice && Number(product.salePrice) < Number(product.price);
  const allImages = [
    ...(product.coverImage ? [product.coverImage] : []),
    ...(product.images || []),
  ];
  const links = [
    product.demoUrl && { icon: <ExternalLink size={14} />, label: "Live Demo", href: product.demoUrl },
    product.sourceUrl && { icon: <Github size={14} />, label: "Source Code", href: product.sourceUrl },
    product.documentationUrl && { icon: <FileText size={14} />, label: "Tài liệu", href: product.documentationUrl },
    product.changelogUrl && { icon: <History size={14} />, label: "Changelog", href: product.changelogUrl },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; href: string }[];

  return (
    <div className="flex flex-col w-full">
      {/* Back button */}
      <AppDashed noTopBorder padding="p-3">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} />
          <span>Trang chủ</span>
        </Link>
      </AppDashed>

      {/* Hero: Cover image */}
      {product.coverImage && (
        <AppDashed noTopBorder padding="p-0">
          <div className="relative w-full aspect-[21/9] overflow-hidden">
            <img
              src={product.coverImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          </div>
        </AppDashed>
      )}

      {/* Header */}
      <AppDashed noTopBorder padding="p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-4">
            {product.thumbnail && (
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-16 h-16 rounded-xl border border-border object-cover shrink-0"
              />
            )}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-title">{product.name}</h1>
                <Badge variant="outline" className={cn("text-[10px] font-semibold border", typeInfo.bg, typeInfo.color)}>
                  {typeInfo.label}
                </Badge>
                {product.isFeatured && (
                  <Badge variant="secondary" className="text-[10px]">
                    <Star size={10} className="mr-1" />
                    Nổi bật
                  </Badge>
                )}
              </div>
              {product.tagline && (
                <p className="text-sm text-muted-foreground">{product.tagline}</p>
              )}
              {product.version && (
                <p className="text-xs text-muted-foreground/70">Phiên bản {product.version}</p>
              )}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between flex-wrap gap-3 mt-1">
            <div className="flex items-center gap-3">
              {product.type === "free" ? (
                <span className="text-2xl font-bold text-emerald-500">Miễn phí</span>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {Number(hasDiscount ? product.salePrice : product.price).toLocaleString("vi-VN")}đ
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-muted-foreground line-through">
                      {Number(product.price).toLocaleString("vi-VN")}đ
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {product.demoUrl && (
                <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink size={14} className="mr-1.5" />
                    Demo
                  </Button>
                </a>
              )}
              <Button size="sm">
                <Download size={14} className="mr-1.5" />
                {product.type === "free" ? "Tải về" : "Mua ngay"}
              </Button>
            </div>
          </div>
        </div>
      </AppDashed>

      {/* Stats bar */}
      <AppDashed noTopBorder padding="p-0">
        <div className="grid grid-cols-3 divide-x divide-border">
          {[
            { icon: <Eye size={14} />, label: "Lượt xem", value: product.viewCount.toLocaleString() },
            { icon: <Download size={14} />, label: "Lượt tải", value: product.downloadCount.toLocaleString() },
            { icon: <Star size={14} />, label: "Đánh giá", value: product.ratingCount > 0 ? `${product.rating}/5` : "Chưa có" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-1 py-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {stat.icon}
                <span className="text-xs">{stat.label}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{stat.value}</span>
            </div>
          ))}
        </div>
      </AppDashed>

      {/* Description */}
      {product.description && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-title">Mô tả</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        </AppDashed>
      )}

      {/* Gallery */}
      {allImages.length > 0 && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-title">Hình ảnh</h2>
            <ImageGallery images={allImages} name={product.name} />
          </div>
        </AppDashed>
      )}

      {/* Video */}
      {product.videoUrl && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-title">Video giới thiệu</h2>
            <div className="aspect-video rounded-lg overflow-hidden border border-border">
              <iframe
                src={product.videoUrl.replace("watch?v=", "embed/")}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </AppDashed>
      )}

      {/* Highlights */}
      {product.highlights && product.highlights.length > 0 && (
        <AppDashed noTopBorder padding="p-0">
          <div className="px-5 pt-4 pb-1">
            <h2 className="text-sm font-bold text-title">Điểm nổi bật</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {product.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-3 p-4 hover:bg-muted-background transition-colors">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Icon icon={h.icon || "solar:star-bold-duotone"} className="text-lg" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{h.title}</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{h.description}</span>
                </div>
              </div>
            ))}
          </div>
        </AppDashed>
      )}

      {/* Features */}
      {product.features && product.features.length > 0 && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-title">Tính năng</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {product.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </AppDashed>
      )}

      {/* Content (rich text) */}
      {product.content && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-title">Chi tiết</h2>
            <article
              className="prose dark:prose-invert prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: product.content }}
            />
          </div>
        </AppDashed>
      )}

      {/* Tech Stack */}
      {(product.techStack?.length > 0 || product.frameworks?.length > 0) && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-title">Công nghệ sử dụng</h2>
            <div className="flex flex-wrap gap-2">
              {[...(product.techStack || []), ...(product.frameworks || [])].map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </AppDashed>
      )}

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <AppDashed noTopBorder padding="p-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-title">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </AppDashed>
      )}

      {/* Product Info */}
      <AppDashed noTopBorder padding="p-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-title">Thông tin sản phẩm</h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="px-4">
              {product.version && (
                <InfoRow icon={<Icon icon="solar:tag-bold-duotone" className="text-base" />} label="Phiên bản" value={product.version} />
              )}
              {product.fileSize && (
                <InfoRow icon={<Icon icon="solar:folder-bold-duotone" className="text-base" />} label="Dung lượng" value={product.fileSize} />
              )}
              {product.compatibility && (
                <InfoRow icon={<Icon icon="solar:monitor-bold-duotone" className="text-base" />} label="Tương thích" value={product.compatibility} />
              )}
              {product.requirements && (
                <InfoRow icon={<Icon icon="solar:cpu-bold-duotone" className="text-base" />} label="Yêu cầu" value={product.requirements} />
              )}
              {product.warrantyMonths != null && product.warrantyMonths > 0 && (
                <InfoRow icon={<Shield size={14} />} label="Bảo hành" value={`${product.warrantyMonths} tháng`} />
              )}
              {product.supportIncluded && (
                <InfoRow icon={<Mail size={14} />} label="Hỗ trợ kỹ thuật" value={product.supportEmail || "Có"} />
              )}
              <InfoRow
                icon={<Icon icon="solar:calendar-bold-duotone" className="text-base" />}
                label="Cập nhật"
                value={new Date(product.updatedAt).toLocaleDateString("vi-VN")}
              />
            </div>
          </div>
        </div>
      </AppDashed>

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
