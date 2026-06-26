"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MdxRenderer } from "@/components/vanixjnk/mdx-builder";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PlaygroundPanel from "./PlaygroundPanel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  order: number;
  createdAt: Date;
}

interface ApiParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  description: string;
  placeholder?: string;
  defaultValue?: any;
}

interface ApiResponseSample {
  status: number;
  description: string;
  body: any;
}

interface PubDocsPageProps {
  initialProducts: ApiProduct[];
  currentProductSlug?: string;
}

export default function PubDocsPage({ initialProducts, currentProductSlug }: PubDocsPageProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>(
    currentProductSlug || initialProducts[0]?.slug || ""
  );

  useEffect(() => {
    if (currentProductSlug) {
      setSelectedProductSlug(currentProductSlug);
    }
  }, [currentProductSlug]);

  const currentProduct = useMemo(() => {
    return initialProducts.find((p) => p.slug === selectedProductSlug);
  }, [initialProducts, selectedProductSlug]);
  
  const [activeDocType, setActiveDocType] = useState<"overview" | "endpoint">("overview");
  const [selectedOverviewSlug, setSelectedOverviewSlug] = useState<string>("");
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [activeSubTab, setActiveSubTab] = useState<"spec" | "playground">("spec");
  const [isMarkdownDialogOpen, setIsMarkdownDialogOpen] = useState(false);

  const aiOptions = [
    {
      id: "claude",
      name: "Claude AI",
      url: "https://claude.ai/",
      renderIcon: () => (
        <svg fill="#D97757" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
          <title>Claude</title>
          <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/>
        </svg>
      )
    },
    {
      id: "gemini",
      name: "Google Gemini",
      url: "https://gemini.google.com/app",
      renderIcon: () => (
        <svg viewBox="0 0 296 298" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
          <mask id="gemini-mask-a" width="296" height="298" x="0" y="0" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }}>
            <path fill="#3186FF" d="M141.201 4.886c2.282-6.17 11.042-6.071 13.184.148l5.985 17.37a184.004 184.004 0 0 0 111.257 113.049l19.304 6.997c6.143 2.227 6.156 10.91.02 13.155l-19.35 7.082a184.001 184.001 0 0 0-109.495 109.385l-7.573 20.629c-2.241 6.105-10.869 6.121-13.133.025l-7.908-21.296a184 184 0 0 0-109.02-108.658l-19.698-7.239c-6.102-2.243-6.118-10.867-.025-13.132l20.083-7.467A183.998 183.998 0 0 0 133.291 26.28l7.91-21.394Z"/>
          </mask>
          <g mask="url(#gemini-mask-a)">
            <g filter="url(#gemini-mask-b)">
              <ellipse cx="163" cy="149" fill="#3689FF" rx="196" ry="159"/>
            </g>
            <g filter="url(#gemini-mask-c)">
              <ellipse cx="33.5" cy="142.5" fill="#F6C013" rx="68.5" ry="72.5"/>
            </g>
            <g filter="url(#gemini-mask-d)">
              <ellipse cx="19.5" cy="148.5" fill="#F6C013" rx="68.5" ry="72.5"/>
            </g>
            <g filter="url(#gemini-mask-e)">
              <path fill="#FA4340" d="M194 10.5C172 82.5 65.5 134.333 22.5 135L144-66l50 76.5Z"/>
            </g>
            <g filter="url(#gemini-mask-f)">
              <path fill="#FA4340" d="M190.5-12.5C168.5 59.5 62 111.333 19 112L140.5-89l50 76.5Z"/>
            </g>
            <g filter="url(#gemini-mask-g)">
              <path fill="#14BB69" d="M194.5 279.5C172.5 207.5 66 155.667 23 155l121.5 201 50-76.5Z"/>
            </g>
            <g filter="url(#gemini-mask-h)">
              <path fill="#14BB69" d="M196.5 320.5C174.5 248.5 68 196.667 25 196l121.5 201 50-76.5Z"/>
            </g>
          </g>
          <defs>
            <filter id="gemini-mask-b" width="464" height="390" x="-69" y="-46" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="18"/>
            </filter>
            <filter id="gemini-mask-c" width="265" height="273" x="-99" y="6" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/>
            </filter>
            <filter id="gemini-mask-d" width="265" height="273" x="-113" y="12" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/>
            </filter>
            <filter id="gemini-mask-e" width="299.5" height="329" x="-41.5" y="-130" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/>
            </filter>
            <filter id="gemini-mask-f" width="299.5" height="329" x="-45" y="-153" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/>
            </filter>
            <filter id="gemini-mask-g" width="299.5" height="329" x="-41" y="91" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/>
            </filter>
            <filter id="gemini-mask-h" width="299.5" height="329" x="-39" y="132" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/>
            </filter>
          </defs>
        </svg>
      )
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      url: "https://chat.deepseek.com/",
      renderIcon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" style={{ flex: "none", lineHeight: 1 }} viewBox="0 0 24 24" className="size-4 shrink-0">
          <path fill="#4D6BFE" d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 0 1-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 0 0-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 0 1-.465.137 9.597 9.597 0 0 0-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 0 0 1.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 0 1 1.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 0 1 .415-.287.302.302 0 0 1 .2.288.306.306 0 0 1-.31.307.303.303 0 0 1-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 0 1-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 0 1 .016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 0 1-.254-.078.253.253 0 0 1-.114-.358c.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z"/>
        </svg>
      )
    },
    {
      id: "chatgpt",
      name: "ChatGPT",
      url: "https://chatgpt.com/",
      renderIcon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10A37F" fillRule="evenodd" className="size-4 shrink-0">
          <title>OpenAI (ChatGPT)</title>
          <path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z" />
        </svg>
      )
    },
    {
      id: "lovable",
      name: "Lovable",
      url: "https://lovable.dev/",
      renderIcon: () => (
        <svg viewBox="0 0 121 122" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" fill="none">
          <mask id="lovable-mask-b" width="121" height="122" x="0" y="0" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }}>
            <path fill="url(#lovable-grad-a)" fillRule="evenodd" d="M36.069 0c19.92 0 36.068 16.155 36.068 36.084v13.713h12.004c19.92 0 36.069 16.156 36.069 36.084 0 19.928-16.149 36.083-36.069 36.083H0v-85.88C0 16.155 16.148 0 36.069 0Z" clipRule="evenodd"/>
          </mask>
          <g mask="url(#lovable-mask-b)">
            <g filter="url(#lovable-filter-c)">
              <ellipse cx="52.738" cy="65.101" fill="#4B73FF" rx="81.373" ry="81.192"/>
            </g>
            <g filter="url(#lovable-filter-d)">
              <ellipse cx="61.673" cy="20.547" fill="#FF66F4" rx="104.216" ry="81.192"/>
            </g>
            <g filter="url(#lovable-filter-e)">
              <ellipse cx="78.666" cy="5.268" fill="#FF0105" rx="81.373" ry="71.304"/>
            </g>
            <g filter="url(#lovable-filter-f)">
              <ellipse cx="63.121" cy="20.527" fill="#FE7B02" rx="48.937" ry="48.829"/>
            </g>
          </g>
          <defs>
            <filter id="lovable-filter-c" width="235.52" height="235.159" x="-65.022" y="-52.478" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur result="effect1_foregroundBlur_572_319" stdDeviation="18.194"/>
            </filter>
            <filter id="lovable-filter-d" width="281.208" height="235.159" x="-78.93" y="-97.032" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur result="effect1_foregroundBlur_572_319" stdDeviation="18.194"/>
            </filter>
            <filter id="lovable-filter-e" width="235.52" height="215.383" x="-39.094" y="-102.423" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur result="effect1_foregroundBlur_572_319" stdDeviation="18.194"/>
            </filter>
            <filter id="lovable-filter-f" width="170.649" height="170.432" x="-22.204" y="-64.688" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur result="effect1_foregroundBlur_572_319" stdDeviation="18.194"/>
            </filter>
            <linearGradient id="lovable-grad-a" x1="40.453" x2="76.933" y1="21.433" y2="121.971" gradientUnits="userSpaceOnUse">
              <stop offset=".025" stopColor="#FF8E63"/>
              <stop offset=".56" stopColor="#FF7EB0"/>
              <stop offset=".95" stopColor="#4B73FF"/>
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: "copilot",
      name: "Microsoft Copilot",
      url: "https://copilot.microsoft.com/",
      renderIcon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="2 4 43.998 40" className="size-4 shrink-0">
          <path fill="url(#copilot-grad-a)" d="M34.142 7.325A4.63 4.63 0 0 0 29.7 4h-1.35a4.63 4.63 0 0 0-4.554 3.794L21.48 20.407l.575-1.965a4.63 4.63 0 0 1 4.444-3.33h7.853l3.294 1.282 3.175-1.283h-.926a4.63 4.63 0 0 1-4.443-3.325l-1.31-4.461z"/>
          <path fill="url(#copilot-grad-b)" d="M14.33 40.656A4.63 4.63 0 0 0 18.779 44h2.87a4.63 4.63 0 0 0 4.629-4.51l.312-12.163-.654 2.233a4.63 4.63 0 0 1-4.443 3.329h-7.919l-2.823-1.532-3.057 1.532h.912a4.63 4.63 0 0 1 4.447 3.344l1.279 4.423z"/>
          <path fill="url(#copilot-grad-c)" d="M29.5 4H13.46c-4.583 0-7.332 6.057-9.165 12.113C2.123 23.29-.72 32.885 7.503 32.885h6.925a4.63 4.63 0 0 0 4.456-3.358 2078.617 2078.617 0 0 1 4.971-17.156c.843-2.843 1.544-5.284 2.621-6.805C27.08 4.714 28.086 4 29.5 4z"/>
          <path fill="url(#copilot-grad-d)" d="M29.5 4H13.46c-4.583 0-7.332 6.057-9.165 12.113C2.123 23.29-.72 32.885 7.503 32.885h6.925a4.63 4.63 0 0 0 4.456-3.358 2078.617 2078.617 0 0 1 4.971-17.156c.843-2.843 1.544-5.284 2.621-6.805C27.08 4.714 28.086 4 29.5 4z"/>
          <path fill="url(#copilot-grad-e)" d="M18.498 44h16.04c4.582 0 7.332-6.058 9.165-12.115 2.171-7.177 5.013-16.775-3.208-16.775h-6.926a4.63 4.63 0 0 0-4.455 3.358 2084.036 2084.036 0 0 1-4.972 17.16c-.842 2.843-1.544 5.285-2.62 6.806-.604.852-1.61 1.566-3.024 1.566z"/>
          <path fill="url(#copilot-grad-f)" d="M18.498 44h16.04c4.582 0 7.332-6.058 9.165-12.115 2.171-7.177 5.013-16.775-3.208-16.775h-6.926a4.63 4.63 0 0 0-4.455 3.358 2084.036 2084.036 0 0 1-4.972 17.16c-.842 2.843-1.544 5.285-2.62 6.806-.604.852-1.61 1.566-3.024 1.566z"/>
          <defs>
            <radialGradient id="copilot-grad-a" cx="0" cy="0" r="1" gradientTransform="matrix(-10.96051 -13.38922 12.59013 -10.30637 38.005 20.514)" gradientUnits="userSpaceOnUse">
              <stop offset=".096" stopColor="#00AEFF"/>
              <stop offset=".773" stopColor="#2253CE"/>
              <stop offset="1" stopColor="#0736C4"/>
            </radialGradient>
            <radialGradient id="copilot-grad-b" cx="0" cy="0" r="1" gradientTransform="rotate(51.84 -28.201 27.85) scale(15.9912 15.5119)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFB657"/>
              <stop offset=".634" stopColor="#FF5F3D"/>
              <stop offset=".923" stopColor="#C02B3C"/>
            </radialGradient>
            <radialGradient id="copilot-grad-e" cx="0" cy="0" r="1" gradientTransform="rotate(109.274 16.301 20.802) scale(38.3873 45.9867)" gradientUnits="userSpaceOnUse">
              <stop offset=".066" stopColor="#8C48FF"/>
              <stop offset=".5" stopColor="#F2598A"/>
              <stop offset=".896" stopColor="#FFB152"/>
            </radialGradient>
            <linearGradient id="copilot-grad-c" x1="12.5" x2="14.788" y1="7.5" y2="33.975" gradientUnits="userSpaceOnUse">
              <stop offset=".156" stopColor="#0D91E1"/>
              <stop offset=".487" stopColor="#52B471"/>
              <stop offset=".652" stopColor="#98BD42"/>
              <stop offset=".937" stopColor="#FFC800"/>
            </linearGradient>
            <linearGradient id="copilot-grad-d" x1="14.5" x2="15.75" y1="4" y2="32.885" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3DCBFF"/>
              <stop offset=".247" stopColor="#0588F7" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="copilot-grad-f" x1="42.586" x2="42.569" y1="13.346" y2="21.215" gradientUnits="userSpaceOnUse">
              <stop offset=".058" stopColor="#F8ADFA"/>
              <stop offset=".708" stopColor="#A86EDD" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: "perplexity",
      name: "Perplexity",
      url: "https://www.perplexity.ai/",
      renderIcon: () => (
        <svg fill="#1FB8CD" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
          <title>Perplexity</title>
          <path d="M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z"/>
        </svg>
      )
    }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: overviews = [], isLoading: isLoadingOverviews } =
    trpc.apiDocs.getOverviews.useQuery(
      { apiType: selectedProductSlug },
      { enabled: !!selectedProductSlug, refetchOnWindowFocus: false }
    );

  const { data: groupsWithEndpoints = [], isLoading: isLoadingGroups } =
    trpc.apiDocs.getGroupsWithEndpoints.useQuery(
      { apiType: selectedProductSlug },
      { enabled: !!selectedProductSlug, refetchOnWindowFocus: false }
    );

  const { data: endpointDetails, isLoading: isLoadingEndpointDetails } =
    trpc.apiDocs.getEndpointById.useQuery(
      { id: selectedEndpointId },
      { enabled: activeDocType === "endpoint" && !!selectedEndpointId, refetchOnWindowFocus: false }
    );

  useEffect(() => {
    if (overviews.length > 0) {
      setSelectedOverviewSlug(overviews[0].slug);
      setActiveDocType("overview");
    } else {
      const firstGroupWithEndpoints = groupsWithEndpoints.find(g => g.endpoints && g.endpoints.length > 0);
      if (firstGroupWithEndpoints && firstGroupWithEndpoints.endpoints.length > 0) {
        setSelectedEndpointId(firstGroupWithEndpoints.endpoints[0].id);
        setActiveDocType("endpoint");
      }
    }
  }, [selectedProductSlug, overviews, groupsWithEndpoints]);

  const filteredGroups = useMemo(() => {
    if (!debouncedSearch.trim()) return groupsWithEndpoints;
    return groupsWithEndpoints
      .map(group => ({
        ...group,
        endpoints: (group.endpoints || []).filter(
          ep =>
            ep.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            ep.path.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
      }))
      .filter(group => group.endpoints.length > 0);
  }, [groupsWithEndpoints, debouncedSearch]);

  const filteredOverviews = useMemo(() => {
    if (!debouncedSearch.trim()) return overviews;
    return overviews.filter(ov =>
      ov.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (ov.description && ov.description.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );
  }, [overviews, debouncedSearch]);

  const activeOverview = useMemo(() => {
    if (activeDocType !== "overview") return null;
    return overviews.find(ov => ov.slug === selectedOverviewSlug) || null;
  }, [activeDocType, overviews, selectedOverviewSlug]);

  const activeMarkdown = useMemo(() => {
    if (activeDocType === "overview" && activeOverview) {
      return activeOverview.content;
    }
    if (activeDocType === "endpoint" && endpointDetails) {
      let md = `# ${endpointDetails.name}\n\n`;
      md += `**Method**: \`${endpointDetails.method}\`\n`;
      md += `**Path**: \`${endpointDetails.path}\`\n\n`;
      if (endpointDetails.description) {
        md += `## Mô tả\n${endpointDetails.description}\n\n`;
      }
      if (endpointDetails.headers && endpointDetails.headers.length > 0) {
        md += `## Request Headers\n`;
        md += `| Tham số | Kiểu | Yêu cầu | Mô tả |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;
        endpointDetails.headers.forEach((h: any) => {
          md += `| \`${h.name}\` | \`${h.type}\` | ${h.required ? "Bắt buộc" : "Tùy chọn"} | ${h.description || ""} |\n`;
        });
        md += `\n`;
      }
      if (endpointDetails.queryParams && endpointDetails.queryParams.length > 0) {
        md += `## Query Parameters\n`;
        md += `| Tham số | Kiểu | Yêu cầu | Mô tả |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;
        endpointDetails.queryParams.forEach((q: any) => {
          md += `| \`${q.name}\` | \`${q.type}\` | ${q.required ? "Bắt buộc" : "Tùy chọn"} | ${q.description || ""} |\n`;
        });
        md += `\n`;
      }
      if (endpointDetails.requestBody && endpointDetails.requestBody.length > 0) {
        md += `## Request Body parameters\n`;
        md += `| Tham số | Kiểu | Yêu cầu | Mô tả |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;
        endpointDetails.requestBody.forEach((b: any) => {
          md += `| \`${b.name}\` | \`${b.type}\` | ${b.required ? "Bắt buộc" : "Tùy chọn"} | ${b.description || ""} |\n`;
        });
        md += `\n`;
      }
      if (endpointDetails.responses && endpointDetails.responses.length > 0) {
        md += `## Responses\n`;
        endpointDetails.responses.forEach((res: any) => {
          md += `### Status: ${res.status} (${res.description || ""})\n`;
          md += `\`\`\`json\n${typeof res.body === "object" ? JSON.stringify(res.body, null, 2) : String(res.body)}\n\`\`\`\n\n`;
        });
      }
      return md;
    }
    return "";
  }, [activeDocType, activeOverview, endpointDetails]);

  const handleOpenWithAi = (ai: typeof aiOptions[0]) => {
    let promptText = "";
    if (activeDocType === "overview" && activeOverview) {
      promptText = `Dưới đây là tài liệu hướng dẫn về ${currentProduct?.name || "API"}. Hãy giải thích nội dung này và tóm tắt các điểm cần lưu ý:\n\n${activeMarkdown}`;
    } else if (activeDocType === "endpoint" && endpointDetails) {
      promptText = `Dưới đây là đặc tả chi tiết của API endpoint "${endpointDetails.name}" (${endpointDetails.method} ${endpointDetails.path}) thuộc dịch vụ ${currentProduct?.name || "API"}:\n\n${activeMarkdown}\n\nHãy viết mã nguồn (ví dụ: Node.js, Python hoặc Go) để gọi API này, và giải thích chi tiết các tham số đầu vào cũng như phản hồi mẫu.`;
    }
    if (promptText) {
      navigator.clipboard.writeText(promptText);
      let targetUrl = ai.url;
      const encodedPrompt = encodeURIComponent(promptText);
      
      if (ai.id === "claude") {
        targetUrl = `https://claude.ai/new?q=${encodedPrompt}`;
      } else if (ai.id === "chatgpt") {
        targetUrl = `https://chatgpt.com/?q=${encodedPrompt}`;
      } else if (ai.id === "perplexity") {
        targetUrl = `https://www.perplexity.ai/?q=${encodedPrompt}`;
      } else if (ai.id === "gemini") {
        targetUrl = `https://gemini.google.com/app?q=${encodedPrompt}`;
      } else if (ai.id === "copilot") {
        targetUrl = `https://copilot.microsoft.com/?q=${encodedPrompt}`;
      } else if (ai.id === "lovable") {
        targetUrl = `https://lovable.dev/#prompt=${encodedPrompt}`;
      }

      toast.success(`Đang mở ${ai.name}... (Đã sao chép prompt vào bộ nhớ tạm)`);
      window.open(targetUrl, "_blank");
    }
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25";
      case "POST":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/25";
      case "PUT":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/25";
      case "DELETE":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/25";
      case "PATCH":
        return "bg-purple-500/10 text-purple-500 border border-purple-500/25";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  const handleCopyPath = (pathText: string) => {
    navigator.clipboard.writeText(pathText);
    toast.success("Đã sao chép đường dẫn API!");
  };

  if (!mounted) {
    return (
      <div className="flex flex-col w-full flex-1">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l border-r border-dashed border-primary/20 pt-[100px] pb-6 px-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden border-l border-r border-dashed border-primary/20 pt-[100px] pb-6 px-6">
          {currentProduct?.thumbnail && (
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
              <img
                src={currentProduct.thumbnail}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-[0.5] dark:opacity-[0.5]"
              />
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/40 to-background" />
              <div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(circle at center, transparent 30%, hsl(var(--background)) 100%)",
                }}
              />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3 bg-background/60 backdrop-blur-md">
              <Icon icon="solar:programming-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-2.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground select-none">
                <Link href="/" className="hover:text-vanixjnk transition-colors flex items-center gap-1">
                  <Icon icon="solar:home-2-line-duotone" className="size-4" />
                  Trang chủ
                </Link>
                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                <Link href="/docs" className="hover:text-vanixjnk transition-colors">
                  Tài liệu API
                </Link>
                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                <span className="text-foreground font-semibold truncate max-w-[200px]">
                  {currentProduct?.name}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {currentProduct?.name}
              </h1>

              {currentProduct?.description && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                  {currentProduct.description}
                </p>
              )}

              {currentProduct?.createdAt && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 select-none">
                  <Icon icon="solar:calendar-line-duotone" className="size-4" />
                  <span>Cập nhật: {new Date(currentProduct.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative w-full border-t border-b border-dashed border-primary/20 overflow-hidden text-primary/20"
        style={{ height: "36px" }}
      >
        <div
          className="absolute inset-y-0 left-[-100vw] w-[300vw]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)",
          }}
        />
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start grow">
            
            <aside className="lg:col-span-3 flex flex-col gap-4 self-stretch border-r border-dashed border-primary/10 pr-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground z-10">
                  <Icon icon="solar:magnifer-line-duotone" className="size-4" />
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm tài liệu & API..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-8 text-[13px] bg-background border border-border/60 rounded-xl focus:outline-hidden focus:border-vanixjnk/60"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <Icon icon="solar:close-circle-line-duotone" className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 pr-1 max-h-[70vh]">
                {filteredOverviews.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2.5">
                      Hướng dẫn chung
                    </h3>
                    <div className="flex flex-col gap-0.5">
                      {filteredOverviews.map((ov) => {
                        const isSelected = activeDocType === "overview" && selectedOverviewSlug === ov.slug;
                        return (
                          <button
                            key={ov.id}
                            onClick={() => {
                              setActiveDocType("overview");
                              setSelectedOverviewSlug(ov.slug);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-left transition-all duration-200 cursor-pointer",
                              isSelected
                                ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk"
                                : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                            )}
                          >
                            <Icon icon="solar:document-text-line-duotone" className="size-4 shrink-0" />
                            <span className="truncate">{ov.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isLoadingGroups ? (
                  <div className="space-y-3 px-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-8 w-full rounded-lg" />
                    <Skeleton className="h-8 w-full rounded-lg" />
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground/60 italic">
                    Không tìm thấy API nào khớp
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <div key={group.id} className="space-y-1.5">
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2.5 truncate" title={group.name}>
                        {group.name}
                      </h3>
                      <div className="flex flex-col gap-0.5">
                        {group.endpoints.map((ep) => {
                          const isSelected = activeDocType === "endpoint" && selectedEndpointId === ep.id;
                          return (
                            <button
                              key={ep.id}
                              onClick={() => {
                                  setActiveDocType("endpoint");
                                  setSelectedEndpointId(ep.id);
                              }}
                              className={cn(
                                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-200 cursor-pointer border",
                                isSelected
                                  ? "bg-vanixjnk/10 border-vanixjnk/25 text-vanixjnk"
                                  : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                              )}
                            >
                              <span className={cn(
                                "text-[9px] font-black tracking-wide uppercase px-1 rounded-sm font-mono scale-90 shrink-0",
                                getMethodBadgeClass(ep.method)
                              )}>
                                {ep.method}
                              </span>
                              <span className="text-[12.5px] truncate grow">{ep.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>

            <main className="lg:col-span-9 flex flex-col gap-6 self-stretch overflow-y-auto max-h-[78vh] pr-1">
              {activeDocType === "overview" && (
                <>
                  {isLoadingOverviews ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-72" />
                      <Skeleton className="h-4 w-96" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  ) : activeOverview ? (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/60 pb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="border-vanixjnk/30 text-vanixjnk bg-vanixjnk/5 text-[10px] font-bold">
                              Tài liệu hướng dẫn
                            </Badge>
                          </div>
                          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                            {activeOverview.title}
                          </h2>
                          {activeOverview.description && (
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                              {activeOverview.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsMarkdownDialogOpen(true)}
                            className="h-8 gap-1.5 text-xs font-semibold cursor-pointer border-border hover:bg-muted/40"
                          >
                            <Icon icon="solar:code-line-duotone" className="size-4 text-vanixjnk" />
                            <span>Xem Markdown</span>
                          </Button>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-semibold cursor-pointer border-border hover:bg-muted/40"
                              >
                                <Icon icon="solar:bolt-line-duotone" className="size-4 text-vanixjnk" />
                                <span>Mở bằng AI</span>
                                <Icon icon="solar:alt-arrow-down-line-duotone" className="size-3 text-muted-foreground" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-56 p-1.5 bg-popover border border-border shadow-md rounded-lg">
                              <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest select-none">
                                Chọn AI Assistant
                              </div>
                              <div className="flex flex-col gap-0.5">
                                {aiOptions.map((ai) => (
                                  <button
                                    key={ai.id}
                                    onClick={() => handleOpenWithAi(ai)}
                                    className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-muted/50 text-[13px] text-left transition-colors cursor-pointer text-foreground font-medium"
                                  >
                                    <div className="flex items-center gap-2">
                                      {ai.renderIcon()}
                                      <span>{ai.name}</span>
                                    </div>
                                    <Icon icon="solar:arrow-right-up-line-duotone" className="size-3.5 text-muted-foreground/50" />
                                  </button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:tracking-tight">
                        <MdxRenderer content={activeOverview.content} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                      <div className="size-14 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
                        <Icon icon="solar:document-text-line-duotone" className="text-2xl" />
                      </div>
                      <span className="text-xs text-muted-foreground/60 italic">Vui lòng chọn một tài liệu ở thanh bên.</span>
                    </div>
                  )}
                </>
              )}

              {activeDocType === "endpoint" && (
                <>
                  {isLoadingEndpointDetails ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-80" />
                      </div>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-48 w-full" />
                    </div>
                  ) : endpointDetails ? (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="border-b border-border/60 pb-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded text-[11px] font-black uppercase border font-mono tracking-wide shadow-2xs",
                              getMethodBadgeClass(endpointDetails.method)
                            )}>
                              {endpointDetails.method}
                            </span>
                            <div className="flex items-center gap-1.5 bg-muted/30 border border-border/80 rounded-lg pl-3 pr-1 py-0.5 font-mono text-xs select-all w-full sm:w-auto mt-1 sm:mt-0">
                              <span className="text-muted-foreground/60 select-none">https://domain.com</span>
                              <span className="text-foreground/85 font-semibold">{endpointDetails.path}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyPath(endpointDetails.path)}
                                className="size-6 p-0 hover:bg-muted ml-2 cursor-pointer"
                                title="Copy path"
                              >
                                <Icon icon="solar:copy-line-duotone" className="size-3.5 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsMarkdownDialogOpen(true)}
                              className="h-8 gap-1.5 text-xs font-semibold cursor-pointer border-border hover:bg-muted/40"
                            >
                              <Icon icon="solar:code-line-duotone" className="size-4 text-vanixjnk" />
                              <span>Xem Markdown</span>
                            </Button>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs font-semibold cursor-pointer border-border hover:bg-muted/40"
                                >
                                  <Icon icon="solar:bolt-line-duotone" className="size-4 text-vanixjnk" />
                                  <span>Mở bằng AI</span>
                                  <Icon icon="solar:alt-arrow-down-line-duotone" className="size-3 text-muted-foreground" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-56 p-1.5 bg-popover border border-border shadow-md rounded-lg">
                                <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest select-none">
                                  Chọn AI Assistant
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  {aiOptions.map((ai) => (
                                    <button
                                      key={ai.id}
                                      onClick={() => handleOpenWithAi(ai)}
                                      className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-muted/50 text-[13px] text-left transition-colors cursor-pointer text-foreground font-medium"
                                    >
                                      <div className="flex items-center gap-2">
                                        {ai.renderIcon()}
                                        <span>{ai.name}</span>
                                      </div>
                                      <Icon icon="solar:arrow-right-up-line-duotone" className="size-3.5 text-muted-foreground/50" />
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <h2 className="text-lg font-bold text-foreground mt-2">{endpointDetails.name}</h2>
                      </div>

                      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground/90">
                        <MdxRenderer content={endpointDetails.description} />
                      </div>

                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-fit whitespace-nowrap">
                        <button
                          onClick={() => setActiveSubTab("spec")}
                          className={cn(
                            "flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer",
                            activeSubTab === "spec"
                              ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-2xs"
                              : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          )}
                        >
                          <Icon icon="solar:document-text-line-duotone" className="size-4" />
                          <span>Đặc tả tham số</span>
                        </button>
                        <button
                          onClick={() => setActiveSubTab("playground")}
                          className={cn(
                            "flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer",
                            activeSubTab === "playground"
                              ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-2xs"
                              : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          )}
                        >
                          <Icon icon="solar:play-line-duotone" className="size-4" />
                          <span>Chạy thử (Playground)</span>
                        </button>
                      </div>

                      {activeSubTab === "spec" && (
                        <div className="space-y-6">
                          <ParameterTable title="Request Headers" list={endpointDetails.headers || []} />

                          <ParameterTable title="Query Parameters" list={endpointDetails.queryParams || []} />

                          {["POST", "PUT", "PATCH", "DELETE"].includes(endpointDetails.method) && (
                            <ParameterTable title="JSON Body parameters" list={endpointDetails.requestBody || []} />
                          )}

                          {endpointDetails.responses && endpointDetails.responses.length > 0 && (
                            <div className="space-y-4 border border-border/40 rounded-2xl p-5 bg-card/20">
                              <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider border-b pb-2 border-border/40 flex items-center gap-1.5">
                                <Icon icon="solar:mailbox-line-duotone" className="text-muted-foreground text-base" />
                                Mẫu kết quả phản hồi (Responses)
                              </h3>
                              <div className="space-y-4">
                                {endpointDetails.responses.map((res: ApiResponseSample, i: number) => (
                                  <div key={i} className="border border-border/60 rounded-xl overflow-hidden bg-background">
                                    <div className="flex justify-between items-center bg-muted/20 px-4 py-2 border-b border-border/60 text-xs">
                                      <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider",
                                        res.status >= 200 && res.status < 300
                                          ? "bg-green-500/15 text-green-500 border border-green-500/25"
                                          : "bg-red-500/15 text-red-500 border border-red-500/25"
                                      )}>
                                        Status: {res.status}
                                      </span>
                                      <span className="text-muted-foreground italic font-medium">{res.description}</span>
                                    </div>
                                    <pre className="p-4 bg-muted/5 font-mono text-[11px] text-foreground/85 max-h-52 overflow-y-auto leading-relaxed select-all">
                                      <code>
                                        {typeof res.body === "object" ? JSON.stringify(res.body, null, 2) : String(res.body)}
                                      </code>
                                    </pre>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeSubTab === "playground" && (
                        <PlaygroundPanel endpointDetails={endpointDetails} />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                      <div className="size-14 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
                        <Icon icon="solar:programming-line-duotone" className="text-2xl" />
                      </div>
                      <span className="text-xs text-muted-foreground/60 italic">Chọn một API ở thanh bên để xem đặc tả kỹ thuật.</span>
                    </div>
                  )}
                </>
              )}
            </main>

          </div>
        </div>
      </div>
      <Dialog open={isMarkdownDialogOpen} onOpenChange={setIsMarkdownDialogOpen}>
        <DialogContent className="max-w-3xl sm:max-w-4xl max-h-[85vh] flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-vanixjnk/10 border border-vanixjnk/25 text-vanixjnk p-2.5">
              <Icon icon="solar:code-line-duotone" className="text-xl" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Xem mã Markdown
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Đặc tả chi tiết tài liệu dưới dạng Markdown nguyên bản
              </DialogDescription>
            </div>
          </div>
          <div className="flex-1 min-h-0 bg-muted/10 border border-border/40 rounded-lg p-3 overflow-y-auto">
            <pre className="font-mono text-[13px] leading-relaxed text-foreground select-all whitespace-pre-wrap break-all max-h-[50vh] overflow-y-auto">
              <code>{activeMarkdown}</code>
            </pre>
          </div>
          <DialogFooter>
            <Button
              variant="vanixjnk"
              className="h-9 px-4 gap-2 text-[13px]"
              onClick={() => {
                navigator.clipboard.writeText(activeMarkdown);
                toast.success("Đã sao chép nội dung Markdown!");
              }}
            >
              <Icon icon="solar:copy-line-duotone" className="size-4" />
              <span>Sao chép Markdown</span>
            </Button>
            <DialogClose asChild>
              <Button variant="danger" className="h-9 text-[13px]">
                <span>Đóng</span>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ParameterTable({ title, list }: { title: string; list: ApiParameter[] }) {
  if (list.length === 0) return null;
  return (
    <div className="space-y-3 border border-border/40 rounded-2xl p-5 bg-card/20">
      <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider border-b pb-2 border-border/40 flex items-center gap-1.5">
        <Icon icon="solar:list-line-duotone" className="text-muted-foreground text-base" />
        {title}
      </h3>
      <div className="overflow-x-auto w-full border border-border/60 rounded-xl bg-background">
        <table className="min-w-full text-left text-xs divide-y divide-border/60">
          <thead className="bg-muted/10 font-bold text-muted-foreground/80">
            <tr>
              <th className="px-4 py-3 font-mono">Tham số</th>
              <th className="px-4 py-3 font-mono">Kiểu</th>
              <th className="px-4 py-3 font-mono">Yêu cầu</th>
              <th className="px-4 py-3 font-mono">Mô tả</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-foreground/80">
            {list.map((param) => (
              <tr key={param.name} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-foreground/75 select-all">{param.name}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] bg-border/40 px-1.5 py-0.5 rounded text-muted-foreground font-mono">{param.type}</span>
                </td>
                <td className="px-4 py-3 font-semibold">
                  {param.required ? (
                    <span className="text-rose-500 bg-rose-500/5 px-1.5 py-0.5 rounded text-[10px] border border-rose-500/20">Bắt buộc</span>
                  ) : (
                    <span className="text-muted-foreground/60 bg-muted/20 px-1.5 py-0.5 rounded text-[10px]">Tùy chọn</span>
                  )}
                </td>
                <td className="px-4 py-3 leading-relaxed">
                  <div>{param.description}</div>
                  {param.defaultValue !== undefined && (
                    <div className="text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-1">
                      <span className="font-bold">Mặc định:</span>
                      <code className="font-mono bg-border/20 px-1 rounded">{String(param.defaultValue)}</code>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
