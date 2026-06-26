import { renderCard, renderRow, renderCTA, renderParagraph, wrapEmailTemplate } from "./helpers.template";

export const welcomeEmailTemplate = wrapEmailTemplate(
  "Chào mừng bạn gia nhập VaniStudio",
  `
${renderParagraph("Chào {{name}},")}
${renderParagraph("Chào mừng bạn đã gia nhập VaniStudio - Nền tảng phát triển sản phẩm công nghệ và thiết kế giao diện cao cấp. Chúng tôi vô cùng vui mừng khi được đồng hành cùng bạn trên con đường xây dựng các giải pháp số hóa đột phá.")}
${renderParagraph("Tài khoản của bạn đã được khởi tạo thành công với các thông tin chi tiết dưới đây:")}

${renderCard(`
  ${renderRow("user-circle-line-duotone", "Họ tên", "{{name}}")}
  ${renderRow("letter-line-duotone", "Email tài khoản", "{{email}}")}
  ${renderRow("card-2-line-duotone", "Mã thành viên", "#{{userId}}")}
  ${renderRow("calendar-line-duotone", "Thời gian đăng ký", "{{createdAt}}")}
  ${renderRow("globus-line-duotone", "Địa chỉ IP đăng ký", "{{ipAddress}}")}
  ${renderRow("map-point-line-duotone", "Vị trí địa lý đăng ký", "{{location}}")}
`)}

${renderCTA(
  "Để bắt đầu trải nghiệm đầy đủ các tính năng của hệ thống, vui lòng truy cập và đăng nhập tại đường dẫn sau:",
  "Đăng Nhập Tài Khoản",
  "{{loginUrl}}"
)}

${renderParagraph("Một lần nữa, xin chân thành cảm ơn bạn đã lựa chọn VaniStudio!")}

<p style="margin: 24px 0 0 0; font-size: 14.5px; line-height: 1.65; color: #262626; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
  Trân trọng,<br />
  <strong style="color: #000000; font-weight: 600;">Đội ngũ Sáng lập VaniStudio</strong><br />
  <a href="https://vanistudio.com" target="_blank" style="color: #0f172a; text-decoration: none; font-weight: 500;">https://vanistudio.com</a>
</p>
`
);
