"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useSetting } from "@/contexts/SettingContext";

export default function AppFooter() {
  const setting = useSetting();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/60 bg-background/95 mt-auto">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Cột 1: Giới thiệu */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              {setting?.siteLogo ? (
                <img src={setting.siteLogo} alt="Logo" className="h-9 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/25">
                    <Icon icon="solar:star-fall-minimalistic-line-duotone" className="text-primary text-lg" />
                  </div>
                  <span className="font-bold text-base tracking-tight text-foreground">
                    {setting?.siteName || "Vani Studio"}
                  </span>
                </div>
              )}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Đơn vị hàng đầu chuyên thiết kế website chuyên nghiệp, lập trình ứng dụng di động, xây dựng chatbot AI thông minh và thiết kế UI/UX hiện đại.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="#"
                className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                title="Facebook"
              >
                <Icon icon="solar:globus-line-duotone" className="text-lg" />
              </a>
              <a
                href="#"
                className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                title="GitHub"
              >
                <Icon icon="solar:code-line-duotone" className="text-lg" />
              </a>
              <a
                href="#"
                className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                title="Liên hệ Zalo"
              >
                <Icon icon="solar:chat-round-line-duotone" className="text-lg" />
              </a>
            </div>
          </div>

          {/* Cột 2: Điều hướng nhanh */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
                Dịch vụ chính
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/services/website" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Thiết kế Website
                  </Link>
                </li>
                <li>
                  <Link href="/services/mobile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Ứng dụng di động
                  </Link>
                </li>
                <li>
                  <Link href="/services/chatbot" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Chatbot AI
                  </Link>
                </li>
                <li>
                  <Link href="/services/ui-ux" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Thiết kế UI/UX
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
                Khám phá
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Dự án tiêu biểu
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Sản phẩm số
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Tin tức công nghệ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Liên hệ & Báo giá
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Cột 3: Thông tin liên hệ */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Thông tin liên hệ
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Icon icon="solar:letter-line-duotone" className="text-lg shrink-0 text-primary mt-0.5" />
                <span>contact@vanistudio.com</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Icon icon="solar:phone-line-duotone" className="text-lg shrink-0 text-primary mt-0.5" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Icon icon="solar:map-point-line-duotone" className="text-lg shrink-0 text-primary mt-0.5" />
                <span>Khu đô thị Đại học Quốc gia, Thủ Đức, TP. Hồ Chí Minh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {currentYear}{" "}
            <a
              href="https://vanistudio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-vanixjnk hover:opacity-80 transition-opacity"
            >
              Vani Studio
            </a>
            . All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Điều khoản dịch vụ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
