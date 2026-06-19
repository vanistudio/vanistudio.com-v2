"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/animate/tooltip";

const TECH_STACK_ITEMS = [
  { id: "js", label: "JavaScript" },
  { id: "ts", label: "TypeScript" },
  { id: "php", label: "PHP" },
  { id: "cs", label: "C#" },
  { id: "py", label: "Python" },
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "react", label: "React" },
  { id: "nextjs", label: "Next.js" },
  { id: "vue", label: "Vue" },
  { id: "nuxtjs", label: "Nuxt" },
  { id: "svelte", label: "Svelte" },
  { id: "angular", label: "Angular" },
  { id: "remix", label: "Remix" },
  { id: "astro", label: "Astro" },
  { id: "gatsby", label: "Gatsby" },
  { id: "electron", label: "Electron" },
  { id: "mui", label: "MUI" },
  { id: "tailwind", label: "Tailwind CSS" },
  { id: "nodejs", label: "Node.js" },
  { id: "bun", label: "Bun" },
  { id: "deno", label: "Deno" },
  { id: "express", label: "Express" },
  { id: "elysia", label: "Elysia" },
  { id: "discordjs", label: "Discord.js" },
  { id: "nestjs", label: "NestJS" },
  { id: "laravel", label: "Laravel" },
  { id: "dotnet", label: ".NET" },
  { id: "redux", label: "Redux" },
  { id: "prisma", label: "Prisma" },
  { id: "postgres", label: "PostgreSQL" },
  { id: "mysql", label: "MySQL" },
  { id: "mongodb", label: "MongoDB" },
  { id: "redis", label: "Redis" },
  { id: "supabase", label: "Supabase" },
  { id: "firebase", label: "Firebase" },
  { id: "nginx", label: "Nginx" },
  { id: "docker", label: "Docker" },
  { id: "linux", label: "Linux" },
  { id: "vite", label: "Vite" },
  { id: "jest", label: "Jest" },
  { id: "vercel", label: "Vercel" },
  { id: "cloudflare", label: "Cloudflare" },
  { id: "git", label: "Git" },
  { id: "github", label: "GitHub" },
  { id: "gitlab", label: "GitLab" },
];

export default function PubHomeTechStack() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col items-center text-center gap-3 max-w-xl mx-auto">
        <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-2.5">
          <Icon icon="solar:cpu-bolt-line-duotone" className="text-2xl" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-vanixjnk">Tech Stack & Ecosystem</span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Hệ sinh thái công nghệ chuyên sâu
          </h2>
        </div>
      </div>

      <div className="py-2">
        <TooltipProvider>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {TECH_STACK_ITEMS.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <img
                    src={`https://skillicons.dev/icons?i=${item.id}&theme=${mounted && resolvedTheme === "dark" ? "dark" : "light"}`}
                    alt={item.label}
                    className="size-14 rounded-md cursor-default shrink-0 select-none"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold text-xs">{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
}
