'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { MenuGroup, Menu } from '@/server/db/schemas/menu.schema';

export interface PublicMenuDataResolved {
  group: MenuGroup;
  items: Menu[];
}

export interface SerializedMenuGroup {
  id: string;
  name: string;
  key: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedMenu {
  id: string;
  groupId: string;
  parentId: string | null;
  name: string;
  url: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicMenuData {
  group: SerializedMenuGroup;
  items: SerializedMenu[];
}

interface MenuContextType {
  publicMenus: PublicMenuDataResolved[];
}

const MenuContext = createContext<MenuContextType>({
  publicMenus: [],
});

export function MenuProvider({
  children,
  initialMenus,
}: {
  children: React.ReactNode;
  initialMenus: PublicMenuData[];
}) {
  const deserialized = useMemo(() => {
    return initialMenus.map((g) => ({
      ...g,
      group: {
        ...g.group,
        createdAt: new Date(g.group.createdAt),
        updatedAt: new Date(g.group.updatedAt),
      },
      items: g.items.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })),
    })) as unknown as PublicMenuDataResolved[];
  }, [initialMenus]);

  return (
    <MenuContext.Provider value={{ publicMenus: deserialized }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  return useContext(MenuContext);
}
