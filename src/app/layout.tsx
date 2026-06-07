import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { settings } from "@/server/db/schemas/setting.schema";
import { SettingProvider } from "@/contexts/SettingContext";
import { UserProvider } from "@/contexts/UserContext";
import { getServerSession } from "@/server/auth";
import { getVanixjnkColor } from "@/lib/color";

import { TRPCProvider } from "@/components/providers/TRPCProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ProgressProviders } from "@/components/providers/ProgressProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let initialSetting = null;
  try {
    const settingsData = await db.select().from(settings).limit(1);
    initialSetting = settingsData.length > 0 ? settingsData[0] : null;
  } catch {
    // Treat as null if DB doesn't exist yet
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
  } catch {
    // Treat as null if DB doesn't exist yet
  }

  const vanixjnkColor = getVanixjnkColor(initialSetting?.siteColor || "oklch(0.6882 0.2338 16.94)");

  const primaryFont = "Signika";
  const secondaryFont = primaryFont;
  const fontWeights = "400;500;600;700";
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(primaryFont)}:wght@${fontWeights}&display=swap`;

  const { user: initialUser } = await getServerSession(true);

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontUrl} rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col selection:bg-vanixjnk/15 selection:text-vanixjnk antialiased" style={{ fontFamily: `"${primaryFont}", sans-serif` }} suppressHydrationWarning>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --vanixjnk: ${vanixjnkColor};
                --font-primary: "${primaryFont}", sans-serif;
                --font-secondary: "${secondaryFont}", sans-serif;
              }
              .dark {
                --vanixjnk: ${vanixjnkColor};
                --font-primary: "${primaryFont}", sans-serif;
                --font-secondary: "${secondaryFont}", sans-serif;
              }
            `,
          }}
        />
        <SettingProvider initialSetting={initialSetting}>
          <UserProvider initialUser={initialUser}>
            <TRPCProvider>
              <ThemeProvider>
                <ProgressProviders>
                  <TooltipProvider>
                    <Toaster richColors position="top-center" closeButton />
                    {children}
                  </TooltipProvider>
                </ProgressProviders>
              </ThemeProvider>
            </TRPCProvider>
          </UserProvider>
        </SettingProvider>
      </body>
    </html>
  );
}
