import { router, publicProcedure } from "../t";
import { z } from "zod";
import { toolsService } from "@/server/services/public/tools.service";

export const toolsRouter = router({
  checkDomain: publicProcedure
    .input(
      z.object({
        domain: z.string().min(1, "Vui lòng nhập tên miền cần kiểm tra"),
      })
    )
    .query(async ({ input }) => {
      return await toolsService.checkDomain(input.domain);
    }),

  checkLiveUid: publicProcedure
    .input(
      z.object({
        uids: z.array(z.string()).min(1, "Vui lòng nhập ít nhất một UID"),
      })
    )
    .mutation(async ({ input }) => {
      return await toolsService.checkLiveUid(input.uids);
    }),

  checkFacebookCookieLive: publicProcedure
    .input(
      z.object({
        cookie: z.string().min(1, "Vui lòng nhập cookie Facebook"),
      })
    )
    .mutation(async ({ input }) => {
      return await toolsService.checkFacebookCookieLive(input.cookie);
    }),

  lookupFacebookId: publicProcedure
    .input(
      z.object({
        link: z.string().min(1, "Vui lòng nhập liên kết hoặc ID"),
        cookie: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await toolsService.lookupFacebookId(input.link, input.cookie);
    }),

  getLinkPreview: publicProcedure
    .input(
      z.object({
        url: z.string().url("Đường dẫn không hợp lệ"),
      })
    )
    .query(async ({ input }) => {
      return await toolsService.getLinkPreview(input.url);
    }),

  checkRobloxUser: publicProcedure
    .input(
      z.object({
        userIdOrUsername: z.union([z.string(), z.number()]),
      })
    )
    .mutation(async ({ input }) => {
      return await toolsService.checkRobloxUser(input.userIdOrUsername);
    }),

  checkRobloxPlace: publicProcedure
    .input(
      z.object({
        placeId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await toolsService.checkRobloxPlace(input.placeId);
    }),

  checkRobloxUserCurrentlyWearing: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await toolsService.checkRobloxUserCurrentlyWearing(input.userId);
    }),

  checkRobloxUserBadges: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await toolsService.checkRobloxUserBadges(input.userId);
    }),
});
