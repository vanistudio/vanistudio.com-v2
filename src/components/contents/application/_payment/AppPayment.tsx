import AppDashed from '@/components/layouts/application/AppDashed';
import { usePageTitle } from '@/hooks/use-page-title';

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

export default function AppPayment() {
  usePageTitle("Chính sách Thanh toán");
  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-3">
        <SectionTitle>Chính sách Thanh toán</SectionTitle>
      </AppDashed>

      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2 justify-center">
          <article className="prose dark:prose-invert prose-sm text-center max-w-[560px] text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">Vani Studio</span> cung cấp các hình thức thanh toán linh hoạt, đảm bảo quy trình giao dịch minh bạch, nhanh chóng và an toàn cho khách hàng.
            </p>
          </article>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-4">
        <article className="prose dark:prose-invert prose-sm max-w-none text-muted-foreground">
          <h3 className="text-title text-base font-bold">1. Quy định thanh toán</h3>

          <p>
            <span className="text-foreground font-medium">1.1.</span> Đối với các Dịch vụ được đặt hàng trực tuyến thông qua Website, khách hàng cần thanh toán <span className="text-foreground font-medium">100% giá trị đơn hàng</span> khi đặt hàng. Sau khi đặt hàng thành công, Vani Studio sẽ liên hệ xác nhận và tiến hành xử lý đơn hàng.
          </p>

          <p>
            <span className="text-foreground font-medium">1.2.</span> Đối với các Dịch vụ có nhãn <span className="text-foreground font-medium">"Premium"</span>, sau khi khách hàng đăng ký tư vấn, Vani Studio sẽ liên hệ và thống nhất hợp đồng cung cấp Dịch vụ. Quy trình thanh toán như sau:
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th className="text-title">Giai đoạn</th>
                  <th className="text-title">Tỷ lệ</th>
                  <th className="text-title">Thời điểm</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-foreground font-medium">Đặt cọc</td>
                  <td>50% giá trị hợp đồng</td>
                  <td>Sau khi ký kết hợp đồng</td>
                </tr>
                <tr>
                  <td className="text-foreground font-medium">Thanh toán còn lại</td>
                  <td>50% giá trị hợp đồng</td>
                  <td>Sau khi hoàn thành và bàn giao dự án</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <span className="text-foreground font-medium">1.3.</span> Đối với các Dịch vụ bổ sung nằm ngoài hợp đồng, Vani Studio sẽ trao đổi và thống nhất chi phí với khách hàng. Thanh toán được thực hiện <span className="text-foreground font-medium">01 lần duy nhất</span> sau khi dịch vụ bổ sung đã hoàn thành.
          </p>

          <h3 className="text-title text-base font-bold">2. Hình thức thanh toán</h3>
          <p>Khách hàng có thể thanh toán đơn hàng hoặc hợp đồng cung cấp Dịch vụ qua các hình thức sau:</p>

          <h4 className="text-title text-sm font-bold">2.1. Chuyển khoản ngân hàng</h4>
          <div className="rounded-lg border border-border bg-muted/30 p-4 not-prose">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[120px]">Ngân hàng:</span>
                <span className="text-foreground font-medium">Vietcombank (Ngân hàng TMCP Ngoại thương Việt Nam)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[120px]">Chủ tài khoản:</span>
                <span className="text-foreground font-medium">VANI STUDIO</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[120px]">Số tài khoản:</span>
                <span className="text-foreground font-medium font-mono tracking-wider">109 530 9999</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[120px]">Nội dung CK:</span>
                <span className="text-foreground font-medium">Mã đơn hàng / Mã hợp đồng</span>
              </div>
            </div>
          </div>

          <h4 className="text-title text-sm font-bold mt-4">2.2. Cổng thanh toán VNPAY</h4>
          <p>
            Khách hàng có thể thanh toán trực tuyến thông qua cổng thanh toán <span className="text-foreground font-medium">VNPAY</span> — hỗ trợ quét QR, ví điện tử, thẻ ATM nội địa và thẻ quốc tế (Visa, MasterCard, JCB).
          </p>

          <h3 className="text-title text-base font-bold">3. Xác nhận thanh toán</h3>
          <p>
            Sau khi nhận được thanh toán, Vani Studio sẽ gửi xác nhận qua email trong vòng <span className="text-foreground font-medium">24 giờ làm việc</span>. Nếu sau 48 giờ khách hàng chưa nhận được xác nhận, vui lòng liên hệ với chúng tôi.
          </p>

          <h3 className="text-title text-base font-bold">4. Liên hệ hỗ trợ</h3>
          <p>Mọi thắc mắc về thanh toán, vui lòng liên hệ:</p>
          <ul>
            <li><span className="text-foreground font-medium">Email:</span>{" "}
              <a href="mailto:vanixjnk@gmail.com" className="text-primary hover:underline">vanixjnk@gmail.com</a>
            </li>
            <li><span className="text-foreground font-medium">Zalo:</span>{" "}
              <a href="https://zalo.me/0935974907" target="_blank" rel="noreferrer" className="text-primary hover:underline">zalo.me/0935974907</a>
            </li>
          </ul>
        </article>
      </AppDashed>

      <AppDashed noTopBorder withDotGrid padding="p-6">
        <div className="flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center max-w-[480px]">
            Vani Studio cam kết đảm bảo mọi giao dịch thanh toán được xử lý minh bạch, an toàn và nhanh chóng. Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi.
          </p>
        </div>
      </AppDashed>
    </div>
  );
}
