import { ExternalLink, Star, Download, Shield, Zap, Code, Eye } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useTheme } from 'next-themes';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const products = [
  {
    name: "TSBVH Bot",
    description: "Discord bot quản lý cộng đồng The Strongest Battleground Viet Hub — hệ thống ranking, leaderboard, quản lý clan và nhiều tính năng hơn nữa.",
    tags: ["Discord Bot", "TypeScript", "MongoDB"],
    color: "blue",
    icon: Zap,
    status: "Active",
  },
  {
    name: "Vani Injector",
    description: "Công cụ tự động hóa quy trình đăng nhập và quản lý tài khoản Riot Client, hỗ trợ multi-account switching nhanh chóng và an toàn.",
    tags: ["Desktop App", "C#", "WPF"],
    color: "purple",
    icon: Shield,
    status: "Active",
  },
  {
    name: "VaniStudio Web",
    description: "Website chính thức của Vani Studio — showcase sản phẩm, quản lý license key, và cung cấp thông tin cho cộng đồng.",
    tags: ["Web App", "React", "Elysia"],
    color: "emerald",
    icon: Code,
    status: "In Development",
  },
  {
    name: "TSBVH Ranking System",
    description: "Hệ thống phân cấp bậc sức mạnh trong The Strongest Battleground — đánh giá trình độ người chơi từ Stage 0 đến Stage 3.",
    tags: ["API", "Roblox", "Leaderboard"],
    color: "amber",
    icon: Star,
    status: "Active",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; tagBg: string; tagText: string }> = {
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/25", text: "text-blue-500", tagBg: "bg-blue-500/10", tagText: "text-blue-500" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/25", text: "text-purple-500", tagBg: "bg-purple-500/10", tagText: "text-purple-500" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/25", text: "text-emerald-500", tagBg: "bg-emerald-500/10", tagText: "text-emerald-500" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/25", text: "text-amber-500", tagBg: "bg-amber-500/10", tagText: "text-amber-500" },
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
              <Icon icon={item.icon} className={cn("text-4xl", item.color)} />
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
                    className="size-10 rounded-md cursor-default"
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
      <AppDashed noTopBorder padding="p-0" className="relative">
        <div className="absolute top-1/2 left-0 w-full h-px border-dashed-h z-0 hidden sm:block" />
        <div className="absolute left-1/2 top-0 h-full w-px border-dashed-v z-0 hidden sm:block" />

        <div className="grid grid-cols-1 sm:grid-cols-2 relative z-10">
          {products.map((product, i) => {
            const colors = colorMap[product.color];
            return (
              <div
                key={i}
                className="p-4 group cursor-pointer hover:bg-muted-background transition-colors"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("size-10 shrink-0 rounded-lg border flex items-center justify-center shadow-sm", colors.bg, colors.border, colors.text)}>
                        <product.icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-sm leading-tight">{product.name}</h3>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-0.5 inline-block", colors.tagBg, colors.tagText)}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AppDashed>
    </div>
  );
}
