import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import AdminLayout from "@/components/layouts/administrator/AdminLayout";

export default async function AdministratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(true);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return <AdminLayout>{children}</AdminLayout>;
}
