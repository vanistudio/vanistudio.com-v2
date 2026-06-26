import { renderCard, renderRow, renderParagraph, renderListItem, renderCodeBlock, wrapEmailTemplate } from "./helpers.template";

export const licenseIssuedEmailTemplate = wrapEmailTemplate(
  "Bàn giao chính thức Bản quyền sản phẩm & Hướng dẫn kích hoạt",
  `
${renderParagraph("Chào {{name}},")}
${renderParagraph("Thay mặt VaniStudio, chúng tôi chân thành cảm ơn bạn đã tin tưởng mua sắm và sử dụng các sản phẩm công nghệ của chúng tôi. Giao dịch mua sản phẩm của bạn đã hoàn tất thành công và được hệ thống thanh toán tự động xác nhận.")}
${renderParagraph("Chúng tôi xin chính thức bàn giao thông tin bản quyền (License Key) và các tài liệu hướng dẫn kích hoạt đi kèm:")}

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Thông tin khách hàng &amp; đơn hàng:
</p>

${renderCard(`
  ${renderRow("user-circle-line-duotone", "Họ tên khách hàng", "{{name}}")}
  ${renderRow("card-2-line-duotone", "Mã số đơn hàng", "#{{orderId}}")}
  ${renderRow("calendar-line-duotone", "Thời gian giao dịch", "{{issuedAt}}")}
  ${renderRow("bill-list-line-duotone", "Tổng thanh toán", "{{price}} {{currency}}")}
  ${renderRow("map-point-line-duotone", "Địa chỉ thanh toán", "{{billingAddress}}")}
`)}

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Thông tin bản quyền sản phẩm:
</p>

${renderCard(`
  ${renderRow("box-line-duotone", "Tên sản phẩm", "<strong>{{productName}}</strong>")}
  ${renderRow("info-square-line-duotone", "Phiên bản phát hành", "{{productVersion}}")}
  ${renderRow("document-text-line-duotone", "Loại giấy phép", "{{licenseType}}")}
  ${renderRow("devices-line-duotone", "Thiết bị tối đa", "{{maxActivations}} thiết bị")}
  ${renderRow("key-line-duotone", "Mã bản quyền (License Key)", "<code style=\"font-family: monospace; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold;\">{{licenseKey}}</code>")}
  ${renderRow("calendar-minimalistic-line-duotone", "Thời hạn sử dụng", "{{expiryDate}}")}
  ${renderRow("chat-square-call-line-duotone", "Hỗ trợ kỹ thuật", "{{supportDuration}}")}
`)}

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Hướng dẫn kích hoạt &amp; cài đặt nhanh:
</p>

${renderCodeBlock("{{activationGuide}}")}

<p style="margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
  Các đường dẫn tài nguyên hữu ích:
</p>
<ul style="margin: 0 0 20px 0; padding-left: 20px;">
  ${renderListItem("Tải bộ cài đặt sản phẩm gốc: <a href=\"{{downloadUrl}}\" target=\"_blank\" style=\"color: #0f172a; font-weight: 600; text-decoration: underline;\">Tải sản phẩm</a>")}
  ${renderListItem("Xem tài liệu hướng dẫn kỹ thuật chi tiết: <a href=\"{{documentationUrl}}\" target=\"_blank\" style=\"color: #0f172a; font-weight: 600; text-decoration: underline;\">Tài liệu hướng dẫn</a>")}
  ${renderListItem("Truy cập Cổng quản lý bản quyền khách hàng để xem lịch sử kích hoạt hoặc đổi thiết bị: <a href=\"{{customerPortalUrl}}\" target=\"_blank\" style=\"color: #0f172a; font-weight: 600; text-decoration: underline;\">Cổng quản lý bản quyền</a>")}
</ul>

<p style="margin: 24px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase;">
Lưu ý bảo mật quan trọng:
</p>
<ul style="margin: 0 0 20px 0; padding-left: 20px;">
  ${renderListItem("Vui lòng tuyệt đối không chia sẻ mã bản quyền này công khai hoặc chia sẻ cho bên thứ ba. Mỗi mã bản quyền gắn liền trực tiếp với tài khoản email của bạn và được kiểm soát thiết bị kích hoạt tự động qua máy chủ VaniStudio Activation Server.")}
  ${renderListItem("Nếu phát hiện số lượng thiết bị kích hoạt vượt quá giới hạn cho phép ({{maxActivations}}), khóa bản quyền của bạn có thể bị tạm khóa tự động.")}
</ul>

${renderParagraph("Nếu gặp bất kỳ khó khăn nào trong quá trình cài đặt hoặc kích hoạt sản phẩm, vui lòng liên hệ trực tiếp với bộ phận chăm sóc khách hàng 24/7 của chúng tôi bằng cách phản hồi lại email này hoặc gửi yêu cầu tới <a href=\"mailto:support@vanistudio.com\" style=\"color: #0f172a; font-weight: 600; text-decoration: underline;\">support@vanistudio.com</a>.")}

${renderParagraph("Chúc bạn có những trải nghiệm tuyệt vời cùng sản phẩm của VaniStudio!")}

<p style="margin: 28px 0 0 0; font-size: 14.5px; line-height: 1.65; color: #262626; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
  Trân trọng,<br />
  <strong style="color: #000000; font-weight: 600;">Đội ngũ Quản lý Sản phẩm &amp; Chăm sóc Khách hàng VaniStudio</strong><br />
  <a href="https://vanistudio.com" target="_blank" style="color: #0f172a; text-decoration: none; font-weight: 500;">https://vanistudio.com</a>
</p>
`
);
