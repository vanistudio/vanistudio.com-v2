'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Setting } from '@/server/db/schemas/setting.schema';

interface SettingContextType {
  setting: Setting | null;
  setSetting: React.Dispatch<React.SetStateAction<Setting | null>>;
}

const SettingContext = createContext<SettingContextType | undefined>(undefined);

export function SettingProvider({
  children,
  initialSetting,
}: {
  children: React.ReactNode;
  initialSetting: Setting | null;
}) {
  const [setting, setSetting] = useState<Setting | null>(initialSetting);

  return (
    <SettingContext.Provider value={{ setting, setSetting }}>
      {children}
    </SettingContext.Provider>
  );
}

export function useSetting() {
  const context = useContext(SettingContext);
  if (context === undefined) {
    throw new Error('useSetting must be used within a SettingProvider');
  }
  return context;
}
