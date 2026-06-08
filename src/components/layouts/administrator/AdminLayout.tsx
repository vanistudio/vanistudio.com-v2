"use client";

import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      <AdminHeader />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      <AdminFooter />
    </div>
  );
}
