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

export default function AppShipping() {
  usePageTitle("Chính sách Giao nhận");
  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-3">
        <SectionTitle>Chính sách Giao nhận</SectionTitle>
      </AppDashed>

      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2 justify-center">
          <article className="prose dark:prose-invert prose-sm text-center max-w-[560px] text-muted-foreground">
            <p>
              Chính sách giao nhận của <span className="text-foreground font-medium">Vani Studio</span> được thiết kế nhằm đảm bảo quá trình bàn giao sản phẩm phần mềm diễn ra suôn sẻ, đúng hạn và đáp ứng đầy đủ yêu cầu của khách hàng.
            </p>
          </article>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-4">
        <article className="prose dark:prose-invert prose-sm max-w-none text-muted-foreground">
          <h3 className="text-title text-base font-bold">1. Phương thức giao nhận</h3>
          <p>Vani Studio cung cấp các phương thức giao nhận sau:</p>
          <ul>
            <li>
              <span className="text-foreground font-medium">Giao nhận trực tuyến:</span> Đối với các sản phẩm phần mềm, Vani Studio sử dụng các phương thức giao nhận trực tuyến thông qua Email, Google Drive, GitHub hoặc GitLab. Đây là phương thức chính được áp dụng cho hầu hết dự án.
            </li>
            <li>
              <span className="text-foreground font-medium">Giao nhận trực tiếp:</span> Trong một số trường hợp đặc biệt hoặc theo yêu cầu của khách hàng, Vani Studio có thể bàn giao trực tiếp tại địa điểm được thỏa thuận trước giữa hai bên.
            </li>
          </ul>

          <h3 className="text-title text-base font-bold">2. Thời gian giao nhận</h3>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th className="text-title">Hạng mục</th>
                  <th className="text-title">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-foreground font-medium">Thời gian hoàn thành</td>
                  <td>Được xác định rõ trong hợp đồng hoặc thỏa thuận ban đầu. Vani Studio cam kết tuân thủ đúng tiến độ đã thỏa thuận.</td>
                </tr>
                <tr>
                  <td className="text-foreground font-medium">Thông báo giao nhận</td>
                  <td>Vani Studio sẽ thông báo cho khách hàng ít nhất <span className="text-foreground font-medium">03 ngày làm việc</span> trước khi tiến hành bàn giao để xác nhận thời gian và phương thức.</td>
                </tr>
                <tr>
                  <td className="text-foreground font-medium">Cam kết đúng hạn</td>
                  <td>Trong trường hợp có bất kỳ sự chậm trễ nào, Vani Studio sẽ thông báo kịp thời và phối hợp cùng khách hàng để tìm giải pháp phù hợp.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-title text-base font-bold">3. Quy trình giao nhận</h3>
          <ul>
            <li>
              <span className="text-foreground font-medium">Kiểm tra sản phẩm:</span> Trước khi bàn giao, Vani Studio kiểm tra kỹ lưỡng sản phẩm để đảm bảo chất lượng, tính hoàn thiện và tuân thủ đầy đủ yêu cầu đã thỏa thuận.
            </li>
            <li>
              <span className="text-foreground font-medium">Bàn giao sản phẩm:</span> Khách hàng sẽ nhận được toàn bộ mã nguồn, tài liệu hướng dẫn sử dụng, tài liệu kỹ thuật và các tài liệu liên quan khác theo phương thức đã thỏa thuận.
            </li>
            <li>
              <span className="text-foreground font-medium">Xác nhận giao nhận:</span> Sau khi nhận sản phẩm, khách hàng kiểm tra và xác nhận việc bàn giao. Nếu có bất kỳ vấn đề nào phát sinh, khách hàng cần thông báo cho Vani Studio trong vòng <span className="text-foreground font-medium">05 ngày làm việc</span>.
            </li>
          </ul>

          <h3 className="text-title text-base font-bold">4. Hỗ trợ sau giao nhận</h3>
          <ul>
            <li>
              <span className="text-foreground font-medium">Hỗ trợ kỹ thuật:</span> Sau khi bàn giao, Vani Studio cam kết cung cấp dịch vụ hỗ trợ kỹ thuật trong suốt thời gian bảo hành đã thỏa thuận. Khách hàng có thể liên hệ qua email hoặc Zalo.
            </li>
            <li>
              <span className="text-foreground font-medium">Hướng dẫn sử dụng:</span> Vani Studio cung cấp dịch vụ hướng dẫn và đào tạo sử dụng phần mềm, đảm bảo khách hàng có thể vận hành sản phẩm một cách hiệu quả nhất.
            </li>
          </ul>

          <h3 className="text-title text-base font-bold">5. Liên hệ hỗ trợ</h3>
          <p>Mọi thắc mắc về chính sách giao nhận, vui lòng liên hệ:</p>
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
            Vani Studio cam kết bàn giao sản phẩm đúng hạn, đảm bảo chất lượng và đồng hành cùng khách hàng trong suốt quá trình sử dụng. Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi.
          </p>
        </div>
      </AppDashed>
    </div>
  );
}
