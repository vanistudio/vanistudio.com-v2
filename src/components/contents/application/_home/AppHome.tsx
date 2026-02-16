import React from 'react';
import { Rocket, Shield, Zap, ChevronRight, Github, Twitter, MessageSquare, Mail, Eye } from 'lucide-react';
import DashedBox from '@/components/layouts/application/DashedBox';
import { cn } from '@/lib/utils';
import AppNavigation from '@/components/layouts/application/AppNavigation';
export default function AppHome() {
  return (
    <div className="flex flex-col w-full">
      <AppNavigation />
      <DashedBox noTopBorder padding="p-3">
        <div className="flex items-center gap-2 justify-center">
          <h1 className="text-sm font-bold text-title">
            <span className="relative px-1.5 py-1 font-medium tracking-widest text-vanixjnk">
              <span className="absolute inset-0 border border-dashed border-vanixjnk bg-vanixjnk/10" />
              Hệ thống cấp bậc sức mạnh
              <svg
                className="absolute top-[-2px] left-[-2px] fill-vanixjnk"
                height="5"
                viewBox="0 0 5 5"
                width="5">
                <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
              </svg>
              <svg
                className="absolute top-[-2px] right-[-2px] fill-vanixjnk"
                height="5"
                viewBox="0 0 5 5"
                width="5">
                <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
              </svg>
              <svg
                className="absolute bottom-[-2px] left-[-2px] fill-vanixjnk"
                height="5"
                viewBox="0 0 5 5"
                width="5">
                <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
              </svg>
              <svg
                className="absolute right-[-2px] bottom-[-2px] fill-vanixjnk"
                height="5"
                viewBox="0 0 5 5"
                width="5">
                <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
              </svg>
            </span>
          </h1>
        </div>
      </DashedBox>
      <div className="w-full">
        <DashedBox noTopBorder padding="p-3">
          <div className='flex items-center gap-2 justify-center'>
            <article className="prose dark:prose-invert prose-sm text-center max-w-[500px] text-muted-foreground">
              <p>
                Là hệ thống phân chia <span className="text-foreground font-medium">cấp bậc trình độ</span> trong The Strongest Battleground, cho phép bạn biết được <span className="text-foreground font-medium">thực lực</span> của bản thân và người khác.
              </p>
            </article>
          </div>
        </DashedBox>
      </div>
      <DashedBox noTopBorder padding="p-3">
        <div className="flex items-center gap-2 justify-center">
          <h1 className="text-sm font-bold text-title">
            <span className="relative px-1.5 py-1 font-medium tracking-widest text-vanixjnk">
              <span className="absolute inset-0 border border-dashed border-vanixjnk bg-vanixjnk/10" />
              Hệ thống phân cấp bậc chính
              <svg
                className="absolute top-[-2px] left-[-2px] fill-vanixjnk"
                height="5"
                viewBox="0 0 5 5"
                width="5">
                <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
              </svg>
              <svg
                className="absolute top-[-2px] right-[-2px] fill-vanixjnk"
                height="5"
                viewBox="0 0 5 5"
                width="5">
                <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
              </svg>
              <svg
                className="absolute bottom-[-2px] left-[-2px] fill-vanixjnk"
                height="5"
                viewBox="0 0 5 5"
                width="5">
                <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
              </svg>
              <svg
                className="absolute right-[-2px] bottom-[-2px] fill-vanixjnk"
                height="5"
                viewBox="0 0 5 5"
                width="5">
                <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
              </svg>
            </span>
          </h1>
        </div>
      </DashedBox>
      <div className="w-full">
        <DashedBox noTopBorder padding="p-0" className="relative">
          <div className="absolute top-1/2 left-0 w-full h-px border-dashed-h z-0 hidden sm:block" />
          <div className="absolute left-1/2 top-0 h-full w-px border-dashed-v z-0 hidden sm:block" />

          <div className="grid grid-cols-1 sm:grid-cols-2 relative z-10">
            <div className={cn(
              "p-4 group cursor-pointer hover:bg-muted-background transition-colors",
            )}>
              <div className="flex flex-col gap-3">
                <div className="aspect-video rounded-lg border border-border bg-muted/50 overflow-hidden relative p-1">
                  <div className="absolute inset-0 opacity-20" />
                  <div className="w-full h-full rounded bg-background flex items-center justify-center overflow-hidden">
                    <img src="/file_00000000672c72088ddd413c4baeef3e.png" alt="Stage 3" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute bottom-2 left-2 font-bold text-lg bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded border bg-gray-500/20 text-gray-500">Stage 3</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Cấp bậc này dành cho những người chơi <span className="text-foreground font-medium">chưa nắm vững</span> các kỹ năng nền tảng và chưa hiểu rõ cách trò chơi vận hành. Họ <span className="text-foreground font-medium">thiếu kỹ năng mềm</span>, phản xạ và kiến thức cơ bản về cơ chế game, dẫn đến lối chơi <span className="text-foreground font-medium">rời rạc</span> và <span className="text-foreground font-medium">kém hiệu quả</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className={cn(
              "p-4 group cursor-pointer hover:bg-muted-background transition-colors",
              "sm:border-l-0",
            )}>
              <div className="flex flex-col gap-3">
                <div className="aspect-video rounded-lg border border-border bg-muted/50 overflow-hidden relative p-1">
                  <div className="absolute inset-0 opacity-20" />
                  <div className="w-full h-full rounded bg-background flex items-center justify-center overflow-hidden">
                    <img src="/file_00000000f17c7208be25aa16d7358073.png" alt="Stage 2" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute bottom-2 left-2 font-bold text-lg bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded border bg-yellow-500/20 text-yellow-500">Stage 2</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Người chơi ở cấp độ này đã làm quen và hiểu được các <span className="text-foreground font-medium">cơ chế quan trọng</span> của trò chơi như blocking, side dashing. Họ <span className="text-foreground font-medium">thành thạo các combo cơ bản</span> và bắt đầu áp dụng một số kỹ thuật nâng cao, tuy nhiên khả năng <span className="text-foreground font-medium">xử lý tình huống</span> và sự ổn định vẫn còn hạn chế.
                  </p>
                </div>
              </div>
            </div>

            <div className={cn(
              "p-4 group cursor-pointer hover:bg-muted-background transition-colors",
              "sm:border-t-0"
            )}>
              <div className="flex flex-col gap-3">
                <div className="aspect-video rounded-lg border border-border bg-muted/50 overflow-hidden relative p-1">
                  <div className="absolute inset-0 opacity-20" />
                  <div className="w-full h-full rounded bg-background flex items-center justify-center overflow-hidden">
                    <img src="/file_0000000081147208b10b09eee33e2985.png" alt="Stage 1" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute bottom-2 left-2 font-bold text-lg bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded border bg-cyan-500/20 text-cyan-500">Stage 1</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Đây là nhóm người chơi <span className="text-foreground font-medium">vượt trội rõ rệt</span> so với mặt bằng chung. Họ tạo ra <span className="text-foreground font-medium">khoảng cách kỹ năng</span> đáng kể so với Stage 2 nhờ vào kiến thức sâu về cơ chế game, khả năng <span className="text-foreground font-medium">đọc tình huống</span> và tư duy chiến thuật tốt. Dù sở hữu tiềm năng lớn, họ vẫn chưa đạt đến mức <span className="text-foreground font-medium">tinh chỉnh hoàn hảo</span> và độ ổn định tuyệt đối trong mọi trận đấu.
                  </p>
                </div>
              </div>
            </div>
            <div className={cn(
              "p-4 group cursor-pointer hover:bg-muted-background transition-colors",
              "sm:border-l-0",
            )}>
              <div className="flex flex-col gap-3">
                <div className="aspect-video rounded-lg border border-border bg-muted/50 overflow-hidden relative p-1">
                  <div className="absolute inset-0 opacity-20" />
                  <div className="w-full h-full rounded bg-background flex items-center justify-center overflow-hidden">
                    <img src="/file_000000009764720880686753d5baa844.png" alt="Stage 0" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute bottom-2 left-2 font-bold text-lg bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded border bg-blue-500/20 text-blue-500">Stage 0</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Cấp bậc cao nhất, đại diện cho những người chơi gần đạt đến <span className="text-foreground font-medium">trình độ tinh thông</span>. Họ sở hữu kỹ năng được tinh chỉnh hoàn thiện, hiệu suất thi đấu ổn định và khả năng <span className="text-foreground font-medium">nhận thức chiến thuật</span> xuất sắc. Những người chơi ở Stage 0 có khả năng <span className="text-foreground font-medium">thống trị trận đấu</span> và vượt trội hoàn toàn so với tất cả các cấp độ còn lại.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DashedBox>
      </div>
      <DashedBox noTopBorder padding="p-3">
        <div className="flex items-center gap-2 justify-center">
          <h1 className="text-sm font-bold text-title">
            <span className="relative px-1.5 py-1 font-medium tracking-widest text-vanixjnk">
              <span className="absolute inset-0 border border-dashed border-vanixjnk bg-vanixjnk/10" />
              Hệ thống phân cấp bậc phụ
              <svg
                className="absolute top-[-2px] left-[-2px] fill-vanixjnk"
                height="5"
                viewBox="0 0 5 5"
                width="5">
                <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
              </svg>
              <svg
                className="absolute top-[-2px] right-[-2px] fill-vanixjnk"
                height="5"
                viewBox="0 0 5 5"
                width="5">
                <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
              </svg>
              <svg
                className="absolute bottom-[-2px] left-[-2px] fill-vanixjnk"
                height="5"
                viewBox="0 0 5 5"
                width="5">
                <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
              </svg>
              <svg
                className="absolute right-[-2px] bottom-[-2px] fill-vanixjnk"
                height="5"
                viewBox="0 0 5 5"
                width="5">
                <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
              </svg>
            </span>
          </h1>
        </div>
      </DashedBox>
      <div className="w-full">
        <DashedBox noTopBorder padding="p-3">
          <div className='flex items-center gap-2 justify-center'>
            <div className="grid grid-cols-1 gap-3 w-full max-w-[600px] mx-auto">
              <div className="flex items-start gap-4 p-4 rounded-xl transition-all group cursor-default">
                <div className="size-10 shrink-0 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8l-7 7M12 8l7 7"></path></svg>
                </div>
                <div className="text-sm text-left text-muted-foreground pt-0.5">
                  <div className="font-bold text-foreground mb-1 flex items-center gap-2">
                    Bậc 1 <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium">Cơ bản</span>
                  </div>
                  <p>
                    Cần cải thiện để đạt được sự <span className="text-foreground font-medium">ổn định</span> và <span className="text-foreground font-medium">hiệu quả cao hơn</span>.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl group cursor-default">
                <div className="size-10 shrink-0 rounded-lg bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-500 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeDasharray={12} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}><path d="M12 5l-7 7M12 5l7 7" strokeDashoffset={0}></path><path strokeDashoffset={0} d="M12 11l-7 7M12 11l7 7"></path></g></svg>
                </div>
                <div className="text-sm text-left text-muted-foreground pt-0.5">
                  <div className="font-bold text-foreground mb-1 flex items-center gap-2">
                    Bậc 2 <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 font-medium">Trung bình</span>
                  </div>
                  <p>
                    Người chơi đạt mức trung bình khá so với mặt bằng chung của Stage này, thể hiện sự hiểu biết và khả năng <span className="text-foreground font-medium">thực hiện tốt</span> các yêu cầu cơ bản của cấp bậc.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl group cursor-default">
                <div className="size-10 shrink-0 rounded-lg bg-green-500/10 border border-green-500/25 flex items-center justify-center text-green-500 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeDasharray={12} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}><path d="M12 2l-7 7M12 2l7 7" strokeDashoffset={0}></path><path strokeDashoffset={0} d="M12 8l-7 7M12 8l7 7"></path><path strokeDashoffset={0} d="M12 14l-7 7M12 14l7 7"></path></g></svg>
                </div>
                <div className="text-sm text-left text-muted-foreground pt-0.5">
                  <div className="font-bold text-foreground mb-1 flex items-center gap-2">
                    Bậc 3 <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium">Vượt trội</span>
                  </div>
                  <p>
                    Người chơi <span className="text-foreground font-medium">vượt trội</span> so với phần lớn những người cùng Stage, có kỹ năng <span className="text-foreground font-medium">ổn định</span> và <span className="text-foreground font-medium">tiệm cận</span> với yêu cầu của Stage kế tiếp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DashedBox>
      </div>
      {/* <DashedBox noTopBorder padding="p-3">
        <h2 className="text-[1.15rem] font-bold text-title">Top Supporters</h2>
      </DashedBox>
      <DashedBox noTopBorder padding="p-0" className="relative">
        <div className="absolute left-1/2 top-0 h-full w-px border-dashed-v z-0 hidden md:block" />
        <div className="grid grid-cols-1 md:grid-cols-2 relative z-10">
          {[
            { name: "Supporter Alpha", amount: "$350.00", link: "github.com/alpha" },
            { name: "Beta Community", amount: "$150.00", link: "x.com/beta" },
          ].map((s, i) => (
            <div key={i} className="p-4 group">
              <div className="flex items-center gap-4 border border-border rounded-xl p-3 bg-background hover:border-vanixjnk transition-colors shadow-sm">
                <div className="size-16 rounded-lg bg-muted border border-border flex flex-col items-center justify-center p-1">
                  <div className="bg-background w-full h-full rounded flex items-center justify-center">
                    <MessageSquare size={20} className="text-muted-foreground" />
                  </div>
                  <span className="text-[10px] font-bold text-green-500 mt-1">{s.amount}</span>
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-title truncate">{s.name}</h3>
                  <a href="#" className="text-xs text-muted-foreground flex items-center gap-1 hover:text-vanixjnk mt-1">
                    <Github size={12} /> {s.link}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashedBox> */}
    </div>
  );
};
