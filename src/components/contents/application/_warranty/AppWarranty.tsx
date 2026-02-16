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

export default function AppWarranty() {
  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-3">
        <SectionTitle>Chính sách Bảo hành</SectionTitle>
      </AppDashed>

      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2 justify-center">
          <article className="prose dark:prose-invert prose-sm text-center max-w-[560px] text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">Vani Studio</span> cam kết mang đến chính sách bảo hành minh bạch, rõ ràng nhằm đảm bảo quyền lợi tối đa cho khách hàng trong suốt quá trình sử dụng sản phẩm.
            </p>
          </article>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-4">
        <article className="prose dark:prose-invert prose-sm max-w-none text-muted-foreground">
          <h3 className="text-title text-base font-bold">1. Thời gian bảo hành</h3>
          <p>
            Mọi sản phẩm do Vani Studio thực hiện được bảo hành theo các gói thời gian tùy thuộc vào quy mô và độ phức tạp của dự án. Thời gian bảo hành được ghi rõ trong hợp đồng giữa hai bên.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th className="text-title">Gói bảo hành</th>
                  <th className="text-title">Thời gian</th>
                  <th className="text-title">Áp dụng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-foreground font-medium">Cơ bản</td>
                  <td>03 tháng</td>
                  <td>Dự án nhỏ, landing page, tool đơn giản</td>
                </tr>
                <tr>
                  <td className="text-foreground font-medium">Tiêu chuẩn</td>
                  <td>06 tháng</td>
                  <td>Web app, hệ thống quản lý, bot</td>
                </tr>
                <tr>
                  <td className="text-foreground font-medium">Nâng cao</td>
                  <td>12 tháng</td>
                  <td>Dự án lớn, hệ thống phức tạp, yêu cầu đặc biệt</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-title text-base font-bold">2. Nội dung bảo hành</h3>
          <p>Vani Studio chịu trách nhiệm bảo hành các trường hợp sau:</p>
          <ul>
            <li>
              <span className="text-foreground font-medium">Lỗi phát sinh từ mã nguồn:</span> Các bug, lỗi logic hoặc sự cố kỹ thuật do code gây ra trong quá trình sử dụng bình thường.
            </li>
            <li>
              <span className="text-foreground font-medium">Lỗi tương thích:</span> Sản phẩm không hoạt động đúng trên các nền tảng đã cam kết hỗ trợ trong hợp đồng.
            </li>
            <li>
              <span className="text-foreground font-medium">Lỗi hiển thị:</span> Giao diện hiển thị không đúng so với thiết kế đã được duyệt.
            </li>
          </ul>
          <p>
            Đối với các lỗi không thuộc phạm vi bảo hành, Vani Studio sẽ tư vấn và đề xuất hướng khắc phục phù hợp cho khách hàng. Chi tiết nội dung bảo hành sẽ được liệt kê đầy đủ trong hợp đồng.
          </p>

          <h3 className="text-title text-base font-bold">3. Thời gian xử lý bảo hành</h3>
          <p>
            Thời gian thực hiện bảo hành chậm nhất là <span className="text-foreground font-medium">24 giờ</span> kể từ khi tiếp nhận thông tin từ khách hàng, không tính ngày nghỉ lễ và Tết. Đối với các sự cố nghiêm trọng ảnh hưởng đến hoạt động kinh doanh, Vani Studio sẽ ưu tiên xử lý ngay lập tức.
          </p>

          <h3 className="text-title text-base font-bold">4. Trường hợp không bảo hành</h3>
          <p>Vani Studio <span className="text-foreground font-medium">không bảo hành</span> trong các trường hợp sau:</p>
          <ul>
            <li>Khách hàng tự ý chỉnh sửa mã nguồn hoặc cấu hình hệ thống mà không có sự đồng ý của Vani Studio;</li>
            <li>Sản phẩm bị hỏng do tác động từ bên thứ ba (hosting, server, plugin không tương thích);</li>
            <li>Các yêu cầu thay đổi, bổ sung tính năng mới nằm ngoài phạm vi dự án ban đầu;</li>
            <li>Hết thời hạn bảo hành theo hợp đồng.</li>
          </ul>

          <h3 className="text-title text-base font-bold">5. Liên hệ bảo hành</h3>
          <p>Khi cần hỗ trợ bảo hành, khách hàng vui lòng liên hệ:</p>
          <ul>
            <li><span className="text-foreground font-medium">Email:</span>{" "}
              <a href="mailto:contact@vanistudio.com" className="text-primary hover:underline">contact@vanistudio.com</a>
            </li>
            <li><span className="text-foreground font-medium">Discord:</span>{" "}
              <a href="https://discord.gg/tsbvh" target="_blank" rel="noreferrer" className="text-primary hover:underline">discord.gg/tsbvh</a>
            </li>
          </ul>
          <p>
            Vani Studio sẽ phản hồi qua email, Discord hoặc phương tiện liên lạc đã được thỏa thuận trong hợp đồng.
          </p>
        </article>
      </AppDashed>

      <AppDashed noTopBorder withDotGrid padding="p-6">
        <div className="flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center max-w-[480px]">
            Vani Studio luôn đặt chất lượng sản phẩm và sự hài lòng của khách hàng lên hàng đầu. Chúng tôi cam kết đồng hành và hỗ trợ bạn trong suốt thời gian bảo hành.
          </p>
        </div>
      </AppDashed>
    </div>
  );
}
