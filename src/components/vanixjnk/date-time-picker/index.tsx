"use client";

import * as React from "react";
import { format, setHours, setMinutes, startOfHour, addHours, addDays, isBefore, isSameDay, addMinutes, startOfMinute } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

interface DateTimePickerProps {
    value?: Date | string | null;
    onChange: (date: Date | null) => void;
    className?: string;
    placeholder?: string;
    align?: "start" | "center" | "end";
    minDate?: Date;
}

export function DateTimePicker({
    value,
    onChange,
    className,
    placeholder = "Chọn ngày giờ...",
    align = "center",
    minDate,
}: DateTimePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const isMobile = useIsMobile();
    const dateValue = React.useMemo(() => {
        if (!value) return null;
        const d = value instanceof Date ? value : new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }, [value]);

    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
        dateValue || undefined
    );
    React.useEffect(() => {
        if (isOpen) {
            let initialDate = dateValue || undefined;
            if (minDate && initialDate && isBefore(initialDate, minDate)) {
                initialDate = startOfMinute(addMinutes(minDate, 5));
            }
            setSelectedDate(initialDate);
        }
    }, [isOpen, dateValue, minDate]);
    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        let base = selectedDate || (minDate ? startOfMinute(addMinutes(minDate, 5)) : startOfMinute(new Date()));

        let newDate = setMinutes(setHours(date, base.getHours()), base.getMinutes());
        if (minDate && isBefore(newDate, minDate)) {
            newDate = startOfMinute(addMinutes(minDate, 5));
        }

        setSelectedDate(newDate);
    };
    const handleTimeSelect = (type: "hour" | "minute", val: number) => {
        const baseDate = selectedDate || (minDate ? startOfMinute(addMinutes(minDate, 5)) : startOfMinute(new Date()));
        let newDate = type === "hour"
            ? setHours(baseDate, val)
            : setMinutes(baseDate, val);
        if (minDate && isBefore(newDate, minDate)) {
            if (isSameDay(newDate, minDate)) {
                if (type === "hour" && val < minDate.getHours()) return;
                if (type === "minute" && newDate.getHours() === minDate.getHours() && val < minDate.getMinutes()) return;
            } else {
                return;
            }
        }

        setSelectedDate(newDate);
    };

    const handleConfirm = () => {
        if (selectedDate) {
            onChange(selectedDate);
            setIsOpen(false);
        }
    };

    const handleQuickAction = (type: "now" | "tomorrow" | "1h") => {
        let newDate = startOfMinute(new Date());
        if (type === "tomorrow") {
            newDate = addDays(newDate, 1);
        } else if (type === "1h") {
            newDate = addHours(newDate, 1);
        } else if (type === "now") {
            newDate = addMinutes(newDate, 5);
        }

        if (minDate && isBefore(newDate, minDate)) {
            newDate = startOfMinute(addMinutes(minDate, 5));
        }

        setSelectedDate(newDate);
    };

    const handleReset = () => {
        setSelectedDate(undefined);
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
        if (isOpen && selectedDate) {
            setTimeout(() => {
                const activeHour = hourRef.current?.querySelector('[data-active="true"]');
                const activeMinute = minuteRef.current?.querySelector('[data-active="true"]');
                if (activeHour) activeHour.scrollIntoView({ block: "center", behavior: "smooth" });
                if (activeMinute) activeMinute.scrollIntoView({ block: "center", behavior: "smooth" });
            }, 50);
        }
    }, [isOpen, selectedDate]);

    const Trigger = (
        <Button
            variant={"outline"}
            className={cn(
                "h-9 justify-start text-left font-normal w-full",
                !dateValue && "text-muted-foreground",
                className
            )}
        >
            <Icon icon="solar:calendar-mark-line-duotone" className={cn("mr-2.5 h-[18px] w-[18px] transition-colors", dateValue ? "text-vanixjnk" : "text-muted-foreground/60")} />
            <span className="truncate flex-1 text-[13px] font-medium">
                {dateValue ? format(dateValue, "HH:mm") + " - " + format(dateValue, "dd/MM/yyyy") : placeholder}
            </span>
            <span className="text-[10px] bg-muted group-hover:bg-popover transition-colors text-muted-foreground font-bold px-1.5 py-0.5 rounded-md uppercase tracking-tighter ml-2">UTC+7</span>
            {dateValue && (
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
            <div className="flex flex-col sm:flex-row sm:divide-x divide-border">
                <div className="flex flex-col p-4 gap-5 bg-popover sm:w-[280px]">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        locale={vi}
                        disabled={minDate ? { before: minDate } : undefined}
                        className="p-0 pointer-events-auto w-full flex justify-center"
                        classNames={{
                            head_cell: "text-muted-foreground font-semibold text-[11px] uppercase tracking-wider w-8",
                            cell: "w-8 h-8 text-sm relative p-0 text-center focus-within:relative focus-within:z-20",
                            day_selected: "bg-vanixjnk text-primary-foreground hover:bg-vanixjnk hover:text-primary-foreground focus:bg-vanixjnk focus:text-primary-foreground rounded-lg",
                            day_today: "bg-accent/50 text-accent-foreground font-bold rounded-lg",
                            day: "h-8 w-8 p-0 font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors",
                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-border/50 rounded-md hover:bg-accent",
                            caption: "flex justify-between pt-1 relative items-center px-1 mb-2",
                        } as any}
                    />

                    <div className="pt-4 border-t border-dashed">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block opacity-80">Lựa chọn nhanh</span>
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="secondary" size="sm" className="h-[26px] text-[11px] rounded-lg px-3 font-semibold bg-accent/60 hover:bg-vanixjnk/10 hover:text-vanixjnk" onClick={() => handleQuickAction("now")}>Ngay bây giờ</Button>
                            <Button type="button" variant="secondary" size="sm" className="h-[26px] text-[11px] rounded-lg px-3 font-semibold bg-accent/60 hover:bg-vanixjnk/10 hover:text-vanixjnk" onClick={() => handleQuickAction("1h")}>+1 Giờ</Button>
                            <Button type="button" variant="secondary" size="sm" className="h-[26px] text-[11px] rounded-lg px-3 font-semibold bg-accent/60 hover:bg-vanixjnk/10 hover:text-vanixjnk" onClick={() => handleQuickAction("tomorrow")}>Ngày mai</Button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col p-4 gap-3 bg-muted/20 w-full sm:w-[190px]">
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
                                {hours.filter(h => {
                                    if (!minDate || !selectedDate) return true;
                                    if (!isSameDay(selectedDate, minDate)) return true;
                                    return h >= minDate.getHours();
                                }).map((h) => {
                                    const isActive = selectedDate?.getHours() === h;
                                    return (
                                        <Button
                                            key={h}
                                            type="button"
                                            variant={isActive ? "vanixjnk" : "ghost"}
                                            size="sm"
                                            data-active={isActive}
                                            className={cn("w-full h-8 text-xs font-medium rounded-lg transition-all shrink-0", !isActive && "text-muted-foreground hover:text-foreground")}
                                            onClick={() => handleTimeSelect("hour", h)}
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
                                {minutes.filter(m => {
                                    if (!minDate || !selectedDate) return true;
                                    if (!isSameDay(selectedDate, minDate)) return true;
                                    if (selectedDate.getHours() !== minDate.getHours()) return true;
                                    return m >= minDate.getMinutes();
                                }).map((m) => {
                                    const isActive = selectedDate?.getMinutes() === m;
                                    return (
                                        <Button
                                            key={m}
                                            type="button"
                                            variant={isActive ? "vanixjnk" : "ghost"}
                                            size="sm"
                                            data-active={isActive}
                                            className={cn("w-full h-8 text-xs font-medium rounded-lg transition-all shrink-0", !isActive && "text-muted-foreground hover:text-foreground")}
                                            onClick={() => handleTimeSelect("minute", m)}
                                        >
                                            {m.toString().padStart(2, "0")}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-3.5 border-t bg-muted/30 flex items-center justify-between mt-auto">
                <div className="text-[12px] font-medium text-muted-foreground px-2">
                    {selectedDate ? (
                        <span>Vào lúc <span className="font-bold text-foreground">{format(selectedDate, "HH:mm")}</span>, ngày <span className="font-bold text-foreground">{format(selectedDate, "dd/MM/yyyy")}</span></span>
                    ) : (
                        <span className="opacity-70">Chưa chọn thời gian...</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="sm" className="h-8 px-4 text-xs font-semibold" onClick={() => setIsOpen(false)}>Hủy</Button>
                    <Button type="button" variant="vanixjnk" size="sm" className="h-8 px-5 text-xs font-semibold shadow-sm" onClick={handleConfirm} disabled={!selectedDate}>Lưu lại</Button>
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
                        <DrawerTitle className="text-[15px] font-bold text-left px-1">Lên lịch thời gian</DrawerTitle>
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
