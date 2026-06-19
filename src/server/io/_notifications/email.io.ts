import nodemailer from "nodemailer";

export interface SmtpServerConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail?: string;
  fromName?: string;
  isDefault?: boolean;
}

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromEmail?: string;
  fromName?: string;
  [key: string]: any;
}

export async function sendMessage(smtpServer: SmtpServerConfig, mailOptions: MailOptions) {
  if (!smtpServer || !smtpServer.host || !smtpServer.port) {
    throw new Error("Missing SMTP server host or port configuration");
  }
  if (!mailOptions || !mailOptions.to) {
    throw new Error("Missing recipient address (to)");
  }

  const transporter = nodemailer.createTransport({
    host: smtpServer.host.trim(),
    port: Number(smtpServer.port),
    secure: Boolean(smtpServer.secure),
    auth: {
      user: smtpServer.user.trim(),
      pass: smtpServer.pass,
    },
  });

  const senderEmail = (mailOptions.fromEmail || smtpServer.fromEmail || smtpServer.user || "").trim();
  const senderName = (mailOptions.fromName || smtpServer.fromName || "System").trim();
  const fromAddress = senderName ? `"${senderName}" <${senderEmail}>` : senderEmail;
  const recipient = mailOptions.to.trim();

  const { fromName, fromEmail, to, ...restOptions } = mailOptions;

  return await transporter.sendMail({
    from: fromAddress,
    to: recipient,
    ...restOptions,
  });
}

export async function sendToClient(config: any, mailOptions: MailOptions) {
  if (!config) return;
  const servers = (config.smtpServers || []) as SmtpServerConfig[];
  const server = servers.find((s) => s.isDefault) || servers[0];
  if (!server) {
    throw new Error("No SMTP servers configured");
  }
  return await sendMessage(server, mailOptions);
}
