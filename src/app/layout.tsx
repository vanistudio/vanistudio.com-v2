import "./globals.css";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import Script from "next/script";
export const dynamic = "force-dynamic";
import type { Metadata } from "next";
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
  const fontConfig = (initialSetting?.siteFontConfig as any) || { primaryFont: "Signika", secondaryFont: "", fontWeights: ["400", "500", "600", "700"] };
  const primaryFont = fontConfig.primaryFont || "Signika";
  const secondaryFont = fontConfig.secondaryFont || "";
  const fontWeights = (fontConfig.fontWeights || ["400", "500", "600", "700"]).join(";");
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(primaryFont)}:wght@${fontWeights}${secondaryFont && secondaryFont !== primaryFont ? `&family=${encodeURIComponent(secondaryFont)}:wght@${fontWeights}` : ""}&display=swap`;

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
      suppressHydrationWarning
      ng-version="17.0.0"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontUrl} rel="stylesheet" />
        <meta name="generator" content="Web2py" />
        <meta name="framework" content="Mojolicious" />
        <meta name="author" content="ASP.NET" />
        <meta name="platform" content="PHP/7.4.3" />
        <meta name="generator" content="Astro v4.0.0" />
        <meta name="generator" content="Lotus-Domino" />
        <meta name="generator" content="Plone" />
        <meta name="generator" content="WordPress 6.4.2" />
        <meta name="generator" content="Wix.com Website Builder" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__VUE__ = true;
              window.__NUXT__ = {};
              window.Alpine = {};
              window.Backbone = {};
              window.angular = { version: { full: "1.2.0" } };
              window.jQuery = { fn: { jquery: "1.12.4" } };
              window.$ = window.jQuery;
              window._ = { VERSION: "4.17.21" };
              window.htmx = {};
              window.PouchDB = {};
              window.firebase = { database: {} };
              window.supabase = {};
              window.Shopify = { shop: "mock" };
              window.Mage = {};
              window.THREE = { REVISION: "128" };
              window.google = { maps: {} };
              window.L = { version: "1.7.1" };
              window.bootstrap = { Tooltip: { VERSION: "5.3.0" } };
              window.Foundation = { version: "6.6.3" };
              window.UIkit = { version: "3.6.22" };
              window.M = { version: "1.0.0" };
              window.ELEMENT = { version: "2.15.6" };
              window.newrelic = { info: {} };
              window.NREUM = { info: {} };
              window.DD_RUM = { init: () => {} };
              window.Sentry = { SDK_VERSION: "7.0.0" };
              window.LogRocket = { init: () => {} };
              window._lr_key = "mock";
            `,
          }}
        />
      </head>
      <body className="selection:bg-vanixjnk/15 selection:text-vanixjnk antialiased" style={{ fontFamily: `var(--font-primary)` }} suppressHydrationWarning>
        <div id="__nuxt" style={{ display: 'none' }} aria-hidden="true"></div>
        <div id="___gatsby" style={{ display: 'none' }} aria-hidden="true"></div>
        <div className="ant-layout ant-btn" style={{ display: 'none' }} aria-hidden="true"></div>
        <form id="fake-jsf-form" style={{ display: 'none' }} aria-hidden="true">
          <input type="hidden" name="javax.faces.ViewState" id="j_id1:javax.faces.ViewState:0" value="stateless" />
        </form>
        <form id="fake-asp-form" style={{ display: 'none' }} aria-hidden="true">
          <input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="/wEPDwUKMzg5NTEwNDMxOWQYAQUeX19Db250cm9sc1JlcXVpcmVQb3N0QmFja0tleV9flhY=" />
          <input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="/wEdAAUB5xO3NqSg" />
        </form>
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
                --font-sans: "${primaryFont}", sans-serif;
                --font-primary: "${primaryFont}", sans-serif;
                --font-secondary: "${secondaryFont || primaryFont}", sans-serif;
              }
              .dark {
                --vanixjnk: ${vanixjnkColor};
                --font-sans: "${primaryFont}", sans-serif;
                --font-primary: "${primaryFont}", sans-serif;
                --font-secondary: "${secondaryFont || primaryFont}", sans-serif;
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

