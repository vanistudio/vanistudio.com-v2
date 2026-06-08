import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { menuService } from "@/server/services/administrator/menu.service";

async function ensureAdmin() {
  const session = await getServerSession(true);
  if (!session?.user || session.user.role !== "admin") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
}

export const menuRouter = router({
  getGroups: publicProcedure.query(async () => {
    await ensureAdmin();
    return await menuService.getGroups();
  }),

  getMenus: publicProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input }) => {
      await ensureAdmin();
      return await menuService.getMenusByGroupId(input.groupId);
    }),

  createGroup: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Tên nhóm menu không được để trống"),
        key: z.string().min(1, "Key nhóm menu không được để trống"),
        description: z.string().optional().nullable(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      return await menuService.createGroup(input);
    }),

  updateGroup: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        key: z.string().optional(),
        description: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      return await menuService.updateGroup(input.id, input);
    }),

  deleteGroup: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      await menuService.deleteGroup(input.id);
      return { success: true };
    }),

  createMenu: publicProcedure
    .input(
      z.object({
        groupId: z.string(),
        parentId: z.string().optional().nullable(),
        name: z.string().min(1, "Tên menu item không được để trống"),
        url: z.string().optional().nullable(),
        icon: z.string().optional().nullable(),
        order: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      return await menuService.createMenu(input);
    }),

  updateMenu: publicProcedure
    .input(
      z.object({
        id: z.string(),
        parentId: z.string().optional().nullable(),
        name: z.string().optional(),
        url: z.string().optional().nullable(),
        icon: z.string().optional().nullable(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      return await menuService.updateMenu(input.id, input);
    }),

  deleteMenu: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      await menuService.deleteMenu(input.id);
      return { success: true };
    }),

  updateOrder: publicProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          order: z.number(),
          parentId: z.string().optional().nullable(),
        })
      )
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      await menuService.updateMenuOrders(
        input.map((item) => ({
          id: item.id,
          order: item.order,
          parentId: item.parentId ?? null,
        }))
      );
      return { success: true };
    }),
});
