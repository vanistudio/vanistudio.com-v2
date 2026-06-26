export const renderRow = (iconName: string, label: string, value: string): string => `
  <tr>
    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="30" valign="middle">
            <img src="https://images.weserv.nl/?url=https://api.iconify.design/solar/${iconName}.svg?color=%25230f172a&amp;output=png&amp;w=48&amp;h=48" width="18" height="18" alt="${label}" style="display: block; border: 0; width: 18px; height: 18px; opacity: 0.9;" />
          </td>
          <td valign="middle" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #737373;">
            ${label}
          </td>
          <td align="right" valign="middle" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #000000; font-weight: 600;">
            ${value}
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;
export const renderCard = (rowsHtml: string): string => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff; border-collapse: separate;">
    ${rowsHtml}
  </table>
`;
export const renderCTA = (introText: string, buttonText: string, buttonUrl: string): string => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0; background-color: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 8px;">
    <tr>
      <td style="padding: 24px; text-align: center;">
        <p style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #525252; line-height: 1.5;">
          ${introText}
        </p>
        <a href="${buttonUrl}" target="_blank" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; font-weight: 600; font-size: 13px; border-radius: 6px; text-decoration: none; display: inline-block; letter-spacing: 0.05em; text-transform: uppercase;">
          ${buttonText} &rarr;
        </a>
        <p style="margin: 16px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11.5px; color: #888888;">
          Hoặc copy liên kết: <a href="${buttonUrl}" target="_blank" style="color: #0f172a; text-decoration: underline; font-weight: 500;">${buttonUrl}</a>
        </p>
      </td>
    </tr>
  </table>
`;
export const renderQuote = (message: string): string => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; background-color: #f8fafc; border-left: 3px solid #0f172a;">
    <tr>
      <td style="padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #262626; line-height: 1.6; font-style: italic;">
        "${message}"
      </td>
    </tr>
  </table>
`;
export const renderCodeBlock = (content: string): string => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
    <tr>
      <td style="padding: 16px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 12.5px; color: #0f172a; line-height: 1.6; word-break: break-all; white-space: pre-wrap;">
        ${content}
      </td>
    </tr>
  </table>
`;
export const renderListItem = (content: string): string => `
  <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.6; color: #262626;">
    ${content}
  </li>
`;
export const renderParagraph = (content: string): string => `
  <p style="margin: 0 0 16px 0; font-size: 14.5px; line-height: 1.65; color: #262626;">
    ${content}
  </p>
`;

export const wrapEmailTemplate = (title: string, content: string): string => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>${title}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    
    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    @media only screen and (max-width: 620px) {
      .email-card {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .email-body {
        padding: 32px 20px !important;
      }
      .email-header {
        padding: 32px 20px 24px 20px !important;
      }
      .email-footer {
        padding: 32px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100% !important; background-color: #fafafa; -webkit-font-smoothing: antialiased; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; margin: 0; padding: 0; width: 100%;">
    <tr>
      <td align="center" style="padding: 40px 0 60px 0;">
        
        <table class="email-card" width="580" cellpadding="0" cellspacing="0" border="0" style="width: 580px; margin: 0 auto; background-color: #ffffff; border-left: 1px dashed #e2e8f0; border-right: 1px dashed #e2e8f0;">
          
          <tr>
            <td style="border-top: 1px dashed #e2e8f0; height: 0px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <tr>
            <td class="email-header" style="padding: 36px 40px 24px 40px; background-color: #ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 0.15em; color: #000000; text-transform: uppercase;">
                      VANI<span style="color: #0f172a;">.</span>STUDIO
                    </span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 4px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 700; color: #0f172a; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; letter-spacing: 0.08em; text-transform: uppercase;">
                      SYSTEM NOTIFICATION
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px dashed #e2e8f0; border-bottom: 1px dashed #e2e8f0; background-color: #ffffff;">
                <tr>
                  <td height="14" style="height: 14px; background-image: repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 1px, transparent 1px, transparent 8px); background-color: #fafafa; font-size: 0; line-height: 0;">
                    &nbsp;
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="email-body" style="padding: 40px 40px 40px 40px; background-color: #ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14.5px; color: #262626; line-height: 1.65; text-align: left;">
                    <!-- email-body-start -->
${content}
                    <!-- email-body-end -->
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px dashed #e2e8f0; border-bottom: 1px dashed #e2e8f0; background-color: #ffffff;">
                <tr>
                  <td height="14" style="height: 14px; background-image: repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 1px, transparent 1px, transparent 8px); background-color: #fafafa; font-size: 0; line-height: 0;">
                    &nbsp;
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="email-footer" style="padding: 36px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11.5px; color: #737373; line-height: 1.6; text-align: left; background-color: #ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 12px; font-weight: 700; color: #000000; letter-spacing: 0.02em;">VaniStudio Engine</p>
                    <p style="margin: 2px 0 0 0; color: #737373;">Hệ thống thông báo và bảo mật tự động.</p>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #fafafa; padding-top: 16px; font-size: 11px; color: #a3a3a3; line-height: 1.6;">
                    <p style="margin: 0 0 8px 0;">Email này được gửi tự động từ hệ thống quản trị VaniStudio. Quý khách vui lòng không chia sẻ email này hoặc các liên kết bên trong với bất kỳ ai để đảm bảo an toàn thông tin.</p>
                    <p style="margin: 0;">
                      &copy; 2026 VaniStudio. Mọi quyền được bảo lưu.<br/>
                      Website: <a href="https://vanistudio.com" style="color: #0f172a; text-decoration: none; font-weight: 600;">vanistudio.com</a> &bull; Support: <a href="mailto:support@vanistudio.com" style="color: #0f172a; text-decoration: none; font-weight: 600;">support@vanistudio.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="border-top: 1px dashed #e2e8f0; height: 0px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
`;
