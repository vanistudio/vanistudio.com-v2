import { type TemplateExtraConfig } from "@/server/db/schemas/template.schema";

export interface DefaultNotificationTemplate {
  name: string;
  eventKey: string;
  channel: string;
  target: "admin" | "client";
  subject?: string;
  content: string;
  variables: string[];
  extraConfig: TemplateExtraConfig;
  description?: string;
  isActive: boolean;
}

export const DEFAULT_NOTIFICATION_TEMPLATES: DefaultNotificationTemplate[] = [
  {
    name: "Email chào mừng thành viên mới",
    eventKey: "user.register",
    channel: "email",
    target: "client",
    subject: "Chào mừng bạn đến với VaniStudio - Khởi đầu hành trình sáng tạo của bạn!",
    content: "Chào {{name}},\n\nChào mừng bạn đã gia nhập VaniStudio - Nền tảng phát triển sản phẩm công nghệ và thiết kế giao diện cao cấp. Chúng tôi vô cùng vui mừng khi được đồng hành cùng bạn trên con đường xây dựng các giải pháp số hóa đột phá.\n\nTài khoản của bạn đã được khởi tạo thành công với các thông tin chi tiết dưới đây:\n• Họ tên: {{name}}\n• Email tài khoản: {{email}}\n• Mã thành viên: #{{userId}}\n• Gói tài khoản ban đầu: {{pricingPlan}}\n• Thời gian đăng ký: {{createdAt}}\n• Địa chỉ IP đăng ký: {{ipAddress}}\n• Vị trí địa lý đăng ký: {{location}}\n\nĐể bắt đầu trải nghiệm đầy đủ các tính năng của hệ thống, vui lòng truy cập và đăng nhập tại đường dẫn sau:\n👉 {{loginUrl}}\n\n🎁 Quà tặng chào mừng dành riêng cho thành viên mới:\nSử dụng mã khuyến mại: {{promoCode}} để được giảm ngay 15% cho lần đầu đăng ký các gói dịch vụ Premium hoặc mua sản phẩm trực tiếp tại VaniStudio.\n\nCác bước quan trọng đầu tiên để tối ưu hóa tài khoản của bạn:\n1. Hoàn thiện hồ sơ cá nhân: Bổ sung số điện thoại, thiết lập múi giờ và đồng bộ hóa avatar của bạn tại {{profileSettingsUrl}}.\n2. Kích hoạt tính năng bảo mật: Chúng tôi đặc biệt khuyên bạn nên kích hoạt xác thực 2 lớp (2FA) tại {{securitySettingsUrl}} để bảo vệ dữ liệu cá nhân của mình.\n3. Tham khảo tài liệu hướng dẫn: Đọc ngay cẩm nang hướng dẫn sử dụng nhanh dành cho người mới tại {{gettingStartedLink}}.\n4. Tham gia cộng đồng: Kết nối với hàng ngàn nhà phát triển khác tại diễn đàn của chúng tôi qua {{communityLink}}.\n\nNếu bạn gặp bất kỳ vấn đề gì hoặc cần hỗ trợ kỹ thuật, xin vui lòng liên hệ với Đội ngũ Chăm sóc khách hàng trực tuyến qua email {{supportEmail}} hoặc truy cập cổng hỗ trợ {{supportPortalUrl}}.\n\nMột lần nữa, xin chân thành cảm ơn bạn đã lựa chọn VaniStudio!\n\nTrân trọng,\nĐội ngũ Sáng lập & Hỗ trợ Khách hàng VaniStudio\nhttps://vanistudio.com",
    variables: [
      "name",
      "email",
      "userId",
      "pricingPlan",
      "createdAt",
      "ipAddress",
      "location",
      "loginUrl",
      "promoCode",
      "profileSettingsUrl",
      "securitySettingsUrl",
      "gettingStartedLink",
      "communityLink",
      "supportEmail",
      "supportPortalUrl"
    ],
    extraConfig: {
      senderName: "VaniStudio Welcome Manager",
      senderEmail: "welcome@vanistudio.com"
    },
    description: "Email tự động gửi chào mừng thành viên mới khi họ đăng ký thành công.",
    isActive: true
  },
  {
    name: "Email khôi phục mật khẩu",
    eventKey: "auth.forgot_password",
    channel: "email",
    target: "client",
    subject: "Yêu cầu khôi phục mật khẩu tài khoản VaniStudio - Hành động khẩn cấp cần thiết",
    content: "Chào {{name}},\n\nChúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản VaniStudio của bạn đăng ký qua địa chỉ email {{email}}.\n\nĐể tiến hành đặt lại mật khẩu mới, vui lòng nhấp vào liên kết bảo mật dưới đây:\n👉 {{resetLink}}\n\n*Lưu ý bảo mật quan trọng:*\n- Đường liên kết khôi phục này chỉ có hiệu lực sử dụng duy nhất một lần và sẽ tự động hết hạn sau đúng {{expiryDurationMinutes}} phút kể từ khi email này được gửi đi (hết hạn vào lúc {{expireTime}}).\n- Địa chỉ IP gửi yêu cầu này là: {{ipAddress}}\n- Quốc gia và Vị trí địa lý ghi nhận: {{location}}\n- Thiết bị và trình duyệt thực hiện yêu cầu: {{device}} (Hệ điều hành: {{operatingSystem}}, Trình duyệt: {{browserName}})\n\nNếu bạn KHÔNG thực hiện yêu cầu này, có thể ai đó đang cố gắng truy cập trái phép vào tài khoản của bạn. Vui lòng bỏ qua email này, mật khẩu hiện tại của bạn vẫn sẽ được giữ an toàn và không bị thay đổi.\n\nĐể bảo vệ tối đa cho tài khoản, chúng tôi khuyên bạn nên:\n1. Tuyệt đối không chia sẻ email này hoặc sao chép liên kết trên gửi cho bất kỳ ai.\n2. Kiểm tra lại lịch sử đăng nhập gần đây của bạn tại: {{securitySettingsUrl}}.\n3. Đọc thêm các khuyến cáo an ninh mạng của chúng tôi tại: {{securityTipsUrl}}.\n\nNếu cần trợ giúp thêm, vui lòng liên hệ ngay với Bộ phận Hỗ trợ Kỹ thuật & An ninh VaniStudio qua số hotline {{supportHotline}} hoặc phản hồi trực tiếp email này.\n\nTrân trọng,\nPhòng An ninh mạng & Bảo mật Thông tin VaniStudio\nsecurity@vanistudio.com",
    variables: [
      "name",
      "email",
      "resetLink",
      "expiryDurationMinutes",
      "expireTime",
      "ipAddress",
      "location",
      "device",
      "operatingSystem",
      "browserName",
      "securitySettingsUrl",
      "securityTipsUrl",
      "supportHotline"
    ],
    extraConfig: {
      senderName: "VaniStudio Security Operations",
      senderEmail: "security@vanistudio.com"
    },
    description: "Email chứa liên kết bảo mật khôi phục mật khẩu cho khách hàng.",
    isActive: true
  },
  {
    name: "Thông báo Telegram: Thành viên mới đăng ký",
    eventKey: "user.register",
    channel: "telegram",
    target: "admin",
    content: "🆕 <b>THÀNH VIÊN ĐĂNG KÝ HỆ THỐNG MỚI</b>\n\nHệ thống ghi nhận tài khoản người dùng mới vừa kích hoạt thành công:\n• <b>Mã thành viên:</b> <code>#{{userId}}</code>\n• <b>Họ và tên:</b> <code>{{name}}</code>\n• <b>Địa chỉ Email:</b> <code>{{email}}</code>\n• <b>Gói đăng ký:</b> <code>{{pricingPlan}}</code>\n• <b>Nguồn giới thiệu:</b> <code>{{referralSource}}</code>\n• <b>Chiến dịch marketing:</b> <code>{{campaignName}}</code>\n• <b>Thời gian đăng ký:</b> <code>{{createdAt}}</code>\n\n🌐 <b>THÔNG TIN KẾT NỐI:</b>\n• <b>Địa chỉ IP:</b> <code>{{ipAddress}}</code>\n• <b>Nhà cung cấp mạng (ISP):</b> <code>{{ispProvider}}</code>\n• <b>Quốc gia:</b> <code>{{signupCountry}}</code> (Vị trí: <code>{{location}}</code>)\n• <b>Thiết bị sử dụng:</b> <code>{{device}}</code>\n\n⚙️ <b>Hành động quản trị:</b>\n👉 <a href=\"{{profileUrl}}\">Xem hồ sơ chi tiết trên Admin Panel</a>\n\n<i>Hệ thống đã tự động gửi email xác nhận và kích hoạt quà tặng chào mừng cho thành viên này.</i>",
    variables: [
      "userId",
      "name",
      "email",
      "pricingPlan",
      "referralSource",
      "campaignName",
      "createdAt",
      "ipAddress",
      "ispProvider",
      "signupCountry",
      "location",
      "device",
      "profileUrl"
    ],
    extraConfig: {
      parseMode: "HTML",
      telegramInlineKeyboard: {
        rows: [
          {
            buttons: [
              { text: "🔍 Xem Hồ Sơ Thành Viên", url: "{{profileUrl}}" }
            ]
          }
        ]
      }
    },
    description: "Tin nhắn tự động gửi đến group Telegram của Admin để thông báo khi có user mới đăng ký.",
    isActive: true
  },
  {
    name: "Cảnh báo Discord: Thành viên mới đăng ký",
    eventKey: "user.register",
    channel: "discord",
    target: "admin",
    content: "Hệ thống quản trị ghi nhận thành viên mới đăng ký tài khoản thành công.",
    variables: [
      "userId",
      "name",
      "email",
      "pricingPlan",
      "referralSource",
      "campaignName",
      "createdAt",
      "ipAddress",
      "ispProvider",
      "signupCountry",
      "location",
      "device",
      "profileUrl"
    ],
    extraConfig: {
      discordEmbeds: [
        {
          colorHex: "#3B82F6",
          color: 3900150,
          title: "🆕 THÀNH VIÊN ĐĂNG KÝ HỆ THỐNG MỚI",
          description: "Một tài khoản khách hàng mới vừa được kích hoạt thành công trên hệ thống VaniStudio.",
          author: {
            name: "VaniStudio User Management"
          },
          fields: [
            { name: "Mã thành viên", value: "`#{{userId}}`", inline: true },
            { name: "Họ và tên", value: "`{{name}}`", inline: true },
            { name: "Địa chỉ Email", value: "`{{email}}`", inline: true },
            { name: "Gói đăng ký", value: "💎 {{pricingPlan}}", inline: true },
            { name: "Nguồn giới thiệu", value: "🔗 {{referralSource}}", inline: true },
            { name: "Chiến dịch", value: "📊 {{campaignName}}", inline: true },
            { name: "Địa chỉ IP", value: "`{{ipAddress}}`", inline: true },
            { name: "Nhà mạng (ISP)", value: "🌐 {{ispProvider}}", inline: true },
            { name: "Quốc gia", value: "📍 {{signupCountry}} ({{location}})", inline: true },
            { name: "Thiết bị sử dụng", value: "💻 {{device}}", inline: false },
            { name: "Hồ sơ quản trị", value: "🔗 [Xem trên Admin Panel]({{profileUrl}})", inline: false }
          ],
          footer: {
            text: "Đăng ký lúc: {{createdAt}} • VaniStudio User Service"
          }
        }
      ]
    },
    description: "Gửi cảnh báo Rich Embed thông báo có thành viên mới đăng ký qua kênh Discord.",
    isActive: true
  },
  {
    name: "Thông báo Slack: Thành viên mới đăng ký",
    eventKey: "user.register",
    channel: "slack",
    target: "admin",
    content: "Thông báo hệ thống: Có thành viên mới đăng ký.",
    variables: [
      "userId",
      "name",
      "email",
      "pricingPlan",
      "referralSource",
      "campaignName",
      "createdAt",
      "ipAddress",
      "ispProvider",
      "signupCountry",
      "location",
      "device",
      "profileUrl"
    ],
    extraConfig: {
      slackBlocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🆕 THÀNH VIÊN ĐĂNG KÝ HỆ THỐNG MỚI"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Hệ thống vừa ghi nhận một thành viên mới kích hoạt tài khoản thành công."
          }
        },
        {
          type: "divider"
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: "*Mã thành viên:*\n`#{{userId}}`" },
            { type: "mrkdwn", text: "*Họ và tên:*\n{{name}}" },
            { type: "mrkdwn", text: "*Email:*\n`{{email}}`" },
            { type: "mrkdwn", text: "*Gói đăng ký:*\n{{pricingPlan}}" },
            { type: "mrkdwn", text: "*Nguồn giới thiệu:*\n{{referralSource}}" },
            { type: "mrkdwn", text: "*Chiến dịch:*\n{{campaignName}}" },
            { type: "mrkdwn", text: "*Địa chỉ IP:*\n`{{ipAddress}}`" },
            { type: "mrkdwn", text: "*Quốc gia:*\n{{signupCountry}} ({{location}})" }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Thiết bị sử dụng:*\n`{{device}}`\n*Nhà mạng (ISP):*\n`{{ispProvider}}`"
          }
        },
        {
          type: "divider"
        },
        {
          type: "actions",
          elements: [
            { type: "button", text: "Xem hồ sơ quản trị", url: "{{profileUrl}}", style: "primary" }
          ]
        }
      ]
    },
    description: "Gửi cấu trúc Block Kit thông báo thành viên mới đăng ký qua kênh Slack.",
    isActive: true
  },
  {
    name: "Báo động Discord: Phát hiện IP brute force bị chặn",
    eventKey: "security.ip_banned",
    channel: "discord",
    target: "admin",
    content: "Cảnh báo an ninh mạng: Hệ thống VaniStudio Sentinel đã phát hiện và chặn một địa chỉ IP có hành vi nguy hiểm.",
    variables: [
      "incidentId",
      "severityLevel",
      "ipAddress",
      "country",
      "city",
      "isp",
      "totalRequests",
      "failedEndpoints",
      "reason",
      "bannedAt",
      "blockDuration",
      "userAgent",
      "firewallRuleId",
      "adminPanelUrl"
    ],
    extraConfig: {
      discordEmbeds: [
        {
          colorHex: "#EF4444",
          color: 15680580,
          title: "🚨 CẢNH BÁO AN NINH CẤP ĐỘ ĐỎ: CHẶN IP ĐỘC HẠI",
          description: "Tường lửa thông minh VaniStudio Sentinel phát hiện dấu hiệu tấn công Brute Force / DDoS cường độ cao vượt quá ngưỡng an toàn cho phép và đã tiến hành chặn vĩnh viễn địa chỉ IP nguồn để bảo vệ máy chủ.",
          author: {
            name: "VaniStudio Sentinel Security Engine"
          },
          fields: [
            { name: "Mã sự cố (Incident ID)", value: "`{{incidentId}}`", inline: true },
            { name: "Mức độ nghiêm trọng", value: "🔴 **{{severityLevel}}**", inline: true },
            { name: "Địa chỉ IP bị chặn", value: "`{{ipAddress}}`", inline: true },
            { name: "Quốc gia & Khu vực", value: "🗺️ {{country}} ({{city}})", inline: true },
            { name: "Nhà cung cấp ISP", value: "🌐 {{isp}}", inline: true },
            { name: "Giao thức", value: "💻 HTTPS / JSON-RPC", inline: true },
            { name: "Tổng số Request độc hại", value: "📈 `{{totalRequests}}` requests", inline: true },
            { name: "Đường dẫn bị tấn công", value: "🛑 `{{failedEndpoints}}`", inline: true },
            { name: "Lý do hệ thống chặn", value: "⚠️ **{{reason}}**", inline: false },
            { name: "Thời gian chặn", value: "⏰ {{bannedAt}}", inline: true },
            { name: "Thời hạn cấm truy cập", value: "⏳ {{blockDuration}}", inline: true },
            { name: "Thiết bị tấn công (User Agent)", value: "```{{userAgent}}```", inline: false }
          ],
          footer: {
            text: "Mã quy tắc tường lửa: {{firewallRuleId}} • VaniStudio Security Sentinel Monitoring"
          }
        }
      ]
    },
    description: "Cảnh báo bảo mật nâng cao gửi qua Discord Rich Embed khi phát hiện và chặn IP spam.",
    isActive: true
  },
  {
    name: "Cảnh báo Telegram: Phát hiện IP brute force bị chặn",
    eventKey: "security.ip_banned",
    channel: "telegram",
    target: "admin",
    content: "🚨 <b>CẢNH BÁO KHẨN CẤP: BẢO VỆ MÁY CHỦ THÀNH CÔNG</b>\n\nTường lửa VaniStudio Sentinel vừa ngăn chặn hành vi xâm nhập trái phép:\n• <b>Mã sự cố (ID):</b> <code>#{{incidentId}}</code>\n• <b>Mức độ cảnh báo:</b> 🔴 <b>{{severityLevel}}</b>\n• <b>Địa chỉ IP nguồn:</b> <code>{{ipAddress}}</code>\n• <b>Quốc gia:</b> {{country}} (Thành phố: {{city}})\n• <b>Nhà mạng (ISP):</b> <code>{{isp}}</code>\n• <b>Lý do xử lý:</b> <u>{{reason}}</u>\n• <b>Tổng yêu cầu ghi nhận:</b> <code>{{totalRequests}} requests</code>\n• <b>Endpoint bị spam:</b> <code>{{failedEndpoints}}</code>\n• <b>Thời gian chặn:</b> <code>{{bannedAt}}</code>\n• <b>Hiệu lực cấm:</b> <code>{{blockDuration}}</code>\n\n⚙️ <b>Thao tác khẩn cấp:</b>\n👉 <a href=\"{{adminPanelUrl}}\">Mở danh sách IP bị cấm trên Admin Panel</a>\n\n🚫 <i>Địa chỉ IP này đã được đẩy lên Cloudflare Firewall API để cấm truy cập ở mức CDN. Không cần xử lý thủ công thêm.</i>",
    variables: [
      "incidentId",
      "severityLevel",
      "ipAddress",
      "country",
      "city",
      "isp",
      "reason",
      "totalRequests",
      "failedEndpoints",
      "bannedAt",
      "blockDuration",
      "adminPanelUrl"
    ],
    extraConfig: {
      parseMode: "HTML",
      telegramInlineKeyboard: {
        rows: [
          {
            buttons: [
              { text: "🛠️ Quản Lý Tường Lửa", url: "{{adminPanelUrl}}" }
            ]
          }
        ]
      }
    },
    description: "Cảnh báo bảo mật gửi qua tin nhắn Telegram khi phát hiện và chặn IP spam.",
    isActive: true
  },
  {
    name: "Cảnh báo Slack: Phát hiện IP brute force bị chặn",
    eventKey: "security.ip_banned",
    channel: "slack",
    target: "admin",
    content: "Cảnh báo an ninh: Phát hiện và chặn địa chỉ IP brute force.",
    variables: [
      "incidentId",
      "severityLevel",
      "ipAddress",
      "isp",
      "country",
      "city",
      "bannedAt",
      "blockDuration",
      "totalRequests",
      "failedEndpoints",
      "reason",
      "firewallLink",
      "ignoreLink"
    ],
    extraConfig: {
      slackBlocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🚨 CẢNH BÁO AN NINH CẤP ĐỘ CAO"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Hệ thống VaniStudio Sentinel* vừa phát hiện hoạt động tấn công nghi vấn có chủ đích và đã tự động thực thi luật chặn tường lửa."
          }
        },
        {
          type: "divider"
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: "*Mã sự cố:*\n`{{incidentId}}`" },
            { type: "mrkdwn", text: "*Mức độ nghiêm trọng:*\n*{{severityLevel}}*" },
            { type: "mrkdwn", text: "*Địa chỉ IP nguồn:*\n`{{ipAddress}}`" },
            { type: "mrkdwn", text: "*Nhà mạng & Quốc gia:*\n{{isp}} ({{country}}, {{city}})" },
            { type: "mrkdwn", text: "*Thời gian chặn:*\n{{bannedAt}}" },
            { type: "mrkdwn", text: "*Thời hạn cấm:*\n`{{blockDuration}}`" },
            { type: "mrkdwn", text: "*Tổng số request:*\n`{{totalRequests}}` requests" },
            { type: "mrkdwn", text: "*Endpoints mục tiêu:*\n`{{failedEndpoints}}`" }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Lý do cấm truy cập:*\n`{{reason}}`"
          }
        },
        {
          type: "divider"
        },
        {
          type: "actions",
          elements: [
            { type: "button", text: "Quản lý Firewall IP", url: "{{firewallLink}}", style: "danger" },
            { type: "button", text: "Bỏ qua cảnh báo", url: "{{ignoreLink}}" }
          ]
        }
      ]
    },
    description: "Cảnh báo bảo mật gửi qua Slack Block Kit khi phát hiện và chặn IP spam.",
    isActive: true
  },
  {
    name: "Email tự động phản hồi khách hàng gửi liên hệ",
    eventKey: "contact.new_submission",
    channel: "email",
    target: "client",
    subject: "Xác nhận tiếp nhận yêu cầu liên hệ thành công [Mã vé: #{{ticketId}}] - VaniStudio",
    content: "Chào {{name}},\n\nCảm ơn bạn đã gửi thư liên hệ tới VaniStudio. \n\nChúng tôi xin thông báo đã tiếp nhận yêu cầu của bạn thành công. Hệ thống đã tự động tạo một vé hỗ trợ có thông tin chi tiết như sau:\n• Mã số vé (Ticket ID): #{{ticketId}}\n• Họ tên khách hàng: {{name}}\n• Email liên hệ: {{email}}\n• Danh mục yêu cầu: {{category}}\n• Tiêu đề liên hệ: {{subject}}\n• Thời gian ghi nhận: {{createdAt}}\n• Thời gian phản hồi dự kiến: {{expectedResponseTime}}\n\nChi tiết nội dung tin nhắn bạn đã gửi:\n--------------------------------------------------\n\"{{message}}\"\n--------------------------------------------------\n\nCác liên kết hữu ích dành cho bạn khi chờ phản hồi:\n- Bạn có thể theo dõi tiến trình xử lý yêu cầu hoặc cập nhật thêm thông tin tại Cổng hỗ trợ khách hàng: {{supportPortalUrl}}\n- Trong lúc chờ đợi, bạn có thể tham khảo mục Câu hỏi thường gặp (FAQ) của chúng tôi để tìm câu trả lời nhanh chóng: {{faqLink}}\n\n*Lưu ý:* Nếu bạn có thêm bất kỳ thông tin nào cần bổ sung cho yêu cầu này, vui lòng phản hồi trực tiếp vào email này mà không cần thay đổi tiêu đề thư. Đội ngũ kỹ thuật viên và chuyên viên của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.\n\nTrân trọng,\nĐội ngũ CSKH và Hỗ trợ Kỹ thuật VaniStudio\nsupport@vanistudio.com",
    variables: [
      "name",
      "ticketId",
      "email",
      "category",
      "subject",
      "createdAt",
      "expectedResponseTime",
      "message",
      "supportPortalUrl",
      "faqLink"
    ],
    extraConfig: {
      senderName: "VaniStudio Customer Support",
      senderEmail: "support@vanistudio.com"
    },
    description: "Email tự động gửi phản hồi xác nhận cho khách hàng khi họ gửi form liên hệ.",
    isActive: true
  },
  {
    name: "Email thông báo Admin: Có liên hệ mới",
    eventKey: "contact.new_submission",
    channel: "email",
    target: "admin",
    subject: "🚨 [Liên hệ mới] Đơn hàng/Hỗ trợ khách hàng - Mã vé #{{ticketId}} - {{name}}",
    content: "Chào Admin,\n\nHệ thống VaniStudio CRM vừa tiếp nhận biểu mẫu liên hệ trực tuyến mới từ khách hàng. Vui lòng kiểm duyệt và phản hồi sớm nhất có thể.\n\nTHÔNG TIN CHI TIẾT VÉ HỖ TRỢ:\n• Mã số vé: #{{ticketId}}\n• Danh mục: {{category}}\n• Độ ưu tiên: {{priorityLevel}}\n• Họ và tên khách hàng: {{name}}\n• Địa chỉ Email: {{email}}\n• Số điện thoại: {{phone}}\n• Số vé đã gửi trước đây của user này: {{previousTicketsCount}}\n• Thời gian gửi: {{createdAt}}\n• URL nguồn trang gửi liên hệ: {{referrerUrl}}\n• Bộ phận tiếp nhận xử lý: {{assignedTeam}}\n\nTHÔNG TIN HẠ TẦNG KẾT NỐI:\n• Địa chỉ IP người gửi: {{ipAddress}}\n• Thiết bị & Hệ điều hành sử dụng: {{deviceInfo}}\n\nNỘI DUNG YÊU CẦU CHI TIẾT TỪ KHÁCH HÀNG:\n--------------------------------------------------\nChủ đề: {{subject}}\n\nNội dung:\n\"{{message}}\"\n--------------------------------------------------\n\nHƯỚNG DẪN XỬ LÝ DÀNH CHO ADMIN:\n1. Đăng nhập trang quản trị CRM để phân công hoặc trả lời trực tiếp tại: {{inboxUrl}}\n2. Bạn cũng có thể phản hồi trực tiếp qua hòm thư điện tử cá nhân của khách hàng bằng cách bấm vào: mailto:{{email}}?subject=Re:%20[VaniStudio]%20{{subject}}\n\nTrân trọng,\nHệ thống CRM Tự động VaniStudio Engine",
    variables: [
      "ticketId",
      "category",
      "priorityLevel",
      "name",
      "email",
      "phone",
      "previousTicketsCount",
      "createdAt",
      "referrerUrl",
      "assignedTeam",
      "ipAddress",
      "deviceInfo",
      "subject",
      "message",
      "inboxUrl"
    ],
    extraConfig: {
      senderName: "VaniStudio CRM Dispatcher",
      senderEmail: "crm@vanistudio.com"
    },
    description: "Email thông báo cho Admin khi có khách hàng gửi biểu mẫu liên hệ.",
    isActive: true
  },
  {
    name: "Thông báo Telegram: Có liên hệ mới từ khách hàng",
    eventKey: "contact.new_submission",
    channel: "telegram",
    target: "admin",
    content: "📬 <b>CÓ LIÊN HỆ MỚI TỪ WEBSITE VANI STUDIO</b>\n\nHệ thống vừa ghi nhận biểu mẫu liên hệ mới:\n• <b>Mã số vé:</b> <code>#{{ticketId}}</code>\n• <b>Phân loại:</b> <code>{{category}}</code>\n• <b>Độ ưu tiên:</b> 🚨 <b>{{priority}}</b>\n• <b>Họ tên khách hàng:</b> <code>{{name}}</code>\n• <b>Email liên lạc:</b> <code>{{email}}</code>\n• <b>Số điện thoại:</b> <code>{{phone}}</code>\n• <b>Chủ đề:</b> <u>{{subject}}</u>\n• <b>Nội dung tin nhắn:</b>\n<blockquote>\"{{message}}\"</blockquote>\n• <b>Thời gian gửi:</b> <code>{{createdAt}}</code>\n\n⚙️ <b>Thao tác xử lý:</b>\n👉 <a href=\"{{inboxUrl}}\">Xem & Trả lời trên Admin Panel</a>",
    variables: [
      "ticketId",
      "category",
      "priority",
      "name",
      "email",
      "phone",
      "subject",
      "message",
      "createdAt",
      "inboxUrl"
    ],
    extraConfig: {
      parseMode: "HTML",
      telegramInlineKeyboard: {
        rows: [
          {
            buttons: [
              { text: "📥 Xem & Trả Lời Liên Hệ", url: "{{inboxUrl}}" }
            ]
          }
        ]
      }
    },
    description: "Tin nhắn gửi vào Telegram của Admin thông báo có liên hệ mới.",
    isActive: true
  },
  {
    name: "Cảnh báo Discord: Có liên hệ mới từ khách hàng",
    eventKey: "contact.new_submission",
    channel: "discord",
    target: "admin",
    content: "Nhận được một yêu cầu liên hệ mới cần xử lý từ khách hàng trực tuyến.",
    variables: [
      "ticketId",
      "category",
      "priority",
      "name",
      "email",
      "phone",
      "deviceInfo",
      "subject",
      "message",
      "createdAt",
      "inboxUrl"
    ],
    extraConfig: {
      discordEmbeds: [
        {
          colorHex: "#3B82F6",
          color: 3900150,
          title: "📬 LIÊN HỆ MỚI TỪ KHÁCH HÀNG (TICKET #{{ticketId}})",
          description: "Một vé hỗ trợ mới vừa được tạo từ biểu mẫu liên hệ trên trang chủ VaniStudio.",
          author: {
            name: "VaniStudio CRM Center"
          },
          fields: [
            { name: "Mã số vé", value: "`#{{ticketId}}`", inline: true },
            { name: "Danh mục", value: "📁 {{category}}", inline: true },
            { name: "Mức độ ưu tiên", value: "⚡ **{{priority}}**", inline: true },
            { name: "Họ tên khách hàng", value: "`{{name}}`", inline: true },
            { name: "Email liên lạc", value: "`{{email}}`", inline: true },
            { name: "Số điện thoại", value: "`{{phone}}`", inline: true },
            { name: "Thiết bị ghi nhận", value: "💻 {{deviceInfo}}", inline: false },
            { name: "Chủ đề liên hệ", value: "**{{subject}}**", inline: false },
            { name: "Nội dung yêu cầu", value: ">>> {{message}}", inline: false },
            { name: "Thời gian gửi", value: "⏰ {{createdAt}}", inline: true }
          ],
          footer: {
            text: "VaniStudio CRM Engine Auto-Notification"
          }
        }
      ]
    },
    description: "Gửi Rich Embed thông tin liên hệ mới vào Discord của quản trị viên.",
    isActive: true
  },
  {
    name: "Thông báo Slack: Nhận liên hệ mới từ khách hàng",
    eventKey: "contact.new_submission",
    channel: "slack",
    target: "admin",
    content: "Nhận liên hệ mới từ khách hàng",
    variables: [
      "ticketId",
      "category",
      "priority",
      "name",
      "email",
      "phone",
      "deviceInfo",
      "createdAt",
      "subject",
      "message",
      "inboxUrl"
    ],
    extraConfig: {
      slackBlocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📬 LIÊN HỆ MỚI TỪ KHÁCH HÀNG (TICKET #{{ticketId}})"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Hệ thống VaniStudio CRM* vừa tiếp nhận một yêu cầu hỗ trợ mới cần phản hồi gấp."
          }
        },
        {
          type: "divider"
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: "*Mã số vé:*\n`#{{ticketId}}`" },
            { type: "mrkdwn", text: "*Phân loại:*\n{{category}}" },
            { type: "mrkdwn", text: "*Độ ưu tiên:*\n*{{priority}}*" },
            { type: "mrkdwn", text: "*Khách hàng:*\n{{name}}" },
            { type: "mrkdwn", text: "*Email liên hệ:*\n`{{email}}`" },
            { type: "mrkdwn", text: "*Số điện thoại:*\n`{{phone}}`" },
            { type: "mrkdwn", text: "*Thiết bị:*\n`{{deviceInfo}}`" },
            { type: "mrkdwn", text: "*Thời gian gửi:*\n{{createdAt}}" }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Chủ đề liên hệ:*\n*{{subject}}*"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Nội dung tin nhắn:*\n>>>{{message}}"
          }
        },
        {
          type: "divider"
        },
        {
          type: "actions",
          elements: [
            { type: "button", text: "Xem trên Admin Panel", url: "{{inboxUrl}}", style: "primary" }
          ]
        }
      ]
    },
    description: "Gửi cấu trúc khối (Block Kit) thông tin liên hệ mới của khách hàng vào kênh Slack hỗ trợ.",
    isActive: true
  },
  {
    name: "Email thông báo: Kích hoạt bảo mật 2FA",
    eventKey: "auth.two_factor_enabled",
    channel: "email",
    target: "client",
    subject: "Xác nhận kích hoạt tính năng Xác thực 2 lớp (2FA) bảo vệ tài khoản - VaniStudio",
    content: "Chào {{name}},\n\nChúng tôi gửi email này để xác nhận rằng tính năng Xác thực 2 lớp (2FA) đã được kích hoạt thành công cho tài khoản VaniStudio của bạn vào lúc {{enabledAt}}.\n\nTHÔNG TIN CHI TIẾT THIẾT LẬP:\n• Trạng thái 2FA: Đã kích hoạt (ENABLED)\n• Phương thức xác thực chính: Ứng dụng xác thực mã OTP (Google Authenticator / Authy)\n• Địa chỉ IP yêu cầu: {{ipAddress}}\n• Vị trí địa lý ghi nhận: {{location}}\n• Thiết bị & Trình duyệt thực hiện: {{device}} (Hệ điều hành: {{operatingSystem}}, Trình duyệt: {{browserName}})\n\nKể từ thời điểm này, mỗi khi đăng nhập vào hệ thống từ bất kỳ thiết bị mới nào, bạn sẽ được yêu cầu nhập mã OTP gồm 6 chữ số được tạo ngẫu nhiên từ ứng dụng xác thực của bạn để hoàn tất đăng nhập. Điều này giúp nâng cao đáng kể mức độ bảo mật cho tài khoản của bạn, ngăn chặn các hành vi đánh cắp mật khẩu thông thường.\n\n*Hành động cần thiết:*\n- Hãy đảm bảo bạn đã lưu trữ các Mã dự phòng khôi phục (Backup Codes) ở một nơi an toàn. Nếu bạn làm mất thiết bị cài ứng dụng xác thực, các mã này là cách duy nhất giúp bạn tự lấy lại tài khoản mà không cần thông qua hỗ trợ của quản trị viên. Bạn có thể xem lại mã dự phòng tại: {{backupCodesUrl}}.\n- Nếu bạn cần chỉnh sửa hoặc thay đổi phương thức xác thực, vui lòng truy cập: {{securitySettingsUrl}}.\n\n🚨 *CẢNH BÁO BẢO MẬT KHẨN CẤP:*\nNếu bạn không phải là người thực hiện kích hoạt 2FA này, điều đó có nghĩa mật khẩu của bạn đã bị lộ và ai đó đang cố tình chiếm đoạt tài khoản. Vui lòng bấm vào liên kết khóa khẩn cấp dưới đây ngay lập tức để tạm đóng tài khoản và liên hệ với nhóm hỗ trợ kỹ thuật của chúng tôi:\n👉 {{lockAccountLink}}\n\nTrân trọng,\nĐội ngũ Bảo mật An ninh mạng VaniStudio\n{{supportEmail}}",
    variables: [
      "name",
      "enabledAt",
      "ipAddress",
      "location",
      "device",
      "operatingSystem",
      "browserName",
      "backupCodesUrl",
      "securitySettingsUrl",
      "lockAccountLink",
      "supportEmail"
    ],
    extraConfig: {
      senderName: "VaniStudio Security Team",
      senderEmail: "security@vanistudio.com"
    },
    description: "Email thông báo cho khách hàng khi họ kích hoạt thành công tính năng bảo mật 2FA.",
    isActive: true
  },
  {
    name: "Email thông báo: Hủy kích hoạt bảo mật 2FA",
    eventKey: "auth.two_factor_disabled",
    channel: "email",
    target: "client",
    subject: "CẢNH BÁO NGUY HIỂM: Tính năng Xác thực 2 lớp (2FA) đã bị tắt - VaniStudio",
    content: "Chào {{name}},\n\nĐây là thông báo khẩn cấp từ trung tâm bảo mật VaniStudio. Tính năng Xác thực hai lớp (2FA) trên tài khoản của bạn đã bị HỦY KÍCH HOẠT thành công vào lúc {{disabledAt}}.\n\nCHI TIẾT PHIÊN THAY ĐỔI:\n• Trạng thái bảo mật 2FA: Đã tắt (DISABLED)\n• Địa chỉ IP thực hiện: {{ipAddress}}\n• Vị trí địa lý ghi nhận: {{location}}\n• Thiết bị thực hiện: {{device}} (Hệ điều hành: {{operatingSystem}}, Trình duyệt: {{browserName}})\n\n⚠️ *CẢNH BÁO BẢO MẬT QUAN TRỌNG:*\nKhi tính năng 2FA bị tắt, tài khoản của bạn sẽ không còn được bảo vệ bởi lớp xác thực thứ hai nữa. Tài khoản lúc này chỉ được bảo mật bằng một lớp mật khẩu thông thường, khiến cho nguy cơ bị xâm nhập, rò rỉ dữ liệu hoặc bị tấn công brute force tăng lên cực kỳ cao.\n\nChúng tôi khuyến cáo bạn nên kích hoạt lại 2FA càng sớm càng tốt tại:\n👉 {{reEnableLink}}\n\n🚨 *HÀNH ĐỘNG KHẨN CẤP NẾU BẠN KHÔNG TẮT 2FA:*\nNếu bạn không thực hiện việc tắt 2FA này, tài khoản của bạn đã bị kẻ tấn công chiếm quyền kiểm soát. Vui lòng thực hiện các bước sau ngay lập tức:\n1. Đăng nhập và kích hoạt lại 2FA ngay lập tức tại: {{securitySettingsUrl}}.\n2. Tiến hành đổi mật khẩu đăng nhập sang một mật khẩu mới mạnh hơn.\n3. Nếu không thể đăng nhập, hãy liên hệ ngay với phòng Hỗ trợ An ninh của chúng tôi qua địa chỉ email {{supportEmail}} để được khóa tài khoản và tiến hành xác minh danh tính khôi phục.\n\nTrân trọng,\nĐội ngũ Bảo mật An ninh mạng VaniStudio\n{{supportEmail}}",
    variables: [
      "name",
      "disabledAt",
      "ipAddress",
      "location",
      "device",
      "operatingSystem",
      "browserName",
      "reEnableLink",
      "securitySettingsUrl",
      "supportEmail"
    ],
    extraConfig: {
      senderName: "VaniStudio Security Team",
      senderEmail: "security@vanistudio.com"
    },
    description: "Email thông báo cho khách hàng khi họ tắt tính năng bảo mật 2FA.",
    isActive: true
  },
  {
    name: "Email gửi mã OTP xác nhận",
    eventKey: "auth.otp_verification",
    channel: "email",
    target: "client",
    subject: "Mã xác thực OTP (Mã bảo mật dùng một lần) tài khoản VaniStudio của bạn",
    content: "Chào {{name}},\n\nChúng tôi nhận được yêu cầu lấy mã OTP xác minh giao dịch hoặc xác thực đăng nhập tài khoản VaniStudio của bạn.\n\nMã xác thực một lần (OTP) của bạn là:\n👉 **{{otpCode}}** 👈\n\n*Thông tin bảo mật quan trọng về mã OTP này:*\n- Mã OTP này chỉ có hiệu lực sử dụng duy nhất 1 lần và sẽ tự động hết hạn sau đúng {{expireMinutes}} phút kể từ khi email này được gửi đi (hết hạn vào lúc {{expireTime}}).\n- Loại hành động xác thực: {{actionType}}\n- Địa chỉ IP thực hiện yêu cầu: {{ipAddress}} (Khu vực ước tính: {{location}})\n- Thiết bị gửi yêu cầu: {{device}} (Hệ điều hành: {{operatingSystem}}, Trình duyệt: {{browserName}})\n\n🚫 *Nguyên tắc an toàn bảo mật tài khoản:*\n- Tuyệt đối KHÔNG chia sẻ mã OTP này với bất kỳ ai, kể cả nhân viên hỗ trợ của VaniStudio. Chúng tôi không bao giờ yêu cầu bạn cung cấp mã OTP qua điện thoại, email hoặc các kênh chat.\n- Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn và mã này sẽ tự động hết hiệu lực sau vài phút.\n\nNếu bạn phát hiện thấy nhiều email yêu cầu OTP liên tiếp mà không phải do mình thực hiện, vui lòng liên hệ ngay với hòm thư an ninh của chúng tôi tại {{supportEmail}} để được tư vấn bảo vệ tài khoản.\n\nTrân trọng,\nĐội ngũ Kỹ thuật & Bảo mật Hệ thống VaniStudio",
    variables: [
      "name",
      "otpCode",
      "expireMinutes",
      "expireTime",
      "actionType",
      "ipAddress",
      "location",
      "device",
      "operatingSystem",
      "browserName",
      "supportEmail"
    ],
    extraConfig: {
      senderName: "VaniStudio Security System",
      senderEmail: "security@vanistudio.com"
    },
    description: "Email gửi mã OTP xác thực đăng nhập hoặc thực hiện giao dịch quan trọng.",
    isActive: true
  },
  {
    name: "Email gửi mã xác minh tài khoản mới",
    eventKey: "auth.register_verification",
    channel: "email",
    target: "client",
    subject: "Mã xác minh kích hoạt tài khoản thành viên mới tại VaniStudio",
    content: "Chào {{name}},\n\nCảm ơn bạn đã lựa chọn đăng ký tài khoản tại hệ thống VaniStudio! Bước cuối cùng để bạn hoàn tất quy trình thiết lập tài khoản và bắt đầu sử dụng tài nguyên của chúng tôi là xác minh địa chỉ email đăng ký.\n\nMã xác minh kích hoạt của bạn là:\n👉 **{{verificationCode}}** 👈\n\n*Thông tin hướng dẫn sử dụng mã:*\n- Mã này có hiệu lực sử dụng trong vòng đúng {{expireMinutes}} phút kể từ thời điểm gửi thư này (hết hiệu lực vào lúc {{expireTime}}).\n- Vui lòng sao chép và nhập chính xác chuỗi mã trên vào ô xác minh trên trình duyệt của bạn.\n- Thiết bị đăng ký ghi nhận: {{device}} tại địa chỉ IP: {{ipAddress}}.\n\nNếu mã trên đã hết hạn sử dụng, bạn có thể gửi lại yêu cầu mã xác minh mới tại liên kết sau:\n👉 {{resendLink}}\n\nNếu bạn có bất kỳ câu hỏi nào trong quá trình kích hoạt tài khoản hoặc gặp sự cố kỹ thuật, vui lòng tham khảo trang Trợ giúp của chúng tôi tại {{helpLink}} hoặc gửi thư về email hỗ trợ để được hướng dẫn trực tiếp.\n\nChào mừng bạn gia nhập cộng đồng sáng tạo của chúng tôi!\n\nTrân trọng,\nĐội ngũ Vận hành & Phát triển Cộng đồng VaniStudio",
    variables: [
      "name",
      "verificationCode",
      "expireMinutes",
      "expireTime",
      "device",
      "ipAddress",
      "resendLink",
      "helpLink"
    ],
    extraConfig: {
      senderName: "VaniStudio Registration Desk",
      senderEmail: "welcome@vanistudio.com"
    },
    description: "Email gửi mã xác nhận khi đăng ký tài khoản mới để kích hoạt tài khoản.",
    isActive: true
  },
  {
    name: "Email cảnh báo: Thay đổi mật khẩu thành công",
    eventKey: "auth.password_changed",
    channel: "email",
    target: "client",
    subject: "🚨 CẢNH BÁO BẢO MẬT: Mật khẩu tài khoản VaniStudio đã được thay đổi",
    content: "Chào {{name}},\n\nĐây là email thông báo bảo mật chính thức của VaniStudio. Mật khẩu tài khoản đăng nhập của bạn (liên kết với hòm thư {{email}}) đã được THAY ĐỔI THÀNH CÔNG vào lúc {{changedAt}}.\n\nCHI TIẾT PHIÊN THAY ĐỔI MẬT KHẨU:\n• Địa chỉ IP thực hiện thay đổi: {{ipAddress}}\n• Vị trí địa lý ước tính: {{location}}\n• Thiết bị thực hiện: {{device}} (Hệ điều hành: {{operatingSystem}}, Trình duyệt: {{browserName}})\n\nNếu chính bạn là người đã thực hiện hành động thay đổi mật khẩu này, vui lòng bỏ qua nội dung email này, mật khẩu mới của bạn đã có hiệu lực để đăng nhập.\n\n🚨 *HÀNH ĐỘNG KHẨN CẤP NẾU BẠN KHÔNG PHẢI NGƯỜI THAY ĐỔI:*\nNếu bạn không hề thực hiện thay đổi mật khẩu này, tài khoản của bạn hiện tại đã bị kẻ gian chiếm giữ trái phép. Bạn cần thực hiện các hành động khẩn cấp sau đây ngay lập tức:\n1. Hãy bấm ngay vào đường liên kết dưới đây để thực hiện KHÓA KHẨN CẤP tài khoản của bạn, ngăn chặn các hành vi phá hoại dữ liệu hoặc rút tiền/mua sản phẩm:\n👉 {{lockAccountLink}}\n2. Thử tiến hành khôi phục mật khẩu thông qua email tại trang: {{passwordResetUrl}}.\n3. Gửi thư điện tử trực tiếp tới phòng hỗ trợ khẩn cấp của chúng tôi tại {{supportEmail}} để các quản trị viên can thiệp kịp thời.\n\nHãy giữ email này cẩn thận vì nó chứa các thông tin IP và thiết bị của kẻ xâm nhập để cung cấp cho cơ quan điều tra an ninh nếu cần thiết.\n\nTrân trọng,\nĐội ngũ An ninh mạng và Giám sát Tài khoản VaniStudio",
    variables: [
      "name",
      "email",
      "changedAt",
      "ipAddress",
      "location",
      "device",
      "operatingSystem",
      "browserName",
      "lockAccountLink",
      "passwordResetUrl",
      "supportEmail"
    ],
    extraConfig: {
      senderName: "VaniStudio Security Command",
      senderEmail: "security@vanistudio.com"
    },
    description: "Email gửi thông báo bảo mật cho người dùng khi mật khẩu tài khoản của họ được cập nhật thành công.",
    isActive: true
  },
  {
    name: "Email cảnh báo: Đăng nhập từ thiết bị hoặc địa điểm lạ",
    eventKey: "auth.login_detected",
    channel: "email",
    target: "client",
    subject: "⚠️ Cảnh báo an ninh: Phát hiện phiên đăng nhập mới từ thiết bị hoặc địa điểm lạ",
    content: "Chào {{name}},\n\nHệ thống giám sát bảo mật tài khoản VaniStudio vừa ghi nhận một hoạt động đăng nhập thành công vào tài khoản của bạn từ một thiết bị hoặc vị trí địa lý mới chưa từng được sử dụng trước đây.\n\nTHÔNG TIN CHI TIẾT PHIÊN ĐĂNG NHẬP MỚI:\n• Thời gian đăng nhập: {{loginAt}}\n• Địa chỉ IP kết nối: {{ipAddress}}\n• Nhà cung cấp mạng (ISP): {{ispProvider}}\n• Vị trí địa lý ước tính: {{location}}\n• Thiết bị ghi nhận: {{device}} (Hệ điều hành: {{operatingSystem}}, Trình duyệt: {{browserName}})\n\nIf hoạt động đăng nhập này do chính bạn thực hiện (ví dụ: bạn đổi máy tính mới, sử dụng điện thoại mới, đổi mạng Wifi công cộng hoặc sử dụng dịch vụ VPN ẩn danh), bạn có thể hoàn toàn yên tâm và bỏ qua email này.\n\n🚨 *HÀNH ĐỘNG CẦN THIẾT NẾU ĐÂY KHÔNG PHẢI BẠN:*\nNếu phiên đăng nhập này được thực hiện bởi một người nào khác, tài khoản của bạn đã bị rò rỉ thông tin đăng nhập. Vui lòng hành động ngay lập tức để bảo vệ dữ liệu:\n1. Nhấp vào liên kết dưới đây để thực hiện ĐĂNG XUẤT tài khoản ngay lập tức khỏi tất cả các phiên làm việc và thiết bị khác:\n👉 {{logoutAllLink}}\n2. Thực hiện thay đổi mật khẩu đăng nhập ngay lập tức sang một mật khẩu mạnh và duy nhất.\n3. Kích hoạt tính năng bảo mật xác thực hai lớp (2FA) tại {{securitySettingsUrl}} nếu chưa kích hoạt để tăng thêm lớp phòng thủ chắc chắn.\n\nNếu cần bất kỳ hỗ trợ nào từ chúng tôi, hãy liên hệ qua hòm thư điện tử {{supportEmail}} bất kỳ lúc nào.\n\nTrân trọng,\nĐội ngũ Giám sát Bảo mật và An toàn Tài khoản VaniStudio",
    variables: [
      "name",
      "loginAt",
      "ipAddress",
      "ispProvider",
      "location",
      "device",
      "operatingSystem",
      "browserName",
      "logoutAllLink",
      "securitySettingsUrl",
      "supportEmail"
    ],
    extraConfig: {
      senderName: "VaniStudio Security Command",
      senderEmail: "security@vanistudio.com"
    },
    description: "Email gửi cảnh báo bảo mật khi phát hiện đăng nhập từ IP, vị trí hoặc thiết bị chưa từng sử dụng trước đây.",
    isActive: true
  },
  {
    name: "Thông báo Telegram: Có bình luận mới trên Blog",
    eventKey: "blog.comment_created",
    channel: "telegram",
    target: "admin",
    content: "💬 <b>CÓ BÌNH LUẬN MỚI CẦN DUYỆT TRÊN BLOG</b>\n\nHệ thống ghi nhận bình luận mới từ độc giả đang chờ duyệt hiển thị:\n• <b>Mã bình luận:</b> <code>#{{commentId}}</code>\n• <b>Bài viết:</b> <a href=\"{{postUrl}}\">{{postTitle}}</a>\n• <b>Họ tên tác giả:</b> <code>{{authorName}}</code>\n• <b>Email tác giả:</b> <code>{{authorEmail}}</code>\n• <b>Website:</b> {{authorWebsite}}\n• <b>Địa chỉ IP tác giả:</b> <code>{{authorIp}}</code>\n• <b>Trạng thái:</b> 🟡 <code>{{status}}</code>\n• <b>Thời gian gửi:</b> <code>{{createdAt}}</code>\n\n📝 <b>Nội dung bình luận:</b>\n<blockquote>\"{{content}}\"</blockquote>\n\n⚙️ <b>Thao tác kiểm duyệt nhanh:</b>\n✅ <a href=\"{{approveUrl}}\">Phê duyệt hiển thị</a> | ❌ <a href=\"{{rejectUrl}}\">Từ chối ẩn</a> | 🚫 <a href=\"{{spamUrl}}\">Báo cáo Spam</a>",
    variables: [
      "commentId",
      "postUrl",
      "postTitle",
      "authorName",
      "authorEmail",
      "authorWebsite",
      "authorIp",
      "status",
      "createdAt",
      "content",
      "approveUrl",
      "rejectUrl",
      "spamUrl"
    ],
    extraConfig: {
      parseMode: "HTML",
      telegramInlineKeyboard: {
        rows: [
          {
            buttons: [
              { text: "✅ Phê Duyệt", url: "{{approveUrl}}" },
              { text: "❌ Từ Chối", url: "{{rejectUrl}}" }
            ]
          },
          {
            buttons: [
              { text: "🚫 Báo Cáo Spam", url: "{{spamUrl}}" }
            ]
          }
        ]
      }
    },
    description: "Thông báo qua Telegram cho quản trị viên khi có bình luận mới được gửi trên bài viết blog.",
    isActive: true
  },
  {
    name: "Cảnh báo Discord: Có bình luận mới trên Blog",
    eventKey: "blog.comment_created",
    channel: "discord",
    target: "admin",
    content: "Hệ thống kiểm duyệt ghi nhận bình luận mới từ độc giả đang chờ ban quản trị phê duyệt.",
    variables: [
      "commentId",
      "status",
      "createdAt",
      "authorName",
      "authorEmail",
      "authorWebsite",
      "authorIp",
      "postTitle",
      "postUrl",
      "content",
      "approveUrl",
      "rejectUrl",
      "spamUrl"
    ],
    extraConfig: {
      discordEmbeds: [
        {
          colorHex: "#F59E0B",
          color: 16096779,
          title: "💬 BÌNH LUẬN MỚI TRÊN BLOG CẦN KIỂM DUYỆT",
          description: "Nội dung phản hồi của độc giả bài viết Blog đã được gửi vào hàng đợi và đang chờ quản trị viên phê duyệt hiển thị công khai.",
          author: {
            name: "VaniStudio Blog Moderator"
          },
          fields: [
            { name: "Mã bình luận", value: "`#{{commentId}}`", inline: true },
            { name: "Trạng thái", value: "🟡 {{status}}", inline: true },
            { name: "Thời gian gửi", value: "⏰ {{createdAt}}", inline: true },
            { name: "Tác giả", value: "👤 `{{authorName}}`", inline: true },
            { name: "Email liên hệ", value: "✉️ `{{authorEmail}}`", inline: true },
            { name: "Website cá nhân", value: "🌐 {{authorWebsite}}", inline: true },
            { name: "Địa chỉ IP tác giả", value: "💻 `{{authorIp}}`", inline: true },
            { name: "Bài viết gốc", value: "🔗 [{{postTitle}}]({{postUrl}})", inline: false },
            { name: "Nội dung bình luận", value: "```{{content}}```", inline: false },
            { name: "Liên kết kiểm duyệt", value: "🔗 [Duyệt hiển thị]({{approveUrl}}) | [Từ chối ẩn]({{rejectUrl}}) | [Báo cáo Spam]({{spamUrl}})", inline: false }
          ],
          footer: {
            text: "VaniStudio Blog System Moderator Engine"
          }
        }
      ]
    },
    description: "Gửi Rich Embed thông tin bình luận mới cần duyệt trên Blog qua kênh Discord.",
    isActive: true
  },
  {
    name: "Thông báo Slack: Có bình luận mới trên Blog",
    eventKey: "blog.comment_created",
    channel: "slack",
    target: "admin",
    content: "Bình luận mới cần duyệt trên Blog",
    variables: [
      "commentId",
      "postUrl",
      "postTitle",
      "authorName",
      "authorEmail",
      "authorWebsite",
      "authorIp",
      "createdAt",
      "status",
      "content",
      "approveUrl",
      "rejectUrl",
      "spamUrl"
    ],
    extraConfig: {
      slackBlocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "💬 BÌNH LUẬN MỚI CẦN DUYỆT TRÊN BLOG (ID: #{{commentId}})"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Hệ thống kiểm duyệt VaniStudio* vừa nhận được một phản hồi mới từ độc giả cần được xem xét và phê duyệt hiển thị."
          }
        },
        {
          type: "divider"
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: "*Mã bình luận:*\n`#{{commentId}}`" },
            { type: "mrkdwn", text: "*Bài viết:*\n<{{postUrl}}|{{postTitle}}>" },
            { type: "mrkdwn", text: "*Tác giả:*\n{{authorName}}" },
            { type: "mrkdwn", text: "*Email:*\n`{{authorEmail}}`" },
            { type: "mrkdwn", text: "*Website:*\n{{authorWebsite}}" },
            { type: "mrkdwn", text: "*Địa chỉ IP:*\n`{{authorIp}}`" },
            { type: "mrkdwn", text: "*Thời gian gửi:*\n{{createdAt}}" },
            { type: "mrkdwn", text: "*Trạng thái:*\n*{{status}}*" }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Nội dung bình luận:*\n>>>\"{{content}}\""
          }
        },
        {
          type: "divider"
        },
        {
          type: "actions",
          elements: [
            { type: "button", text: "Phê duyệt hiển thị", url: "{{approveUrl}}", style: "primary" },
            { type: "button", text: "Từ chối ẩn", url: "{{rejectUrl}}", style: "danger" },
            { type: "button", text: "Báo cáo Spam", url: "{{spamUrl}}" }
          ]
        }
      ]
    },
    description: "Gửi thông tin bình luận mới qua Slack Block Kit để quản trị viên dễ dàng duyệt.",
    isActive: true
  },
  {
    name: "Email bàn giao License Key sản phẩm",
    eventKey: "license.issued",
    channel: "email",
    target: "client",
    subject: "Bàn giao chính thức Bản quyền sản phẩm & Hướng dẫn kích hoạt bản quyền - VaniStudio",
    content: "Chào {{name}},\n\nThay mặt VaniStudio, chúng tôi chân thành cảm ơn bạn đã tin tưởng mua sắm và sử dụng các sản phẩm công nghệ của chúng tôi. Giao dịch mua sản phẩm của bạn đã hoàn tất thành công và được hệ thống thanh toán tự động xác nhận.\n\nChúng tôi xin chính thức bàn giao thông tin bản quyền (License Key) và các tài liệu hướng dẫn kích hoạt đi kèm:\n\nTHÔNG TIN KHÁCH HÀNG & ĐƠN HÀNG:\n• Họ tên khách hàng: {{name}}\n• Mã số đơn hàng: #{{orderId}}\n• Thời gian giao dịch: {{issuedAt}}\n• Tổng chi phí thanh toán: {{price}} {{currency}}\n• Địa chỉ thanh toán ghi nhận: {{billingAddress}}\n\nTHÔNG TIN CHI TIẾT BẢN QUYỀN SẢN PHẨM:\n• Tên sản phẩm: **{{productName}}**\n• Phiên bản phát hành hiện tại: {{productVersion}}\n• Loại giấy phép sở hữu: {{licenseType}}\n• Số thiết bị kích hoạt tối đa: {{maxActivations}} thiết bị\n• Mã bản quyền (License Key): `{{licenseKey}}`\n• Thời gian hết hạn sử dụng: {{expiryDate}}\n• Thời hạn được hỗ trợ kỹ thuật miễn phí: {{supportDuration}}\n\nHƯỚNG DẪN KÍCH HOẠT VÀ CÀI ĐẶT NHANH:\n--------------------------------------------------\n{{activationGuide}}\n--------------------------------------------------\n\nCÁC ĐƯỜNG DẪN TÀI NGUYÊN HỮU ÍCH:\n- Tải bộ cài đặt sản phẩm gốc: {{downloadUrl}}\n- Xem tài liệu hướng dẫn kỹ thuật chi tiết: {{documentationUrl}}\n- Truy cập Cổng quản lý bản quyền khách hàng để xem lịch sử kích hoạt hoặc đổi thiết bị: {{customerPortalUrl}}\n\n⚠️ *Lưu ý bảo mật quan trọng:*\n- Vui lòng tuyệt đối không chia sẻ mã bản quyền này công khai hoặc chia sẻ cho bên thứ ba. Mỗi mã bản quyền gắn liền trực tiếp với tài khoản email của bạn và được kiểm soát thiết bị kích hoạt tự động qua máy chủ VaniStudio Activation Server.\n- Nếu phát hiện số lượng thiết bị kích hoạt vượt quá giới hạn cho phép ({{maxActivations}}), khóa bản quyền của bạn có thể bị tạm khóa tự động.\n\nNếu gặp bất kỳ khó khăn nào trong quá trình cài đặt hoặc kích hoạt sản phẩm, vui lòng liên hệ trực tiếp với bộ phận chăm sóc khách hàng 24/7 của chúng tôi bằng cách phản hồi lại email này hoặc gửi yêu cầu tới support@vanistudio.com.\n\nChúc bạn có những trải nghiệm tuyệt vời cùng sản phẩm của VaniStudio!\n\nTrân trọng,\nĐội ngũ Quản lý Sản phẩm & Chăm sóc Khách hàng VaniStudio\nhttps://vanistudio.com",
    variables: [
      "name",
      "orderId",
      "issuedAt",
      "price",
      "currency",
      "billingAddress",
      "productName",
      "productVersion",
      "licenseType",
      "maxActivations",
      "licenseKey",
      "expiryDate",
      "supportDuration",
      "activationGuide",
      "downloadUrl",
      "documentationUrl",
      "customerPortalUrl"
    ],
    extraConfig: {
      senderName: "VaniStudio Licensing Desk",
      senderEmail: "license@vanistudio.com"
    },
    description: "Email gửi tự động cho khách hàng chứa mã bản quyền (license key) và hướng dẫn kích hoạt sau khi đơn hàng hoàn tất.",
    isActive: true
  }
];
