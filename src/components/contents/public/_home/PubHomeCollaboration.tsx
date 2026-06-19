"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

export default function PubHomeCollaboration() {
  return (
    <section className="mt-4">
      <div className="relative p-8 sm:p-12 overflow-hidden flex flex-col items-center text-center gap-6">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground z-10">
          Bắt đầu một dự án mới cùng Vani Studio
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed z-10">
          Hãy liên hệ trực tiếp với chúng tôi để cùng lên ý tưởng, thiết kế và phát triển các sản phẩm phần mềm chất lượng cao.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 z-10">
          <Button
            asChild
            variant="vanixjnk"
            size="lg"
            className="font-bold text-xs"
          >
            <Link id="cta-contact-btn" href="/contact">
              <Icon icon="solar:unread-chat-line-duotone" className="text-lg mr-2" />
              Gửi yêu cầu hợp tác
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="font-bold text-xs"
          >
            <Link id="cta-services-btn" href="/services">
              <Icon icon="solar:window-frame-line-duotone" className="text-lg mr-2" />
              Xem dịch vụ
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
