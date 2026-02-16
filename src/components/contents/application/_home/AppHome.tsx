import { ArrowUpRight, Pin } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useTheme } from 'next-themes';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const projects = [
  {
    name: "VaniStudio Web",
    slug: "/projects/vanistudio-web",
    description: "Website chính thức của Vani Studio — showcase sản phẩm, quản lý license key và cung cấp thông tin cho cộng đồng.",
    screenshot: "/images/projects/vanistudio-web.png",
    background: "https://cdn.vectorstock.com/i/1000v/11/04/retro-marble-background-groovy-70s-wavy-pattern-vector-47221104.jpg",
    status: "Building",
    statusColor: "text-amber-500",
    dotColor: "bg-amber-500",
  },
  {
    name: "Vani Injector",
    slug: "/projects/vani-injector",
    description: "Công cụ tự động hóa quy trình đăng nhập và quản lý multi-account Riot Client nhanh chóng, an toàn.",
    screenshot: "/images/projects/vani-injector.png",
    background: "https://cdn.vectorstock.com/i/1000v/11/04/retro-marble-background-groovy-70s-wavy-pattern-vector-47221104.jpg",
    status: "Active",
    statusColor: "text-emerald-500",
    dotColor: "bg-emerald-500",
  },
  {
    name: "TSBVH Bot",
    slug: "/projects/tsbvh-bot",
    description: "Discord bot quản lý cộng đồng TSBVH — hệ thống ranking, leaderboard, quản lý clan và nhiều tính năng hơn nữa.",
    screenshot: "/images/projects/tsbvh-bot.png",
    background: "https://img.freepik.com/premium-vector/abstract-hand-drawn-psychedelic-groovy-background-retro-wavy-pattern-texture-design_92086-696.jpg",
    status: "Active",
    statusColor: "text-emerald-500",
    dotColor: "bg-emerald-500",
  },
  {
    name: "Lunel",
    slug: "/projects/lunel",
    description: "Dự án đang được phát triển — một sản phẩm mới sắp ra mắt từ Vani Studio. Hãy đón chờ!",
    screenshot: "/images/projects/soon.png",
    background: "https://img.freepik.com/premium-vector/abstract-hand-drawn-psychedelic-groovy-background-retro-wavy-pattern-texture-design_92086-696.jpg",
    status: "Coming Soon",
    statusColor: "text-red-500",
    dotColor: "bg-red-500",
  },
];

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

function ProjectCard({ project }: { project: typeof projects[number] }) {
  return (
    <div className="p-3">
      <Link to={project.slug} className="flex flex-col gap-2 cursor-pointer group w-full">
        <div className="p-[4px] rounded-[10px] border border-border">
          <div className="relative w-full bg-muted-background rounded-[6px] border border-border h-[200px] md:h-[200px] sm:h-[170px] overflow-hidden select-none">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ backgroundImage: `url(${project.background})` }}
            />
            <h1 className="absolute top-2 left-2 text-xs text-muted-foreground group-hover:text-foreground font-medium transition-all duration-300 group-hover:left-1/2 group-hover:-translate-x-1/2">
              {project.status}
            </h1>
            <div className="bg-background rounded-t-[6px] absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[75%] group-hover:h-[70%] transition-all duration-300 p-[2px] pb-0">
              <div className="w-full h-full rounded-t-[4px] overflow-hidden">
                <img
                  alt={project.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  src={project.screenshot}
                />
              </div>
            </div>
            <div className="absolute top-1 right-1 p-1.5 rounded-[8px] border border-border bg-background text-title">
              <Pin size={12} />
            </div>
          </div>
        </div>
        <div className="px-2 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[1.10rem] leading-[1.10] text-title font-bold">{project.name}</h3>
            <div className="flex items-center gap-1 select-none">
              <div className="relative flex items-center justify-center">
                <div
                  className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping group-hover:hidden rounded-full opacity-40", project.dotColor)}
                  style={{ width: 10, height: 10 }}
                />
                <svg className={cn("relative z-10", project.statusColor)} height="14" width="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
                </svg>
              </div>
              <p className={cn("text-sm font-medium", project.statusColor)}>{project.status}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{project.description}</p>
          <div className="flex items-center gap-1 select-none">
            <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-title">View Project</p>
            <ArrowUpRight size={14} className="text-muted-foreground transition-all duration-300 group-hover:rotate-45 group-hover:text-title" />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function AppHome() {
  const { resolvedTheme } = useTheme();

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
              { id: "cpp", label: "C/C++" },
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
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </AppDashed>
    </div>
  );
}
