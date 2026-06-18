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
    subject: "Chào mừng bạn gia nhập gia đình VaniStudio!",
    content: "Chào {{name}},\n\nCảm ơn bạn đã đăng ký tài khoản thành công tại VaniStudio với địa chỉ email {{email}}.\nHệ thống của chúng tôi đã kích hoạt tài khoản của bạn thành công.\n\nTrân trọng,\nVaniStudio Welcome Team.",
    variables: ["name", "email"],
    extraConfig: {
      senderName: "VaniStudio Welcome",
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
    subject: "Yêu cầu khôi phục mật khẩu tài khoản VaniStudio",
    content: "Chào {{name}},\n\nChúng tôi nhận được yêu cầu khôi phục mật khẩu của bạn. Vui lòng bấm vào liên kết dưới đây để thiết lập mật khẩu mới (Liên kết có giá trị trong 15 phút):\n\n{{resetLink}}\n\nNếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n\nTrân trọng,\nVaniStudio Security Team.",
    variables: ["name", "resetLink"],
    extraConfig: {
      senderName: "VaniStudio Security",
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
    content: "🆕 <b>Thành viên mới đăng ký</b>\n\n• Họ tên: {{name}}\n• Email: {{email}}\n• Thời gian: {{createdAt}}",
    variables: ["name", "email", "createdAt"],
    extraConfig: {
      parseMode: "HTML"
    },
    description: "Tin nhắn tự động gửi đến group Telegram của Admin để thông báo khi có user mới đăng ký.",
    isActive: true
  },
  {
    name: "Báo động Discord: Phát hiện IP brute force bị chặn",
    eventKey: "security.ip_banned",
    channel: "discord",
    target: "admin",
    content: "Hệ thống bảo mật VaniStudio Sentinel đã phát hiện và chặn một địa chỉ IP có hành vi tấn công brute force.",
    variables: ["ipAddress", "reason", "bannedAt"],
    extraConfig: {
      discordEmbed: {
        color: "#EF4444",
        title: "🚨 CẢNH BÁO BẢO MẬT: CHẶN IP TRUY CẬP",
        authorName: "VaniStudio Sentinel",
        footerText: "Hạ tầng bảo vệ VaniStudio"
      }
    },
    description: "Cảnh báo bảo mật nâng cao gửi qua Discord Rich Embed khi phát hiện và chặn IP spam.",
    isActive: true
  },
  {
    name: "Cảnh báo Telegram: Phát hiện IP brute force bị chặn",
    eventKey: "security.ip_banned",
    channel: "telegram",
    target: "admin",
    content: "🚨 <b>CẢNH BÁO BẢO MẬT: CHẶN IP TRUY CẬP</b>\n\nHệ thống bảo mật VaniStudio Sentinel đã phát hiện và chặn một địa chỉ IP có hành vi tấn công brute force.\n\n• Địa chỉ IP: {{ipAddress}}\n• Lý do: {{reason}}\n• Thời gian: {{bannedAt}}",
    variables: ["ipAddress", "reason", "bannedAt"],
    extraConfig: {
      parseMode: "HTML"
    },
    description: "Cảnh báo bảo mật gửi qua tin nhắn Telegram khi phát hiện và chặn IP spam.",
    isActive: true
  },
  {
    name: "Cảnh báo Slack: Phát hiện IP brute force bị chặn",
    eventKey: "security.ip_banned",
    channel: "slack",
    target: "admin",
    content: "Cảnh báo bảo mật: Phát hiện IP brute force bị chặn",
    variables: ["ipAddress", "reason", "bannedAt"],
    extraConfig: {
      slackBlocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "🚨 *CẢNH BÁO BẢO MẬT: CHẶN IP TRUY CẬP*\nHệ thống bảo mật VaniStudio Sentinel đã phát hiện và chặn một địa chỉ IP có hành vi tấn công brute force."
          }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: "*Địa chỉ IP:*\n{{ipAddress}}" },
            { type: "mrkdwn", text: "*Lý do:*\n{{reason}}" },
            { type: "mrkdwn", text: "*Thời gian:*\n{{bannedAt}}" }
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
    subject: "Chúng tôi đã nhận được thông tin liên hệ của bạn",
    content: "Chào {{name}},\n\nCảm ơn bạn đã gửi liên hệ về chủ đề: **{{subject}}**.\nĐội ngũ hỗ trợ của VaniStudio đã nhận được yêu cầu và sẽ xem xét phản hồi bạn sớm nhất có thể (trong vòng 24 giờ làm việc).\n\nNội dung bạn đã gửi:\n\"{{message}}\"\n\nTrân trọng,\nVaniStudio Support Team.",
    variables: ["name", "subject", "message"],
    extraConfig: {
      senderName: "VaniStudio Support",
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
    subject: "[Liên hệ mới] {{subject}} - {{name}}",
    content: "Chào Admin,\n\nHệ thống vừa ghi nhận một yêu cầu liên hệ mới từ khách hàng:\n\n• Họ tên: {{name}}\n• Email: {{email}}\n• Chủ đề: {{subject}}\n• Nội dung tin nhắn:\n{{message}}\n\nVui lòng truy cập trang quản trị để xử lý yêu cầu này.\n\nTrân trọng,\nVaniStudio Core System.",
    variables: ["name", "email", "subject", "message"],
    extraConfig: {
      senderName: "VaniStudio System",
      senderEmail: "system@vanistudio.com"
    },
    description: "Email thông báo cho Admin khi có khách hàng gửi biểu mẫu liên hệ.",
    isActive: true
  },
  {
    name: "Thông báo Telegram: Có liên hệ mới từ khách hàng",
    eventKey: "contact.new_submission",
    channel: "telegram",
    target: "admin",
    content: "📬 <b>Yêu cầu liên hệ mới</b>\n\n• Khách hàng: {{name}}\n• Email: {{email}}\n• Chủ đề: {{subject}}\n• Nội dung: {{message}}",
    variables: ["name", "email", "subject", "message"],
    extraConfig: {
      parseMode: "HTML"
    },
    description: "Tin nhắn gửi vào Telegram của Admin thông báo có liên hệ mới.",
    isActive: true
  },
  {
    name: "Cảnh báo Discord: Có liên hệ mới từ khách hàng",
    eventKey: "contact.new_submission",
    channel: "discord",
    target: "admin",
    content: "Nhận yêu cầu liên hệ mới từ biểu mẫu public.",
    variables: ["name", "email", "subject", "message"],
    extraConfig: {
      discordEmbed: {
        color: "#3B82F6",
        title: "📬 LIÊN HỆ MỚI TỪ KHÁCH HÀNG",
        authorName: "VaniStudio Inbox",
        footerText: "VaniStudio Contact Form Engine"
      }
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
    variables: ["name", "email", "subject", "message"],
    extraConfig: {
      slackBlocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "📬 *Bạn có liên hệ mới từ khách hàng!*"
          }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: "*Khách hàng:*\n{{name}}" },
            { type: "mrkdwn", text: "*Email:*\n{{email}}" },
            { type: "mrkdwn", text: "*Chủ đề:*\n{{subject}}" }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Lời nhắn:*\n{{message}}"
          }
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
    subject: "Bảo mật tài khoản: Đã kích hoạt xác thực 2 lớp (2FA)",
    content: "Chào {{name}},\n\nBạn đã kích hoạt thành công tính năng xác thực 2 lớp (2FA) bằng email cho tài khoản VaniStudio của mình.\nKể từ bây giờ, mỗi lần đăng nhập bạn sẽ được yêu cầu nhập mã OTP gửi tới email này.\n\nNếu bạn không thực hiện thay đổi này, hãy liên hệ ngay với chúng tôi để bảo vệ tài khoản.\n\nTrân trọng,\nVaniStudio Security Team.",
    variables: ["name"],
    extraConfig: {
      senderName: "VaniStudio Security",
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
    subject: "Bảo mật tài khoản: Đã tắt xác thực 2 lớp (2FA)",
    content: "Chào {{name}},\n\nTính năng xác thực 2 lớp (2FA) cho tài khoản VaniStudio của bạn đã bị hủy kích hoạt.\nTài khoản của bạn hiện chỉ được bảo vệ bởi mật khẩu thông thường.\n\nNếu bạn không thực hiện thay đổi này, hãy đổi mật khẩu ngay lập tức hoặc liên hệ hỗ trợ kỹ thuật để tránh mất an toàn thông tin.\n\nTrân trọng,\nVaniStudio Security Team.",
    variables: ["name"],
    extraConfig: {
      senderName: "VaniStudio Security",
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
    subject: "Mã OTP xác thực tài khoản VaniStudio của bạn",
    content: "Chào {{name}},\n\nMã OTP xác thực của bạn là: **{{otpCode}}**\nMã này có hiệu lực trong vòng {{expireMinutes}} phút. Vui lòng không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.\n\nTrân trọng,\nVaniStudio Security Team.",
    variables: ["name", "otpCode", "expireMinutes"],
    extraConfig: {
      senderName: "VaniStudio Security",
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
    subject: "Xác minh địa chỉ email tài khoản VaniStudio của bạn",
    content: "Chào {{name}},\n\nCảm ơn bạn đã đăng ký tài khoản tại VaniStudio. Vui lòng sử dụng mã xác minh dưới đây để kích hoạt tài khoản của bạn:\n\nMã xác minh: **{{verificationCode}}**\nMã có hiệu lực trong vòng {{expireMinutes}} phút.\n\nTrân trọng,\nVaniStudio Welcome Team.",
    variables: ["name", "verificationCode", "expireMinutes"],
    extraConfig: {
      senderName: "VaniStudio Welcome",
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
    subject: "Cảnh báo bảo mật: Mật khẩu tài khoản VaniStudio đã bị thay đổi",
    content: "Chào {{name}},\n\nMật khẩu cho tài khoản VaniStudio của bạn (liên kết với email {{email}}) đã được thay đổi thành công vào lúc {{changedAt}}.\n\nNếu bạn là người thực hiện thay đổi này, bạn có thể an tâm bỏ qua email này.\nNếu bạn KHÔNG thực hiện thay đổi này, tài khoản của bạn có thể đã bị xâm nhập. Vui lòng bấm vào liên kết dưới đây ngay lập tức để khóa tài khoản tạm thời và liên hệ hỗ trợ khẩn cấp:\n\n{{lockAccountLink}}\n\nTrân trọng,\nVaniStudio Security Team.",
    variables: ["name", "email", "changedAt", "lockAccountLink"],
    extraConfig: {
      senderName: "VaniStudio Security",
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
    subject: "Cảnh báo bảo mật: Phát hiện hoạt động đăng nhập mới",
    content: "Chào {{name}},\n\nChúng tôi phát hiện tài khoản VaniStudio của bạn vừa được đăng nhập thành công từ một thiết bị hoặc địa điểm mới:\n\n• Địa chỉ IP: {{ipAddress}}\n• Thiết bị/Trình duyệt: {{device}}\n• Thời gian: {{loginAt}}\n• Vị trí ước tính: {{location}}\n\nNếu đây là bạn, không cần thực hiện thêm hành động nào.\nNếu bạn KHÔNG thực hiện đăng nhập này, vui lòng đổi mật khẩu ngay lập tức hoặc bấm vào liên kết dưới đây để hủy tất cả các phiên đăng nhập khác của tài khoản này:\n\n{{logoutAllLink}}\n\nTrân trọng,\nVaniStudio Security Team.",
    variables: ["name", "ipAddress", "device", "loginAt", "location", "logoutAllLink"],
    extraConfig: {
      senderName: "VaniStudio Security",
      senderEmail: "security@vanistudio.com"
    },
    description: "Email gửi cảnh báo bảo mật khi phát hiện đăng nhập từ IP, vị trí hoặc thiết bị chưa từng sử dụng trước đây.",
    isActive: true
  }
];
