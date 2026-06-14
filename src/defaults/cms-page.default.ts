import { type NewCmsPage } from "@/server/db/schemas/cms-page.schema";

export const DEFAULT_CMS_PAGES: Omit<NewCmsPage, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "Điều khoản Dịch vụ",
    slug: "terms-of-service",
    description: "Điều khoản sử dụng dịch vụ và chính sách hoạt động tại Vani Studio.",
    isActive: true,
    publishedAt: new Date("2026-06-13T09:00:00.000Z"),
    thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-nugixvnugixvnugi-1781432652289.jpg",
    metaTitle: "Điều khoản Dịch vụ | Vani Studio",
    metaDescription: "Điều khoản sử dụng dịch vụ và chính sách hoạt động tại Vani Studio. Khách hàng sử dụng dịch vụ vui lòng tuân thủ quy định.",
    metaKeywords: "dieu khoan, terms of service, vani studio, dieu khoan su dung",
    content: `# Điều khoản Dịch vụ

Chào mừng bạn đến với Vani Studio. Khi sử dụng các dịch vụ và sản phẩm của chúng tôi, bạn đồng ý tuân thủ các điều khoản dưới đây.

## 1. Định nghĩa
- **"Vani Studio"** (hoặc **"chúng tôi"**) — đơn vị cung cấp dịch vụ thiết kế, phát triển phần mềm và các sản phẩm công nghệ.
- **"Khách hàng"** (hoặc **"bạn"**) — cá nhân hoặc tổ chức sử dụng dịch vụ, sản phẩm của Vani Studio.
- **"Dịch vụ"** — toàn bộ sản phẩm phần mềm, công cụ, website, ứng dụng, bot, API và các dịch vụ kỹ thuật khác do Vani Studio cung cấp.

<Separator className="my-6" />

## 2. Điều kiện sử dụng
Khi sử dụng Dịch vụ, bạn cam kết rằng:
- Bạn đã đủ 16 tuổi trở lên hoặc có sự đồng ý từ người giám hộ hợp pháp;
- Thông tin cá nhân bạn cung cấp là chính xác, đầy đủ và được cập nhật;
- Bạn không sử dụng Dịch vụ cho bất kỳ mục đích bất hợp pháp hoặc vi phạm pháp luật Việt Nam;
- Bạn không can thiệp, phá hoại hoặc gây ảnh hưởng đến hoạt động bình thường của hệ thống.

<Separator className="my-6" />

## 3. Quyền sở hữu trí tuệ
Toàn bộ nội dung, thiết kế, mã nguồn, thương hiệu và tài liệu liên quan đến Dịch vụ thuộc quyền sở hữu trí tuệ của Vani Studio, trừ khi có thỏa thuận khác bằng văn bản.
- **Sản phẩm phát triển theo hợp đồng**: Quyền sở hữu mã nguồn sẽ được chuyển giao cho khách hàng sau khi thanh toán đầy đủ, trừ các thành phần framework và thư viện lõi của Vani Studio.
- **Sản phẩm cấp phép (license)**: Khách hàng được cấp quyền sử dụng theo license key, không được sao chép, phân phối lại hoặc chỉnh sửa mã nguồn khi chưa có sự đồng ý.

<Separator className="my-6" />

## 4. License Key và Tài khoản
- Mỗi license key chỉ được sử dụng theo số lượng kích hoạt đã quy định;
- Nghiêm cấm chia sẻ, bán lại hoặc chuyển nhượng license key cho bên thứ ba;
- Vani Studio có quyền thu hồi license key nếu phát hiện hành vi vi phạm điều khoản;
- Khách hàng chịu trách nhiệm bảo mật thông tin tài khoản và license key của mình.

<Separator className="my-6" />

## 5. Giới hạn trách nhiệm
<Alert className="border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400">
  <Icon icon="solar:danger-line-duotone" className="size-4" />
  <AlertTitle>Giới hạn trách nhiệm</AlertTitle>
  <AlertDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
    Vani Studio nỗ lực đảm bảo Dịch vụ hoạt động ổn định. Tuy nhiên, chúng tôi không chịu trách nhiệm trong các trường hợp gián đoạn dịch vụ do sự cố ngoài tầm kiểm soát (thiên tai, tấn công mạng, lỗi hạ tầng bên thứ ba); thiệt hại do sử dụng sai mục đích hoặc mất dữ liệu do khách hàng không thực hiện sao lưu.
  </AlertDescription>
</Alert>

<Separator className="my-6" />

## 6. Chấm dứt Dịch vụ
Chúng tôi có quyền tạm ngừng hoặc chấm dứt cung cấp Dịch vụ nếu phát hiện khách hàng vi phạm bất kỳ điều khoản nào, sử dụng dịch vụ cho mục đích bất hợp pháp hoặc gây ảnh hưởng tiêu cực đến hệ thống.

<Separator className="my-6" />

## 7. Thay đổi Điều khoản
Vani Studio có quyền cập nhật Điều khoản Dịch vụ bất kỳ lúc nào. Việc tiếp tục sử dụng Dịch vụ sau khi điều khoản được cập nhật đồng nghĩa với việc bạn chấp nhận những thay đổi đó.

<Separator className="my-6" />

## 8. Liên hệ
Mọi thắc mắc về Điều khoản Dịch vụ, vui lòng liên hệ:
- **Email**: [vanixjnk@gmail.com](mailto:vanixjnk@gmail.com)
- **Zalo**: [zalo.me/0935974907](https://zalo.me/0935974907)
`,
  },
  {
    title: "Chính sách Bảo mật",
    slug: "privacy-policy",
    description: "Chính sách thu thập, sử dụng và bảo vệ thông tin cá nhân của khách hàng tại Vani Studio.",
    isActive: true,
    publishedAt: new Date("2026-06-13T09:00:00.000Z"),
    thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-kq74c9kq74c9kq74-1781432721744.jpg",
    metaTitle: "Chính sách Bảo mật | Vani Studio",
    metaDescription: "Chính sách thu thập, sử dụng và bảo mật thông tin cá nhân của khách hàng khi đăng ký sử dụng dịch vụ tại Vani Studio.",
    metaKeywords: "chinh sach bao mat, quyen rieng tu, vani studio, bao mat thong tin",
    content: `# Chính sách Bảo mật

Chào mừng bạn đến với Vani Studio. Chúng tôi cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn. Vui lòng đọc kỹ Chính sách Bảo mật dưới đây.

## 1. Mục đích và phạm vi thu thập thông tin
Khi đăng ký tài khoản hoặc sử dụng Dịch vụ, chúng tôi có thể thu thập các thông tin cần thiết bao gồm: họ tên, địa chỉ email, tên đăng nhập và các thông tin liên quan khác nhằm phục vụ các mục đích sau:
- Xác nhận đơn hàng, kích hoạt và quản lý license key;
- Cung cấp thông tin về Dịch vụ, gửi thông báo cập nhật sản phẩm;
- Phân tích xu hướng sử dụng nhằm cải tiến chất lượng Dịch vụ;
- Hỗ trợ khách hàng khi có yêu cầu hoặc sự cố phát sinh.

<Separator className="my-6" />

## 2. Phạm vi sử dụng thông tin
Vani Studio cam kết chỉ sử dụng thông tin cá nhân của khách hàng đúng theo các mục đích đã nêu. Chúng tôi không bán, trao đổi hoặc chuyển giao thông tin cá nhân cho bên thứ ba khi chưa có sự đồng ý.

<Alert className="border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400">
  <Icon icon="solar:info-circle-line-duotone" className="size-4" />
  <AlertTitle>Tiết lộ pháp lý</AlertTitle>
  <AlertDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
    Thông tin cá nhân chỉ được tiết lộ khi có yêu cầu hợp pháp từ cơ quan tư pháp có thẩm quyền (Viện kiểm sát, Tòa án hoặc cơ quan Công an điều tra) liên quan đến hành vi vi phạm pháp luật.
  </AlertDescription>
</Alert>

<Separator className="my-6" />

## 3. Thời gian lưu trữ thông tin
Dữ liệu cá nhân sẽ được lưu trữ trên hệ thống máy chủ bảo mật của Vani Studio cho đến khi khách hàng yêu cầu hủy bỏ hoặc tự xóa tài khoản.

<Separator className="my-6" />

## 4. Quyền của khách hàng
Khách hàng có toàn quyền kiểm tra, cập nhật, điều chỉnh hoặc yêu cầu xóa bỏ thông tin cá nhân bằng cách liên hệ trực tiếp với Vani Studio. Chúng tôi cam kết bảo mật tuyệt đối mọi thông tin giao dịch trực tuyến, bao gồm thông tin thanh toán, license key và lịch sử sử dụng dịch vụ.

<Separator className="my-6" />

## 5. Cập nhật Chính sách
Vani Studio có quyền cập nhật Chính sách Bảo mật này bất kỳ lúc nào. Trong trường hợp có thay đổi quan trọng, chúng tôi sẽ thông báo cho khách hàng thông qua website hoặc email đã đăng ký.

<Separator className="my-6" />

## 6. Thông tin liên hệ
Mọi thắc mắc hoặc yêu cầu về bảo mật, vui lòng liên hệ:
- **Email**: [vanixjnk@gmail.com](mailto:vanixjnk@gmail.com)
- **Zalo**: [zalo.me/0935974907](https://zalo.me/0935974907)
`,
  },
  {
    title: "Chính sách Hoàn tiền",
    slug: "refund-policy",
    description: "Chính sách hoàn tiền và quy trình xử lý yêu cầu hoàn trả tại Vani Studio.",
    isActive: true,
    publishedAt: new Date("2026-06-13T09:00:00.000Z"),
    thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-49etib49etib49et-1781432734491.jpg",
    metaTitle: "Chính sách Hoàn tiền | Vani Studio",
    metaDescription: "Chính sách hoàn tiền và quy trình xử lý yêu cầu hoàn trả đối với sản phẩm, dịch vụ tại Vani Studio.",
    metaKeywords: "hoan tien, refund policy, vani studio, chinh sach hoan tien",
    content: `# Chính sách Hoàn tiền

Chào mừng bạn đến với Vani Studio. Chúng tôi luôn mong muốn mang lại sự hài lòng cao nhất cho khách hàng. Vui lòng tham khảo chính sách hoàn tiền dưới đây.

## 1. Điều kiện hoàn tiền
Vani Studio sẽ xem xét hoàn tiền trong các trường hợp sau:
- **Không hoàn thành dự án**: Nếu Vani Studio không thể hoàn thành dự án theo thỏa thuận ban đầu trong hợp đồng, khách hàng có quyền yêu cầu hoàn tiền toàn bộ hoặc một phần tương ứng với khối lượng công việc chưa thực hiện.
- **Chất lượng không đạt yêu cầu**: Nếu sản phẩm cuối cùng không đạt tiêu chuẩn chất lượng như đã cam kết và Vani Studio không thể khắc phục sau khi đã được trao cơ hội sửa chữa hợp lý, khách hàng có thể yêu cầu hoàn tiền.
- **Không hài lòng với sản phẩm**: Trong vòng 14 ngày kể từ khi nhận bàn giao sản phẩm, nếu khách hàng không hài lòng và gửi yêu cầu hoàn tiền, Vani Studio sẽ xem xét và xử lý theo từng trường hợp cụ thể.

<Separator className="my-6" />

## 2. Quy trình hoàn tiền
<table className="min-w-full border-collapse border border-border/60 text-[13px] my-4">
  <thead>
    <tr className="bg-muted/40">
      <th className="border border-border/60 px-4 py-2 font-bold text-left text-foreground">Bước</th>
      <th className="border border-border/60 px-4 py-2 font-bold text-left text-foreground">Nội dung</th>
      <th className="border border-border/60 px-4 py-2 font-bold text-left text-foreground">Thời gian</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground font-semibold">1. Gửi yêu cầu</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">Khách hàng gửi yêu cầu hoàn tiền bằng văn bản đến email [vanixjnk@gmail.com](mailto:vanixjnk@gmail.com), nêu rõ lý do và cung cấp bằng chứng liên quan (nếu có).</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">—</td>
    </tr>
    <tr className="bg-muted/10">
      <td className="border border-border/60 px-4 py-2 text-muted-foreground font-semibold">2. Xác nhận</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">Vani Studio xác nhận đã nhận yêu cầu và bắt đầu xem xét.</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">3 ngày làm việc</td>
    </tr>
    <tr>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground font-semibold">3. Xử lý</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">Xem xét, đánh giá yêu cầu và thông báo kết quả qua email hoặc phương tiện liên lạc đã thỏa thuận.</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">14 ngày làm việc</td>
    </tr>
    <tr className="bg-muted/10">
      <td className="border border-border/60 px-4 py-2 text-muted-foreground font-semibold">4. Hoàn tiền</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">Nếu được chấp thuận, số tiền sẽ được hoàn trả vào tài khoản ngân hàng do khách hàng cung cấp.</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">7–14 ngày làm việc</td>
    </tr>
  </tbody>
</table>

<Separator className="my-6" />

## 3. Trường hợp không hoàn tiền
Vani Studio không chấp nhận yêu cầu hoàn tiền trong các trường hợp sau:
- **Thay đổi yêu cầu ban đầu**: Nếu khách hàng thay đổi yêu cầu hoặc mục tiêu dự án sau khi dự án đã bắt đầu triển khai, Vani Studio không chịu trách nhiệm hoàn tiền cho các phần việc đã hoàn thành theo yêu cầu ban đầu.
- **Sử dụng sai mục đích**: Nếu sản phẩm bị hỏng hoặc không hoạt động đúng do khách hàng sử dụng sai mục đích, không tuân theo hướng dẫn hoặc tự ý chỉnh sửa, Vani Studio không chịu trách nhiệm hoàn tiền.
- **Quá thời hạn yêu cầu**: Yêu cầu hoàn tiền gửi sau 14 ngày kể từ ngày bàn giao sản phẩm sẽ không được xem xét, trừ trường hợp đặc biệt do Vani Studio quyết định.

<Separator className="my-6" />

## 4. Liên hệ hỗ trợ
Mọi yêu cầu hoàn tiền hoặc thắc mắc về chính sách, vui lòng liên hệ:
- **Email**: [vanixjnk@gmail.com](mailto:vanixjnk@gmail.com)
- **Zalo**: [zalo.me/0935974907](https://zalo.me/0935974907)
`,
  },
  {
    title: "Chính sách Giao nhận",
    slug: "delivery-policy",
    description: "Chính sách giao nhận, bàn giao sản phẩm phần mềm và tài liệu tại Vani Studio.",
    isActive: true,
    publishedAt: new Date("2026-06-13T09:00:00.000Z"),
    thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-drs5e6drs5e6drs5-1781433175501.jpg",
    metaTitle: "Chính sách Giao nhận | Vani Studio",
    metaDescription: "Chính sách bàn giao, thời gian hoàn thành và phương thức giao nhận sản phẩm phần mềm tại Vani Studio.",
    metaKeywords: "giao nhan, ban giao san pham, delivery policy, vani studio",
    content: `# Chính sách Giao nhận

Chào mừng bạn đến với Vani Studio. Chúng tôi cam kết thực hiện quy trình bàn giao sản phẩm và dịch vụ một cách minh bạch, an toàn và chuyên nghiệp nhất.

## 1. Phương thức giao nhận
- **Giao nhận trực tuyến**: Đối với các sản phẩm phần mềm, Vani Studio sử dụng các phương thức giao nhận trực tuyến thông qua Email, Google Drive, GitHub hoặc GitLab. Đây là phương thức chính được áp dụng cho hầu hết dự án.
- **Giao nhận trực tiếp**: Trong một số trường hợp đặc biệt hoặc theo yêu cầu của khách hàng, Vani Studio có thể bàn giao trực tiếp tại địa điểm được thỏa thuận trước giữa hai bên.

<Separator className="my-6" />

## 2. Thời gian giao nhận
<table className="min-w-full border-collapse border border-border/60 text-[13px] my-4">
  <thead>
    <tr className="bg-muted/40">
      <th className="border border-border/60 px-4 py-2 font-bold text-left text-foreground">Hạng mục</th>
      <th className="border border-border/60 px-4 py-2 font-bold text-left text-foreground">Chi tiết</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground font-semibold">Thời gian hoàn thành</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">Được xác định rõ trong hợp đồng hoặc thỏa thuận ban đầu. Vani Studio cam kết tuân thủ đúng tiến độ đã thỏa thuận.</td>
    </tr>
    <tr className="bg-muted/10">
      <td className="border border-border/60 px-4 py-2 text-muted-foreground font-semibold">Thông báo giao nhận</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">Vani Studio sẽ thông báo cho khách hàng ít nhất 03 ngày làm việc trước khi tiến hành bàn giao để xác nhận thời gian và phương thức.</td>
    </tr>
    <tr>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground font-semibold">Cam kết đúng hạn</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">Trong trường hợp có bất kỳ sự chậm trễ nào, Vani Studio sẽ thông báo kịp thời và phối hợp cùng khách hàng để tìm giải pháp phù hợp.</td>
    </tr>
  </tbody>
</table>

<Separator className="my-6" />

## 3. Quy trình giao nhận
- **Kiểm tra sản phẩm**: Trước khi bàn giao, Vani Studio kiểm tra kỹ lưỡng sản phẩm để đảm bảo chất lượng, tính hoàn thiện và tuân thủ đầy đủ yêu cầu đã thỏa thuận.
- **Bàn giao sản phẩm**: Khách hàng sẽ nhận được toàn bộ mã nguồn, tài liệu hướng dẫn sử dụng, tài liệu kỹ thuật và các tài liệu liên quan khác theo phương thức đã thỏa thuận.
- **Xác nhận giao nhận**: Sau khi nhận sản phẩm, khách hàng kiểm tra và xác nhận việc bàn giao. Nếu có bất kỳ vấn đề nào phát sinh, khách hàng cần thông báo cho Vani Studio trong vòng 05 ngày làm việc.

<Separator className="my-6" />

## 4. Hỗ trợ sau giao nhận
<Alert className="border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400">
  <Icon icon="solar:shield-check-line-duotone" className="size-4" />
  <AlertTitle>Hỗ trợ sau giao nhận</AlertTitle>
  <AlertDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
    Sau khi bàn giao, Vani Studio cam kết cung cấp dịch vụ hỗ trợ kỹ thuật trong suốt thời gian bảo hành đã thỏa thuận. Khách hàng có thể liên hệ qua email hoặc Zalo. Đồng thời, chúng tôi cung cấp dịch vụ hướng dẫn và đào tạo sử dụng phần mềm, đảm bảo khách hàng có thể vận hành sản phẩm một cách hiệu quả nhất.
  </AlertDescription>
</Alert>

<Separator className="my-6" />

## 5. Liên hệ hỗ trợ
Mọi thắc mắc về chính sách giao nhận, vui lòng liên hệ:
- **Email**: [vanixjnk@gmail.com](mailto:vanixjnk@gmail.com)
- **Zalo**: [zalo.me/0935974907](https://zalo.me/0935974907)
`,
  },
  {
    title: "Chính sách Bảo hành",
    slug: "warranty-policy",
    description: "Chính sách bảo hành, hỗ trợ kỹ thuật và thời gian xử lý sự cố tại Vani Studio.",
    isActive: true,
    publishedAt: new Date("2026-06-13T09:00:00.000Z"),
    thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-y9vu10y9vu10y9vu-1781432840356.jpg",
    metaTitle: "Chính sách Bảo hành | Vani Studio",
    metaDescription: "Chính sách bảo trì, bảo hành phần mềm, khắc phục lỗi phát sinh và các trường hợp từ chối bảo hành tại Vani Studio.",
    metaKeywords: "bao hanh, bao tri, warranty policy, vani studio",
    content: `# Chính sách Bảo hành

Chào mừng bạn đến với Vani Studio. Chúng tôi cam kết đồng hành cùng khách hàng thông qua chính sách bảo hành và hỗ trợ kỹ thuật chu đáo.

## 1. Thời gian bảo hành
Mọi sản phẩm do Vani Studio thực hiện được bảo hành theo các gói thời gian tùy thuộc vào quy mô và độ phức tạp của dự án. Thời gian bảo hành được ghi rõ trong hợp đồng giữa hai bên.

<table className="min-w-full border-collapse border border-border/60 text-[13px] my-4">
  <thead>
    <tr className="bg-muted/40">
      <th className="border border-border/60 px-4 py-2 font-bold text-left text-foreground">Gói bảo hành</th>
      <th className="border border-border/60 px-4 py-2 font-bold text-left text-foreground">Thời gian</th>
      <th className="border border-border/60 px-4 py-2 font-bold text-left text-foreground">Áp dụng</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground font-semibold">Cơ bản</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">03 tháng</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">Dự án nhỏ, landing page, tool đơn giản</td>
    </tr>
    <tr className="bg-muted/10">
      <td className="border border-border/60 px-4 py-2 text-muted-foreground font-semibold">Tiêu chuẩn</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">06 tháng</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">Web app, hệ thống quản lý, bot</td>
    </tr>
    <tr>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground font-semibold">Nâng cao</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">12 tháng</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">Dự án lớn, hệ thống phức tạp, yêu cầu đặc biệt</td>
    </tr>
  </tbody>
</table>

<Separator className="my-6" />

## 2. Nội dung bảo hành
Vani Studio chịu trách nhiệm bảo hành các trường hợp sau:
- **Lỗi phát sinh từ mã nguồn**: Các bug, lỗi logic hoặc sự cố kỹ thuật do code gây ra trong quá trình sử dụng bình thường.
- **Lỗi tương thích**: Sản phẩm không hoạt động đúng trên các nền tảng đã cam kết hỗ trợ trong hợp đồng.
- **Lỗi hiển thị**: Giao diện hiển thị không đúng so với thiết kế đã được duyệt.

Đối với các lỗi không thuộc phạm vi bảo hành, Vani Studio sẽ tư vấn và đề xuất hướng khắc phục phù hợp cho khách hàng. Chi tiết nội dung bảo hành sẽ được liệt kê đầy đủ trong hợp đồng.

<Separator className="my-6" />

## 3. Thời gian xử lý bảo hành
Thời gian thực hiện bảo hành chậm nhất là **24 giờ** kể từ khi tiếp nhận thông tin từ khách hàng, không tính ngày nghỉ lễ và Tết. Đối với các sự cố nghiêm trọng ảnh hưởng đến hoạt động kinh doanh, Vani Studio sẽ ưu tiên xử lý ngay lập tức.

<Separator className="my-6" />

## 4. Trường hợp không bảo hành
<Alert className="border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400">
  <Icon icon="solar:shield-warning-line-duotone" className="size-4" />
  <AlertTitle>Trường hợp từ chối bảo hành</AlertTitle>
  <AlertDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
    Vani Studio không bảo hành trong các trường hợp khách hàng tự ý chỉnh sửa mã nguồn hoặc cấu hình hệ thống; sản phẩm bị hỏng do tác động từ bên thứ ba (hosting, server, plugin không tương thích); các yêu cầu thay đổi, bổ sung tính năng mới nằm ngoài phạm vi ban đầu; hoặc sản phẩm hết thời hạn bảo hành.
  </AlertDescription>
</Alert>

<Separator className="my-6" />

## 5. Liên hệ bảo hành
Khi cần hỗ trợ bảo hành, khách hàng vui lòng liên hệ:
- **Email**: [vanixjnk@gmail.com](mailto:vanixjnk@gmail.com)
- **Zalo**: [zalo.me/0935974907](https://zalo.me/0935974907)
`,
  },
  {
    title: "Chính sách Thanh toán",
    slug: "payment-policy",
    description: "Chính sách thanh toán, các phương thức thanh toán và quy trình xác nhận tại Vani Studio.",
    isActive: true,
    publishedAt: new Date("2026-06-13T09:00:00.000Z"),
    thumbnail: "https://storage.vanistudio.com/uploads/Gemini-Generated-Image-3j13ka3j13ka3j13-1781433096414.jpg",
    metaTitle: "Chính sách Thanh toán | Vani Studio",
    metaDescription: "Hướng dẫn quy định thanh toán hợp đồng, hình thức chuyển khoản ngân hàng, cổng thanh toán VNPAY và xác nhận giao dịch tại Vani Studio.",
    metaKeywords: "thanh toan, phuong thuc thanh toan, chuyen khoan, payment policy, vani studio",
    content: `# Chính sách Thanh toán

Chào mừng bạn đến với Vani Studio. Dưới đây là các quy định và hướng dẫn thanh toán chi tiết cho các sản phẩm và dịch vụ của chúng tôi.

## 1. Quy định thanh toán
- **1.1. Đối với các Dịch vụ được đặt hàng trực tuyến thông qua Website**: Khách hàng cần thanh toán **100%** giá trị đơn hàng khi đặt hàng. Sau khi đặt hàng thành công, Vani Studio sẽ liên hệ xác nhận và tiến hành xử lý đơn hàng.
- **1.2. Đối với các Dịch vụ có nhãn "Premium"**: Sau khi khách hàng đăng ký tư vấn, Vani Studio sẽ liên hệ và thống nhất hợp đồng cung cấp Dịch vụ. Quy trình thanh toán được thực hiện theo các giai đoạn sau:

<table className="min-w-full border-collapse border border-border/60 text-[13px] my-4">
  <thead>
    <tr className="bg-muted/40">
      <th className="border border-border/60 px-4 py-2 font-bold text-left text-foreground">Giai đoạn</th>
      <th className="border border-border/60 px-4 py-2 font-bold text-left text-foreground">Tỷ lệ</th>
      <th className="border border-border/60 px-4 py-2 font-bold text-left text-foreground">Thời điểm</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground font-semibold">Đặt cọc</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">50% giá trị hợp đồng</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">Sau khi ký kết hợp đồng</td>
    </tr>
    <tr className="bg-muted/10">
      <td className="border border-border/60 px-4 py-2 text-muted-foreground font-semibold">Thanh toán còn lại</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">50% giá trị hợp đồng</td>
      <td className="border border-border/60 px-4 py-2 text-muted-foreground">Sau khi hoàn thành và bàn giao dự án</td>
    </tr>
  </tbody>
</table>

- **1.3. Đối với các Dịch vụ bổ sung nằm ngoài hợp đồng**: Vani Studio sẽ trao đổi và thống nhất chi phí với khách hàng. Thanh toán được thực hiện 01 lần duy nhất sau khi dịch vụ bổ sung đã hoàn thành.

<Separator className="my-6" />

## 2. Hình thức thanh toán
Khách hàng có thể thanh toán đơn hàng hoặc hợp đồng cung cấp Dịch vụ qua các hình thức sau:

### 2.1. Chuyển khoản ngân hàng
- **Ngân hàng**: MB BANK (Ngân hàng TMCP Quân Đội)
- **Chủ tài khoản**: NGUYEN DINH BAO
- **Số tài khoản**: 100000001
- **Nội dung chuyển khoản**: Mã đơn hàng / Mã hợp đồng

### 2.2. Cổng thanh toán VNPAY
Khách hàng có thể thanh toán trực tuyến thông qua cổng thanh toán VNPAY — hỗ trợ quét mã QR, ví điện tử, thẻ ATM nội địa và thẻ quốc tế (Visa, MasterCard, JCB).

<Separator className="my-6" />

## 3. Xác nhận thanh toán
<Alert className="border-sky-500/20 bg-sky-500/5 text-sky-600 dark:text-sky-400">
  <Icon icon="solar:info-circle-line-duotone" className="size-4" />
  <AlertTitle>Xác nhận thanh toán</AlertTitle>
  <AlertDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
    Sau khi nhận được thanh toán, Vani Studio sẽ gửi xác nhận qua email trong vòng 24 giờ làm việc. Nếu sau 48 giờ khách hàng chưa nhận được xác nhận, vui lòng liên hệ với chúng tôi.
  </AlertDescription>
</Alert>

<Separator className="my-6" />

## 4. Liên hệ hỗ trợ
Mọi thắc mắc về thanh toán, vui lòng liên hệ:
- **Email**: [vanixjnk@gmail.com](mailto:vanixjnk@gmail.com)
- **Zalo**: [zalo.me/0935974907](https://zalo.me/0935974907)
`,
  },
];
