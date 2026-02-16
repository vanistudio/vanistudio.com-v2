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

export default function AppRefund() {
  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-3">
        <SectionTitle>Chính sách Hoàn tiền</SectionTitle>
      </AppDashed>

      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2 justify-center">
          <article className="prose dark:prose-invert prose-sm text-center max-w-[560px] text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">Vani Studio</span> cam kết cung cấp dịch vụ thiết kế và phát triển phần mềm chất lượng cao. Chính sách hoàn tiền dưới đây được thiết kế nhằm bảo vệ quyền lợi của cả hai bên và đảm bảo tính minh bạch trong mọi giao dịch.
            </p>
          </article>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-4">
        <article className="prose dark:prose-invert prose-sm max-w-none text-muted-foreground">
          <h3 className="text-title text-base font-bold">1. Điều kiện hoàn tiền</h3>
          <p>Vani Studio sẽ xem xét hoàn tiền trong các trường hợp sau:</p>
          <ul>
            <li>
              <span className="text-foreground font-medium">Không hoàn thành dự án:</span> Nếu Vani Studio không thể hoàn thành dự án theo thỏa thuận ban đầu trong hợp đồng, khách hàng có quyền yêu cầu hoàn tiền toàn bộ hoặc một phần tương ứng với khối lượng công việc chưa thực hiện.
            </li>
            <li>
              <span className="text-foreground font-medium">Chất lượng không đạt yêu cầu:</span> Nếu sản phẩm cuối cùng không đạt tiêu chuẩn chất lượng như đã cam kết và Vani Studio không thể khắc phục sau khi đã được trao cơ hội sửa chữa hợp lý, khách hàng có thể yêu cầu hoàn tiền.
            </li>
            <li>
              <span className="text-foreground font-medium">Không hài lòng với sản phẩm:</span> Trong vòng <span className="text-foreground font-medium">14 ngày</span> kể từ khi nhận bàn giao sản phẩm, nếu khách hàng không hài lòng và gửi yêu cầu hoàn tiền, Vani Studio sẽ xem xét và xử lý theo từng trường hợp cụ thể.
            </li>
          </ul>

          <h3 className="text-title text-base font-bold">2. Quy trình hoàn tiền</h3>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th className="text-title">Bước</th>
                  <th className="text-title">Nội dung</th>
                  <th className="text-title">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-foreground font-medium">1. Gửi yêu cầu</td>
                  <td>Khách hàng gửi yêu cầu hoàn tiền bằng văn bản đến email <a href="mailto:vanixjnk@gmail.com" className="text-primary hover:underline">vanixjnk@gmail.com</a>, nêu rõ lý do và cung cấp bằng chứng liên quan (nếu có).</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td className="text-foreground font-medium">2. Xác nhận</td>
                  <td>Vani Studio xác nhận đã nhận yêu cầu và bắt đầu xem xét.</td>
                  <td>3 ngày làm việc</td>
                </tr>
                <tr>
                  <td className="text-foreground font-medium">3. Xử lý</td>
                  <td>Xem xét, đánh giá yêu cầu và thông báo kết quả qua email hoặc phương tiện liên lạc đã thỏa thuận.</td>
                  <td>14 ngày làm việc</td>
                </tr>
                <tr>
                  <td className="text-foreground font-medium">4. Hoàn tiền</td>
                  <td>Nếu được chấp thuận, số tiền sẽ được hoàn trả vào tài khoản ngân hàng do khách hàng cung cấp.</td>
                  <td>7–14 ngày làm việc</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-title text-base font-bold">3. Trường hợp không hoàn tiền</h3>
          <p>Vani Studio <span className="text-foreground font-medium">không chấp nhận</span> yêu cầu hoàn tiền trong các trường hợp sau:</p>
          <ul>
            <li>
              <span className="text-foreground font-medium">Thay đổi yêu cầu ban đầu:</span> Nếu khách hàng thay đổi yêu cầu hoặc mục tiêu dự án sau khi dự án đã bắt đầu triển khai, Vani Studio không chịu trách nhiệm hoàn tiền cho các phần việc đã hoàn thành theo yêu cầu ban đầu.
            </li>
            <li>
              <span className="text-foreground font-medium">Sử dụng sai mục đích:</span> Nếu sản phẩm bị hỏng hoặc không hoạt động đúng do khách hàng sử dụng sai mục đích, không tuân theo hướng dẫn hoặc tự ý chỉnh sửa, Vani Studio không chịu trách nhiệm hoàn tiền.
            </li>
            <li>
              <span className="text-foreground font-medium">Quá thời hạn yêu cầu:</span> Yêu cầu hoàn tiền gửi sau 14 ngày kể từ ngày bàn giao sản phẩm sẽ không được xem xét, trừ trường hợp đặc biệt do Vani Studio quyết định.
            </li>
          </ul>

          <h3 className="text-title text-base font-bold">4. Liên hệ hỗ trợ</h3>
          <p>Mọi yêu cầu hoàn tiền hoặc thắc mắc về chính sách, vui lòng liên hệ:</p>
          <ul>
            <li><span className="text-foreground font-medium">Email:</span>{" "}
              <a href="mailto:vanixjnk@gmail.com" className="text-primary hover:underline">vanixjnk@gmail.com</a>
            </li>
            <li><span className="text-foreground font-medium">Discord:</span>{" "}
              <a href="https://discord.gg/tsbvh" target="_blank" rel="noreferrer" className="text-primary hover:underline">discord.gg/tsbvh</a>
            </li>
          </ul>
        </article>
      </AppDashed>

      <AppDashed noTopBorder withDotGrid padding="p-6">
        <div className="flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center max-w-[480px]">
            Vani Studio cam kết xử lý mọi yêu cầu hoàn tiền một cách công bằng, minh bạch và nhanh chóng nhất có thể. Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi.
          </p>
        </div>
      </AppDashed>
    </div>
  );
}
