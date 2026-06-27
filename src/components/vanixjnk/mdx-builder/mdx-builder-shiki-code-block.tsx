"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

let highlighterPromise: Promise<any> | null = null;

function getHighlighterInstance() {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then((shiki) =>
      shiki.createHighlighter({
        themes: ["vesper", "github-light"],
        langs: [
          "javascript", "typescript", "jsx", "tsx",
          "rust", "go", "python", "html", "css",
          "bash", "sh", "json", "yaml", "yml", "sql",
          "markdown", "md", "mdx", "c", "cpp", "csharp",
          "java", "php", "ruby", "swift", "kotlin", "toml"
        ],
      })
    );
  }
  return highlighterPromise;
}

export const ShikiCodeBlock = ({ code, lang }: { code: string; lang: string }) => {
  const { resolvedTheme } = useTheme();
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const activeTheme = resolvedTheme === "light" ? "github-light" : "vesper";

  useEffect(() => {
    let isMounted = true;
    
    getHighlighterInstance().then(async (highlighter) => {
      if (!isMounted) return;
      try {
        const cleanLang = lang.toLowerCase().trim();
        const supportedLangs = highlighter.getLoadedLanguages();
        
        if (cleanLang && cleanLang !== "text" && !supportedLangs.includes(cleanLang)) {
          try {
            await highlighter.loadLanguage(cleanLang as any);
          } catch {
            console.warn(`Shiki failed to load language: ${cleanLang}, falling back to text.`);
          }
        }

        const currentLangs = highlighter.getLoadedLanguages();
        const finalLang = currentLangs.includes(cleanLang) ? cleanLang : "text";
        
        const html = highlighter.codeToHtml(code, {
          lang: finalLang,
          theme: activeTheme,
        });
        if (isMounted) {
          setHighlightedHtml(html);
        }
      } catch (err) {
        console.error("Shiki highlighting error:", err);
      }
    }).catch(err => {
      console.error("Failed to load Shiki:", err);
    });

    return () => {
      isMounted = false;
    };
  }, [code, lang, activeTheme]);

  if (highlightedHtml) {
    return (
      <div 
        className="shiki-code-block-wrapper my-4 overflow-x-auto rounded-xl border border-border/80 [&>pre]:p-4! [&>pre]:m-0! [&>pre]:font-mono [&>pre]:text-xs [&>pre]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
      />
    );
  }

  return (
    <pre className="not-prose p-4 rounded-xl bg-muted/30 border border-border/80 font-mono text-xs overflow-x-auto my-4 text-foreground leading-relaxed">
      <code className={lang ? `language-${lang}` : ""}>{code}</code>
    </pre>
  );
};
