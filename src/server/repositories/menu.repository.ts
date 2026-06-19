import { db } from "@/server/db";
import { menus, menuGroups, type MenuGroup, type NewMenuGroup, type Menu, type NewMenu } from "@/server/db/schemas/menu.schema";
import { eq, asc, and } from "drizzle-orm";
import { DEFAULT_MENU_GROUPS } from "@/defaults/menu.default";

export class MenuRepository {
  async getGroups(): Promise<MenuGroup[]> {
    let groups = await db.select().from(menuGroups).orderBy(asc(menuGroups.name));
    if (groups.length === 0) {
      await this.seedDefaultMenus();
      groups = await db.select().from(menuGroups).orderBy(asc(menuGroups.name));
    }
    return groups;
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

  async seedDefaultMenus(): Promise<void> {
    const existingGroups = await db.select().from(menuGroups).limit(1);
    if (existingGroups.length > 0) return;

    await db.transaction(async (tx) => {
      for (const group of DEFAULT_MENU_GROUPS) {
        const [insertedGroup] = await tx.insert(menuGroups).values({
          name: group.name,
          key: group.key,
          description: group.description,
          isActive: true,
        }).returning();

        const seedMenuItems = async (items: any[], groupId: string, parentId: string | null = null) => {
          for (const item of items) {
            const [insertedItem] = await tx.insert(menus).values({
              groupId,
              parentId,
              name: item.name,
              url: item.url || null,
              icon: item.icon,
              order: item.order,
              isActive: true,
            }).returning();

            if (insertedItem && item.children && item.children.length > 0) {
              await seedMenuItems(item.children, groupId, insertedItem.id);
            }
          }
        };

        if (insertedGroup && group.items.length > 0) {
          await seedMenuItems(group.items, insertedGroup.id);
        }
      }
    });
  }

  async resetAllMenusToDefault(): Promise<void> {
    await db.delete(menus);
    await db.delete(menuGroups);
    await this.seedDefaultMenus();
  }

  async getPublicMenus(): Promise<{ group: MenuGroup; items: Menu[] }[]> {
    let groups = await db
      .select()
      .from(menuGroups)
      .where(eq(menuGroups.isActive, true))
      .orderBy(asc(menuGroups.name));
    
    if (groups.length === 0) {
      await this.seedDefaultMenus();
      groups = await db
        .select()
        .from(menuGroups)
        .where(eq(menuGroups.isActive, true))
        .orderBy(asc(menuGroups.name));
    }

    const result = [];
    for (const group of groups) {
      const activeItems = await db
        .select()
        .from(menus)
        .where(
          and(
            eq(menus.groupId, group.id),
            eq(menus.isActive, true)
          )
        )
        .orderBy(asc(menus.order));
      result.push({ group, items: activeItems });
    }
    return result;
  }
}

export const menuRepository = new MenuRepository();
