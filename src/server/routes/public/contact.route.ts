import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { contactSubmissions } from "@/server/db/schemas/contact.schema";
import { extensionsRepository } from "@/server/repositories/extensions.repository";
import { notificationService } from "@/server/services/public/notification.service";
import { extractActivityTracking } from "@/server/plugins/tracking.plugin";

function getSiteUrl(headers: Headers): string {
  const proto = headers.get("x-forwarded-proto") || "http";
  const host = headers.get("x-forwarded-host") || headers.get("host") || "";
  let resolvedUrl = "";
  if (host) {
    resolvedUrl = `${proto}://${host}`;
  }

  let envDomain = process.env.APP_BETTER_AUTH_DOMAIN || "";
  if (envDomain) {
    if (!envDomain.startsWith("http://") && !envDomain.startsWith("https://")) {
      const isDev = envDomain.includes("localhost") || envDomain.includes("127.0.0.1");
      envDomain = `${isDev ? "http://" : "https://"}${envDomain}`;
    }
  }

  const fallbackUrl = envDomain || "https://vanistudio.com";
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    const isLocal = resolvedUrl.includes("localhost") || resolvedUrl.includes("127.0.0.1") || !resolvedUrl;
    if (isLocal) {
      const isEnvLocal = envDomain.includes("localhost") || envDomain.includes("127.0.0.1") || !envDomain;
      return isEnvLocal ? "https://vanistudio.com" : envDomain;
    }
  }

  return resolvedUrl || fallbackUrl;
}

export const contactRouter = router({
  getConfig: publicProcedure.query(async () => {
    try {
      const ext = await extensionsRepository.getExtensionById("contact_page_customizer");
      if (!ext) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy cấu hình trang liên hệ",
        });
      }
      return {
        isEnabled: ext.isEnabled,
        config: ext.config as any,
      };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải cấu hình trang liên hệ",
      });
    }
  }),

  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Vui lòng nhập họ tên"),
        email: z.string().email("Email không hợp lệ"),
        phone: z.string().optional(),
        company: z.string().optional(),
        subject: z.string().min(1, "Vui lòng nhập tiêu đề"),
        message: z.string().min(1, "Vui lòng nhập nội dung"),
        attachments: z.array(z.string()).default([]),
        customFields: z.record(z.string(), z.any()).default({}),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const tracking = await extractActivityTracking(ctx.headers);
        const siteUrl = getSiteUrl(ctx.headers);
        
        let referrerUrl = ctx.headers.get("referer") || "";
        const isProd = process.env.NODE_ENV === "production";
        if (isProd && (referrerUrl.includes("localhost") || referrerUrl.includes("127.0.0.1") || !referrerUrl)) {
          referrerUrl = `${siteUrl}/contact`;
        } else if (!referrerUrl) {
          referrerUrl = `${siteUrl}/contact`;
        }

        const ext = await extensionsRepository.getExtensionById("contact_page_customizer");
        if (!ext || !ext.isEnabled) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tính năng liên hệ hiện đang bị tạm khóa hoặc bảo trì",
          });
        }

        const config = ext.config as any;

        if (config.destination?.saveToDb) {
          await db.insert(contactSubmissions).values({
            name: input.name,
            email: input.email,
            phone: input.phone || null,
            company: input.company || null,
            subject: input.subject,
            message: input.message,
            attachments: input.attachments,
            customFields: input.customFields,
          });
        }

        if (config.destination?.useCentralNotification) {
          const ticketId = `TK-${Date.now().toString().slice(-6)}`;
          const createdAt = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

          await notificationService.trigger("contact.new_submission", {
            name: input.name,
            ticketId,
            email: input.email,
            category: "Liên hệ",
            subject: input.subject,
            createdAt,
            expectedResponseTime: "Trong vòng 24 giờ làm việc",
            message: input.message,
            supportPortalUrl: `${siteUrl}/support`,
            faqLink: `${siteUrl}/faq`,
          });

          await notificationService.trigger("contact.new_submission_admin", {
            ticketId,
            category: "Liên hệ",
            priorityLevel: "Bình thường",
            priority: "Bình thường",
            name: input.name,
            email: input.email,
            phone: input.phone || "Không có",
            company: input.company || "Không có",
            previousTicketsCount: "0",
            createdAt,
            referrerUrl,
            assignedTeam: "Chăm sóc khách hàng",
            ipAddress: tracking.ipAddress || "unknown",
            deviceInfo: tracking.deviceName || "unknown",
            subject: input.subject,
            message: input.message,
            inboxUrl: `${siteUrl}/adminPanel/inbox`,
          });
        }

        return { success: true };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Lỗi hệ thống khi gửi liên hệ",
        });
      }
    }),
});
