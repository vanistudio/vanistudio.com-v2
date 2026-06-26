import { renderCard, renderRow, renderParagraph, wrapEmailTemplate } from "./helpers.template";

export const loginDetectedEmailTemplate = wrapEmailTemplate(
  "Cảnh báo an ninh: Phát hiện phiên đăng nhập mới lạ",
  `
${renderParagraph("Chào {{name}},")}
${renderParagraph("Hệ thống giám sát bảo mật tài khoản VaniStudio vừa ghi nhận một hoạt động đăng nhập thành công vào tài khoản của bạn từ một thiết bị hoặc vị trí địa lý mới chưa từng được sử dụng trước đây.")}

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Thông tin chi tiết phiên đăng nhập mới:
</p>

${renderCard(`
  ${renderRow("clock-circle-line-duotone", "Thời gian đăng nhập", "{{loginAt}}")}
  ${renderRow("globus-line-duotone", "Địa chỉ IP kết nối", "{{ipAddress}}")}
  ${renderRow("users-group-two-rounded-line-duotone", "Nhà mạng (ISP)", "{{ispProvider}}")}
  ${renderRow("map-point-line-duotone", "Vị trí ước tính", "{{location}}")}
  ${renderRow("smartphone-line-duotone", "Thiết bị ghi nhận", "{{device}} ({{operatingSystem}})")}
  ${renderRow("monitor-line-duotone", "Trình duyệt sử dụng", "{{browserName}}")}
`)}

${renderParagraph("Nếu hoạt động đăng nhập này do chính bạn thực hiện (ví dụ: bạn đổi máy tính mới, sử dụng điện thoại mới, đổi mạng Wifi công cộng hoặc sử dụng dịch vụ VPN ẩn danh), bạn có thể hoàn toàn yên tâm và bỏ qua email này.")}

<div style="margin: 28px 0; padding: 20px; background-color: #fff1f2; border: 1px dashed #f43f5e; border-radius: 8px;">
  <p style="margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #e11d48; letter-spacing: 0.05em; text-transform: uppercase;">
    HÀNH ĐỘNG CẦN THIẾT NẾU ĐÂY KHÔNG PHẢI BẠN:
  </p>
  <p style="margin: 0 0 16px 0; font-size: 13.5px; line-height: 1.5; color: #4c0519;">
    Nếu phiên đăng nhập này được thực hiện bởi một người nào khác, tài khoản của bạn đã bị rò rỉ thông tin đăng nhập. Vui lòng hành động ngay lập tức để bảo vệ dữ liệu:
  </p>
  <div style="text-align: center; margin-bottom: 20px;">
    <a href="{{logoutAllLink}}" target="_blank" style="background-color: #be123c; color: #ffffff; padding: 10px 24px; font-weight: 600; font-size: 12.5px; border-radius: 6px; text-decoration: none; display: inline-block; letter-spacing: 0.05em; text-transform: uppercase;">
      Đăng Xuất Khỏi Tất Cả Thiết Bị
    </a>
  </div>
  <ol style="margin: 0; padding-left: 20px; color: #4c0519; font-size: 13.5px; line-height: 1.6;">
    <li style="margin-bottom: 8px;">Thực hiện thay đổi mật khẩu đăng nhập ngay lập tức sang một mật khẩu mạnh và duy nhất.</li>
    <li style="margin-bottom: 8px;">Kích hoạt tính năng bảo mật xác thực hai lớp (2FA) trong phần Cài đặt Bảo mật để bảo vệ tài khoản tốt hơn.</li>
    <li>Nếu cần hỗ trợ, hãy liên hệ qua hòm thư điện tử <a href="mailto:support@vanistudio.com" style="color: #be123c; font-weight: 600; text-decoration: underline;">support@vanistudio.com</a> bất kỳ lúc nào.</li>
  </ol>
</div>

<p style="margin: 28px 0 0 0; font-size: 14.5px; line-height: 1.65; color: #262626; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
  Trân trọng,<br />
  <strong style="color: #000000; font-weight: 600;">Đội ngũ Giám sát Bảo mật và An toàn Tài khoản VaniStudio</strong>
</p>
`
);
