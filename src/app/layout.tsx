import "./globals.css";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import Script from "next/script";
export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Signika } from "next/font/google";
import { ProgressProviders } from "@/components/providers/ProgressProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { TRPCProvider } from "@/components/providers/TRPCProvider";
import { getVanixjnkColor } from "@/lib/color";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { settings } from "@/server/db/schemas/setting.schema";
import { SettingProvider } from "@/contexts/SettingContext";
import { UserProvider } from "@/contexts/UserContext";
import { MenuProvider } from "@/contexts/MenuContext";
import { menuRepository } from "@/server/repositories/menu.repository";
import { getServerSession } from "@/lib/auth";

const signika = Signika({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  let initialSetting = null;
  try {
    const settingsData = await db.select().from(settings).limit(1);
    initialSetting = settingsData.length > 0 ? settingsData[0] : null;
  } catch (e) {
  }

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const metadataBase = `${protocol}://${host}`;

  const getAbsoluteUrl = (url?: string | null) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    return `${metadataBase}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const faviconUrl = getAbsoluteUrl(initialSetting?.siteFavicon || "/favicon.ico");
  const thumbnailUrl = getAbsoluteUrl(initialSetting?.siteOgImage);

  return {
    metadataBase: new URL(metadataBase),
    title: {
      default: initialSetting?.siteName || "Vani Store",
      template: `%s | ${initialSetting?.siteName || "Vani Store"}`,
    },
    description: initialSetting?.siteMetaDescription || "",
    keywords: initialSetting?.siteMetaKeywords || "",
    icons: {
      icon: [
        { url: faviconUrl!, sizes: "any" },
        { url: faviconUrl!, sizes: "128x128" },
        { url: faviconUrl!, sizes: "256x256" },
      ],
      shortcut: faviconUrl!,
      apple: [
        { url: faviconUrl!, sizes: "128x128" },
        { url: faviconUrl!, sizes: "256x256" },
      ],
    },
    openGraph: {
      title: initialSetting?.siteName || "",
      description: initialSetting?.siteMetaDescription || "",
      images: thumbnailUrl ? [thumbnailUrl] : [],
      siteName: initialSetting?.siteName || "",
    },
    twitter: {
      card: "summary_large_image",
      title: initialSetting?.siteName || "",
      description: initialSetting?.siteMetaDescription || "",
      images: thumbnailUrl ? [thumbnailUrl] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialSetting = null;
  try {
    const settingsData = await db.select().from(settings).limit(1);
    initialSetting = settingsData.length > 0 ? settingsData[0] : null;
  } catch (e) {
  }

  const vanixjnkColor = getVanixjnkColor(initialSetting?.siteColor || "#7c3aed");

  const { user: initialUser } = await getServerSession(true);

  let initialMenus = [];
  try {
    const rawMenus = await menuRepository.getPublicMenus();
    initialMenus = JSON.parse(JSON.stringify(rawMenus));
  } catch (e) {
  }

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const metadataBase = `${protocol}://${host}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": initialSetting?.siteName || "MMOSTORE",
    "description": initialSetting?.siteMetaDescription || "",
    "url": metadataBase,
    "logo": initialSetting?.siteLogo ? (initialSetting.siteLogo.startsWith("http") ? initialSetting.siteLogo : `${metadataBase}${initialSetting.siteLogo}`) : undefined,
  };

  return (
    <html
      lang="en"
      className={signika.variable}
      suppressHydrationWarning
    >
      <body className="selection:bg-vanixjnk/15 selection:text-vanixjnk antialiased" suppressHydrationWarning>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --vanixjnk: ${vanixjnkColor};
              }
              .dark {
                --vanixjnk: ${vanixjnkColor};
              }
            `,
          }}
        />
        <SettingProvider initialSetting={initialSetting}>
          <UserProvider initialUser={initialUser}>
            <TRPCProvider>
              <MenuProvider initialMenus={initialMenus}>
                <ProgressProviders>
                  <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                  >
                    <NuqsAdapter>
                      <TooltipProvider>
                        <Toaster richColors position="top-center" visibleToasts={4} closeButton />
                        {children}
                      </TooltipProvider>
                    </NuqsAdapter>
                  </ThemeProvider>
                </ProgressProviders>
              </MenuProvider>
            </TRPCProvider>
          </UserProvider>
        </SettingProvider>
      </body>
    </html>
  );
}

