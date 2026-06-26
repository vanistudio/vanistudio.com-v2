import { renderCard, renderRow, renderParagraph, renderListItem, wrapEmailTemplate } from "./helpers.template";

export const otpVerificationEmailTemplate = wrapEmailTemplate(
  "Mã xác thực OTP tài khoản VaniStudio của bạn",
  `
${renderParagraph("Chào {{name}},")}
${renderParagraph("Chúng tôi nhận được yêu cầu lấy mã OTP xác minh giao dịch hoặc xác thực đăng nhập tài khoản VaniStudio của bạn.")}

<!-- Branded OTP Code Box -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0; background-color: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 8px;">
  <tr>
    <td style="padding: 24px; text-align: center;">
      <p style="margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
        Mã xác thực một lần (OTP):
      </p>
      <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: 0.2em; padding: 12px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; display: inline-block; margin: 0 auto; text-align: center;">
        {{otpCode}}
      </div>
      <p style="margin: 14px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11.5px; color: #888888;">
        Mã này sẽ hết hiệu lực sau đúng {{expireMinutes}} phút (hết hạn vào lúc {{expireTime}}).
      </p>
    </td>
  </tr>
</table>

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Thông tin phiên yêu cầu:
</p>

${renderCard(`
  ${renderRow("shield-warning-line-duotone", "Hành động xác thực", "{{actionType}}")}
  ${renderRow("globus-line-duotone", "Địa chỉ IP thực hiện", "{{ipAddress}} ({{location}})")}
  ${renderRow("smartphone-line-duotone", "Thiết bị & Hệ điều hành", "{{device}} ({{operatingSystem}})")}
  ${renderRow("monitor-line-duotone", "Trình duyệt yêu cầu", "{{browserName}}")}
`)}

<p style="margin: 24px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Nguyên tắc an toàn bảo mật tài khoản:
</p>
<ul style="margin: 0 0 20px 0; padding-left: 20px;">
  ${renderListItem("Tuyệt đối <strong>KHÔNG</strong> chia sẻ mã OTP này với bất kỳ ai, kể cả nhân viên hỗ trợ của VaniStudio. Chúng tôi không bao giờ yêu cầu bạn cung cấp mã OTP qua điện thoại, email hoặc các kênh chat.")}
  ${renderListItem("Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Tài khoản của bạn vẫn an toàn và mã này sẽ tự động hết hiệu lực sau vài phút.")}
  ${renderListItem("Nếu phát hiện nhiều email yêu cầu OTP liên tiếp mà không phải do mình thực hiện, vui lòng liên hệ ngay với hòm thư an ninh tại <a href=\"mailto:support@vanistudio.com\" style=\"color: #0f172a; font-weight: 600; text-decoration: underline;\">support@vanistudio.com</a>.")}
</ul>

<p style="margin: 28px 0 0 0; font-size: 14.5px; line-height: 1.65; color: #262626; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
  Trân trọng,<br />
  <strong style="color: #000000; font-weight: 600;">Đội ngũ Kỹ thuật &amp; Bảo mật Hệ thống VaniStudio</strong>
</p>
`
);
