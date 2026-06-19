import { menuRepository } from "@/server/repositories/menu.repository";
import { type MenuGroup, type NewMenuGroup, type Menu, type NewMenu } from "@/server/db/schemas/menu.schema";

export class MenuService {
  async getGroups(): Promise<MenuGroup[]> {
    return await menuRepository.getGroups();
  }

  async getMenusByGroupId(groupId: string): Promise<Menu[]> {
    return await menuRepository.getMenusByGroupId(groupId);
  }

  async createGroup(data: NewMenuGroup): Promise<MenuGroup> {
    if (!data.name.trim()) throw new Error("Tên nhóm menu không được trống");
    if (!data.key.trim()) throw new Error("Key nhóm menu không được trống");
    return await menuRepository.createGroup(data);
  }

  async updateGroup(id: string, data: Partial<NewMenuGroup>): Promise<MenuGroup> {
    if (data.name !== undefined && !data.name.trim()) throw new Error("Tên nhóm menu không được trống");
    if (data.key !== undefined && !data.key.trim()) throw new Error("Key nhóm menu không được trống");
    return await menuRepository.updateGroup(id, data);
  }

  async deleteGroup(id: string): Promise<void> {
    await menuRepository.deleteGroup(id);
  }

  async createMenu(data: NewMenu): Promise<Menu> {
    if (!data.name.trim()) throw new Error("Tên menu item không được trống");
    return await menuRepository.createMenu(data);
  }

  async updateMenu(id: string, data: Partial<NewMenu>): Promise<Menu> {
    if (data.name !== undefined && !data.name.trim()) throw new Error("Tên menu item không được trống");
    return await menuRepository.updateMenu(id, data);
  }

  async deleteMenu(id: string): Promise<void> {
    await menuRepository.deleteMenu(id);
  }

  async updateMenuOrders(
    items: { id: string; order: number; parentId: string | null }[]
  ): Promise<void> {
    await menuRepository.updateMenuOrders(items);
  }

  async getPublicMenus(): Promise<{ group: MenuGroup; items: Menu[] }[]> {
    return await menuRepository.getPublicMenus();
  }

  async resetAllMenusToDefault(): Promise<void> {
    await menuRepository.resetAllMenusToDefault();
  }
}

export const menuService = new MenuService();
