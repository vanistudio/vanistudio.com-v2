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
    content: "<p>Chào {{name}},</p><p>Chào mừng bạn đã gia nhập VaniStudio - Nền tảng phát triển sản phẩm công nghệ và thiết kế giao diện cao cấp. Chúng tôi vô cùng vui mừng khi được đồng hành cùng bạn trên con đường xây dựng các giải pháp số hóa đột phá.</p><p>Tài khoản của bạn đã được khởi tạo thành công với các thông tin chi tiết dưới đây:</p><ul><li>Họ tên: {{name}}</li><li>Email tài khoản: {{email}}</li><li>Mã thành viên: #{{userId}}</li><li>Gói tài khoản ban đầu: {{pricingPlan}}</li><li>Thời gian đăng ký: {{createdAt}}</li><li>Địa chỉ IP đăng ký: {{ipAddress}}</li><li>Vị trí địa lý đăng ký: {{location}}</li></ul><p>Để bắt đầu trải nghiệm đầy đủ các tính năng của hệ thống, vui lòng truy cập và đăng nhập tại đường dẫn sau:<br />👉 <a href=\"{{loginUrl}}\" target=\"_blank\">{{loginUrl}}</a></p><p>🎁 <strong>Quà tặng chào mừng dành riêng cho thành viên mới:</strong><br />Sử dụng mã khuyến mại: <strong>{{promoCode}}</strong> để được giảm ngay 15% cho lần đầu đăng ký các gói dịch vụ Premium hoặc mua sản phẩm trực tiếp tại VaniStudio.</p><p>Các bước quan trọng đầu tiên để tối ưu hóa tài khoản của bạn:</p><ol><li>Hoàn thiện hồ sơ cá nhân: Bổ sung số điện thoại, thiết lập múi giờ và đồng bộ hóa avatar của bạn tại <a href=\"{{profileSettingsUrl}}\" target=\"_blank\">{{profileSettingsUrl}}</a>.</li><li>Kích hoạt tính năng bảo mật: Chúng tôi đặc biệt khuyên bạn nên kích hoạt xác thực 2 lớp (2FA) tại <a href=\"{{securitySettingsUrl}}\" target=\"_blank\">{{securitySettingsUrl}}</a> để bảo vệ dữ liệu cá nhân của mình.</li><li>Tham khảo tài liệu hướng dẫn: Đọc ngay cẩm nang hướng dẫn sử dụng nhanh dành cho người mới tại <a href=\"{{gettingStartedLink}}\" target=\"_blank\">{{gettingStartedLink}}</a>.</li><li>Tham gia cộng đồng: Kết nối với hàng ngàn nhà phát triển khác tại diễn đàn của chúng tôi qua <a href=\"{{communityLink}}\" target=\"_blank\">{{communityLink}}</a>.</li></ol><p>Nếu bạn gặp bất kỳ vấn đề gì hoặc cần hỗ trợ kỹ thuật, xin vui lòng liên hệ với Đội ngũ Chăm sóc khách hàng trực tuyến qua email <a href=\"mailto:{{supportEmail}}\">{{supportEmail}}</a> hoặc truy cập cổng hỗ trợ <a href=\"{{supportPortalUrl}}\" target=\"_blank\">{{supportPortalUrl}}</a>.</p><p>Một lần nữa, xin chân thành cảm ơn bạn đã lựa chọn VaniStudio!</p><p>Trân trọng,<br /><strong>Đội ngũ Sáng lập &amp; Hỗ trợ Khách hàng VaniStudio</strong><br /><a href=\"https://vanistudio.com\" target=\"_blank\">https://vanistudio.com</a></p>",
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
    content: "<p>Chào {{name}},</p><p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản VaniStudio của bạn đăng ký qua địa chỉ email {{email}}.</p><p>Để tiến hành đặt lại mật khẩu mới, vui lòng nhấp vào liên kết bảo mật dưới đây:<br />👉 <a href=\"{{resetLink}}\" target=\"_blank\">{{resetLink}}</a></p><p><strong>Lưu ý bảo mật quan trọng:</strong></p><ul><li>Đường liên kết khôi phục này chỉ có hiệu lực sử dụng duy nhất một lần và sẽ tự động hết hạn sau đúng {{expiryDurationMinutes}} phút kể từ khi email này được gửi đi (hết hạn vào lúc {{expireTime}}).</li><li>Địa chỉ IP gửi yêu cầu này là: {{ipAddress}}</li><li>Quốc gia và Vị trí địa lý ghi nhận: {{location}}</li><li>Thiết bị và trình duyệt thực hiện yêu cầu: {{device}} (Hệ điều hành: {{operatingSystem}}, Trình duyệt: {{browserName}})</li></ul><p>Nếu bạn KHÔNG thực hiện yêu cầu này, có thể ai đó đang cố gắng truy cập trái phép vào tài khoản của bạn. Vui lòng bỏ qua email này, mật khẩu hiện tại của bạn vẫn sẽ được giữ an toàn và không bị thay đổi.</p><p>Để bảo vệ tối đa cho tài khoản, chúng tôi khuyên bạn nên:</p><ol><li>Tuyệt đối không chia sẻ email này hoặc sao chép liên kết trên gửi cho bất kỳ ai.</li><li>Kiểm tra lại lịch sử đăng nhập gần đây của bạn tại: <a href=\"{{securitySettingsUrl}}\" target=\"_blank\">{{securitySettingsUrl}}</a>.</li><li>Đọc thêm các khuyến cáo an ninh mạng của chúng tôi tại: <a href=\"{{securityTipsUrl}}\" target=\"_blank\">{{securityTipsUrl}}</a>.</li></ol><p>Nếu cần trợ giúp thêm, vui lòng liên hệ ngay với Bộ phận Hỗ trợ Kỹ thuật &amp; An ninh VaniStudio qua số hotline {{supportHotline}} hoặc phản hồi trực tiếp email này.</p><p>Trân trọng,<br /><strong>Phòng An ninh mạng &amp; Bảo mật Thông tin VaniStudio</strong><br /><a href=\"mailto:security@vanistudio.com\">security@vanistudio.com</a></p>",
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
    eventKey: "user.register_admin",
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
    eventKey: "user.register_admin",
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
    eventKey: "user.register_admin",
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
    content: "<p>Chào {{name}},</p><p>Cảm ơn bạn đã gửi thư liên hệ tới VaniStudio.</p><p>Chúng tôi xin thông báo đã tiếp nhận yêu cầu của bạn thành công. Hệ thống đã tự động tạo một vé hỗ trợ có thông tin chi tiết như sau:</p><ul><li>Mã số vé (Ticket ID): #{{ticketId}}</li><li>Họ tên khách hàng: {{name}}</li><li>Email liên hệ: {{email}}</li><li>Danh mục yêu cầu: {{category}}</li><li>Tiêu đề liên hệ: {{subject}}</li><li>Thời gian ghi nhận: {{createdAt}}</li><li>Thời gian phản hồi dự kiến: {{expectedResponseTime}}</li></ul><p>Chi tiết nội dung tin nhắn bạn đã gửi:</p><blockquote style=\"border-left: 4px solid #ccc; padding-left: 16px; margin: 16px 0;\">\"{{message}}\"</blockquote><p>Các liên kết hữu ích dành cho bạn khi chờ phản hồi:</p><ul><li>Bạn có thể theo dõi tiến trình xử lý yêu cầu hoặc cập nhật thêm thông tin tại Cổng hỗ trợ khách hàng: <a href=\"{{supportPortalUrl}}\" target=\"_blank\">{{supportPortalUrl}}</a></li><li>Trong lúc chờ đợi, bạn có thể tham khảo mục Câu hỏi thường gặp (FAQ) của chúng tôi để tìm câu trả lời nhanh chóng: <a href=\"{{faqLink}}\" target=\"_blank\">{{faqLink}}</a></li></ul><p><strong>Lưu ý:</strong> Nếu bạn có thêm bất kỳ thông tin nào cần bổ sung cho yêu cầu này, vui lòng phản hồi trực tiếp vào email này mà không cần thay đổi tiêu đề thư. Đội ngũ kỹ thuật viên và chuyên viên của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p><p>Trân trọng,<br /><strong>Đội ngũ CSKH và Hỗ trợ Kỹ thuật VaniStudio</strong><br /><a href=\"mailto:support@vanistudio.com\">support@vanistudio.com</a></p>",
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
    eventKey: "contact.new_submission_admin",
    channel: "email",
    target: "admin",
    subject: "🚨 [Liên hệ mới] Đơn hàng/Hỗ trợ khách hàng - Mã vé #{{ticketId}} - {{name}}",
    content: "<p>Chào Admin,</p><p>Hệ thống VaniStudio CRM vừa tiếp nhận biểu mẫu liên hệ trực tuyến mới từ khách hàng. Vui lòng kiểm duyệt và phản hồi sớm nhất có thể.</p><p><strong>THÔNG TIN CHI TIẾT VÉ HỖ TRỢ:</strong></p><ul><li>Mã số vé: #{{ticketId}}</li><li>Danh mục: {{category}}</li><li>Độ ưu tiên: {{priorityLevel}}</li><li>Họ và tên khách hàng: {{name}}</li><li>Địa chỉ Email: {{email}}</li><li>Số điện thoại: {{phone}}</li><li>Số vé đã gửi trước đây của user này: {{previousTicketsCount}}</li><li>Thời gian gửi: {{createdAt}}</li><li>URL nguồn trang gửi liên hệ: <a href=\"{{referrerUrl}}\" target=\"_blank\">{{referrerUrl}}</a></li><li>Bộ phận tiếp nhận xử lý: {{assignedTeam}}</li></ul><p><strong>THÔNG TIN HẠ TẦNG KẾT NỐI:</strong></p><ul><li>Địa chỉ IP người gửi: {{ipAddress}}</li><li>Thiết bị &amp; Hệ điều hành sử dụng: {{deviceInfo}}</li></ul><p><strong>NỘI DUNG YÊU CẦU CHI TIẾT TỪ KHÁCH HÀNG:</strong></p><p>Chủ đề: {{subject}}</p><blockquote style=\"border-left: 4px solid #ccc; padding-left: 16px; margin: 16px 0;\">\"{{message}}\"</blockquote><p><strong>HƯỚNG DẪN XỬ LÝ DÀNH CHO ADMIN:</strong></p><ol><li>Đăng nhập trang quản trị CRM để phân công hoặc trả lời trực tiếp tại: <a href=\"{{inboxUrl}}\" target=\"_blank\">{{inboxUrl}}</a></li><li>Bạn cũng có thể phản hồi trực tiếp qua hòm thư điện tử cá nhân của khách hàng bằng cách bấm vào: <a href=\"mailto:{{email}}?subject=Re:%20[VaniStudio]%20{{subject}}\">mailto:{{email}}</a></li></ol><p>Trân trọng,<br /><strong>Hệ thống CRM Tự động VaniStudio Engine</strong></p>",
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
    eventKey: "contact.new_submission_admin",
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
    eventKey: "contact.new_submission_admin",
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
    eventKey: "contact.new_submission_admin",
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
    content: "<p>Chào {{name}},</p><p>Chúng tôi gửi email này để xác nhận rằng tính năng Xác thực 2 lớp (2FA) đã được kích hoạt thành công cho tài khoản VaniStudio của bạn vào lúc {{enabledAt}}.</p><p><strong>THÔNG TIN CHI TIẾT THIẾT LẬP:</strong></p><ul><li>Trạng thái 2FA: Đã kích hoạt (ENABLED)</li><li>Phương thức xác thực chính: Ứng dụng xác thực mã OTP (Google Authenticator / Authy)</li><li>Địa chỉ IP yêu cầu: {{ipAddress}}</li><li>Vị trí địa lý ghi nhận: {{location}}</li><li>Thiết bị &amp; Trình duyệt thực hiện: {{device}} (Hệ điều hành: {{operatingSystem}}, Trình duyệt: {{browserName}})</li></ul><p>Kể từ thời điểm này, mỗi khi đăng nhập vào hệ thống từ bất kỳ thiết bị mới nào, bạn sẽ được yêu cầu nhập mã OTP gồm 6 chữ số được tạo ngẫu nhiên từ ứng dụng xác thực của bạn để hoàn tất đăng nhập. Điều này giúp nâng cao đáng kể mức độ bảo mật cho tài khoản của bạn, ngăn chặn các hành vi đánh cắp mật khẩu thông thường.</p><p><strong>Hành động cần thiết:</strong></p><ul><li>Hãy đảm bảo bạn đã lưu trữ các Mã dự phòng khôi phục (Backup Codes) ở một nơi an toàn. Nếu bạn làm mất thiết bị cài ứng dụng xác thực, các mã này là cách duy nhất giúp bạn tự lấy lại tài khoản mà không cần thông qua hỗ trợ của quản trị viên. Bạn có thể xem lại mã dự phòng tại: <a href=\"{{backupCodesUrl}}\" target=\"_blank\">{{backupCodesUrl}}</a>.</li><li>Nếu bạn cần chỉnh sửa hoặc thay đổi phương thức xác thực, vui lòng truy cập: <a href=\"{{securitySettingsUrl}}\" target=\"_blank\">{{securitySettingsUrl}}</a>.</li></ul><p>🚨 <strong>CẢNH BÁO BẢO MẬT KHẨN CẤP:</strong><br />Nếu bạn không phải là người thực hiện kích hoạt 2FA này, điều đó có nghĩa mật khẩu của bạn đã bị lộ và ai đó đang cố tình chiếm đoạt tài khoản. Vui lòng bấm vào liên kết khóa khẩn cấp dưới đây ngay lập tức để tạm đóng tài khoản và liên hệ với nhóm hỗ trợ kỹ thuật của chúng tôi:<br />👉 <a href=\"{{lockAccountLink}}\" target=\"_blank\">{{lockAccountLink}}</a></p><p>Trân trọng,<br /><strong>Đội ngũ Bảo mật An ninh mạng VaniStudio</strong><br /><a href=\"mailto:{{supportEmail}}\">{{supportEmail}}</a></p>",
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
    content: "<p>Chào {{name}},</p><p>Đây là thông báo khẩn cấp từ trung tâm bảo mật VaniStudio. Tính năng Xác thực hai lớp (2FA) trên tài khoản của bạn đã bị HỦY KÍCH HOẠT thành công vào lúc {{disabledAt}}.</p><p><strong>CHI TIẾT PHIÊN THAY ĐỔI:</strong></p><ul><li>Trạng thái bảo mật 2FA: Đã tắt (DISABLED)</li><li>Địa chỉ IP thực hiện: {{ipAddress}}</li><li>Vị trí địa lý ghi nhận: {{location}}</li><li>Thiết bị thực hiện: {{device}} (Hệ điều hành: {{operatingSystem}}, Trình duyệt: {{browserName}})</li></ul><p>⚠️ <strong>CẢNH BÁO BẢO MẬT QUAN TRỌNG:</strong><br />Khi tính năng 2FA bị tắt, tài khoản của bạn sẽ không còn được bảo vệ bởi lớp xác thực thứ hai nữa. Tài khoản lúc này chỉ được bảo mật bằng một lớp mật khẩu thông thường, khiến cho nguy cơ bị xâm nhập, rò rỉ dữ liệu hoặc bị tấn công brute force tăng lên cực kỳ cao.</p><p>Chúng tôi khuyến cáo bạn nên kích hoạt lại 2FA càng sớm càng tốt tại:<br />👉 <a href=\"{{reEnableLink}}\" target=\"_blank\">{{reEnableLink}}</a></p><p>🚨 <strong>HÀNH ĐỘNG KHẨN CẤP NẾU BẠN KHÔNG TẮT 2FA:</strong><br />Nếu bạn không thực hiện việc tắt 2FA này, tài khoản của bạn đã bị kẻ tấn công chiếm quyền kiểm soát. Vui lòng thực hiện các bước sau ngay lập tức:</p><ol><li>Đăng nhập và kích hoạt lại 2FA ngay lập tức tại: <a href=\"{{securitySettingsUrl}}\" target=\"_blank\">{{securitySettingsUrl}}</a>.</li><li>Tiến hành đổi mật khẩu đăng nhập sang một mật khẩu mới mạnh hơn.</li><li>Nếu không thể đăng nhập, hãy liên hệ ngay với phòng Hỗ trợ An ninh của chúng tôi qua địa chỉ email <a href=\"mailto:{{supportEmail}}\">{{supportEmail}}</a> để được khóa tài khoản và tiến hành xác minh danh tính khôi phục.</li></ol><p>Trân trọng,<br /><strong>Đội ngũ Bảo mật An ninh mạng VaniStudio</strong><br /><a href=\"mailto:{{supportEmail}}\">{{supportEmail}}</a></p>",
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
    content: "<p>Chào {{name}},</p><p>Cảm ơn bạn đã lựa chọn đăng ký tài khoản tại hệ thống VaniStudio! Bước cuối cùng để bạn hoàn tất quy trình thiết lập tài khoản và bắt đầu sử dụng tài nguyên của chúng tôi là xác minh địa chỉ email đăng ký.</p><p>Mã xác minh kích hoạt của bạn là:<br />👉 <strong>{{verificationCode}}</strong> 👈</p><p><strong>Thông tin hướng dẫn sử dụng mã:</strong></p><ul><li>Mã này có hiệu lực sử dụng trong vòng đúng {{expireMinutes}} phút kể từ thời điểm gửi thư này (hết hiệu lực vào lúc {{expireTime}}).</li><li>Vui lòng sao chép và nhập chính xác chuỗi mã trên vào ô xác minh trên trình duyệt của bạn.</li><li>Thiết bị đăng ký ghi nhận: {{device}} tại địa chỉ IP: {{ipAddress}}.</li></ul><p>Nếu mã trên đã hết hạn sử dụng, bạn có thể gửi lại yêu cầu mã xác minh mới tại liên kết sau:<br />👉 <a href=\"{{resendLink}}\" target=\"_blank\">{{resendLink}}</a></p><p>Nếu bạn có bất kỳ câu hỏi nào trong quá trình kích hoạt tài khoản hoặc gặp sự cố kỹ thuật, vui lòng tham khảo trang Trợ giúp của chúng tôi tại <a href=\"{{helpLink}}\" target=\"_blank\">{{helpLink}}</a> hoặc gửi thư về email hỗ trợ để được hướng dẫn trực tiếp.</p><p>Chào mừng bạn gia nhập cộng đồng sáng tạo của chúng tôi!</p><p>Trân trọng,<br /><strong>Đội ngũ Vận hành &amp; Phát triển Cộng đồng VaniStudio</strong></p>",
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
    content: "<p>Chào {{name}},</p><p>Đây là email thông báo bảo mật chính thức của VaniStudio. Mật khẩu tài khoản đăng nhập của bạn (liên kết với hòm thư {{email}}) đã được THAY ĐỔI THÀNH CÔNG vào lúc {{changedAt}}.</p><p><strong>CHI TIẾT PHIÊN THAY ĐỔI MẬT KHẨU:</strong></p><ul><li>Địa chỉ IP thực hiện thay đổi: {{ipAddress}}</li><li>Vị trí địa lý ước tính: {{location}}</li><li>Thiết bị thực hiện: {{device}} (Hệ điều hành: {{operatingSystem}}, Trình duyệt: {{browserName}})</li></ul><p>Nếu chính bạn là người đã thực hiện hành động thay đổi mật khẩu này, vui lòng bỏ qua nội dung email này, mật khẩu mới của bạn đã có hiệu lực để đăng nhập.</p><p>🚨 <strong>HÀNH ĐỘNG KHẨN CẤP NẾU BẠN KHÔNG PHẢI NGƯỜI THAY ĐỔI:</strong><br />Nếu bạn không hề thực hiện thay đổi mật khẩu này, tài khoản của bạn hiện tại đã bị kẻ gian chiếm giữ trái phép. Bạn cần thực hiện các hành động khẩn cấp sau đây ngay lập tức:</p><ol><li>Hãy bấm ngay vào đường liên kết dưới đây để thực hiện KHÓA KHẨN CẤP tài khoản của bạn, ngăn chặn các hành vi phá hoại dữ liệu hoặc rút tiền/mua sản phẩm:<br />👉 <a href=\"{{lockAccountLink}}\" target=\"_blank\">{{lockAccountLink}}</a></li><li>Thử tiến hành khôi phục mật khẩu thông qua email tại trang: <a href=\"{{passwordResetUrl}}\" target=\"_blank\">{{passwordResetUrl}}</a>.</li><li>Gửi thư điện tử trực tiếp tới phòng hỗ trợ khẩn cấp của chúng tôi tại <a href=\"mailto:{{supportEmail}}\">{{supportEmail}}</a> để các quản trị viên can thiệp kịp thời.</li></ol><p>Hãy giữ email này cẩn thận vì nó chứa các thông tin IP và thiết bị của kẻ xâm nhập để cung cấp cho cơ quan điều tra an ninh nếu cần thiết.</p><p>Trân trọng,<br /><strong>Đội ngũ An ninh mạng và Giám sát Tài khoản VaniStudio</strong></p>",
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
    content: "<p>Chào {{name}},</p><p>Hệ thống giám sát bảo mật tài khoản VaniStudio vừa ghi nhận một hoạt động đăng nhập thành công vào tài khoản của bạn từ một thiết bị hoặc vị trí địa lý mới chưa từng được sử dụng trước đây.</p><p><strong>THÔNG TIN CHI TIẾT PHIÊN ĐĂNG NHẬP MỚI:</strong></p><ul><li>Thời gian đăng nhập: {{loginAt}}</li><li>Địa chỉ IP kết nối: {{ipAddress}}</li><li>Nhà cung cấp mạng (ISP): {{ispProvider}}</li><li>Vị trí địa lý ước tính: {{location}}</li><li>Thiết bị ghi nhận: {{device}} (Hệ điều hành: {{operatingSystem}}, Trình duyệt: {{browserName}})</li></ul><p>Nếu hoạt động đăng nhập này do chính bạn thực hiện (ví dụ: bạn đổi máy tính mới, sử dụng điện thoại mới, đổi mạng Wifi công cộng hoặc sử dụng dịch vụ VPN ẩn danh), bạn có thể hoàn toàn yên tâm và bỏ qua email này.</p><p>🚨 <strong>HÀNH ĐỘNG CẦN THIẾT NẾU ĐÂY KHÔNG PHẢI BẠN:</strong><br />Nếu phiên đăng nhập này được thực hiện bởi một người nào khác, tài khoản của bạn đã bị rò rỉ thông tin đăng nhập. Vui lòng hành động ngay lập tức để bảo vệ dữ liệu:</p><ol><li>Nhấp vào liên kết dưới đây để thực hiện ĐĂNG XUẤT tài khoản ngay lập tức khỏi tất cả các phiên làm việc và thiết bị khác:<br />👉 <a href=\"{{logoutAllLink}}\" target=\"_blank\">{{logoutAllLink}}</a></li><li>Thực hiện thay đổi mật khẩu đăng nhập ngay lập tức sang một mật khẩu mạnh và duy nhất.</li><li>Kích hoạt tính năng bảo mật xác thực hai lớp (2FA) tại <a href=\"{{securitySettingsUrl}}\" target=\"_blank\">{{securitySettingsUrl}}</a> nếu chưa kích hoạt để tăng thêm lớp phòng thủ chắc chắn.</li></ol><p>Nếu cần bất kỳ hỗ trợ nào từ chúng tôi, hãy liên hệ qua hòm thư điện tử <a href=\"mailto:{{supportEmail}}\">{{supportEmail}}</a> bất kỳ lúc nào.</p><p>Trân trọng,<br /><strong>Đội ngũ Giám sát Bảo mật và An toàn Tài khoản VaniStudio</strong></p>",
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
    content: "<p>Chào {{name}},</p><p>Thay mặt VaniStudio, chúng tôi chân thành cảm ơn bạn đã tin tưởng mua sắm và sử dụng các sản phẩm công nghệ của chúng tôi. Giao dịch mua sản phẩm của bạn đã hoàn tất thành công và được hệ thống thanh toán tự động xác nhận.</p><p>Chúng tôi xin chính thức bàn giao thông tin bản quyền (License Key) và các tài liệu hướng dẫn kích hoạt đi kèm:</p><p><strong>THÔNG TIN KHÁCH HÀNG &amp; ĐƠN HÀNG:</strong></p><ul><li>Họ tên khách hàng: {{name}}</li><li>Mã số đơn hàng: #{{orderId}}</li><li>Thời gian giao dịch: {{issuedAt}}</li><li>Tổng chi phí thanh toán: {{price}} {{currency}}</li><li>Địa chỉ thanh toán ghi nhận: {{billingAddress}}</li></ul><p><strong>THÔNG TIN CHI TIẾT BẢN QUYỀN SẢN PHẨM:</strong></p><ul><li>Tên sản phẩm: <strong>{{productName}}</strong></li><li>Phiên bản phát hành hiện tại: {{productVersion}}</li><li>Loại giấy phép sở hữu: {{licenseType}}</li><li>Số thiết bị kích hoạt tối đa: {{maxActivations}} thiết bị</li><li>Mã bản quyền (License Key): <code>{{licenseKey}}</code></li><li>Thời gian hết hạn sử dụng: {{expiryDate}}</li><li>Thời hạn được hỗ trợ kỹ thuật miễn phí: {{supportDuration}}</li></ul><p><strong>HƯỚNG DẪN KÍCH HOẠT VÀ CÀI ĐẶT NHANH:</strong></p><pre><code>{{activationGuide}}</code></pre><p><strong>CÁC ĐƯỜNG DẪN TÀI NGUYÊN HỮU ÍCH:</strong></p><ul><li>Tải bộ cài đặt sản phẩm gốc: <a href=\"{{downloadUrl}}\" target=\"_blank\">{{downloadUrl}}</a></li><li>Xem tài liệu hướng dẫn kỹ thuật chi tiết: <a href=\"{{documentationUrl}}\" target=\"_blank\">{{documentationUrl}}</a></li><li>Truy cập Cổng quản lý bản quyền khách hàng để xem lịch sử kích hoạt hoặc đổi thiết bị: <a href=\"{{customerPortalUrl}}\" target=\"_blank\">{{customerPortalUrl}}</a></li></ul><p>⚠️ <strong>Lưu ý bảo mật quan trọng:</strong></p><ul><li>Vui lòng tuyệt đối không chia sẻ mã bản quyền này công khai hoặc chia sẻ cho bên thứ ba. Mỗi mã bản quyền gắn liền trực tiếp với tài khoản email của bạn và được kiểm soát thiết bị kích hoạt tự động qua máy chủ VaniStudio Activation Server.</li><li>Nếu phát hiện số lượng thiết bị kích hoạt vượt quá giới hạn cho phép ({{maxActivations}}), khóa bản quyền của bạn có thể bị tạm khóa tự động.</li></ul><p>Nếu gặp bất kỳ khó khăn nào trong quá trình cài đặt hoặc kích hoạt sản phẩm, vui lòng liên hệ trực tiếp với bộ phận chăm sóc khách hàng 24/7 của chúng tôi bằng cách phản hồi lại email này hoặc gửi yêu cầu tới <a href=\"mailto:support@vanistudio.com\">support@vanistudio.com</a>.</p><p>Chúc bạn có những trải nghiệm tuyệt vời cùng sản phẩm của VaniStudio!</p><p>Trân trọng,<br /><strong>Đội ngũ Quản lý Sản phẩm &amp; Chăm sóc Khách hàng VaniStudio</strong><br /><a href=\"https://vanistudio.com\" target=\"_blank\">https://vanistudio.com</a></p>",
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

export const VARIABLE_EXPLANATIONS: Record<string, string> = {
  name: "Tên hiển thị của khách hàng/người nhận",
  email: "Địa chỉ email của tài khoản",
  userId: "Mã định danh duy nhất của người dùng",
  pricingPlan: "Tên gói tài khoản đã đăng ký (Gói dịch vụ)",
  createdAt: "Ngày giờ đăng ký/tạo sự kiện",
  ipAddress: "Địa chỉ IP thực hiện hành động",
  location: "Vị trí địa lý ước tính từ địa chỉ IP",
  loginUrl: "Đường dẫn đăng nhập hệ thống",
  promoCode: "Mã khuyến mại/giảm giá chào mừng",
  profileSettingsUrl: "Đường dẫn đến trang cài đặt hồ sơ",
  securitySettingsUrl: "Đường dẫn cài đặt bảo mật tài khoản",
  securityTipsUrl: "Đường dẫn xem khuyến cáo bảo mật an ninh mạng",
  gettingStartedLink: "Đường dẫn tài liệu hướng dẫn bắt đầu",
  communityLink: "Đường dẫn tham gia diễn đàn cộng đồng",
  supportEmail: "Hòm thư hỗ trợ kỹ thuật và chăm sóc khách hàng",
  supportPortalUrl: "Đường dẫn đến cổng hỗ trợ khách hàng",
  resetLink: "Đường dẫn bảo mật để khôi phục mật khẩu",
  expiryDurationMinutes: "Thời gian hết hạn của liên kết (phút)",
  expireTime: "Thời điểm liên kết hoặc mã hết hiệu lực",
  device: "Tên thiết bị thực hiện yêu cầu",
  operatingSystem: "Hệ điều hành của thiết bị",
  browserName: "Tên trình duyệt web sử dụng",
  supportHotline: "Số điện thoại đường dây nóng hỗ trợ",
  referralSource: "Nguồn giới thiệu đăng ký",
  campaignName: "Tên chiến dịch marketing thu hút",
  ispProvider: "Nhà cung cấp dịch vụ Internet (ISP)",
  signupCountry: "Quốc gia thực hiện đăng ký",
  profileUrl: "Đường dẫn quản trị xem hồ sơ chi tiết",
  incidentId: "Mã số định danh sự cố bảo mật",
  severityLevel: "Mức độ nghiêm trọng của cảnh báo an ninh",
  country: "Tên quốc gia phát hiện sự cố",
  city: "Tên thành phố phát hiện sự cố",
  isp: "Tên nhà cung cấp mạng (ISP) của thủ phạm",
  totalRequests: "Tổng số lượt yêu cầu được gửi lên",
  failedEndpoints: "Danh sách các đường dẫn/endpoint bị tấn công",
  reason: "Lý do hệ thống thực thi luật chặn IP",
  bannedAt: "Thời điểm IP bị chặn",
  blockDuration: "Thời gian cấm truy cập",
  userAgent: "Thông tin trình duyệt và hệ điều hành nguồn",
  firewallRuleId: "Mã quy tắc tường lửa được áp dụng",
  adminPanelUrl: "Đường dẫn đến danh sách IP bị cấm ở trang quản trị",
  firewallLink: "Đường dẫn quản lý Firewall IP an ninh",
  ignoreLink: "Đường dẫn bỏ qua cảnh báo bảo mật",
  ticketId: "Mã số vé hỗ trợ khách hàng",
  category: "Danh mục phân loại yêu cầu liên hệ",
  subject: "Chủ đề liên hệ hoặc tiêu đề thư",
  message: "Nội dung tin nhắn khách hàng gửi",
  expectedResponseTime: "Thời gian phản hồi ước tính cho khách",
  faqLink: "Đường dẫn trang các câu hỏi thường gặp",
  priorityLevel: "Mức độ ưu tiên xử lý liên hệ",
  priority: "Độ ưu tiên xử lý liên hệ",
  phone: "Số điện thoại khách hàng cung cấp",
  previousTicketsCount: "Số lượng vé liên hệ trước đây của user này",
  referrerUrl: "Đường dẫn trang web nguồn gửi liên hệ",
  assignedTeam: "Bộ phận tiếp nhận xử lý yêu cầu",
  deviceInfo: "Thông tin thiết bị và hệ điều hành người gửi",
  inboxUrl: "Đường dẫn hòm thư quản lý trong CRM",
  enabledAt: "Thời điểm kích hoạt 2FA thành công",
  backupCodesUrl: "Đường dẫn xem mã dự phòng khôi phục tài khoản",
  lockAccountLink: "Đường dẫn khẩn cấp để tạm khóa tài khoản",
  disabledAt: "Thời điểm tắt tính năng 2FA",
  reEnableLink: "Đường dẫn nhanh để kích hoạt lại 2FA",
  otpCode: "Mã xác thực OTP dùng một lần",
  expireMinutes: "Thời hạn hiệu lực của OTP (phút)",
  actionType: "Loại hành động yêu cầu mã OTP",
  verificationCode: "Mã xác minh kích hoạt tài khoản",
  resendLink: "Đường dẫn yêu cầu gửi lại mã xác minh mới",
  helpLink: "Đường dẫn đến trang trợ giúp người dùng",
  changedAt: "Thời điểm thay đổi mật khẩu thành công",
  passwordResetUrl: "Đường dẫn đến trang đặt lại mật khẩu",
  loginAt: "Thời điểm đăng nhập tài khoản",
  logoutAllLink: "Đường dẫn đăng xuất khỏi tất cả thiết bị",
  commentId: "Mã số định danh của bình luận",
  status: "Trạng thái phê duyệt của bình luận",
  authorName: "Họ tên tác giả viết bình luận",
  authorEmail: "Địa chỉ email của tác giả bình luận",
  authorWebsite: "Website cá nhân của tác giả bình luận",
  authorIp: "Địa chỉ IP của người gửi bình luận",
  postTitle: "Tiêu đề của bài viết Blog liên quan",
  postUrl: "Đường dẫn bài viết Blog trên website",
  content: "Nội dung chi tiết của bình luận hoặc tin nhắn",
  approveUrl: "Đường dẫn duyệt hiển thị bình luận",
  rejectUrl: "Đường dẫn từ chối ẩn bình luận",
  spamUrl: "Đường dẫn báo cáo spam bình luận",
  orderId: "Mã đơn hàng mua sắm sản phẩm",
  issuedAt: "Thời điểm cấp phát bản quyền",
  price: "Tổng chi phí thanh toán đơn hàng",
  currency: "Đơn vị tiền tệ thanh toán",
  billingAddress: "Địa chỉ thanh toán ghi nhận",
  productName: "Tên sản phẩm bản quyền",
  productVersion: "Phiên bản hiện tại của sản phẩm",
  licenseType: "Loại giấy phép bản quyền sở hữu",
  maxActivations: "Số lượng thiết bị tối đa được phép kích hoạt",
  licenseKey: "Mã bản quyền (License Key) sản phẩm",
  expiryDate: "Ngày hết hạn sử dụng bản quyền",
  supportDuration: "Thời gian hỗ trợ kỹ thuật đi kèm đơn hàng",
  activationGuide: "Nội dung hướng dẫn kích hoạt bản quyền nhanh",
  downloadUrl: "Đường dẫn tải bộ cài đặt sản phẩm gốc",
  documentationUrl: "Đường dẫn tài liệu kỹ thuật chi tiết của sản phẩm",
  customerPortalUrl: "Đường dẫn đến Cổng quản lý bản quyền cá nhân",
};
