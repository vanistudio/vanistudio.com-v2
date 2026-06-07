'use client';

import React, { createContext, useContext } from 'react';
import type { Setting } from '@/server/db/schemas/setting.schema';

const SettingContext = createContext<Setting | null>(null);

export function SettingProvider({
  children,
  initialSetting,
}: {
  children: React.ReactNode;
  initialSetting: Setting | null;
}) {
  return (
    <SettingContext.Provider value={initialSetting}>
      {children}
    </SettingContext.Provider>
  );
}

export function useSetting() {
  return useContext(SettingContext);
}
