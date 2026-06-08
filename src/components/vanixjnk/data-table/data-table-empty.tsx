"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

export interface DataTableEmptyProps {
    onAdd?: () => void;
    title?: string;
    description?: string;
    buttonText?: string;
    columnCount?: number;
}

const cellStyles = [
    { inner: "bg-muted-foreground/10", innerWidth: "w-full" },
    { inner: "bg-vanixjnk/30", innerWidth: "w-1/2" },
    { inner: "bg-muted-foreground/10", innerWidth: "w-full" },
    { inner: "bg-blue-500/30", innerWidth: "w-3/4" },
];

const MockupTable = ({ columnCount = 6 }: { columnCount?: number }) => {
    const columns = Array.from({ length: columnCount }).map((_, i) => ({
        flex: [1, 1.5, 2, 1.2, 0.8][i % 5],
        style: cellStyles[i % cellStyles.length]
    }));

    return (
        <div className="w-full space-y-5 px-4 pt-4">
            {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center w-full">
                    {columns.map((col, j) => (
                        <div
                            key={j}
                            className="h-5 bg-muted/40 rounded flex items-center px-2 shrink-0 overflow-hidden"
                            style={{ flex: col.flex }}
                        >
                            <div className={cn("h-1.5 rounded", col.style.inner, col.style.innerWidth)} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export function DataTableEmpty({
    onAdd,
    title = "Không có dữ liệu",
    description = "Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc để xem kết quả phù hợp hơn.",
    buttonText = "Thêm mới",
    columnCount = 6,
}: DataTableEmptyProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && resolvedTheme === "dark";

    return (
        <div className="relative w-full min-h-[500px] flex items-center justify-center overflow-hidden bg-background/50 border-t border-dashed border-border/50">
            <div className="absolute inset-0 z-0 pointer-events-none select-none mt-4 overflow-hidden">
                <div className="absolute inset-0 opacity-100">
                    <MockupTable columnCount={columnCount} />
                </div>
                <div
                    className="absolute inset-0 z-10"
                    style={{
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 0%, black 100%)",
                        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 0%, black 100%)",
                    }}
                />
            </div>
            <div
                className="relative z-10 flex flex-col items-center text-center p-6 bg-muted/50 rounded-xl space-y-2 border border-border shadow-sm max-w-[80%]"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 160 160"
                    width={140}
                    height={140}
                >
                    <defs>
                        <filter
                            id="filter0_d_6007_1806"
                            x="13.1"
                            y="64.3364"
                            width="134.8"
                            height="94.5"
                            filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB"
                        >
                            {" "}
                            <feFlood floodOpacity={0} result="BackgroundImageFix" />{" "}
                            <feColorMatrix
                                in="SourceAlpha"
                                type="matrix"
                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                result="hardAlpha"
                            />{" "}
                            <feOffset dy={11} /> <feGaussianBlur stdDeviation={11} />{" "}
                            <feColorMatrix
                                type="matrix"
                                values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.27 0"
                            />{" "}
                            <feBlend
                                mode="normal"
                                in2="BackgroundImageFix"
                                result="effect1_dropShadow_6007_1806"
                            />{" "}
                            <feBlend
                                mode="normal"
                                in="SourceGraphic"
                                in2="effect1_dropShadow_6007_1806"
                                result="shape"
                            />{" "}
                        </filter>{" "}
                        <linearGradient
                            id="paint0_linear_6007_1806"
                            x1="80.4704"
                            y1="74.1683"
                            x2="80.4704"
                            y2="126.381"
                            gradientUnits="userSpaceOnUse"
                        >
                            {" "}
                            <stop className="[stop-color:#FDFEFF] dark:[stop-color:#262626]" />
                            <stop offset="0.9964" className="[stop-color:#ECF0F5] dark:[stop-color:#0A0A0A]" />{" "}
                        </linearGradient>
                    </defs>
                    <g fill="none">
                        <path
                            d="M80.4 142.836C113.2 142.836 139.8 116.436 139.8 83.8364C139.8 51.2364 113.2 24.8364 80.4 24.8364C47.6 24.8364 21 51.2364 21 83.8364C21 116.436 47.6 142.836 80.4 142.836Z"
                            className="fill-[#F1F3FA] dark:fill-[#171717]"
                        />{" "}
                        <path
                            d="M125.9 76.1364V112.236C125.9 119.736 119.8 125.836 112.2 125.836H48.8C41.3 125.836 35.2 119.836 35.1 112.336C35.1 112.236 35.1 112.236 35.1 112.136V76.1364C35.1 76.0364 35.1 76.0364 35.1 75.9364C35.1 75.7364 35.1 75.5364 35.2 75.3364C35.3 75.0364 35.4 74.8364 35.5 74.5364L52.5 42.0364C53.1 40.7364 54.4 40.0364 55.8 40.0364H105.1C106.5 40.0364 107.7 40.7364 108.4 42.0364L125.4 74.5364C125.5 74.7364 125.6 75.0364 125.7 75.3364C125.9 75.5364 125.9 75.8364 125.9 76.1364Z"
                            className="fill-[#D5DAE5] dark:fill-[#262626]"
                        />{" "}
                        <g filter="url(#filter0_d_6007_1806)">
                            {" "}
                            <path
                                d="M125.9 76.1364V115.936C125.9 121.436 121.5 125.836 115.9 125.836H45.1C39.6 125.836 35.1 121.436 35.1 115.936V75.9364C35.1 75.7364 35.1 75.5364 35.2 75.3364H58C61.4 75.3364 64.2 78.0364 64.2 81.5364C64.2 83.2364 64.9 84.8364 66 85.9364C67.2 87.1364 68.6 87.7364 70.4 87.7364H90.7C94.1 87.7364 96.9 85.0364 96.9 81.5364C96.9 79.8364 97.6 78.2364 98.7 77.1364C99.9 75.9364 101.3 75.3364 103 75.3364H125.7C125.9 75.5364 125.9 75.8364 125.9 76.1364Z"
                                fill="url(#paint0_linear_6007_1806)"
                            />{" "}
                        </g>{" "}
                        <path
                            d="M105.52 28.0056C106.825 42.2528 107.478 45.5155 104.523 58.4182C103.562 61.2868 102.601 64.4285 100.542 66.6141C97.6592 70.029 92.4428 71.5316 88.1873 70.4388C83.7945 69.346 80.2254 65.5213 79.4018 60.877C78.7154 58.0084 79.6763 54.5935 82.1473 52.8177C84.7555 51.1786 88.4618 51.5884 90.6582 53.6373C93.1291 55.6863 94.09 58.828 93.9528 61.8332C93.8155 64.8383 92.7173 67.8435 91.2073 70.4388C87.7938 76.8204 86.3885 76.797 79.4018 87.278"
                            className="stroke-[#AAB2C5] dark:stroke-[#525252]"
                            strokeWidth={2}
                            strokeMiterlimit={10}
                            strokeDasharray="4 4"
                        />{" "}
                        <path
                            d="M113.174 22.6994C112.652 24.6032 110.565 25.2955 108.478 24.084C106.216 23.0455 104.651 22.1802 104.999 20.4495C105.521 18.7187 107.608 18.5457 110.043 18.3726C113 18.0264 113.521 20.7956 113.174 22.6994Z"
                            className="fill-[#D5DAE5] dark:fill-[#262626]"
                        />{" "}
                        <path
                            d="M96.3025 24.43C97.1721 25.9876 99.6071 27.0261 101.346 25.4684C103.26 23.7377 104.825 22.5262 103.955 20.7955C103.086 19.2378 101.694 19.757 98.7375 20.1032C96.3025 20.6224 95.2589 22.6993 96.3025 24.43Z"
                            className="fill-[#D5DAE5] dark:fill-[#262626]"
                        />{" "}
                        <path
                            d="M103.955 18.0265C105.173 17.8534 106.39 18.5457 106.738 19.5842C106.912 19.9303 107.086 20.4495 107.086 20.7957C107.434 23.2187 106.564 25.2956 105.173 25.4686C103.607 25.8148 102.042 24.084 101.868 21.8341C101.868 21.1418 101.868 20.7957 101.868 20.2764C102.042 19.0649 102.738 18.1996 103.955 18.0265C104.129 18.0265 103.955 18.0265 103.955 18.0265Z"
                            className="fill-[#AAB2C5] dark:fill-[#525252]"
                        />{" "}
                        <path
                            d="M69.0906 102.096C70.3577 102.096 71.3849 101.069 71.3849 99.8019C71.3849 98.5348 70.3577 97.5076 69.0906 97.5076C67.8235 97.5076 66.7963 98.5348 66.7963 99.8019C66.7963 101.069 67.8235 102.096 69.0906 102.096Z"
                            className="fill-[#AAB2C5] dark:fill-[#525252]"
                        />{" "}
                        <path
                            d="M91.9095 102.096C93.1766 102.096 94.2038 101.069 94.2038 99.8019C94.2038 98.5348 93.1766 97.5076 91.9095 97.5076C90.6424 97.5076 89.6152 98.5348 89.6152 99.8019C89.6152 101.069 90.6424 102.096 91.9095 102.096Z"
                            className="fill-[#AAB2C5] dark:fill-[#525252]"
                        />{" "}
                        <path
                            d="M84.2205 117.164H77.0276C75.9114 117.164 74.9813 116.234 74.9813 115.118C74.9813 114.002 75.9114 113.072 77.0276 113.072H84.1585C85.2746 113.072 86.2048 114.002 86.2048 115.118C86.2668 116.234 85.3367 117.164 84.2205 117.164Z"
                            className="fill-[#AAB2C5] dark:fill-[#525252]"
                        />
                    </g>
                </svg>
                <h3 className="text-base font-bold tracking-tight mb-2 text-foreground">
                    {title}
                </h3>
                <p className="text-[13px] text-muted-foreground">
                    {description}
                </p>
                {onAdd && (
                  <Button variant="vanixjnk" size="sm" onClick={onAdd} className="mt-4 shadow-none">
                     {buttonText}
                  </Button>
                )}
            </div>
            <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-b from-background to-transparent z-5 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-background to-transparent z-5 pointer-events-none" />
        </div>
    );
}
