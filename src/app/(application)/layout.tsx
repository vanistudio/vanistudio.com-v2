import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import AppLayout from "@/components/layouts/application/AppLayout";

export default async function ApplicationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(true);

  if (!session?.user) {
    redirect("/");
  }

  return <AppLayout>{children}</AppLayout>;
}
