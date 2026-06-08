"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useSetting } from "@/contexts/SettingContext";

export default function AppFooter() {
  const setting = useSetting();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-background mt-auto overflow-hidden border-t border-dashed border-primary/20">
      <div className="w-full">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4">
            
            <div className="relative p-6 md:p-8 md:pr-10 flex flex-col gap-5 md:border-r border-dashed border-primary/20">
              <Link href="/" className="flex items-center gap-2 group self-start">
                <img
                  src={setting?.siteLogo || "/vani-1.png"}
                  alt="Logo"
                  className="h-9 w-auto object-contain rounded-lg"
                />
              </Link>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Kiến tạo giải pháp công nghệ vượt trội: thiết kế Website chuyên nghiệp, phát triển ứng dụng di động, giải pháp Chatbot AI và giao diện UI/UX tối ưu trải nghiệm.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <a
                  href="#"
                  className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 border border-dashed border-primary/20"
                  title="Facebook"
                >
                  <Icon icon="solar:globus-line-duotone" className="text-lg" />
                </a>
                <a
                  href="#"
                  className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 border border-dashed border-primary/20"
                  title="GitHub"
                >
                  <Icon icon="solar:code-line-duotone" className="text-lg" />
                </a>
                <a
                  href="#"
                  className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 border border-dashed border-primary/20"
                  title="Zalo"
                >
                  <Icon icon="solar:chat-round-line-duotone" className="text-lg" />
                </a>
              </div>
            </div>

            <div className="relative p-6 md:p-8 flex flex-col md:border-r border-dashed border-primary/20">
              <h4 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase mb-5 select-none">
                Dịch vụ chính
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/services/website" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Thiết kế Website
                  </Link>
                </li>
                <li>
                  <Link href="/services/mobile" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Ứng dụng di động
                  </Link>
                </li>
                <li>
                  <Link href="/services/chatbot" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Trợ lý ảo AI Chatbot
                  </Link>
                </li>
                <li>
                  <Link href="/services/ui-ux" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Thiết kế UI/UX
                  </Link>
                </li>
              </ul>
            </div>

            <div className="relative p-6 md:p-8 flex flex-col md:border-r border-dashed border-primary/20">
              <h4 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase mb-5 select-none">
                Khám phá
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/projects" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Dự án đã thực hiện
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Sản phẩm phần mềm
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Blog & Tin công nghệ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Liên hệ báo giá
                  </Link>
                </li>
              </ul>
            </div>

            <div className="relative p-6 md:p-8 flex flex-col gap-4">
              <h4 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase mb-1 select-none">
                Kết nối với chúng tôi
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-[13px] text-muted-foreground">
                  <div className="size-6 rounded-md flex items-center justify-center text-primary bg-primary/10 border border-primary/20 shrink-0 mt-0.5">
                    <Icon icon="solar:letter-line-duotone" className="text-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono tracking-wider text-muted-foreground/50 uppercase select-none">Email</span>
                    <span className="hover:text-primary transition-colors cursor-pointer text-foreground font-medium">contact@vanistudio.com</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-[13px] text-muted-foreground">
                  <div className="size-6 rounded-md flex items-center justify-center text-primary bg-primary/10 border border-primary/20 shrink-0 mt-0.5">
                    <Icon icon="solar:phone-line-duotone" className="text-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono tracking-wider text-muted-foreground/50 uppercase select-none">Hotline</span>
                    <span className="hover:text-primary transition-colors cursor-pointer text-foreground font-medium">+84 123 456 789</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-[13px] text-muted-foreground">
                  <div className="size-6 rounded-md flex items-center justify-center text-primary bg-primary/10 border border-primary/20 shrink-0 mt-0.5">
                    <Icon icon="solar:map-point-line-duotone" className="text-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono tracking-wider text-muted-foreground/50 uppercase select-none">Địa chỉ</span>
                    <span className="text-foreground leading-relaxed font-medium">Thủ Đức, TP. Hồ Chí Minh</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
      <div 
        className="relative w-full border-t border-b border-dashed border-primary/20 overflow-hidden text-primary/20" 
        style={{ height: "36px" }}
      >
        <div 
          className="absolute inset-y-0 left-[-100vw] w-[300vw]" 
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)"
          }}
        />
      </div>
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-muted-foreground font-mono select-none">
            © {currentYear} VANI STUDIO. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-5 font-mono text-[10px] tracking-wider text-muted-foreground/60">
            <Link href="/privacy" className="hover:text-primary transition-colors duration-200">
              PRIVACY POLICY
            </Link>
            <span className="text-border/40 select-none">/</span>
            <Link href="/terms" className="hover:text-primary transition-colors duration-200">
              TERMS OF SERVICE
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
