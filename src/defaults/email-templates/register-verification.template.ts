import { renderCard, renderRow, renderCTA, renderParagraph, wrapEmailTemplate } from "./helpers.template";

export const registerVerificationEmailTemplate = wrapEmailTemplate(
  "Mã xác minh kích hoạt tài khoản thành viên mới",
  `
${renderParagraph("Chào {{name}},")}
${renderParagraph("Cảm ơn bạn đã lựa chọn đăng ký tài khoản tại hệ thống VaniStudio! Bước cuối cùng để bạn hoàn tất quy trình thiết lập tài khoản và bắt đầu sử dụng tài nguyên của chúng tôi là xác minh địa chỉ email đăng ký.")}

<!-- Branded Verification Code Box -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0; background-color: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 8px;">
  <tr>
    <td style="padding: 24px; text-align: center;">
      <p style="margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
        Mã xác minh kích hoạt tài khoản:
      </p>
      <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: 0.2em; padding: 12px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; display: inline-block; margin: 0 auto; text-align: center;">
        {{verificationCode}}
      </div>
      <p style="margin: 14px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11.5px; color: #888888;">
        Mã xác minh có hiệu lực trong vòng đúng {{expireMinutes}} phút (hết hạn vào lúc {{expireTime}}).
      </p>
    </td>
  </tr>
</table>

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Thông tin phiên đăng ký:
</p>

${renderCard(`
  ${renderRow("smartphone-line-duotone", "Thiết bị đăng ký", "{{device}}")}
  ${renderRow("globus-line-duotone", "Địa chỉ IP", "{{ipAddress}}")}
`)}

${renderCTA(
  "Nếu mã trên đã hết hạn sử dụng, bạn có thể gửi lại yêu cầu mã xác minh mới tại đây:",
  "Gửi Lại Mã Xác Minh",
  "{{resendLink}}"
)}

${renderParagraph("Nếu bạn có bất kỳ câu hỏi nào trong quá trình kích hoạt tài khoản hoặc gặp sự cố kỹ thuật, vui lòng tham khảo trang <a href=\"{{helpLink}}\" target=\"_blank\" style=\"color: #0f172a; font-weight: 600; text-decoration: underline;\">Trợ giúp của VaniStudio</a> hoặc gửi thư về email hỗ trợ để được hướng dẫn trực tiếp.")}

${renderParagraph("Chào mừng bạn gia nhập cộng đồng sáng tạo của chúng tôi!")}

<p style="margin: 28px 0 0 0; font-size: 14.5px; line-height: 1.65; color: #262626; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
  Trân trọng,<br />
  <strong style="color: #000000; font-weight: 600;">Đội ngũ Vận hành &amp; Phát triển Cộng đồng VaniStudio</strong>
</p>
`
);
