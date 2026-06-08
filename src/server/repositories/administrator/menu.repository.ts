import { db } from "@/server/db";
import { menus, menuGroups, type MenuGroup, type NewMenuGroup, type Menu, type NewMenu } from "@/server/db/schemas/menu.schema";
import { eq, asc } from "drizzle-orm";

export class MenuRepository {
  async getGroups(): Promise<MenuGroup[]> {
    return await db.select().from(menuGroups).orderBy(asc(menuGroups.name));
  }

  async getMenusByGroupId(groupId: string): Promise<Menu[]> {
    return await db.select().from(menus).where(eq(menus.groupId, groupId)).orderBy(asc(menus.order));
  }

  async createGroup(data: NewMenuGroup): Promise<MenuGroup> {
    const [inserted] = await db.insert(menuGroups).values(data).returning();
    if (!inserted) throw new Error("Không thể tạo nhóm menu");
    return inserted;
  }

  async updateGroup(id: string, data: Partial<NewMenuGroup>): Promise<MenuGroup> {
    const [updated] = await db
      .update(menuGroups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(menuGroups.id, id))
      .returning();
    if (!updated) throw new Error("Không tìm thấy nhóm menu để cập nhật");
    return updated;
  }

  async deleteGroup(id: string): Promise<void> {
    await db.delete(menuGroups).where(eq(menuGroups.id, id));
  }

  async createMenu(data: NewMenu): Promise<Menu> {
    const [inserted] = await db.insert(menus).values(data).returning();
    if (!inserted) throw new Error("Không thể tạo menu item");
    return inserted;
  }

  async updateMenu(id: string, data: Partial<NewMenu>): Promise<Menu> {
    const [updated] = await db
      .update(menus)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(menus.id, id))
      .returning();
    if (!updated) throw new Error("Không tìm thấy menu item để cập nhật");
    return updated;
  }

  async deleteMenu(id: string): Promise<void> {
    await db.delete(menus).where(eq(menus.id, id));
  }

  async updateMenuOrders(
    items: { id: string; order: number; parentId: string | null }[]
  ): Promise<void> {
    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(menus)
          .set({
            order: item.order,
            parentId: item.parentId,
            updatedAt: new Date(),
          })
          .where(eq(menus.id, item.id));
      }
    });
  }
}

export const menuRepository = new MenuRepository();
