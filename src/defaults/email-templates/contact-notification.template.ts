import { renderCard, renderRow, renderQuote, renderParagraph, renderListItem, renderCTA, wrapEmailTemplate } from "./helpers.template";

export const contactNotificationEmailTemplate = wrapEmailTemplate(
  "Thông báo Admin: Yêu cầu liên hệ mới",
  `
${renderParagraph("Chào Admin,")}
${renderParagraph("Hệ thống VaniStudio CRM vừa tiếp nhận biểu mẫu liên hệ trực tuyến mới từ khách hàng. Vui lòng kiểm duyệt và phản hồi sớm nhất có thể.")}

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Thông tin chi tiết vé hỗ trợ:
</p>

${renderCard(`
  ${renderRow("card-2-line-duotone", "Mã số vé", "#{{ticketId}}")}
  ${renderRow("folder-open-line-duotone", "Danh mục", "{{category}}")}
  ${renderRow("shield-warning-line-duotone", "Độ ưu tiên", "{{priorityLevel}}")}
  ${renderRow("user-circle-line-duotone", "Họ và tên khách hàng", "{{name}}")}
  ${renderRow("letter-line-duotone", "Địa chỉ Email", "{{email}}")}
  ${renderRow("phone-line-duotone", "Số điện thoại", "{{phone}}")}
  ${renderRow("history-line-duotone", "Số vé trước đây", "{{previousTicketsCount}} vé")}
  ${renderRow("calendar-line-duotone", "Thời gian gửi", "{{createdAt}}")}
  ${renderRow("link-line-duotone", "URL nguồn", "<a href=\"{{referrerUrl}}\" target=\"_blank\" style=\"color: #0f172a; text-decoration: underline;\">Xem link nguồn</a>")}
  ${renderRow("users-group-two-rounded-line-duotone", "Bộ phận tiếp nhận", "{{assignedTeam}}")}
`)}

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Thông tin kết nối &amp; thiết bị:
</p>

${renderCard(`
  ${renderRow("globus-line-duotone", "Địa chỉ IP người gửi", "{{ipAddress}}")}
  ${renderRow("monitor-line-duotone", "Thiết bị & Hệ điều hành", "{{deviceInfo}}")}
`)}

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Nội dung yêu cầu chi tiết:
</p>

<p style="margin: 0 0 10px 0; font-size: 14.5px; font-weight: bold; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  Chủ đề: {{subject}}
</p>

${renderQuote("{{message}}")}

<p style="margin: 24px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Hướng dẫn xử lý dành cho Admin:
</p>

${renderCTA(
  "Đăng nhập trang quản trị CRM để phân công hoặc trả lời trực tiếp:",
  "Mở CRM Hộp Thư",
  "{{inboxUrl}}"
)}

<ul style="margin: 0 0 20px 0; padding-left: 20px;">
  ${renderListItem("Bạn có thể phản hồi trực tiếp qua email cá nhân của khách hàng: <a href=\"mailto:{{email}}?subject=Re:%20[VaniStudio]%20{{subject}}\" style=\"color: #0f172a; font-weight: 600; text-decoration: underline;\">Bấm vào đây để Email</a>")}
</ul>

<p style="margin: 28px 0 0 0; font-size: 14.5px; line-height: 1.65; color: #262626; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
  Trân trọng,<br />
  <strong style="color: #000000; font-weight: 600;">Hệ thống CRM Tự động VaniStudio Engine</strong>
</p>
`
);
