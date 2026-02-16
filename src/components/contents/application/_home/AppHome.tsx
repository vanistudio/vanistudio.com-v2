import { ExternalLink, Star, Download, Shield, Zap, Code, Eye } from 'lucide-react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { cn } from '@/lib/utils';
import AppNavigation from '@/components/layouts/application/AppNavigation';

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
        <span className="relative px-1.5 py-1 font-medium tracking-widest text-vanixjnk">
          <span className="absolute inset-0 border border-dashed border-vanixjnk bg-vanixjnk/10" />
          {children}
          {[
            "top-[-2px] left-[-2px]",
            "top-[-2px] right-[-2px]",
            "bottom-[-2px] left-[-2px]",
            "bottom-[-2px] right-[-2px]",
          ].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} fill-vanixjnk`} height="5" viewBox="0 0 5 5" width="5">
              <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
            </svg>
          ))}
        </span>
      </h2>
    </div>
  );
}

export default function AppHome() {
  return (
    <div className="flex flex-col w-full">
      <AppNavigation />
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
        <div className="absolute top-1/2 left-0 w-full h-px border-dashed-h z-0 hidden sm:block" />
        <div className="absolute left-1/2 top-0 h-full w-px border-dashed-v z-0 hidden sm:block" />
        <div className="grid grid-cols-1 sm:grid-cols-2 relative z-10">
          {[
            { icon: Zap, label: "Hiệu suất cao", desc: "Tối ưu hóa tốc độ và trải nghiệm", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/25" },
            { icon: Shield, label: "An toàn & Bảo mật", desc: "Bảo vệ dữ liệu người dùng", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/25" },
            { icon: Code, label: "Mã nguồn sạch", desc: "Codebase chuẩn, dễ mở rộng", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/25" },
            { icon: Star, label: "Cộng đồng", desc: "Hỗ trợ và lắng nghe người dùng", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/25" },
          ].map((item, i) => (
            <div key={i} className="p-4 group cursor-default hover:bg-muted-background transition-colors">
              <div className="flex items-start gap-3">
                <div className={cn("size-9 shrink-0 rounded-lg flex items-center justify-center shadow-sm", item.bg, item.border, item.color, "border")}>
                  <item.icon size={18} />
                </div>
                <div className="text-sm">
                  <div className="font-bold text-foreground mb-0.5">{item.label}</div>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
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
