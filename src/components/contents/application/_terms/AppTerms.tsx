import AppDashed from '@/components/layouts/application/AppDashed';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      <h2 className="text-sm font-bold text-title">
        <span className="relative px-1.5 py-1 font-medium tracking-widest text-primary">
          <span className="absolute inset-0 border border-dashed border-primary bg-primary/10" />
          {children}
          {[
            "top-[-2px] left-[-2px]",
            "top-[-2px] right-[-2px]",
            "bottom-[-2px] left-[-2px]",
            "bottom-[-2px] right-[-2px]",
          ].map((pos, i) => (
            <svg key={i} className={`absolute ${pos} fill-primary`} height="5" viewBox="0 0 5 5" width="5">
              <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
            </svg>
          ))}
        </span>
      </h2>
    </div>
  );
}

export default function AppTerms() {
  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-3">
        <SectionTitle>Điều khoản Dịch vụ</SectionTitle>
      </AppDashed>

      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2 justify-center">
          <article className="prose dark:prose-invert prose-sm text-center max-w-[560px] text-muted-foreground">
            <p>
              Khi sử dụng các sản phẩm và dịch vụ của <span className="text-foreground font-medium">Vani Studio</span>, bạn đồng ý tuân thủ các điều khoản dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
            </p>
          </article>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-4">
        <article className="prose dark:prose-invert prose-sm max-w-none text-muted-foreground">
          <h3 className="text-title text-base font-bold">1. Định nghĩa</h3>
          <ul>
            <li><span className="text-foreground font-medium">"Vani Studio"</span> (hoặc "chúng tôi") — đơn vị cung cấp dịch vụ thiết kế, phát triển phần mềm và các sản phẩm công nghệ.</li>
            <li><span className="text-foreground font-medium">"Khách hàng"</span> (hoặc "bạn") — cá nhân hoặc tổ chức sử dụng dịch vụ, sản phẩm của Vani Studio.</li>
            <li><span className="text-foreground font-medium">"Dịch vụ"</span> — toàn bộ sản phẩm phần mềm, công cụ, website, ứng dụng, bot, API và các dịch vụ kỹ thuật khác do Vani Studio cung cấp.</li>
          </ul>

          <h3 className="text-title text-base font-bold">2. Điều kiện sử dụng</h3>
          <p>Khi sử dụng Dịch vụ, bạn cam kết rằng:</p>
          <ul>
            <li>Bạn đã đủ 16 tuổi trở lên hoặc có sự đồng ý từ người giám hộ hợp pháp;</li>
            <li>Thông tin cá nhân bạn cung cấp là chính xác, đầy đủ và được cập nhật;</li>
            <li>Bạn không sử dụng Dịch vụ cho bất kỳ mục đích bất hợp pháp hoặc vi phạm pháp luật Việt Nam;</li>
            <li>Bạn không can thiệp, phá hoại hoặc gây ảnh hưởng đến hoạt động bình thường của hệ thống.</li>
          </ul>

          <h3 className="text-title text-base font-bold">3. Quyền sở hữu trí tuệ</h3>
          <p>
            Toàn bộ nội dung, thiết kế, mã nguồn, thương hiệu và tài liệu liên quan đến Dịch vụ thuộc quyền sở hữu trí tuệ của <span className="text-foreground font-medium">Vani Studio</span>, trừ khi có thỏa thuận khác bằng văn bản.
          </p>
          <ul>
            <li>Đối với các sản phẩm phát triển theo hợp đồng: quyền sở hữu mã nguồn sẽ được chuyển giao cho khách hàng sau khi thanh toán đầy đủ, trừ các thành phần framework và thư viện lõi của Vani Studio;</li>
            <li>Đối với các sản phẩm cấp phép (license): khách hàng được cấp quyền sử dụng theo license key, không được sao chép, phân phối lại hoặc chỉnh sửa mã nguồn khi chưa có sự đồng ý.</li>
          </ul>

          <h3 className="text-title text-base font-bold">4. License Key và Tài khoản</h3>
          <ul>
            <li>Mỗi license key chỉ được sử dụng theo số lượng kích hoạt đã quy định;</li>
            <li>Nghiêm cấm chia sẻ, bán lại hoặc chuyển nhượng license key cho bên thứ ba;</li>
            <li>Vani Studio có quyền thu hồi license key nếu phát hiện hành vi vi phạm điều khoản;</li>
            <li>Khách hàng chịu trách nhiệm bảo mật thông tin tài khoản và license key của mình.</li>
          </ul>

          <h3 className="text-title text-base font-bold">5. Giới hạn trách nhiệm</h3>
          <p>
            Vani Studio nỗ lực đảm bảo Dịch vụ hoạt động ổn định và liên tục. Tuy nhiên, chúng tôi không chịu trách nhiệm trong các trường hợp:
          </p>
          <ul>
            <li>Gián đoạn dịch vụ do sự cố ngoài tầm kiểm soát (thiên tai, tấn công mạng, lỗi hạ tầng bên thứ ba);</li>
            <li>Thiệt hại phát sinh từ việc khách hàng sử dụng Dịch vụ sai mục đích hoặc vi phạm điều khoản;</li>
            <li>Mất dữ liệu do khách hàng không thực hiện sao lưu theo khuyến nghị.</li>
          </ul>

          <h3 className="text-title text-base font-bold">6. Chấm dứt Dịch vụ</h3>
          <p>Vani Studio có quyền tạm ngừng hoặc chấm dứt cung cấp Dịch vụ cho khách hàng nếu:</p>
          <ul>
            <li>Khách hàng vi phạm bất kỳ điều khoản nào trong văn bản này;</li>
            <li>Khách hàng sử dụng Dịch vụ cho mục đích bất hợp pháp;</li>
            <li>Khách hàng gây ảnh hưởng tiêu cực đến hệ thống hoặc người dùng khác.</li>
          </ul>

          <h3 className="text-title text-base font-bold">7. Thay đổi Điều khoản</h3>
          <p>
            Vani Studio có quyền cập nhật Điều khoản Dịch vụ bất kỳ lúc nào. Các thay đổi quan trọng sẽ được thông báo qua website hoặc email. Việc tiếp tục sử dụng Dịch vụ sau khi điều khoản được cập nhật đồng nghĩa với việc bạn chấp nhận những thay đổi đó.
          </p>

          <h3 className="text-title text-base font-bold">8. Liên hệ</h3>
          <p>Mọi câu hỏi về Điều khoản Dịch vụ, vui lòng liên hệ:</p>
          <ul>
            <li><span className="text-foreground font-medium">Email:</span>{" "}
              <a href="mailto:vanixjnk@gmail.com" className="text-primary hover:underline">vanixjnk@gmail.com</a>
            </li>
            <li><span className="text-foreground font-medium">Zalo:</span>{" "}
              <a href="https://discord.gg/tsbvh" target="_blank" rel="noreferrer" className="text-primary hover:underline">discord.gg/tsbvh</a>
            </li>
          </ul>
        </article>
      </AppDashed>

      <AppDashed noTopBorder withDotGrid padding="p-6">
        <div className="flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center max-w-[480px]">
            Bằng việc sử dụng Dịch vụ của Vani Studio, bạn xác nhận đã đọc, hiểu rõ và đồng ý tuân thủ toàn bộ các Điều khoản Dịch vụ nêu trên.
          </p>
        </div>
      </AppDashed>
    </div>
  );
}
