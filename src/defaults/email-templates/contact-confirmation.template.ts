import { renderCard, renderRow, renderQuote, renderParagraph, wrapEmailTemplate } from "./helpers.template";

export const contactConfirmationEmailTemplate = wrapEmailTemplate(
  "Xác nhận tiếp nhận yêu cầu liên hệ",
  `
${renderParagraph("Chào {{name}},")}
${renderParagraph("Cảm ơn bạn đã gửi thư liên hệ tới VaniStudio.")}
${renderParagraph("Chúng tôi xin thông báo đã tiếp nhận yêu cầu của bạn thành công. Hệ thống đã tự động tạo một vé hỗ trợ có thông tin chi tiết như sau:")}

${renderCard(`
  ${renderRow("card-2-line-duotone", "Mã số vé (Ticket ID)", "#{{ticketId}}")}
  ${renderRow("user-circle-line-duotone", "Họ tên khách hàng", "{{name}}")}
  ${renderRow("letter-line-duotone", "Email liên hệ", "{{email}}")}
  ${renderRow("folder-open-line-duotone", "Danh mục yêu cầu", "{{category}}")}
  ${renderRow("document-text-line-duotone", "Tiêu đề liên hệ", "{{subject}}")}
  ${renderRow("calendar-line-duotone", "Thời gian ghi nhận", "{{createdAt}}")}
  ${renderRow("clock-circle-line-duotone", "Phản hồi dự kiến", "{{expectedResponseTime}}")}
`)}

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Chi tiết nội dung tin nhắn bạn đã gửi:
</p>

${renderQuote("{{message}}")}

${renderParagraph("<strong>Lưu ý:</strong> Nếu bạn có thêm bất kỳ thông tin nào cần bổ sung cho yêu cầu này, vui lòng phản hồi trực tiếp vào email này mà không cần thay đổi tiêu đề thư. Đội ngũ kỹ thuật viên và chuyên viên của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.")}

<p style="margin: 28px 0 0 0; font-size: 14.5px; line-height: 1.65; color: #262626; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
  Trân trọng,<br />
  <strong style="color: #000000; font-weight: 600;">Đội ngũ CSKH và Hỗ trợ Kỹ thuật VaniStudio</strong><br />
  <a href="mailto:support@vanistudio.com" style="color: #0f172a; text-decoration: none; font-weight: 500;">support@vanistudio.com</a>
</p>
`
);
