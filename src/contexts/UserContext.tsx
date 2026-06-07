'use client';

import React, { createContext, useContext } from 'react';
import type { User } from '@/server/db/schemas/user.schema';

const UserContext = createContext<User | null>(null);

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  return (
    <UserContext.Provider value={initialUser}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
