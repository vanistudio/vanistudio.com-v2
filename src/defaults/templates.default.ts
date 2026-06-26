import { type TemplateExtraConfig } from "@/server/db/schemas/template.schema";
import {
  welcomeEmailTemplate,
  forgotPasswordEmailTemplate,
  contactConfirmationEmailTemplate,
  contactNotificationEmailTemplate,
  twoFactorEnabledEmailTemplate,
  twoFactorDisabledEmailTemplate,
  otpVerificationEmailTemplate,
  registerVerificationEmailTemplate,
  passwordChangedEmailTemplate,
  loginDetectedEmailTemplate,
  licenseIssuedEmailTemplate,
} from "./email-templates";

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
}

export const DEFAULT_NOTIFICATION_TEMPLATES: DefaultNotificationTemplate[] = [
  {
    name: "Email chào mừng thành viên mới",
    eventKey: "user.register",
    channel: "email",
    target: "client",
    subject: "Chào mừng bạn đến với VaniStudio - Khởi đầu hành trình sáng tạo của bạn!",
    content: welcomeEmailTemplate,
    variables: [
      "name",
      "email",
      "userId",
      "createdAt",
      "ipAddress",
      "location",
      "loginUrl"
    ],
    extraConfig: {
      senderName: "VaniStudio Welcome Manager"
    },
    description: "Email tự động gửi chào mừng thành viên mới khi họ đăng ký thành công.",
  },
  {
    name: "Email khôi phục mật khẩu",
    eventKey: "auth.forgot_password",
    channel: "email",
    target: "client",
    subject: "Yêu cầu khôi phục mật khẩu tài khoản VaniStudio - Hành động khẩn cấp cần thiết",
    content: forgotPasswordEmailTemplate,
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
      "securityTipsUrl",
      "supportHotline"
    ],
    extraConfig: {
      senderName: "VaniStudio Security Operations"
    },
    description: "Email chứa liên kết bảo mật khôi phục mật khẩu cho khách hàng.",
  },
  {
    name: "Thông báo Telegram: Thành viên mới đăng ký",
    eventKey: "user.register_admin",
    channel: "telegram",
    target: "admin",
    content: "🆕 <b>THÀNH VIÊN ĐĂNG KÝ HỆ THỐNG MỚI</b>\n\nHệ thống ghi nhận tài khoản người dùng mới vừa kích hoạt thành công:\n• <b>Mã thành viên:</b> <code>#{{userId}}</code>\n• <b>Họ và tên:</b> <code>{{name}}</code>\n• <b>Địa chỉ Email:</b> <code>{{email}}</code>\n• <b>Nguồn giới thiệu:</b> <code>{{referralSource}}</code>\n• <b>Chiến dịch marketing:</b> <code>{{campaignName}}</code>\n• <b>Thời gian đăng ký:</b> <code>{{createdAt}}</code>\n\n🌐 <b>THÔNG TIN KẾT NỐI:</b>\n• <b>Địa chỉ IP:</b> <code>{{ipAddress}}</code>\n• <b>Nhà cung cấp mạng (ISP):</b> <code>{{ispProvider}}</code> (Vị trí: <code>{{location}}</code>)\n• <b>Thiết bị sử dụng:</b> <code>{{device}}</code>\n\n<i>Hệ thống đã tự động gửi email xác nhận và kích hoạt quà tặng chào mừng cho thành viên này.</i>",
    variables: [
      "userId",
      "name",
      "email",
      "referralSource",
      "campaignName",
      "createdAt",
      "ipAddress",
      "ispProvider",
      "location",
      "device"
    ],
    extraConfig: {
      parseMode: "HTML"
    },
    description: "Tin nhắn tự động gửi đến group Telegram của Admin để thông báo khi có user mới đăng ký.",
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
      "referralSource",
      "campaignName",
      "createdAt",
      "ipAddress",
      "ispProvider",
      "location",
      "device"
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
            { name: "Nguồn giới thiệu", value: "🔗 {{referralSource}}", inline: true },
            { name: "Chiến dịch", value: "📊 {{campaignName}}", inline: true },
            { name: "Địa chỉ IP", value: "`{{ipAddress}}`", inline: true },
            { name: "Nhà mạng (ISP)", value: "🌐 {{ispProvider}}", inline: true },
            { name: "Vị trí địa lý", value: "📍 {{location}}", inline: true },
            { name: "Thiết bị sử dụng", value: "💻 {{device}}", inline: false }
          ],
          footer: {
            text: "Đăng ký lúc: {{createdAt}} • VaniStudio User Service"
          }
        }
      ]
    },
    description: "Gửi cảnh báo Rich Embed thông báo có thành viên mới đăng ký qua kênh Discord.",
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
      "referralSource",
      "campaignName",
      "createdAt",
      "ipAddress",
      "ispProvider",
      "location",
      "device"
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
            { type: "mrkdwn", text: "*Nguồn giới thiệu:*\n{{referralSource}}" },
            { type: "mrkdwn", text: "*Chiến dịch:*\n{{campaignName}}" },
            { type: "mrkdwn", text: "*Địa chỉ IP:*\n`{{ipAddress}}`" },
            { type: "mrkdwn", text: "*Vị trí địa lý:*\n{{location}}" }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Thiết bị sử dụng:*\n`{{device}}`\n*Nhà mạng (ISP):*\n`{{ispProvider}}`"
          }
        },
      ]
    },
    description: "Gửi cấu trúc Block Kit thông báo thành viên mới đăng ký qua kênh Slack.",
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
      "firewallRuleId"
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
  },
  {
    name: "Cảnh báo Telegram: Phát hiện IP brute force bị chặn",
    eventKey: "security.ip_banned",
    channel: "telegram",
    target: "admin",
    content: "🚨 <b>CẢNH BÁO KHẨN CẤP: BẢO VỆ MÁY CHỦ THÀNH CÔNG</b>\n\nTường lửa VaniStudio Sentinel vừa ngăn chặn hành vi xâm nhập trái phép:\n• <b>Mã sự cố (ID):</b> <code>#{{incidentId}}</code>\n• <b>Mức độ cảnh báo:</b> 🔴 <b>{{severityLevel}}</b>\n• <b>Địa chỉ IP nguồn:</b> <code>{{ipAddress}}</code>\n• <b>Quốc gia:</b> {{country}} (Thành phố: {{city}})\n• <b>Nhà mạng (ISP):</b> <code>{{isp}}</code>\n• <b>Lý do xử lý:</b> <u>{{reason}}</u>\n• <b>Tổng yêu cầu ghi nhận:</b> <code>{{totalRequests}} requests</code>\n• <b>Endpoint bị spam:</b> <code>{{failedEndpoints}}</code>\n• <b>Thời gian chặn:</b> <code>{{bannedAt}}</code>\n• <b>Hiệu lực cấm:</b> <code>{{blockDuration}}</code>\n\n🚫 <i>Địa chỉ IP này đã được đẩy lên Cloudflare Firewall API để cấm truy cập ở mức CDN. Không cần xử lý thủ công thêm.</i>",
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
      "blockDuration"
    ],
    extraConfig: {
      parseMode: "HTML"
    },
    description: "Cảnh báo bảo mật gửi qua tin nhắn Telegram khi phát hiện và chặn IP spam.",
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
  },
  {
    name: "Email tự động phản hồi khách hàng gửi liên hệ",
    eventKey: "contact.new_submission",
    channel: "email",
    target: "client",
    subject: "Xác nhận tiếp nhận yêu cầu liên hệ thành công [Mã vé: #{{ticketId}}] - VaniStudio",
    content: contactConfirmationEmailTemplate,
    variables: [
      "name",
      "ticketId",
      "email",
      "category",
      "subject",
      "createdAt",
      "expectedResponseTime",
      "message"
    ],
    extraConfig: {
      senderName: "VaniStudio Customer Support"
    },
    description: "Email tự động gửi phản hồi xác nhận cho khách hàng khi họ gửi form liên hệ.",
  },
  {
    name: "Email thông báo Admin: Có liên hệ mới",
    eventKey: "contact.new_submission_admin",
    channel: "email",
    target: "admin",
    subject: "🚨 [Liên hệ mới] Đơn hàng/Hỗ trợ khách hàng - Mã vé #{{ticketId}} - {{name}}",
    content: contactNotificationEmailTemplate,
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
      senderName: "VaniStudio CRM Dispatcher"
    },
    description: "Email thông báo cho Admin khi có khách hàng gửi biểu mẫu liên hệ.",
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
  },
  {
    name: "Email thông báo: Kích hoạt bảo mật 2FA",
    eventKey: "auth.two_factor_enabled",
    channel: "email",
    target: "client",
    subject: "Xác nhận kích hoạt tính năng Xác thực 2 lớp (2FA) bảo vệ tài khoản - VaniStudio",
    content: twoFactorEnabledEmailTemplate,
    variables: [
      "name",
      "enabledAt",
      "ipAddress",
      "location",
      "device",
      "operatingSystem",
      "browserName",
      "backupCodesUrl",
      "lockAccountLink"
    ],
    extraConfig: {
      senderName: "VaniStudio Security Team"
    },
    description: "Email thông báo cho khách hàng khi họ kích hoạt thành công tính năng bảo mật 2FA.",
  },
  {
    name: "Email thông báo: Hủy kích hoạt bảo mật 2FA",
    eventKey: "auth.two_factor_disabled",
    channel: "email",
    target: "client",
    subject: "CẢNH BÁO NGUY HIỂM: Tính năng Xác thực 2 lớp (2FA) đã bị tắt - VaniStudio",
    content: twoFactorDisabledEmailTemplate,
    variables: [
      "name",
      "disabledAt",
      "ipAddress",
      "location",
      "device",
      "operatingSystem",
      "browserName",
      "reEnableLink"
    ],
    extraConfig: {
      senderName: "VaniStudio Security Team"
    },
    description: "Email thông báo cho khách hàng khi họ tắt tính năng bảo mật 2FA.",
  },
  {
    name: "Email gửi mã OTP xác nhận",
    eventKey: "auth.otp_verification",
    channel: "email",
    target: "client",
    subject: "Mã xác thực OTP (Mã bảo mật dùng một lần) tài khoản VaniStudio của bạn",
    content: otpVerificationEmailTemplate,
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
      "browserName"
    ],
    extraConfig: {
      senderName: "VaniStudio Security System"
    },
    description: "Email gửi mã OTP xác thực đăng nhập hoặc thực hiện giao dịch quan trọng.",
  },
  {
    name: "Email gửi mã xác minh tài khoản mới",
    eventKey: "auth.register_verification",
    channel: "email",
    target: "client",
    subject: "Mã xác minh kích hoạt tài khoản thành viên mới tại VaniStudio",
    content: registerVerificationEmailTemplate,
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
      senderName: "VaniStudio Registration Desk"
    },
    description: "Email gửi mã xác nhận khi đăng ký tài khoản mới để kích hoạt tài khoản.",
  },
  {
    name: "Email cảnh báo: Thay đổi mật khẩu thành công",
    eventKey: "auth.password_changed",
    channel: "email",
    target: "client",
    subject: "🚨 CẢNH BÁO BẢO MẬT: Mật khẩu tài khoản VaniStudio đã được thay đổi",
    content: passwordChangedEmailTemplate,
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
      "passwordResetUrl"
    ],
    extraConfig: {
      senderName: "VaniStudio Security Command"
    },
    description: "Email gửi thông báo bảo mật cho người dùng khi mật khẩu tài khoản của họ được cập nhật thành công.",
  },
  {
    name: "Email cảnh báo: Đăng nhập từ thiết bị hoặc địa điểm lạ",
    eventKey: "auth.login_detected",
    channel: "email",
    target: "client",
    subject: "⚠️ Cảnh báo an ninh: Phát hiện phiên đăng nhập mới từ thiết bị hoặc địa điểm lạ",
    content: loginDetectedEmailTemplate,
    variables: [
      "name",
      "loginAt",
      "ipAddress",
      "ispProvider",
      "location",
      "device",
      "operatingSystem",
      "browserName",
      "logoutAllLink"
    ],
    extraConfig: {
      senderName: "VaniStudio Security Command"
    },
    description: "Email gửi cảnh báo bảo mật khi phát hiện đăng nhập từ IP, vị trí hoặc thiết bị chưa từng sử dụng trước đây.",
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
  },
  {
    name: "Email bàn giao License Key sản phẩm",
    eventKey: "license.issued",
    channel: "email",
    target: "client",
    subject: "Bàn giao chính thức Bản quyền sản phẩm & Hướng dẫn kích hoạt bản quyền - VaniStudio",
    content: licenseIssuedEmailTemplate,
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
      senderName: "VaniStudio Licensing Desk"
    },
    description: "Email gửi tự động cho khách hàng chứa mã bản quyền (license key) và hướng dẫn kích hoạt sau khi đơn hàng hoàn tất.",
  }
];

export const VARIABLE_EXPLANATIONS: Record<string, string> = {
  name: "Tên hiển thị của khách hàng/người nhận",
  email: "Địa chỉ email của tài khoản",
  userId: "Mã định danh duy nhất của người dùng",
  createdAt: "Ngày giờ đăng ký/tạo sự kiện",
  ipAddress: "Địa chỉ IP thực hiện hành động",
  location: "Vị trí địa lý ước tính từ địa chỉ IP",
  loginUrl: "Đường dẫn đăng nhập hệ thống",
  securityTipsUrl: "Đường dẫn xem khuyến cáo bảo mật an ninh mạng",
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
  firewallLink: "Đường dẫn quản lý Firewall IP an ninh",
  ignoreLink: "Đường dẫn bỏ qua cảnh báo bảo mật",
  ticketId: "Mã số vé hỗ trợ khách hàng",
  category: "Danh mục phân loại yêu cầu liên hệ",
  subject: "Chủ đề liên hệ hoặc tiêu đề thư",
  message: "Nội dung tin nhắn khách hàng gửi",
  expectedResponseTime: "Thời gian phản hồi ước tính cho khách",
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
