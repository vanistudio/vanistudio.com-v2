import { useEffect } from "react";

export function usePageTitle(title?: string) {
  useEffect(() => {
    const base = document.querySelector("meta[property='og:site_name']")?.getAttribute("content") || "Vani Studio";
    document.title = title ? `${title} | ${base}` : base;
  }, [title]);
}
