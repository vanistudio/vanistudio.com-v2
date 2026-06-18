import { create } from "zustand";

interface FontState {
  primaryFont: string;
  secondaryFont: string;
  setPrimaryFont: (font: string) => void;
  setSecondaryFont: (font: string) => void;
  loadFont: (family: string) => void;
  updateCSSVariable: () => void;
}

export const useFontStore = create<FontState>((set, get) => ({
  primaryFont: "Signika",
  secondaryFont: "",

  setPrimaryFont: (font: string) => {
    set({ primaryFont: font });
    get().loadFont(font);
    get().updateCSSVariable();
  },

  setSecondaryFont: (font: string) => {
    set({ secondaryFont: font });
    if (font) get().loadFont(font);
    get().updateCSSVariable();
  },

  loadFont: (family: string) => {
    if (typeof document === "undefined" || !family) return;
    const id = `font-store-${family.replace(/\s+/g, "-")}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
      document.head.appendChild(link);
    }
  },

  updateCSSVariable: () => {
    if (typeof document === "undefined") return;
    const { primaryFont, secondaryFont } = get();
    document.documentElement.style.setProperty("--font-primary", `"${primaryFont}", sans-serif`);
    document.documentElement.style.setProperty("--font-secondary", secondaryFont ? `"${secondaryFont}", sans-serif` : `"${primaryFont}", sans-serif`);
    document.body.style.fontFamily = `"${primaryFont}", sans-serif`;
  },
}));
