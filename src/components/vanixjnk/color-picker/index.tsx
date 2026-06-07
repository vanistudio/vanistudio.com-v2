'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HexColorPicker } from 'react-colorful'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'

const colorPresets = [
    '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c',
    '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c',
    '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c',
    '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309',
    '#fef9c3', '#fef08a', '#fde047', '#eab308', '#ca8a04', '#a16207',
    '#d9f99d', '#bef264', '#a3e635', '#84cc16', '#65a30d', '#4d7c0f',
    '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d',
    '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857',
    '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e',
    '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490',
    '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8',
    '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca',
    '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce',
    '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d',
    '#ffffff', '#cbd5e1', '#64748b', '#475569', '#0f172a', '#000000',
]

const isHexDark = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return (r * 0.299 + g * 0.587 + b * 0.114) < 128
}

interface ColorPickerProps {
    value: string
    onChange: (color: string) => void
    label?: string
    className?: string
}

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
    const [color, setColor] = React.useState(value)
    const [open, setOpen] = React.useState(false)
    const [eyeDropperSupported, setEyeDropperSupported] = React.useState(false)

    React.useEffect(() => {
        setColor(value)
    }, [value])

    React.useEffect(() => {
        if (typeof window !== 'undefined' && 'EyeDropper' in window) {
            setEyeDropperSupported(true)
        }
    }, [])

    const onColorChange = (newColor: string) => {
        setColor(newColor)
        onChange(newColor)
    }

    const onEyeDropperColorChange = async () => {
        if (!eyeDropperSupported) return

        try {
            const eyeDropper = new (window as any).EyeDropper()
            const result = await eyeDropper.open()
            if (result?.sRGBHex) {
                onColorChange(result.sRGBHex)
            }
        } catch (e) {
            console.error('Error picking color:', e)
        }
    }

    return (
        <div className={cn("grid w-full gap-2 self-start", className)}>
            {label && <Label className="text-sm text-foreground leading-none">{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="border-foreground/20 h-9 w-full rounded-md border transition-opacity hover:opacity-80 cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                    />
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-3">
                    <Tabs defaultValue="presets" className="w-full">
                        <TabsList className="mb-3 grid grid-cols-2 w-full">
                            <TabsTrigger value="presets">Presets</TabsTrigger>
                            <TabsTrigger value="picker">Custom</TabsTrigger>
                        </TabsList>
                        <TabsContent value="presets" className="space-y-2">
                            <div className="flex max-h-48 flex-wrap overflow-y-auto">
                                {colorPresets.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => onColorChange(preset)}
                                        className={cn(
                                            'relative size-8 border-2 transition-all cursor-pointer',
                                            color === preset && '',
                                        )}
                                        style={{ backgroundColor: preset }}
                                    >
                                        {color === preset && (
                                            <div className="absolute inset-0 grid place-content-center">
                                                <Icon icon="mdi:check" width={14} height={14}
                                                    className={cn(
                                                        'size-3.5 text-white drop-shadow',
                                                        !isHexDark(preset) && 'text-black'
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="picker" className="space-y-2">
                            <HexColorPicker color={color} onChange={onColorChange} style={{ width: '100%' }} />
                        </TabsContent>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="relative flex-1">
                                <div className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-mono text-muted-foreground select-none">HEX</div>
                                <Input value={color} onChange={(e) => onColorChange(e.target.value)} className="pl-10 h-8 font-mono text-xs" />
                            </div>
                            {eyeDropperSupported && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={onEyeDropperColorChange}
                                    className="cursor-pointer shrink-0"
                                    title="Chọn màu màn hình"
                                >
                                    <Icon icon="mdi:eyedropper" className="size-4" />
                                </Button>
                            )}
                        </div>
                    </Tabs>
                </PopoverContent>
            </Popover>
        </div>
    )
}
