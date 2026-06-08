"use client";

import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      <AdminHeader />
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5">
        {children}
      </main>
      <AdminFooter />
    </div>
  );
}
