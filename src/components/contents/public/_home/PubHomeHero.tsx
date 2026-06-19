"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

export default function PubHomeHero() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative border-l border-r border-dashed border-primary/20 pt-16 pb-8 px-6">
        <section className="flex flex-col items-center text-center gap-5 max-w-xl mx-auto select-none">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 border border-border/60 text-[10px] font-mono text-muted-foreground select-none">
            <span className="text-vanixjnk font-bold">❯</span>
            <span>npx vanistudio init --gamer-first</span>
            <span className="w-1 h-3 bg-vanixjnk/70 animate-pulse" />
          </div>
          <h1 className="flex justify-center mt-1 mb-1">
            <img
              src="/vani-1.png"
              alt="Vani Studio"
              className="h-20 sm:h-32 rounded-xl w-auto object-contain select-none pointer-events-none"
            />
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            <strong className="font-semibold text-foreground">Vani Studio</strong> là một <strong className="font-semibold text-foreground">nhóm phát triển độc lập</strong> chuyên xây dựng các <strong className="font-semibold text-foreground">công cụ, ứng dụng và giải pháp phần mềm</strong> phục vụ <strong className="font-semibold text-foreground">cộng đồng game thủ Việt Nam</strong>. Chúng tôi tập trung vào <strong className="font-semibold text-foreground">chất lượng, trải nghiệm người dùng và sự sáng tạo</strong> trong từng sản phẩm.
          </p>

          <div className="flex items-center gap-3 mt-1 w-full sm:w-auto justify-center">
            <Button
              asChild
              variant="vanixjnk"
              size="sm"
              className="font-bold text-xs"
            >
              <Link id="hero-btn-quote" href="/contact">
                <Icon icon="solar:chat-round-money-line-duotone" className="text-base mr-1.5" />
                Bắt đầu dự án
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="font-bold text-xs"
            >
              <Link id="hero-btn-portfolio" href="/projects">
                <Icon icon="solar:gallery-line-duotone" className="text-base text-muted-foreground mr-1.5" />
                Dự án đã làm
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-[10px] font-mono text-muted-foreground/80 border-t border-dashed border-border/40 pt-5 w-full max-w-md">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>CORE: ACTIVE</span>
            </div>
            <div className="h-3 w-px bg-border/40" />
            <div className="flex items-center gap-1.5">
              <Icon icon="solar:globus-line-duotone" className="text-xs text-vanixjnk" />
              <span>PING: 18ms</span>
            </div>
            <div className="h-3 w-px bg-border/40" />
            <div className="flex items-center gap-1.5">
              <Icon icon="solar:shield-check-line-duotone" className="text-xs text-emerald-500" />
              <span>SECURED</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
