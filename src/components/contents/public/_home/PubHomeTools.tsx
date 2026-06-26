"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export default function PubHomeTools() {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col items-center text-center gap-3 max-w-xl mx-auto">
        <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-2.5">
          <Icon icon="solar:widget-line-duotone" className="text-2xl" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-vanixjnk">Active Utilities</span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Bộ công cụ & Tiện ích trực tuyến
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            name: "Roblox Checker",
            desc: "Kiểm tra thông tin profile và place Roblox.",
            icon: "proicons:roblox",
            href: "/tools/check-roblox",
            gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
            border: "border-rose-500/20",
            iconColor: "text-rose-500 dark:text-rose-400",
            badgeBg: "bg-rose-500/10",
          },
          {
            name: "Trình tạo 2FA TOTP",
            desc: "Tạo mã xác thực 2 lớp TOTP ngoại tuyến an toàn.",
            icon: "solar:key-minimalistic-line-duotone",
            href: "/tools/2fa",
            gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
            border: "border-emerald-500/20",
            iconColor: "text-emerald-500 dark:text-emerald-400",
            badgeBg: "bg-emerald-500/10",
          },
          {
            name: "FB Cookie Validator",
            desc: "Kiểm tra trạng thái Cookie Facebook trực tuyến.",
            icon: "solar:shield-keyhole-line-duotone",
            href: "/tools/check-cookie-facebook",
            gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
            border: "border-blue-500/20",
            iconColor: "text-blue-500 dark:text-blue-400",
            badgeBg: "bg-blue-500/10",
          },
          {
            name: "FB Live UID Check",
            desc: "Kiểm tra trạng thái hoạt động UID người dùng.",
            icon: "solar:users-group-rounded-line-duotone",
            href: "/tools/check-live-uid",
            gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
            border: "border-cyan-500/20",
            iconColor: "text-cyan-500 dark:text-cyan-400",
            badgeBg: "bg-cyan-500/10",
          },
          {
            name: "Domain Analyzer",
            desc: "Phân tích thông tin WHOIS/DNS tên miền.",
            icon: "solar:globus-line-duotone",
            href: "/tools/check-domain",
            gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
            border: "border-amber-500/20",
            iconColor: "text-amber-500 dark:text-amber-400",
            badgeBg: "bg-amber-500/10",
          },
          {
            name: "Tạo mã QR Code",
            desc: "Tạo mã QR tùy biến nội dung nhanh chóng.",
            icon: "solar:qr-code-line-duotone",
            href: "/tools/qr-generator",
            gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
            border: "border-purple-500/20",
            iconColor: "text-purple-500 dark:text-purple-400",
            badgeBg: "bg-purple-500/10",
          },
          {
            name: "Discord Checker",
            desc: "Kiểm tra trạng thái hoạt động và cấu hình Token Discord.",
            icon: "ic:baseline-discord",
            href: "/tools/check-discord",
            gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
            border: "border-indigo-500/20",
            iconColor: "text-indigo-500 dark:text-indigo-400",
            badgeBg: "bg-indigo-500/10",
          },
        ].map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={cn(
              "flex flex-col justify-between p-4 rounded-xl border bg-gradient-to-br select-none min-h-[170px] transition-none",
              tool.gradient,
              tool.border
            )}
          >
            <div className="flex flex-col items-start text-left">
              <div className={cn(
                "size-10 rounded-lg flex items-center justify-center border border-border/10",
                tool.badgeBg,
                tool.iconColor
              )}>
                <Icon icon={tool.icon} className="text-xl" />
              </div>

              <h3 className="font-black text-xs text-foreground mt-3 tracking-tight uppercase">
                {tool.name}
              </h3>

              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-3 leading-relaxed opacity-75">
                {tool.desc}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/80 pt-2 border-t border-border/10 mt-3">
              <span>Mở công cụ</span>
              <Icon icon="solar:arrow-right-linear" className="text-[10px]" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
