import { renderCard, renderRow, renderCTA, renderParagraph, renderListItem, wrapEmailTemplate } from "./helpers.template";

export const forgotPasswordEmailTemplate = wrapEmailTemplate(
  "Khôi phục mật khẩu tài khoản VaniStudio",
  `
${renderParagraph("Chào {{name}},")}
${renderParagraph("Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản VaniStudio của bạn đăng ký qua địa chỉ email {{email}}.")}

${renderCTA(
  "Để tiến hành đặt lại mật khẩu mới, vui lòng nhấp vào liên kết bảo mật dưới đây:",
  "Đặt Lại Mật Khẩu",
  "{{resetLink}}"
)}

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Lưu ý bảo mật quan trọng về yêu cầu:
</p>

${renderCard(`
  ${renderRow("clock-circle-line-duotone", "Thời hạn hiệu lực", "{{expiryDurationMinutes}} phút (Hết hạn lúc {{expireTime}})")}
  ${renderRow("globus-line-duotone", "Địa chỉ IP gửi yêu cầu", "{{ipAddress}}")}
  ${renderRow("map-point-line-duotone", "Vị trí địa lý", "{{location}}")}
  ${renderRow("smartphone-line-duotone", "Thiết bị & Hệ điều hành", "{{device}} ({{operatingSystem}})")}
  ${renderRow("monitor-line-duotone", "Trình duyệt thực hiện", "{{browserName}}")}
`)}

${renderParagraph("Nếu bạn <strong>KHÔNG</strong> thực hiện yêu cầu này, vui lòng bỏ qua email. Mật khẩu hiện tại của bạn vẫn sẽ được giữ an toàn và không bị thay đổi.")}

<p style="margin: 24px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Để bảo vệ tối đa cho tài khoản, chúng tôi khuyên bạn nên:
</p>
<ul style="margin: 0 0 20px 0; padding-left: 20px;">
  ${renderListItem("Tuyệt đối không chia sẻ email này hoặc sao chép liên kết trên gửi cho bất kỳ ai.")}
  ${renderListItem("Đọc thêm các khuyến cáo an ninh mạng của chúng tôi tại: <a href=\"{{securityTipsUrl}}\" target=\"_blank\" style=\"color: #0f172a; font-weight: 600; text-decoration: underline;\">Cẩm nang bảo mật VaniStudio</a>.")}
</ul>

${renderParagraph("Nếu cần trợ giúp thêm, vui lòng liên hệ ngay với Bộ phận Hỗ trợ Kỹ thuật &amp; An ninh VaniStudio qua số hotline <strong>{{supportHotline}}</strong> hoặc phản hồi trực tiếp email này.")}

<p style="margin: 28px 0 0 0; font-size: 14.5px; line-height: 1.65; color: #262626; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
  Trân trọng,<br />
  <strong style="color: #000000; font-weight: 600;">Phòng An ninh mạng &amp; Bảo mật Thông tin VaniStudio</strong><br />
  <a href="mailto:security@vanistudio.com" style="color: #0f172a; text-decoration: none; font-weight: 500;">security@vanistudio.com</a>
</p>
`
);
