"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

export default function PubHomeHero() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-l border-r border-dashed border-primary/20 pt-16 pb-8 px-6">
        <section className="flex flex-col items-center text-center gap-4 max-w-xl mx-auto select-none">
          <h1 className="flex justify-center mb-2">
            <img
              src="/vani-1.png"
              alt="Vani Studio"
              className="h-20 sm:h-32 rounded-xl w-auto object-contain select-none pointer-events-none"
            />
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            <strong className="font-semibold text-foreground">Vani Studio</strong> là một <strong className="font-semibold text-foreground">nhóm phát triển độc lập</strong> chuyên xây dựng các <strong className="font-semibold text-foreground">công cụ, ứng dụng và giải pháp phần mềm</strong> phục vụ <strong className="font-semibold text-foreground">cộng đồng game thủ Việt Nam</strong>. Chúng tôi tập trung vào <strong className="font-semibold text-foreground">chất lượng, trải nghiệm người dùng và sự sáng tạo</strong> trong từng sản phẩm.
          </p>

          <div className="flex items-center gap-3 mt-2 w-full sm:w-auto justify-center">
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
        </section>
      </div>
    </div>
  );
}
