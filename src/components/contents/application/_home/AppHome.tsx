import { useState, useEffect } from 'react';
import { ArrowUpRight, Pin } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useTheme } from 'next-themes';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Service {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  icon: string | null;
  price: string;
  minPrice: string | null;
  currency: string;
  features: string[];
  isFeatured: boolean;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  thumbnail: string | null;
  coverImage: string | null;
  type: string;
  techStack: string[];
  isFeatured: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
  authorName: string | null;
  publishedAt: string | null;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  thumbnail: string | null;
  coverImage: string | null;
  type: string;
  status: string;
  price: string;
  salePrice: string | null;
  currency: string;
  techStack: string[];
  tags: string[];
  isFeatured: boolean;
  version: string | null;
}

const typeMap: Record<string, { label: string; color: string; dotColor: string }> = {
  free: { label: "Miễn phí", color: "text-emerald-500", dotColor: "bg-emerald-500" },
  premium: { label: "Premium", color: "text-amber-500", dotColor: "bg-amber-500" },
  enterprise: { label: "Enterprise", color: "text-purple-500", dotColor: "bg-purple-500" },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      <h2 className="text-sm font-bold text-title">
        <span className="relative px-1.5 py-1 font-medium tracking-widest text-primary">
          <span className="absolute inset-0 border border-dashed border-primary bg-primary/10" />
          {children}
          {[
            "top-[-2px] left-[-2px]",
            "top-[-2px] right-[-2px]",
            "bottom-[-2px] left-[-2px]",
            "bottom-[-2px] right-[-2px]",
          ].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} fill-primary`} height="5" viewBox="0 0 5 5" width="5">
              <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
            </svg>
          ))}
        </span>
      </h2>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const typeInfo = typeMap[product.type] || typeMap.premium;
  const hasDiscount = product.salePrice && Number(product.salePrice) < Number(product.price);

  return (
    <div className="p-3">
      <Link to={`/products/${product.slug}`} className="flex flex-col gap-2 cursor-pointer group w-full">
        <div className="p-[4px] rounded-[10px] border border-border">
          <div className="relative w-full bg-muted-background rounded-[6px] border border-border h-[200px] md:h-[200px] sm:h-[170px] overflow-hidden select-none">
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <h1 className="absolute top-2 left-2 text-xs text-muted-foreground group-hover:text-foreground font-medium transition-all duration-300 group-hover:left-1/2 group-hover:-translate-x-1/2">
              {typeInfo.label}
            </h1>
            <div className="bg-background rounded-t-[6px] absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[75%] group-hover:h-[70%] transition-all duration-300 p-[2px] pb-0">
              <div className="w-full h-full rounded-t-[4px] overflow-hidden">
                {product.thumbnail ? (
                  <img
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    src={product.thumbnail}
                  />
                ) : product.coverImage ? (
                  <img
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    src={product.coverImage}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/30">
                    <Icon icon="solar:box-bold-duotone" className="text-4xl text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>
            {product.isFeatured && (
              <div className="absolute top-1 right-1 p-1.5 rounded-[8px] border border-border bg-background text-title">
                <Pin size={12} />
              </div>
            )}
          </div>
        </div>
        <div className="px-2 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[1.10rem] leading-[1.10] text-title font-bold">{product.name}</h3>
            <div className="flex items-center gap-1 select-none">
              <div className="relative flex items-center justify-center">
                <div
                  className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping group-hover:hidden rounded-full opacity-40", typeInfo.dotColor)}
                  style={{ width: 10, height: 10 }}
                />
                <svg className={cn("relative z-10", typeInfo.color)} height="14" width="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
                </svg>
              </div>
              <p className={cn("text-sm font-medium", typeInfo.color)}>{typeInfo.label}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.tagline || product.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 select-none">
              <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-title">Xem chi tiết</p>
              <ArrowUpRight size={14} className="text-muted-foreground transition-all duration-300 group-hover:rotate-45 group-hover:text-title" />
            </div>
            {product.type === "free" ? (
              <Badge variant="secondary" className="text-[10px] font-medium">Miễn phí</Badge>
            ) : Number(product.price) > 0 && (
              <div className="flex items-center gap-1.5">
                {hasDiscount && (
                  <span className="text-[11px] text-muted-foreground line-through">
                    {Number(product.price).toLocaleString("vi-VN")}đ
                  </span>
                )}
                <span className="text-sm font-semibold text-primary">
                  {Number(hasDiscount ? product.salePrice : product.price).toLocaleString("vi-VN")}đ
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function AppHome() {
  const { resolvedTheme } = useTheme();
  usePageTitle("Trang chủ");
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      (api.api.app.products as any).get({ query: { limit: '20' } }).then(({ data }: any) => {
        if (data?.success) setProducts(data.products || []);
      }),
      (api.api.app.services as any).get().then(({ data }: any) => {
        if (data?.success) setServices((data.services || []).slice(0, 6));
      }),
      (api.api.app.projects as any).get({ query: { limit: '6' } }).then(({ data }: any) => {
        if (data?.success) setProjects(data.projects || []);
      }),
      (api.api.app.blog as any).get({ query: { limit: '4' } }).then(({ data }: any) => {
        if (data?.success) setBlogPosts(data.posts || []);
      }),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col w-full">
      <AppDashed withDotGrid noTopBorder>
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          <img src="/vanistudio.png" alt="" className="w-[100px] h-[100px] rounded-[8px]" />
          <div className="text-center select-none space-y-1">
            <h1 className="text-[1.55rem] font-bold leading-[1.08] text-title">
              Vani Studio
            </h1>
            <p className="text-muted-foreground text-sm">Thiết kế và phát triển phần mềm</p>
          </div>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-3">
        <SectionTitle>Về Vani Studio</SectionTitle>
      </AppDashed>

      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2 justify-center">
          <article className="prose dark:prose-invert prose-sm text-center max-w-[560px] text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">Vani Studio</span> là một nhóm phát triển độc lập chuyên xây dựng các{" "}
              <span className="text-foreground font-medium">công cụ, ứng dụng và giải pháp phần mềm</span>{" "}
              phục vụ cộng đồng game thủ Việt Nam. Chúng tôi tập trung vào chất lượng, trải nghiệm người dùng và sự sáng tạo trong từng sản phẩm.
            </p>
          </article>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-0" className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 relative z-10">
          {[
            { icon: "solar:bolt-circle-bold-duotone", label: "Hiệu suất cao", desc: "Sản phẩm được tối ưu hóa để đảm bảo tốc độ xử lý nhanh nhất, mang lại trải nghiệm mượt mà cho người dùng.", color: "text-blue-500" },
            { icon: "solar:shield-keyhole-bold-duotone", label: "An toàn & Bảo mật", desc: "Dữ liệu người dùng luôn được mã hóa và bảo vệ nghiêm ngặt, tuân thủ các tiêu chuẩn bảo mật hiện đại.", color: "text-emerald-500" },
            { icon: "solar:code-square-bold-duotone", label: "Mã nguồn sạch", desc: "Codebase được thiết kế theo kiến trúc chuẩn, dễ bảo trì, mở rộng và tích hợp với các hệ thống khác.", color: "text-purple-500" },
            { icon: "solar:users-group-rounded-bold-duotone", label: "Cộng đồng lớn mạnh", desc: "Cộng đồng hàng nghìn người dùng luôn sẵn sàng hỗ trợ, chia sẻ kinh nghiệm và đóng góp ý tưởng.", color: "text-amber-500" },
            { icon: "solar:settings-minimalistic-bold-duotone", label: "Tự động hóa", desc: "Tích hợp quy trình tự động giúp tiết kiệm thời gian, giảm thiểu thao tác thủ công và tăng năng suất.", color: "text-rose-500" },
            { icon: "solar:headphones-round-sound-bold-duotone", label: "Hỗ trợ nhanh chóng", desc: "Đội ngũ phát triển luôn lắng nghe phản hồi và sẵn sàng hỗ trợ xử lý mọi vấn đề trong thời gian ngắn nhất.", color: "text-cyan-500" },
          ].map((item, i) => (
            <div key={i} className="p-5 group cursor-default hover:bg-muted-background transition-colors flex flex-col items-center text-center gap-2.5">
              <Icon icon={item.icon} className={cn("text-5xl", item.color)} />
              <div className="text-sm font-bold text-foreground">{item.label}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-3">
        <SectionTitle>Tech Stack</SectionTitle>
      </AppDashed>
      <AppDashed noTopBorder padding="p-4">
        <TooltipProvider>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { id: "js", label: "JavaScript" },
              { id: "ts", label: "TypeScript" },
              { id: "php", label: "PHP" },
              { id: "cs", label: "C#" },
              { id: "py", label: "Python" },
              { id: "c", label: "C" },
              { id: "cpp", label: "C++" },
              { id: "go", label: "Go" },
              { id: "rust", label: "Rust" },
              { id: "react", label: "React" },
              { id: "nextjs", label: "Next.js" },
              { id: "vue", label: "Vue" },
              { id: "nuxtjs", label: "Nuxt" },
              { id: "svelte", label: "Svelte" },
              { id: "angular", label: "Angular" },
              { id: "remix", label: "Remix" },
              { id: "astro", label: "Astro" },
              { id: "gatsby", label: "Gatsby" },
              { id: "electron", label: "Electron" },
              { id: "mui", label: "MUI" },
              { id: "tailwind", label: "Tailwind CSS" },
              { id: "nodejs", label: "Node.js" },
              { id: "bun", label: "Bun" },
              { id: "deno", label: "Deno" },
              { id: "express", label: "Express" },
              { id: "elysia", label: "Elysia" },
              { id: "discordjs", label: "Discord.js" },
              { id: "nestjs", label: "NestJS" },
              { id: "laravel", label: "Laravel" },
              { id: "dotnet", label: ".NET" },
              { id: "redux", label: "Redux" },
              { id: "prisma", label: "Prisma" },
              { id: "postgres", label: "PostgreSQL" },
              { id: "mysql", label: "MySQL" },
              { id: "mongodb", label: "MongoDB" },
              { id: "redis", label: "Redis" },
              { id: "supabase", label: "Supabase" },
              { id: "firebase", label: "Firebase" },
              { id: "nginx", label: "Nginx" },
              { id: "docker", label: "Docker" },
              { id: "linux", label: "Linux" },
              { id: "vite", label: "Vite" },
              { id: "jest", label: "Jest" },
              { id: "vercel", label: "Vercel" },
              { id: "cloudflare", label: "Cloudflare" },
              { id: "git", label: "Git" },
              { id: "github", label: "GitHub" },
              { id: "gitlab", label: "GitLab" },
            ].map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <img
                    src={`https://skillicons.dev/icons?i=${item.id}&theme=${resolvedTheme === 'dark' ? 'dark' : 'light'}`}
                    alt={item.label}
                    className="size-12 rounded-md cursor-default"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </AppDashed>
      <AppDashed noTopBorder padding="p-3">
        <SectionTitle>Sản phẩm của chúng tôi</SectionTitle>
      </AppDashed>
      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2 justify-center">
          <article className="prose dark:prose-invert prose-sm text-center max-w-[560px] text-muted-foreground">
            <p>
              Mỗi sản phẩm đều được phát triển với{" "}
              <span className="text-foreground font-medium">sự tỉ mỉ</span> và{" "}
              <span className="text-foreground font-medium">chất lượng đặt lên hàng đầu</span>.
              Chúng tôi không ngừng cải tiến để mang đến trải nghiệm tốt nhất.
            </p>
          </article>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:box-bold-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Chưa có sản phẩm nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </AppDashed>
      {services.length > 0 && (
        <>
          <AppDashed noTopBorder padding="p-3">
            <SectionTitle>Dịch vụ nổi bật</SectionTitle>
          </AppDashed>
          <AppDashed noTopBorder padding="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
              {services.map((s) => (
                <Link key={s.id} to={`/services/${s.slug}`} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon icon={s.icon || "solar:widget-5-bold-duotone"} className="text-xl text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-title text-center">{s.name}</h3>
                  {s.tagline && <p className="text-[10px] text-muted-foreground text-center line-clamp-2">{s.tagline}</p>}
                  {s.features && s.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mt-1">
                      {s.features.slice(0, 2).map((f, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{f}</span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <Link to="/services">
                <Button variant="outline" size="sm" className="text-xs">
                  Xem tất cả dịch vụ
                  <ArrowUpRight size={12} className="ml-1" />
                </Button>
              </Link>
            </div>
          </AppDashed>
        </>
      )}
      {projects.length > 0 && (
        <>
          <AppDashed noTopBorder padding="p-3">
            <SectionTitle>Dự án tiêu biểu</SectionTitle>
          </AppDashed>
          <AppDashed noTopBorder padding="p-0">
            <div className="grid grid-cols-2 sm:grid-cols-3">
              {projects.map((p) => (
                <Link key={p.id} to={`/projects/${p.slug}`} className="p-3 group">
                  <div className="p-[4px] rounded-[10px] border border-border">
                    <div className="relative w-full bg-muted-background rounded-[6px] border border-border h-[140px] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {p.thumbnail || p.coverImage ? (
                        <img src={p.thumbnail || p.coverImage || ''} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/30">
                          <Icon icon="solar:case-round-bold-duotone" className="text-3xl text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-1 mt-2 flex flex-col gap-0.5">
                    <h3 className="text-sm font-bold text-title truncate">{p.name}</h3>
                    {p.tagline && <p className="text-xs text-muted-foreground line-clamp-1">{p.tagline}</p>}
                    {p.techStack && p.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.techStack.slice(0, 3).map((t) => (
                          <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex justify-center p-4">
              <Link to="/projects">
                <Button variant="outline" size="sm" className="text-xs">
                  Xem tất cả dự án
                  <ArrowUpRight size={12} className="ml-1" />
                </Button>
              </Link>
            </div>
          </AppDashed>
        </>
      )}
      {blogPosts.length > 0 && (
        <>
          <AppDashed noTopBorder padding="p-3">
            <SectionTitle>Bài viết mới nhất</SectionTitle>
          </AppDashed>
          <AppDashed noTopBorder padding="p-0">
            <div className="grid grid-cols-2 sm:grid-cols-4">
              {blogPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="p-3 group">
                  <div className="p-[3px] rounded-[8px] border border-border">
                    <div className="relative w-full bg-muted-background rounded-[5px] border border-border h-[100px] overflow-hidden">
                      {post.thumbnail ? (
                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/30">
                          <Icon icon="solar:document-text-bold-duotone" className="text-2xl text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-0.5 mt-1.5 flex flex-col gap-0.5">
                    <h3 className="text-xs font-bold text-title line-clamp-2">{post.title}</h3>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex justify-center p-4">
              <Link to="/blog">
                <Button variant="outline" size="sm" className="text-xs">
                  Xem tất cả bài viết
                  <ArrowUpRight size={12} className="ml-1" />
                </Button>
              </Link>
            </div>
          </AppDashed>
        </>
      )}
      <AppDashed noTopBorder withDotGrid padding="p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-lg font-bold text-title">Bạn có dự án cần phát triển?</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Liên hệ ngay để được tư vấn miễn phí. Chúng tôi sẵn sàng biến ý tưởng của bạn thành hiện thực.
          </p>
          <div className="flex items-center gap-3">
            <Link to="/contact">
              <Button size="sm">
                <Icon icon="solar:chat-round-dots-bold-duotone" className="text-sm mr-1.5" />
                Liên hệ tư vấn
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outline" size="sm">
                <Icon icon="solar:widget-5-bold-duotone" className="text-sm mr-1.5" />
                Xem dịch vụ
              </Button>
            </Link>
          </div>
        </div>
      </AppDashed>
    </div>
  );
}
