"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

export default function Home() {
  return (
    <div className="w-full max-w-[1600px] mx-auto p-3 sm:p-5">
      <div className="flex flex-col gap-16 py-8 sm:py-12 md:py-16">
        {/* 1. Hero Section */}
        <section className="relative flex flex-col items-center text-center gap-6 max-w-4xl mx-auto px-4 select-none">
          {/* Decorative background glow */}
          <div className="absolute -top-12 -z-10 size-72 rounded-full bg-primary/10 blur-3xl opacity-70" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-primary bg-primary/10 border border-primary/20">
            <Icon icon="solar:sparkles-line-duotone" className="text-base animate-pulse" />
            <span>Vani Studio v2.0 - Beta</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
            Kiến tạo trải nghiệm số{" "}
            <span className="text-primary">
              Đột phá & Đỉnh cao
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Chúng tôi đồng hành cùng doanh nghiệp thiết kế Website chuyên nghiệp, lập trình ứng dụng di động (iOS & Android), xây dựng Chatbot AI thông minh và thiết kế UI/UX hiện đại.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-4 w-full sm:w-auto">
            <Link
              id="hero-btn-quote"
              href="/contact"
              className="flex items-center justify-center gap-2 h-11 px-6 w-full sm:w-auto rounded-xl border border-primary/25 bg-primary/15 text-primary font-bold text-sm hover:bg-primary/25 transition-all"
            >
              <Icon icon="solar:chat-round-money-line-duotone" className="text-lg" />
              Nhận báo giá ngay
            </Link>
            <Link
              id="hero-btn-portfolio"
              href="/projects"
              className="flex items-center justify-center gap-2 h-11 px-6 w-full sm:w-auto rounded-xl border border-border bg-background text-foreground font-bold text-sm hover:bg-muted transition-all"
            >
              <Icon icon="solar:gallery-line-duotone" className="text-lg text-muted-foreground" />
              Xem các dự án
            </Link>
          </div>
        </section>

        {/* 2. Dịch vụ tiêu biểu */}
        <section className="flex flex-col gap-10">
          <div className="text-center flex flex-col gap-3 max-w-2xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Dịch vụ công nghệ cốt lõi
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Cung cấp giải pháp toàn diện từ tư vấn, thiết kế đến lập trình sản phẩm hoàn thiện.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            {/* Card 1 */}
            <div className="group flex flex-col gap-4 p-5 rounded-2xl border border-border/80 bg-background/50 hover:bg-background hover:shadow-md transition-all duration-300">
              <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Icon icon="solar:monitor-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground mb-1.5">Thiết kế Website</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Website giới thiệu, Landing Page và hệ thống TMĐT chuẩn SEO, tải nhanh và tương thích mọi thiết bị.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group flex flex-col gap-4 p-5 rounded-2xl border border-border/80 bg-background/50 hover:bg-background hover:shadow-md transition-all duration-300">
              <div className="size-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform">
                <Icon icon="solar:smartphone-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground mb-1.5">Ứng dụng di động</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Phát triển ứng dụng iOS & Android bản địa (Native) hoặc Cross-platform mượt mà, tối ưu trải nghiệm.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group flex flex-col gap-4 p-5 rounded-2xl border border-border/80 bg-background/50 hover:bg-background hover:shadow-md transition-all duration-300">
              <div className="size-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                <Icon icon="solar:magic-stick-3-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground mb-1.5">Chatbot AI thông minh</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Tích hợp AI trợ lý ảo tự động tư vấn, CSKH và chốt đơn 24/7 trên đa kênh Messenger, Zalo, Website.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group flex flex-col gap-4 p-5 rounded-2xl border border-border/80 bg-background/50 hover:bg-background hover:shadow-md transition-all duration-300">
              <div className="size-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <Icon icon="solar:palette-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground mb-1.5">Thiết kế UI/UX</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Nghiên cứu hành vi người dùng, vẽ wireframe và thiết kế giao diện ứng dụng thẩm mỹ, dễ thao tác.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Thế mạnh cốt lõi */}
        <section className="flex flex-col lg:flex-row items-center gap-12 px-4 mt-6">
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Tại sao chọn Vani Studio?</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Giải pháp tối ưu, cam kết chất lượng sản phẩm
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Chúng tôi không chỉ viết code, chúng tôi cùng bạn phân tích bài toán kinh doanh để thiết lập nên những sản phẩm số hiệu quả nhất, tối ưu chi phí vận hành và tăng doanh thu.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center text-green-500 shrink-0 mt-0.5">
                  <Icon icon="solar:check-circle-line-duotone" className="text-sm" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Giao diện độc bản</h4>
                  <p className="text-xs text-muted-foreground">Không sử dụng mẫu đại trà, thiết kế riêng biệt.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center text-green-500 shrink-0 mt-0.5">
                  <Icon icon="solar:check-circle-line-duotone" className="text-sm" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Hiệu năng tối đa</h4>
                  <p className="text-xs text-muted-foreground">Tối ưu mã nguồn, tốc độ tải trang dưới 1 giây.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center text-green-500 shrink-0 mt-0.5">
                  <Icon icon="solar:check-circle-line-duotone" className="text-sm" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Bảo mật cao</h4>
                  <p className="text-xs text-muted-foreground">Áp dụng các tiêu chuẩn mã hóa dữ liệu hàng đầu.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center text-green-500 shrink-0 mt-0.5">
                  <Icon icon="solar:check-circle-line-duotone" className="text-sm" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Hỗ trợ 24/7</h4>
                  <p className="text-xs text-muted-foreground">Bảo hành bảo trì trọn đời, đồng hành dài lâu.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative aspect-video lg:aspect-square max-w-lg mx-auto rounded-3xl overflow-hidden border border-border/80 bg-muted/30 flex items-center justify-center select-none shadow-sm">
            <div className="absolute inset-0 bg-primary/5" />
            <div className="flex flex-col items-center gap-3 z-10 text-center px-6">
              <div className="size-16 rounded-2xl bg-background border border-border flex items-center justify-center shadow-md">
                <Icon icon="solar:code-file-line-duotone" className="text-3xl text-primary" />
              </div>
              <span className="font-bold text-base text-foreground">Sản phẩm hoàn thiện, chuẩn chỉnh</span>
              <span className="text-xs text-muted-foreground max-w-xs">
                Mọi sản phẩm bàn giao đều đi kèm tài liệu hướng dẫn và mã nguồn sạch, dễ nâng cấp.
              </span>
            </div>
          </div>
        </section>

        {/* 4. Call to Action Banner */}
        <section className="px-4 mt-6">
          <div className="relative rounded-3xl border border-primary/25 bg-primary/10 p-8 sm:p-12 overflow-hidden flex flex-col items-center text-center gap-6">

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground z-10">
              Sẵn sàng nâng tầm doanh nghiệp của bạn?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed z-10">
              Hãy liên hệ ngay với chúng tôi để nhận tư vấn giải pháp và báo giá chi tiết phù hợp nhất cho dự án của bạn.
            </p>
            <Link
              id="cta-contact-btn"
              href="/contact"
              className="flex items-center gap-2 h-11 px-8 rounded-xl border border-primary/25 bg-primary/15 text-primary font-bold text-sm hover:bg-primary/25 transition-all z-10"
            >
              <Icon icon="solar:unread-chat-line-duotone" className="text-lg animate-bounce" />
              Gửi yêu cầu ngay
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

