"use client";

import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      <AppHeader />
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
