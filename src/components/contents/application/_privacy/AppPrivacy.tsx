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

export default function AppPrivacy() {
  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-3">
        <SectionTitle>Chính sách Bảo mật</SectionTitle>
      </AppDashed>

      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2 justify-center">
          <article className="prose dark:prose-invert prose-sm text-center max-w-[560px] text-muted-foreground">
            <p>
              Bảo vệ thông tin cá nhân của khách hàng là ưu tiên hàng đầu của{" "}
              <span className="text-foreground font-medium">Vani Studio</span>. Chính sách dưới đây mô tả cách chúng tôi thu thập, sử dụng và bảo mật dữ liệu của bạn.
            </p>
          </article>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-4">
        <article className="prose dark:prose-invert prose-sm max-w-none text-muted-foreground">
          <h3 className="text-title text-base font-bold">1. Mục đích và phạm vi thu thập thông tin</h3>
          <p>
            Khi khách hàng đăng ký tài khoản hoặc sử dụng các sản phẩm, dịch vụ (sau đây gọi chung là <span className="text-foreground font-medium">"Dịch vụ"</span>) của Vani Studio, chúng tôi có thể thu thập các thông tin cần thiết bao gồm: họ tên, địa chỉ email, tên đăng nhập và các thông tin liên quan khác.
          </p>
          <p>Thông tin được thu thập nhằm phục vụ các mục đích sau:</p>
          <ul>
            <li>Xác nhận đơn hàng, kích hoạt và quản lý license key;</li>
            <li>Cung cấp thông tin về Dịch vụ, gửi thông báo cập nhật sản phẩm;</li>
            <li>Phân tích xu hướng sử dụng nhằm cải tiến chất lượng Dịch vụ;</li>
            <li>Hỗ trợ khách hàng khi có yêu cầu hoặc sự cố phát sinh.</li>
          </ul>
          <p>
            Khách hàng có trách nhiệm tự bảo mật thông tin tài khoản của mình. Trong trường hợp phát hiện hành vi sử dụng trái phép hoặc vi phạm bảo mật, vui lòng thông báo ngay cho Vani Studio để được hỗ trợ kịp thời.
          </p>

          <h3 className="text-title text-base font-bold">2. Phạm vi sử dụng thông tin</h3>
          <p>
            Vani Studio cam kết chỉ sử dụng thông tin cá nhân của khách hàng đúng theo các mục đích đã nêu. Chúng tôi <span className="text-foreground font-medium">không bán, trao đổi hoặc chuyển giao</span> thông tin cá nhân cho bên thứ ba khi chưa có sự đồng ý của khách hàng.
          </p>
          <p>
            Thông tin cá nhân chỉ được tiết lộ khi có yêu cầu hợp pháp từ cơ quan tư pháp có thẩm quyền, bao gồm Viện kiểm sát, Tòa án hoặc cơ quan Công an điều tra liên quan đến hành vi vi phạm pháp luật.
          </p>

          <h3 className="text-title text-base font-bold">3. Thời gian lưu trữ thông tin</h3>
          <p>
            Dữ liệu cá nhân sẽ được lưu trữ trên hệ thống máy chủ bảo mật của Vani Studio cho đến khi khách hàng yêu cầu hủy bỏ hoặc tự xóa tài khoản.
          </p>
          <p>
            Nếu khách hàng muốn xóa toàn bộ dữ liệu cá nhân, vui lòng gửi yêu cầu đến email:{" "}
            <a href="mailto:vanixjnk@gmail.com" className="text-primary hover:underline font-medium">vanixjnk@gmail.com</a>
          </p>

          <h3 className="text-title text-base font-bold">4. Thông tin liên hệ</h3>
          <p>
            Mọi câu hỏi, yêu cầu hoặc khiếu nại liên quan đến việc thu thập và xử lý thông tin cá nhân, vui lòng liên hệ:
          </p>
          <ul>
            <li><span className="text-foreground font-medium">Đơn vị:</span> Vani Studio</li>
            <li><span className="text-foreground font-medium">Email:</span>{" "}
              <a href="mailto:vanixjnk@gmail.com" className="text-primary hover:underline">vanixjnk@gmail.com</a>
            </li>
            <li><span className="text-foreground font-medium">Zalo:</span>{" "}
              <a href="https://zalo.me/0935974907" target="_blank" rel="noreferrer" className="text-primary hover:underline">zalo.me/0935974907</a>
            </li>
          </ul>

          <h3 className="text-title text-base font-bold">5. Quyền của khách hàng</h3>
          <p>
            Khách hàng có toàn quyền kiểm tra, cập nhật, điều chỉnh hoặc yêu cầu xóa bỏ thông tin cá nhân bằng cách liên hệ trực tiếp với Vani Studio. Chúng tôi cam kết xử lý mọi yêu cầu trong thời gian sớm nhất có thể.
          </p>
          <p>
            Vani Studio cam kết bảo mật tuyệt đối mọi thông tin giao dịch trực tuyến của khách hàng, bao gồm thông tin thanh toán, license key và lịch sử sử dụng dịch vụ.
          </p>

          <h3 className="text-title text-base font-bold">6. Cập nhật Chính sách</h3>
          <p>
            Vani Studio có quyền cập nhật Chính sách Bảo mật này bất kỳ lúc nào. Trong trường hợp có thay đổi quan trọng, chúng tôi sẽ thông báo cho khách hàng thông qua website hoặc email đã đăng ký.
          </p>
          <p>
            Việc tiếp tục sử dụng Dịch vụ sau khi Chính sách được cập nhật đồng nghĩa với việc khách hàng chấp nhận những thay đổi đó.
          </p>
        </article>
      </AppDashed>

      <AppDashed noTopBorder withDotGrid padding="p-6">
        <div className="flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center max-w-[480px]">
            Cảm ơn bạn đã đọc và tin tưởng Vani Studio. Nếu có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi — chúng tôi luôn sẵn sàng hỗ trợ bạn.
          </p>
        </div>
      </AppDashed>
    </div>
  );
}
