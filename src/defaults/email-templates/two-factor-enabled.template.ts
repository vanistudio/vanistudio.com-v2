import { renderCard, renderRow, renderParagraph, renderListItem, wrapEmailTemplate } from "./helpers.template";

export const twoFactorEnabledEmailTemplate = wrapEmailTemplate(
  "Xác nhận kích hoạt tính năng Xác thực 2 lớp (2FA)",
  `
${renderParagraph("Chào {{name}},")}
${renderParagraph("Chúng tôi gửi email này để xác nhận rằng tính năng Xác thực 2 lớp (2FA) đã được kích hoạt thành công cho tài khoản VaniStudio của bạn vào lúc {{enabledAt}}.")}

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Thông tin chi tiết thiết lập:
</p>

${renderCard(`
  ${renderRow("shield-check-line-duotone", "Trạng thái 2FA", "Đã kích hoạt (ENABLED)")}
  ${renderRow("key-line-duotone", "Phương thức xác thực", "Mã OTP (Google Authenticator / Authy)")}
  ${renderRow("globus-line-duotone", "Địa chỉ IP yêu cầu", "{{ipAddress}}")}
  ${renderRow("map-point-line-duotone", "Vị trí địa lý", "{{location}}")}
  ${renderRow("smartphone-line-duotone", "Thiết bị & Hệ điều hành", "{{device}} ({{operatingSystem}})")}
  ${renderRow("monitor-line-duotone", "Trình duyệt sử dụng", "{{browserName}}")}
`)}

${renderParagraph("Kể từ thời điểm này, mỗi khi đăng nhập vào hệ thống từ bất kỳ thiết bị mới nào, bạn sẽ được yêu cầu nhập mã OTP gồm 6 chữ số được tạo ngẫu nhiên từ ứng dụng xác thực của bạn để hoàn tất đăng nhập. Điều này giúp nâng cao đáng kể mức độ bảo mật cho tài khoản của bạn, ngăn chặn các hành vi đánh cắp mật khẩu thông thường.")}

<p style="margin: 24px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Hành động quan trọng cần thiết:
</p>
<ul style="margin: 0 0 20px 0; padding-left: 20px;">
  ${renderListItem("Hãy đảm bảo bạn đã lưu trữ các <strong>Mã dự phòng khôi phục (Backup Codes)</strong> ở một nơi an toàn. Nếu bạn làm mất thiết bị cài ứng dụng xác thực, các mã này là cách duy nhất giúp bạn tự lấy lại tài khoản mà không cần thông qua hỗ trợ của quản trị viên.")}
  ${renderListItem("Bạn có thể xem lại mã dự phòng tại: <a href=\"{{backupCodesUrl}}\" target=\"_blank\" style=\"color: #0f172a; font-weight: 600; text-decoration: underline;\">Trang mã khôi phục dự phòng</a>.")}
</ul>

<div style="margin: 28px 0; padding: 20px; background-color: #fff1f2; border: 1px dashed #f43f5e; border-radius: 8px;">
  <p style="margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #e11d48; letter-spacing: 0.05em; text-transform: uppercase;">
    CẢNH BÁO BẢO MẬT KHẨN CẤP:
  </p>
  <p style="margin: 0 0 16px 0; font-size: 13.5px; line-height: 1.5; color: #4c0519;">
    If you did not perform this 2FA activation, your password has been leaked and someone is trying to hijack your account. Please lock your account immediately:
  </p>
  <div style="text-align: center;">
    <a href="{{lockAccountLink}}" target="_blank" style="background-color: #be123c; color: #ffffff; padding: 10px 24px; font-weight: 600; font-size: 12.5px; border-radius: 6px; text-decoration: none; display: inline-block; letter-spacing: 0.05em; text-transform: uppercase;">
      Khóa Khẩn Cấp Tài Khoản
    </a>
  </div>
</div>

<p style="margin: 28px 0 0 0; font-size: 14.5px; line-height: 1.65; color: #262626; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
  Trân trọng,<br />
  <strong style="color: #000000; font-weight: 600;">Đội ngũ Bảo mật An ninh mạng VaniStudio</strong><br />
  <a href="mailto:support@vanistudio.com" style="color: #0f172a; text-decoration: none; font-weight: 500;">support@vanistudio.com</a>
</p>
`
);
