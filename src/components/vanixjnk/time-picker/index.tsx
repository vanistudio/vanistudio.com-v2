"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Icon } from "@iconify/react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimePickerProps {
    value?: string | null; // e.g. "08:30"
    onChange: (time: string | null) => void;
    className?: string;
    placeholder?: string;
    align?: "start" | "center" | "end";
}

export function TimePicker({
    value,
    onChange,
    className,
    placeholder = "Chọn giờ...",
    align = "center",
}: TimePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const isMobile = useIsMobile();

    // Split "HH:mm" into hours and minutes
    const initialTime = React.useMemo(() => {
        if (!value) return { hour: 8, minute: 0 };
        const parts = value.split(":");
        const hour = parseInt(parts[0], 10);
        const minute = parseInt(parts[1], 10);
        return {
            hour: isNaN(hour) ? 8 : hour,
            minute: isNaN(minute) ? 0 : minute,
        };
    }, [value]);

    const [selectedHour, setSelectedHour] = React.useState<number>(initialTime.hour);
    const [selectedMinute, setSelectedMinute] = React.useState<number>(initialTime.minute);

    React.useEffect(() => {
        if (isOpen) {
            setSelectedHour(initialTime.hour);
            setSelectedMinute(initialTime.minute);
        }
    }, [isOpen, initialTime]);

    const handleConfirm = () => {
        const h = selectedHour.toString().padStart(2, "0");
        const m = selectedMinute.toString().padStart(2, "0");
        onChange(`${h}:${m}`);
        setIsOpen(false);
    };

    const handleReset = () => {
        onChange(null);
        setIsOpen(false);
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5).concat(
        Array.from({ length: 60 }, (_, i) => i).filter(m => m % 5 !== 0)
    ).sort((a, b) => a - b);

    const hourRef = React.useRef<HTMLDivElement>(null);
    const minuteRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                const activeHour = hourRef.current?.querySelector('[data-active="true"]');
                const activeMinute = minuteRef.current?.querySelector('[data-active="true"]');
                if (activeHour) activeHour.scrollIntoView({ block: "center", behavior: "smooth" });
                if (activeMinute) activeMinute.scrollIntoView({ block: "center", behavior: "smooth" });
            }, 50);
        }
    }, [isOpen, selectedHour, selectedMinute]);

    const Trigger = (
        <Button
            variant={"outline"}
            className={cn(
                "h-9 justify-start text-left font-normal w-full cursor-pointer",
                !value && "text-muted-foreground",
                className
            )}
        >
            <Icon icon="solar:clock-circle-line-duotone" className={cn("mr-2.5 h-[18px] w-[18px] transition-colors", value ? "text-vanixjnk" : "text-muted-foreground/60")} />
            <span className="truncate flex-1 text-[13px] font-medium">
                {value ? value : placeholder}
            </span>
            {value && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                    }}
                    className="ml-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                >
                    <Icon icon="solar:close-circle-bold" className="h-[14px] w-[14px]" />
                </div>
            )}
        </Button>
    );

    const ContentBody = (
        <div className="flex flex-col w-full selection:bg-vanixjnk/20">
            <div className="flex flex-col p-4 gap-3 bg-muted/20 w-full">
                <div className="flex items-center gap-2 mb-1 px-1">
                    <Icon icon="solar:clock-circle-line-duotone" className="text-vanixjnk size-4 opacity-80" />
                    <span className="text-sm font-bold tracking-tight">Thời gian</span>
                </div>

                <div className="flex gap-3 h-[256px]">
                    <div className="flex-1 flex flex-col items-center gap-1.5" ref={hourRef}>
                        <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">Giờ</span>
                        <div
                            className="w-full h-full overflow-y-auto custom-scrollbar rounded-xl border bg-popover shadow-xs flex flex-col p-1.5 gap-0.5"
                            onWheel={(e) => e.stopPropagation()}
                        >
                            {hours.map((h) => {
                                const isActive = selectedHour === h;
                                return (
                                    <Button
                                        key={h}
                                        type="button"
                                        variant={isActive ? "vanixjnk" : "ghost"}
                                        size="sm"
                                        data-active={isActive}
                                        className={cn("w-full h-8 text-xs font-medium rounded-lg transition-all shrink-0", !isActive && "text-muted-foreground hover:text-foreground")}
                                        onClick={() => setSelectedHour(h)}
                                    >
                                        {h.toString().padStart(2, "0")}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1.5" ref={minuteRef}>
                        <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">Phút</span>
                        <div
                            className="w-full h-full overflow-y-auto custom-scrollbar rounded-xl border bg-popover shadow-xs flex flex-col p-1.5 gap-0.5"
                            onWheel={(e) => e.stopPropagation()}
                        >
                            {minutes.map((m) => {
                                const isActive = selectedMinute === m;
                                return (
                                    <Button
                                        key={m}
                                        type="button"
                                        variant={isActive ? "vanixjnk" : "ghost"}
                                        size="sm"
                                        data-active={isActive}
                                        className={cn("w-full h-8 text-xs font-medium rounded-lg transition-all shrink-0", !isActive && "text-muted-foreground hover:text-foreground")}
                                        onClick={() => setSelectedMinute(m)}
                                    >
                                        {m.toString().padStart(2, "0")}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-3.5 border-t bg-muted/30 flex items-center justify-between mt-auto">
                <div className="text-[12px] font-medium text-muted-foreground px-2">
                    <span>Vào lúc <span className="font-bold text-foreground">{selectedHour.toString().padStart(2, "0")}:{selectedMinute.toString().padStart(2, "0")}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="sm" className="h-8 px-4 text-xs font-semibold" onClick={() => setIsOpen(false)}>Hủy</Button>
                    <Button type="button" variant="vanixjnk" size="sm" className="h-8 px-5 text-xs font-semibold shadow-sm" onClick={handleConfirm}>Lưu lại</Button>
                </div>
            </div>
        </div>
    );
    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <DrawerTrigger asChild>
                    {Trigger}
                </DrawerTrigger>
                <DrawerContent className="p-0">
                    <DrawerHeader className="border-b py-4">
                        <DrawerTitle className="text-[15px] font-bold text-left px-4">Chọn giờ hoạt động</DrawerTitle>
                    </DrawerHeader>
                    <div className="flex flex-col w-full overflow-hidden">
                        {ContentBody}
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {Trigger}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 flex flex-col rounded-lg overflow-hidden shadow-lg border-border/60" align={align}>
                {ContentBody}
            </PopoverContent>
        </Popover>
    );
}
