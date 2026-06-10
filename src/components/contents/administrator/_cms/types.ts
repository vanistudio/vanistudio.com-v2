export interface CmsPageMock {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  thumbnail: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isActive: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export const INITIAL_PAGES: CmsPageMock[] = [
  {
    id: "1",
    title: "Về chúng tôi - Vani Studio",
    slug: "ve-chung-toi",
    description: "Giới thiệu về tầm nhìn, sứ mệnh và đội ngũ sáng lập của Vani Studio.",
    content: `# Chào mừng đến với Vani Studio!

Chúng tôi là một tập thể sáng tạo chuyên thiết kế **Website chuyên nghiệp**, phát triển **Ứng dụng di động**, giải pháp **Chatbot AI** và **giao diện UI/UX** chất lượng cao.

<Alert variant="default" className="border-vanixjnk/20 bg-vanixjnk/5 text-foreground my-4">
  <Icon icon="solar:info-square-line-duotone" className="size-5 text-vanixjnk" />
  <AlertTitle className="text-vanixjnk font-bold">Thông báo</AlertTitle>
  <AlertDescription>Vani Studio vừa ra mắt phiên bản v2 với giao diện quản trị hiện đại, hỗ trợ soạn thảo MDX phong phú.</AlertDescription>
</Alert>

## Tầm nhìn & Sứ mệnh

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
  <Card className="border-border/60 bg-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-vanixjnk">
        <Icon icon="solar:eye-line-duotone" className="size-5" />
        <span>Tầm nhìn</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      Trở thành đơn vị tiên phong kiến tạo giải pháp công nghệ hiện đại, nâng tầm trải nghiệm người dùng.
    </CardContent>
  </Card>

  <Card className="border-border/60 bg-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-vanixjnk">
        <Icon icon="solar:stars-line-duotone" className="size-5" />
        <span>Sứ mệnh</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      Mang lại giá trị tối đa cho khách hàng thông qua những sản phẩm chất lượng tốt nhất với thiết kế chỉn chu.
    </CardContent>
  </Card>
</div>

## Câu hỏi thường gặp

<Accordion type="single" collapsible className="w-full border border-border/60 rounded-xl px-4 py-2 bg-muted/10">
  <AccordionItem value="item-1">
    <AccordionTrigger>Thời gian hoàn thành một dự án thiết kế UI/UX là bao lâu?</AccordionTrigger>
    <AccordionContent>
      Thời gian trung bình khoảng từ 2 đến 4 tuần tùy thuộc vào quy mô và yêu cầu cụ thể của từng dự án.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Vani Studio có hỗ trợ sau bàn giao không?</AccordionTrigger>
    <AccordionContent>
      Có, chúng tôi cung cấp gói bảo hành 12 tháng miễn phí và hỗ trợ kỹ thuật 24/7 sau khi bàn giao sản phẩm.
    </AccordionContent>
  </AccordionItem>
</Accordion>

<div className="flex gap-2.5 mt-6">
  <Button variant="default" className="bg-vanixjnk text-white hover:bg-vanixjnk/90">
    Liên hệ ngay
  </Button>
  <Button variant="outline" className="border-border/80">
    Xem bảng giá
  </Button>
</div>`,
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    metaTitle: "Giới thiệu về Vani Studio | Thiết kế UI/UX & Website",
    metaDescription: "Tìm hiểu thêm về đội ngũ phát triển, văn hóa và dịch vụ thiết kế UI/UX, website chuyên nghiệp tại Vani Studio.",
    metaKeywords: "vani studio, gioi thieu vani studio, thiet ke website, lap trinh app",
    isActive: true,
    publishedAt: "2026-06-01T08:00:00.000Z",
    createdAt: "2026-06-01T08:00:00.000Z",
  },
  {
    id: "2",
    title: "Chính sách bảo mật thông tin",
    slug: "chinh-sach-bao-mat",
    description: "Chính sách cam kết bảo vệ dữ liệu cá nhân của khách hàng khi truy cập Vani Studio.",
    content: `# Chính sách bảo mật thông tin khách hàng

Chúng tôi cam kết bảo vệ tuyệt đối thông tin riêng tư của người dùng. Bản chính sách này làm rõ các dữ liệu chúng tôi thu thập và cách sử dụng chúng.

## 1. Dữ liệu thu thập
- Tên và địa chỉ Email khi bạn gửi biểu mẫu liên hệ.
- Địa chỉ IP và lịch sử truy cập thông qua Google Analytics.

## 2. Bảo mật thông tin
Mọi dữ liệu truyền tải đều được mã hóa SSL/TLS an toàn. Chúng tôi tuyệt đối không bán hoặc cung cấp thông tin của bạn cho bên thứ ba.`,
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
    metaTitle: "Chính sách bảo mật | Vani Studio",
    metaDescription: "Đọc kỹ chính sách bảo mật thông tin người dùng và cam kết bảo vệ dữ liệu cá nhân tại Vani Studio.",
    metaKeywords: "chinh sach bao mat, bao mat thong tin, vani studio",
    isActive: true,
    publishedAt: "2026-06-02T10:30:00.000Z",
    createdAt: "2026-06-02T10:30:00.000Z",
  },
  {
    id: "3",
    title: "Điều khoản sử dụng dịch vụ",
    slug: "dieu-khoan-dich-vu",
    description: "Quy định và các điều khoản pháp lý ràng buộc giữa khách hàng và Vani Studio.",
    content: `# Điều khoản sử dụng dịch vụ

Chào mừng bạn truy cập trang web của chúng tôi. Khi sử dụng các dịch vụ do Vani Studio cung cấp, bạn mặc định đồng ý tuân thủ các điều khoản sau.

## 1. Quyền sở hữu trí tuệ
Mọi mã nguồn, thiết kế UI/UX, và tài liệu trên website này đều thuộc quyền sở hữu độc quyền của Vani Studio. Bạn không được sao chép khi chưa có văn bản đồng ý.

## 2. Giới hạn trách nhiệm
Chúng tôi nỗ lực tối đa để vận hành website thông suốt, tuy nhiên không chịu trách nhiệm nếu dịch vụ bị gián đoạn do sự cố bất khả kháng hoặc nhà mạng cung cấp.`,
    thumbnail: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
    metaTitle: "Điều khoản sử dụng dịch vụ | Vani Studio",
    metaDescription: "Chi tiết quy định sử dụng dịch vụ và trách nhiệm pháp lý giữa Vani Studio và khách hàng.",
    metaKeywords: "dieu khoan dich vu, dieu khoan vani studio, quy dinh su dung",
    isActive: true,
    publishedAt: "2026-06-03T14:15:00.000Z",
    createdAt: "2026-06-03T14:15:00.000Z",
  },
  {
    id: "4",
    title: "Quy trình thanh toán và Hoàn trả",
    slug: "chinh-sach-thanh-toan",
    description: "Thông tin hướng dẫn giao dịch, thanh toán trực tuyến và hoàn tiền cho các dịch vụ phần mềm.",
    content: `# Chính sách Thanh toán và Hoàn trả

Bài viết hướng dẫn quy trình chuyển khoản ngân hàng, thanh toán qua cổng điện tử và điều kiện hoàn tiền dịch vụ.

## 1. Phương thức thanh toán
Khách hàng có thể thanh toán qua các tài khoản ngân hàng chính thức của Vani Studio được cung cấp khi ký hợp đồng.

## 2. Điều kiện hoàn tiền
- Hoàn trả 100% nếu dự án chưa được khởi tạo thiết kế sau 7 ngày làm việc kể từ lúc đặt cọc.
- Hoàn trả 50% nếu khách hàng yêu cầu hủy khi thiết kế demo UI/UX đã hoàn thiện.`,
    thumbnail: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=600&q=80",
    metaTitle: "Quy trình thanh toán & Hoàn trả phí dịch vụ | Vani Studio",
    metaDescription: "Hướng dẫn thực hiện thanh toán hợp đồng và chính sách bồi hoàn chi phí dịch vụ của Vani Studio.",
    metaKeywords: "hoan tien, thanh toan hop dong, vani studio",
    isActive: false,
    publishedAt: null,
    createdAt: "2026-06-04T09:20:00.000Z",
  }
];

export function getStoredPages(): CmsPageMock[] {
  if (typeof window === "undefined") {
    return INITIAL_PAGES;
  }
  const stored = localStorage.getItem("cms_pages");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored cms pages:", e);
      return INITIAL_PAGES;
    }
  }
  localStorage.setItem("cms_pages", JSON.stringify(INITIAL_PAGES));
  return INITIAL_PAGES;
}

export function saveStoredPages(pages: CmsPageMock[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("cms_pages", JSON.stringify(pages));
  }
}
