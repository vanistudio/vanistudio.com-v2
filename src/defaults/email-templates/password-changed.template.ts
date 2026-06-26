import { renderCard, renderRow, renderParagraph, wrapEmailTemplate } from "./helpers.template";

export const passwordChangedEmailTemplate = wrapEmailTemplate(
  "Cảnh báo bảo mật: Mật khẩu tài khoản VaniStudio đã bị thay đổi",
  `
${renderParagraph("Chào {{name}},")}
${renderParagraph("Đây là email thông báo bảo mật chính thức của VaniStudio. Mật khẩu tài khoản đăng nhập của bạn (liên kết với hòm thư {{email}}) đã được <strong>THAY ĐỔI THÀNH CÔNG</strong> vào lúc {{changedAt}}.")}

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Chi tiết phiên thay đổi mật khẩu:
</p>

${renderCard(`
  ${renderRow("globus-line-duotone", "Địa chỉ IP thực hiện", "{{ipAddress}}")}
  ${renderRow("map-point-line-duotone", "Vị trí địa lý ước tính", "{{location}}")}
  ${renderRow("smartphone-line-duotone", "Thiết bị thực hiện", "{{device}} ({{operatingSystem}})")}
  ${renderRow("monitor-line-duotone", "Trình duyệt sử dụng", "{{browserName}}")}
`)}

${renderParagraph("Nếu chính bạn là người đã thực hiện hành động thay đổi mật khẩu này, vui lòng bỏ qua nội dung email này. Mật khẩu mới của bạn đã có hiệu lực để đăng nhập.")}

<div style="margin: 28px 0; padding: 20px; background-color: #fff1f2; border: 1px dashed #f43f5e; border-radius: 8px;">
  <p style="margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #e11d48; letter-spacing: 0.05em; text-transform: uppercase;">
    HÀNH ĐỘNG KHẨN CẤP NẾU BẠN KHÔNG PHẢI NGƯỜI THAY ĐỔI:
  </p>
  <p style="margin: 0 0 16px 0; font-size: 13.5px; line-height: 1.5; color: #4c0519;">
    Nếu bạn không hề thực hiện thay đổi mật khẩu này, tài khoản của bạn hiện tại đã bị kẻ gian chiếm giữ trái phép. Bạn cần thực hiện các hành động khẩn cấp sau đây ngay lập tức:
  </p>
  <div style="text-align: center; margin-bottom: 20px;">
    <a href="{{lockAccountLink}}" target="_blank" style="background-color: #be123c; color: #ffffff; padding: 10px 24px; font-weight: 600; font-size: 12.5px; border-radius: 6px; text-decoration: none; display: inline-block; letter-spacing: 0.05em; text-transform: uppercase;">
      Khóa Khẩn Cấp Tài Khoản
    </a>
  </div>
  <ol style="margin: 0; padding-left: 20px; color: #4c0519; font-size: 13.5px; line-height: 1.6;">
    <li style="margin-bottom: 8px;">Thử tiến hành đặt lại mật khẩu thông qua email tại trang: <a href="{{passwordResetUrl}}" target="_blank" style="color: #be123c; font-weight: 600; text-decoration: underline;">Đặt lại mật khẩu</a>.</li>
    <li>Gửi thư điện tử trực tiếp tới phòng hỗ trợ khẩn cấp tại <a href="mailto:support@vanistudio.com" style="color: #be123c; font-weight: 600; text-decoration: underline;">support@vanistudio.com</a> để các quản trị viên can thiệp kịp thời.</li>
  </ol>
</div>

${renderParagraph("Hãy giữ email này cẩn thận vì nó chứa các thông tin IP và thiết bị của kẻ xâm nhập để cung cấp cho cơ quan điều tra an ninh nếu cần thiết.")}

<p style="margin: 28px 0 0 0; font-size: 14.5px; line-height: 1.65; color: #262626; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
  Trân trọng,<br />
  <strong style="color: #000000; font-weight: 600;">Đội ngũ An ninh mạng và Giám sát Tài khoản VaniStudio</strong>
</p>
`
);
