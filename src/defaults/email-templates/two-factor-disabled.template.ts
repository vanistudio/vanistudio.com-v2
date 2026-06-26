import { renderCard, renderRow, renderCTA, renderParagraph, wrapEmailTemplate } from "./helpers.template";

export const twoFactorDisabledEmailTemplate = wrapEmailTemplate(
  "CẢNH BÁO: Tính năng Xác thực 2 lớp (2FA) đã bị tắt",
  `
${renderParagraph("Chào {{name}},")}
${renderParagraph("Đây là thông báo khẩn cấp từ trung tâm bảo mật VaniStudio. Tính năng Xác thực hai lớp (2FA) trên tài khoản của bạn đã bị <strong>HỦY KÍCH HOẠT</strong> thành công vào lúc {{disabledAt}}.")}

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Chi tiết phiên thay đổi:
</p>

${renderCard(`
  ${renderRow("shield-cross-line-duotone", "Trạng thái 2FA", "Đã tắt (DISABLED)")}
  ${renderRow("globus-line-duotone", "Địa chỉ IP thực hiện", "{{ipAddress}}")}
  ${renderRow("map-point-line-duotone", "Vị trí địa lý", "{{location}}")}
  ${renderRow("smartphone-line-duotone", "Thiết bị thực hiện", "{{device}} ({{operatingSystem}})")}
  ${renderRow("monitor-line-duotone", "Trình duyệt sử dụng", "{{browserName}}")}
`)}

<div style="margin: 24px 0; padding: 20px; background-color: #fffbeb; border: 1px dashed #f59e0b; border-radius: 8px;">
  <p style="margin: 0 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #d97706; letter-spacing: 0.05em; text-transform: uppercase;">
    CẢNH BÁO BẢO MẬT QUAN TRỌNG:
  </p>
  <p style="margin: 0; font-size: 13.5px; line-height: 1.5; color: #78350f;">
    Khi tính năng 2FA bị tắt, tài khoản của bạn sẽ không còn được bảo vệ bởi lớp xác thực thứ hai nữa. Tài khoản lúc này chỉ được bảo mật bằng một lớp mật khẩu thông thường, khiến cho nguy cơ bị xâm nhập, rò rỉ dữ liệu hoặc bị tấn công brute force tăng lên cực kỳ cao.
  </p>
</div>

${renderCTA(
  "Chúng tôi khuyến cáo bạn nên kích hoạt lại 2FA càng sớm càng tốt để bảo vệ tài khoản:",
  "Kích Hoạt Lại 2FA",
  "{{reEnableLink}}"
)}

<div style="margin: 28px 0; padding: 20px; background-color: #fff1f2; border: 1px dashed #f43f5e; border-radius: 8px;">
  <p style="margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #e11d48; letter-spacing: 0.05em; text-transform: uppercase;">
    HÀNH ĐỘNG KHẨN CẤP NẾU BẠN KHÔNG TẮT 2FA:
  </p>
  <p style="margin: 0 0 16px 0; font-size: 13.5px; line-height: 1.5; color: #4c0519;">
    Nếu bạn không thực hiện việc tắt 2FA này, tài khoản của bạn đã bị kẻ tấn công chiếm quyền kiểm soát. Vui lòng thực hiện các bước sau ngay lập tức:
  </p>
  <ol style="margin: 0; padding-left: 20px; color: #4c0519; font-size: 13.5px; line-height: 1.6;">
    <li style="margin-bottom: 8px;">Tiến hành đổi mật khẩu đăng nhập sang một mật khẩu mới mạnh hơn và kích hoạt lại 2FA trong phần Cài đặt Bảo mật.</li>
    <li>Nếu không thể đăng nhập, hãy liên hệ ngay với phòng Hỗ trợ An ninh của chúng tôi qua địa chỉ email <a href="mailto:support@vanistudio.com" style="color: #be123c; font-weight: 600; text-decoration: underline;">support@vanistudio.com</a> để được khóa tài khoản và tiến hành xác minh danh tính khôi phục.</li>
  </ol>
</div>

<p style="margin: 28px 0 0 0; font-size: 14.5px; line-height: 1.65; color: #262626; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
  Trân trọng,<br />
  <strong style="color: #000000; font-weight: 600;">Đội ngũ Bảo mật An ninh mạng VaniStudio</strong><br />
  <a href="mailto:support@vanistudio.com" style="color: #0f172a; text-decoration: none; font-weight: 500;">support@vanistudio.com</a>
</p>
`
);
