"use client";

import { Icon } from "@iconify/react";

const features = [
  {
    title: "Hiệu suất cao",
    desc: "Sản phẩm được tối ưu hóa để đảm bảo tốc độ xử lý nhanh nhất, mang lại trải nghiệm mượt mà cho người dùng.",
    icon: "solar:bolt-line-duotone",
    color: "text-blue-500",
  },
  {
    title: "An toàn & Bảo mật",
    desc: "Dữ liệu người dùng luôn được mã hóa và bảo vệ nghiêm ngặt, tuân thủ các tiêu chuẩn bảo mật hiện đại.",
    icon: "solar:shield-keyhole-line-duotone",
    color: "text-emerald-500",
  },
  {
    title: "Mã nguồn sạch",
    desc: "Codebase được thiết kế theo kiến trúc chuẩn, dễ bảo trì, mở rộng và tích hợp với các hệ thống khác.",
    icon: "solar:code-line-duotone",
    color: "text-purple-500",
  },
  {
    title: "Cộng đồng lớn mạnh",
    desc: "Cộng đồng hàng nghìn người dùng luôn sẵn sàng hỗ trợ, chia sẻ kinh nghiệm và đóng góp ý tưởng.",
    icon: "solar:users-group-two-rounded-line-duotone",
    color: "text-amber-500",
  },
  {
    title: "Tự động hóa",
    desc: "Tích hợp quy trình tự động giúp tiết kiệm thời gian, giảm thiểu thao tác thủ công và tăng năng suất.",
    icon: "solar:settings-minimalistic-line-duotone",
    color: "text-rose-500",
  },
  {
    title: "Hỗ trợ nhanh chóng",
    desc: "Đội ngũ phát triển luôn lắng nghe phản hồi và sẵn sàng hỗ trợ xử lý mọi vấn đề trong thời gian ngắn nhất.",
    icon: "solar:chat-round-call-line-duotone",
    color: "text-cyan-500",
  },
];

export default function PubHomeFeatures() {
  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col items-center text-center gap-3 max-w-xl mx-auto select-none">
        <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-2.5 shadow-md shadow-vanixjnk/5">
          <Icon icon="solar:stars-line-duotone" className="text-2xl" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-vanixjnk">Core Values</span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Phẩm chất & Giá trị cốt lõi
          </h2>
          <div className="h-0.5 w-10 bg-linear-to-r from-transparent via-vanixjnk/50 to-transparent mt-1" />
        </div>
      </div>
      <div className="relative z-10 h-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 relative z-10">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 flex flex-col items-center text-center gap-2.5"
            >
              <Icon icon={feat.icon} className={`text-5xl ${feat.color}`} />
              <div className="text-sm font-bold text-foreground">{feat.title}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
