"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

export interface TelegramInlineButton {
    text: string
    url: string
}

export interface TelegramInlineRow {
    buttons: TelegramInlineButton[]
}

export interface TelegramInlineKeyboard {
    rows: TelegramInlineRow[]
}


interface TelegramRichMessageBuilderProps {
    message: string
    onMessageChange: (v: string) => void
    inlineKeyboard: TelegramInlineKeyboard
    onKeyboardChange: (v: TelegramInlineKeyboard) => void
}

const MAX_CHARS = 4096
const MAX_ROWS = 10
const MAX_BUTTONS_PER_ROW = 8

function applyFormatTag(textarea: HTMLTextAreaElement, open: string, close: string): string {
    const { selectionStart: s, selectionEnd: e, value } = textarea
    const selected = value.slice(s, e)
    if (!selected) return value
    return value.slice(0, s) + open + selected + close + value.slice(e)
}

export function TelegramRichMessageBuilder({ message, onMessageChange, inlineKeyboard, onKeyboardChange }: TelegramRichMessageBuilderProps) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const charCount = message.length
    
    const [linkPopoverOpen, setLinkPopoverOpen] = React.useState(false)
    const [linkUrl, setLinkUrl] = React.useState("")
    const [savedSelection, setSavedSelection] = React.useState<{s: number, e: number} | null>(null)

    const applyTag = (open: string, close: string) => {
        const ta = textareaRef.current
        if (!ta) return
        const newVal = applyFormatTag(ta, open, close)
        onMessageChange(newVal)
        setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.selectionStart, ta.selectionEnd) }, 0)
    }

    const handleOpenLinkPopover = (open: boolean) => {
        if (open) {
            const ta = textareaRef.current
            if (ta) setSavedSelection({ s: ta.selectionStart, e: ta.selectionEnd })
        } else {
            setLinkUrl("")
            setSavedSelection(null)
        }
        setLinkPopoverOpen(open)
    }

    const submitLink = () => {
        const ta = textareaRef.current
        if (!ta || !savedSelection) return
        const { value } = ta
        const { s, e } = savedSelection
        const selected = value.slice(s, e) || "link text"
        const finalUrl = linkUrl.trim() || "https://"
        const newVal = value.slice(0, s) + `<a href="${finalUrl}">${selected}</a>` + value.slice(e)
        onMessageChange(newVal)
        setLinkPopoverOpen(false)
        const newCursorPos = s + `<a href="${finalUrl}">`.length + selected.length + 4
        setTimeout(() => { ta.focus(); ta.setSelectionRange(newCursorPos, newCursorPos) }, 0)
    }

    const addRow = () => {
        if (inlineKeyboard.rows.length >= MAX_ROWS) return
        onKeyboardChange({ rows: [...inlineKeyboard.rows, { buttons: [{ text: "", url: "" }] }] })
    }

    const removeRow = (ri: number) => {
        const rows = inlineKeyboard.rows.filter((_, i) => i !== ri)
        onKeyboardChange({ rows })
    }

    const moveRow = (ri: number, dir: -1 | 1) => {
        const rows = [...inlineKeyboard.rows]
        const ni = ri + dir
        if (ni < 0 || ni >= rows.length) return
        ;[rows[ri], rows[ni]] = [rows[ni], rows[ri]]
        onKeyboardChange({ rows })
    }

    const addButton = (ri: number) => {
        const rows = inlineKeyboard.rows.map((row, i) => {
            if (i !== ri || row.buttons.length >= MAX_BUTTONS_PER_ROW) return row
            return { buttons: [...row.buttons, { text: "", url: "" }] }
        })
        onKeyboardChange({ rows })
    }

    const removeButton = (ri: number, bi: number) => {
        const rows = inlineKeyboard.rows.map((row, i) => {
            if (i !== ri) return row
            const buttons = row.buttons.filter((_, j) => j !== bi)
            return { buttons }
        }).filter(row => row.buttons.length > 0)
        onKeyboardChange({ rows })
    }

    const updateButton = (ri: number, bi: number, field: keyof TelegramInlineButton, value: string) => {
        const rows = inlineKeyboard.rows.map((row, i) => {
            if (i !== ri) return row
            return {
                buttons: row.buttons.map((btn, j) => j === bi ? { ...btn, [field]: value } : btn)
            }
        })
        onKeyboardChange({ rows })
    }

    const totalButtons = inlineKeyboard.rows.reduce((acc, r) => acc + r.buttons.length, 0)

    return (
        <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="content" className="gap-1.5">
                    <Icon icon="solar:document-text-line-duotone" className="size-4" />
                    Nội dung
                </TabsTrigger>
                <TabsTrigger value="keyboard" className="gap-1.5">
                    <Icon icon="solar:keyboard-line-duotone" className="size-4" />
                    Bàn phím inline
                    {totalButtons > 0 && <span className="ml-1 rounded-full bg-[#2AABEE] text-white text-[10px] px-1.5 py-0">{totalButtons}</span>}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
                <div className="flex flex-col rounded-lg border border-border/40 bg-card overflow-hidden shadow-sm">
                    <div className="flex flex-wrap gap-1 p-2 border-b border-border/40 bg-muted/10">
                        {[
                            { label: "B", open: "<b>", close: "</b>", title: "Bold", cls: "font-bold" },
                            { label: "I", open: "<i>", close: "</i>", title: "Italic", cls: "italic" },
                            { label: "U", open: "<u>", close: "</u>", title: "Underline", cls: "underline" },
                            { label: "S", open: "<s>", close: "</s>", title: "Strikethrough", cls: "line-through" },
                            { label: "</>", open: "<code>", close: "</code>", title: "Inline code", cls: "font-mono" },
                            { label: "pre", open: "<pre>", close: "</pre>", title: "Code block", cls: "font-mono" },
                        ].map(f => (
                            <button
                                key={f.open}
                                type="button"
                                title={f.title}
                                onClick={() => applyTag(f.open, f.close)}
                                className={cn("h-7 min-w-[28px] px-2 rounded text-[13px] border border-transparent bg-transparent hover:bg-[#2AABEE]/10 hover:text-[#2AABEE] transition-colors", f.cls)}
                            >{f.label}</button>
                        ))}
                        <Popover open={linkPopoverOpen} onOpenChange={handleOpenLinkPopover}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    title="Chèn link"
                                    className="h-7 px-2 rounded text-[13px] border border-transparent bg-transparent hover:bg-[#2AABEE]/10 hover:text-[#2AABEE] transition-colors flex items-center gap-1"
                                >
                                    <Icon icon="solar:link-line-duotone" className="size-3.5" /> Link
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-3" align="start">
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm leading-none">Chèn đường dẫn (Link)</h4>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="https://example.com"
                                            className="h-8 text-sm flex-1 bg-muted/20"
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault()
                                                    submitLink()
                                                }
                                            }}
                                            autoFocus
                                        />
                                        <Button size="sm" className="h-8 bg-[#2AABEE] hover:bg-[#229ED9]" onClick={submitLink}>Chèn</Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="relative">
                        <Textarea
                            ref={textareaRef}
                            value={message}
                            onChange={e => {
                                if (e.target.value.length <= MAX_CHARS) onMessageChange(e.target.value)
                            }}
                            placeholder={"Soạn nội dung Telegram...\n\nVí dụ: <b>Khuyến mãi</b> giảm <i>50%</i>"}
                            rows={12}
                            className="font-mono text-[13px] leading-relaxed resize-none border-0 focus-visible:ring-0 rounded-none shadow-none bg-transparent p-3"
                        />
                        <span className={cn("absolute bottom-2 right-3 text-[10px]", charCount > MAX_CHARS * 0.9 ? "text-amber-500" : "text-muted-foreground")}>
                            {charCount}/{MAX_CHARS}
                        </span>
                    </div>
                </div>

                <div className="rounded-lg bg-muted/10 border p-3 pt-2 text-[12px] text-muted-foreground space-y-2 shadow-sm">
                    <p className="font-medium text-[#2AABEE] flex items-center gap-1.5"><Icon icon="solar:info-circle-line-duotone" className="size-4" /> HTML Tags hỗ trợ:</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1.5">
                        <span className="flex items-center gap-1"><code className="bg-transparent text-foreground border border-border/50 font-semibold font-mono px-1 rounded">&lt;b&gt;</code> In đậm</span>
                        <span className="flex items-center gap-1"><code className="bg-transparent text-foreground border border-border/50 font-semibold font-mono px-1 rounded">&lt;i&gt;</code> In nghiêng</span>
                        <span className="flex items-center gap-1"><code className="bg-transparent text-foreground border border-border/50 font-semibold font-mono px-1 rounded">&lt;u&gt;</code> Gạch dưới</span>
                        <span className="flex items-center gap-1"><code className="bg-transparent text-foreground border border-border/50 font-semibold font-mono px-1 rounded">&lt;s&gt;</code> Gạch ngang</span>
                        <span className="flex items-center gap-1"><code className="bg-transparent text-foreground border border-border/50 font-semibold font-mono px-1 rounded">&lt;code&gt;</code> Inline code</span>
                        <span className="flex items-center gap-1"><code className="bg-transparent text-foreground border border-border/50 font-semibold font-mono px-1 rounded">&lt;pre&gt;</code> Code block</span>
                        <span className="flex items-center gap-1 col-span-2"><code className="bg-transparent text-foreground border border-border/50 font-semibold font-mono px-1 rounded">&lt;a href=""&gt;...&lt;/a&gt;</code> Hyperlink</span>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="keyboard" className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10 shadow-sm">
                    <p className="text-[13px] text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:gap-1">
                        <span>Thiết lập bàn phím: </span>
                        <span className="font-semibold text-foreground">{inlineKeyboard.rows.length}/{MAX_ROWS} hàng</span>
                        <span className="hidden sm:inline"> · </span>
                        <span>Tối đa <strong className="text-foreground">{MAX_BUTTONS_PER_ROW}</strong> nút/hàng</span>
                    </p>
                    <Button type="button" size="sm" variant="outline" onClick={addRow} disabled={inlineKeyboard.rows.length >= MAX_ROWS} className="gap-1.5">
                        <Icon icon="solar:add-square-line-duotone" className="size-4" />
                        Thêm hàng
                    </Button>
                </div>

                {inlineKeyboard.rows.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-10 text-[#2AABEE] text-sm border-2 border-dashed border-[#2AABEE]/20 bg-[#2AABEE]/5 rounded-lg shadow-sm">
                        <Icon icon="solar:keyboard-line-duotone" className="size-8 opacity-60" />
                        <p className="font-medium opacity-80">Chưa có hàng nào. Bấm "Thêm hàng" để bắt đầu.</p>
                    </div>
                )}

                {inlineKeyboard.rows.map((row, ri) => (
                    <div key={ri} className="rounded-lg border border-border/60 bg-card p-3 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2 p-1.5 rounded-md bg-muted/30">
                            <span className="text-[12px] font-semibold text-muted-foreground px-2">HÀNG {ri + 1}</span>
                            <div className="flex items-center gap-1">
                                <button type="button" onClick={() => moveRow(ri, -1)} disabled={ri === 0} className="size-6 flex items-center justify-center rounded hover:bg-muted disabled:opacity-30 transition-colors border-transparent bg-transparent">
                                    <Icon icon="solar:arrow-up-line-duotone" className="size-3.5" />
                                </button>
                                <button type="button" onClick={() => moveRow(ri, 1)} disabled={ri === inlineKeyboard.rows.length - 1} className="size-6 flex items-center justify-center rounded hover:bg-muted disabled:opacity-30 transition-colors border-transparent bg-transparent">
                                    <Icon icon="solar:arrow-down-line-duotone" className="size-3.5" />
                                </button>
                                <button type="button" onClick={() => removeRow(ri)} className="size-6 flex items-center justify-center rounded text-red-400 hover:bg-red-400/10 hover:text-red-500 transition-colors border-transparent bg-transparent">
                                    <Icon icon="solar:trash-bin-trash-line-duotone" className="size-3.5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {row.buttons.map((btn, bi) => (
                                <div key={bi} className="flex gap-2 items-center">
                                    <div className="grid grid-cols-2 gap-2 flex-1 relative">
                                        <div className="relative">
                                            <Icon icon="solar:text-field-line-duotone" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
                                            <Input
                                                value={btn.text}
                                                onChange={e => updateButton(ri, bi, "text", e.target.value)}
                                                placeholder="Tên hiển thị..."
                                                className="h-8 text-[13px] pl-8 bg-transparent shadow-sm border-border/60 focus-visible:border-[#2AABEE]"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Icon icon="solar:global-line-duotone" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
                                            <Input
                                                value={btn.url}
                                                onChange={e => updateButton(ri, bi, "url", e.target.value)}
                                                placeholder="https://..."
                                                className="h-8 text-[13px] pl-8 bg-transparent shadow-sm border-border/60 focus-visible:border-[#2AABEE]"
                                            />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeButton(ri, bi)} className="shrink-0 size-8 flex items-center justify-center rounded-lg border border-transparent hover:border-red-400/30 hover:bg-red-400/10 text-red-500 transition-colors bg-transparent">
                                        <Icon icon="solar:close-circle-line-duotone" className="size-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {row.buttons.length < MAX_BUTTONS_PER_ROW && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => addButton(ri)} className="gap-1.5 text-xs h-8 w-full border border-dashed border-border/40 text-muted-foreground hover:bg-[#2AABEE]/5 hover:text-[#2AABEE] hover:border-[#2AABEE]/30 bg-transparent">
                                <Icon icon="solar:add-circle-line-duotone" className="size-3.5" />
                                Thêm nút vào hàng này
                            </Button>
                        )}
                    </div>
                ))}
            </TabsContent>
        </Tabs>
    )
}