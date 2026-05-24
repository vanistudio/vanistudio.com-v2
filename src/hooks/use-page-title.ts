import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export function usePageTitle(title?: string) {
  const { settings } = useAuth();
  useEffect(() => {
    const base = settings?.siteName || document.querySelector("meta[property='og:site_name']")?.getAttribute("content") || "Vani Studio";
    document.title = title ? `${title} | ${base}` : base;
  }, [title, settings]);
}
