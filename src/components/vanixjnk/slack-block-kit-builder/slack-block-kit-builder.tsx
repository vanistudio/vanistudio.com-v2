"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export type SlackBlockType = "header" | "section" | "divider" | "image" | "context" | "actions"

export type SlackButtonStyle = "primary" | "danger" | "default"

export interface SlackTextObject {
    type: "plain_text" | "mrkdwn"
    text: string
    emoji?: boolean
}

export interface SlackImageElement {
    type: "image"
    image_url: string
    alt_text: string
}

export interface SlackButtonElement {
    type: "button"
    text: string
    url?: string
    style?: SlackButtonStyle
}

export interface SlackContextElement {
    type: "text" | "image"
    text?: string
    image_url?: string
    alt_text?: string
}

export interface SlackSectionAccessory {
    type: "image"
    image_url: string
    alt_text: string
}

export interface SlackHeaderBlock {
    type: "header"
    text: string
}

export interface SlackSectionBlock {
    type: "section"
    text: string
    accessory_image_url?: string
    accessory_alt_text?: string
}

export interface SlackDividerBlock {
    type: "divider"
}

export interface SlackImageBlock {
    type: "image"
    image_url: string
    alt_text: string
    title?: string
}

export interface SlackContextBlock {
    type: "context"
    elements: SlackContextElement[]
}

export interface SlackActionsBlock {
    type: "actions"
    elements: SlackButtonElement[]
}

export type SlackBlock =
    | SlackHeaderBlock
    | SlackSectionBlock
    | SlackDividerBlock
    | SlackImageBlock
    | SlackContextBlock
    | SlackActionsBlock


interface SlackBlockBuilderProps {
    blocks: SlackBlock[]
    onBlocksChange: (blocks: SlackBlock[]) => void
}

const MAX_BLOCKS = 50

const BLOCK_ICONS: Record<SlackBlock["type"], string> = {
    header: "solar:text-field-focus-line-duotone",
    section: "solar:document-text-line-duotone",
    divider: "solar:minus-line-duotone",
    image: "solar:gallery-line-duotone",
    context: "solar:tag-line-duotone",
    actions: "solar:hand-pointing-line-duotone",
}

const BLOCK_LABELS: Record<SlackBlock["type"], string> = {
    header: "Tiêu đề",
    section: "Section",
    divider: "Divider",
    image: "Hình ảnh",
    context: "Context",
    actions: "Nút hành động",
}

function makeBlock(type: SlackBlock["type"]): SlackBlock {
    if (type === "header") return { type: "header", text: "" }
    if (type === "section") return { type: "section", text: "" }
    if (type === "divider") return { type: "divider" }
    if (type === "image") return { type: "image", image_url: "", alt_text: "" }
    if (type === "context") return { type: "context", elements: [{ type: "text", text: "" }] }
    return { type: "actions", elements: [{ type: "button", text: "Button", style: "default" }] }
}

function getBlockText(val: any): string {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object" && typeof val.text === "string") return val.text;
    return "";
}

function setBlockText(original: any, newText: string, defaultType: "mrkdwn" | "plain_text" = "plain_text") {
    if (original && typeof original === "object") {
        return {
            ...original,
            text: newText
        };
    }
    return {
        type: defaultType,
        text: newText
    };
}

function BlockEditor({ block, index, totalBlocks, onChange, onRemove, onMove }: {
    block: SlackBlock
    index: number
    totalBlocks: number
    onChange: (b: SlackBlock) => void
    onRemove: () => void
    onMove: (dir: -1 | 1) => void
}) {
    const [open, setOpen] = React.useState(true)

    const set = (fields: Partial<SlackBlock>) => onChange({ ...block, ...fields } as SlackBlock)

    return (
        <div className="rounded-lg border border-border/60 bg-muted/20 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/30">
                <Icon icon={BLOCK_ICONS[block.type]} className="size-4 text-[#4A154B]" />
                <span className="text-xs font-semibold flex-1">{BLOCK_LABELS[block.type]}</span>
                <div className="flex items-center gap-0.5">
                    <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="size-6 flex items-center justify-center rounded hover:bg-accent disabled:opacity-30 transition-colors">
                        <Icon icon="solar:arrow-up-line-duotone" className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => onMove(1)} disabled={index === totalBlocks - 1} className="size-6 flex items-center justify-center rounded hover:bg-accent disabled:opacity-30 transition-colors">
                        <Icon icon="solar:arrow-down-line-duotone" className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => setOpen(v => !v)} className="size-6 flex items-center justify-center rounded hover:bg-accent transition-colors">
                        <Icon icon={open ? "solar:alt-arrow-up-line-duotone" : "solar:alt-arrow-down-line-duotone"} className="size-3.5" />
                    </button>
                    <button type="button" onClick={onRemove} className="size-6 flex items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors">
                        <Icon icon="solar:trash-bin-trash-line-duotone" className="size-3.5" />
                    </button>
                </div>
            </div>

            {open && (
                <div className="p-3 space-y-3">
                    {block.type === "header" && (
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Tiêu đề <span className="text-destructive">*</span> (max 150)</label>
                            <Input
                                value={getBlockText(block.text)}
                                onChange={e => set({ text: setBlockText(block.text, e.target.value.slice(0, 150), "plain_text") as any })}
                                placeholder="Tiêu đề lớn..."
                                className="font-semibold"
                            />
                            <span className="text-[10px] text-muted-foreground">{getBlockText(block.text).length}/150</span>
                        </div>
                    )}

                    {block.type === "section" && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Nội dung mrkdwn <span className="text-destructive">*</span> (max 3000)</label>
                                <Textarea
                                    value={getBlockText(block.text)}
                                    onChange={e => set({ text: setBlockText(block.text, e.target.value.slice(0, 3000), "mrkdwn") as any })}
                                    placeholder={"*bold*, _italic_, ~strike~\n<https://example.com|Link text>"}
                                    rows={5}
                                    className="font-mono text-sm resize-none"
                                />
                                <span className="text-[10px] text-muted-foreground">{getBlockText(block.text).length}/3000</span>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Accessory Image URL (tuỳ chọn)</label>
                                <Input
                                    value={block.accessory_image_url || ""}
                                    onChange={e => set({ accessory_image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            {block.accessory_image_url && (
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Alt text cho ảnh</label>
                                    <Input
                                        value={block.accessory_alt_text || ""}
                                        onChange={e => set({ accessory_alt_text: e.target.value })}
                                        placeholder="Mô tả ảnh"
                                    />
                                </div>
                            )}
                            {(block as any).fields && (block as any).fields.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <label className="text-xs text-muted-foreground font-semibold">Các ô thông tin (Fields)</label>
                                    {((block as any).fields as any[]).map((f, fi) => (
                                        <div key={fi} className="flex gap-2 items-center">
                                            <Input
                                                value={getBlockText(f)}
                                                onChange={e => {
                                                    const nextFields = ((block as any).fields as any[]).map((x, j) => j === fi ? setBlockText(x, e.target.value, "mrkdwn") : x);
                                                    set({ fields: nextFields } as any);
                                                }}
                                                placeholder="Nội dung field (mrkdwn)..."
                                                className="text-xs h-8"
                                            />
                                            <button type="button" onClick={() => {
                                                const nextFields = ((block as any).fields as any[]).filter((_, j) => j !== fi);
                                                set({ fields: nextFields } as any);
                                            }} className="shrink-0 size-7 flex items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors">
                                                <Icon icon="solar:close-circle-line-duotone" className="size-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {((block as any).fields as any[]).length < 10 && (
                                        <Button type="button" size="sm" variant="ghost" className="gap-1 text-xs h-7 w-full border border-dashed border-border/60"
                                            onClick={() => set({ fields: [...((block as any).fields as any[]), { type: "mrkdwn", text: "" }] } as any)}>
                                            <Icon icon="solar:add-circle-line-duotone" className="size-3.5" /> Thêm field
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {block.type === "image" && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Image URL <span className="text-destructive">*</span></label>
                                <Input value={block.image_url} onChange={e => set({ image_url: e.target.value })} placeholder="https://..." />
                            </div>
                            {block.image_url && (
                                <img src={block.image_url} alt="preview" className="max-h-32 rounded-md object-cover border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                            )}
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Alt text <span className="text-destructive">*</span></label>
                                <Input value={block.alt_text} onChange={e => set({ alt_text: e.target.value })} placeholder="Mô tả ảnh" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Tiêu đề ảnh (tuỳ chọn, max 2000)</label>
                                <Input value={getBlockText(block.title)} onChange={e => set({ title: setBlockText(block.title, e.target.value.slice(0, 2000), "plain_text") as any })} placeholder="Caption..." />
                            </div>
                        </>
                    )}

                    {block.type === "context" && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-muted-foreground">Elements (max 10)</label>
                                <div className="flex gap-1">
                                    <Button type="button" size="sm" variant="outline" className="h-6 text-[10px] px-2 gap-1"
                                        disabled={block.elements.length >= 10}
                                        onClick={() => set({ elements: [...block.elements, { type: "mrkdwn", text: "" }] } as any)}>
                                        <Icon icon="solar:add-circle-line-duotone" className="size-3" /> Text
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" className="h-6 text-[10px] px-2 gap-1"
                                        disabled={block.elements.length >= 10}
                                        onClick={() => set({ elements: [...block.elements, { type: "image", image_url: "", alt_text: "" }] } as any)}>
                                        <Icon icon="solar:add-circle-line-duotone" className="size-3" /> Image
                                    </Button>
                                </div>
                            </div>
                            {block.elements.map((el, ei) => (
                                <div key={ei} className="flex gap-2 items-start">
                                    <div className="flex-1 space-y-1">
                                        {el.type !== "image" && (
                                            <Input
                                                value={getBlockText(el)}
                                                onChange={e => {
                                                    const elements = block.elements.map((x, j) => j === ei ? setBlockText(x, e.target.value, "mrkdwn") : x) as SlackContextElement[]
                                                    set({ elements } as any)
                                                }}
                                                placeholder="Text (mrkdwn)..."
                                                className="text-sm"
                                            />
                                        )}
                                        {el.type === "image" && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    value={(el as any).image_url || ""}
                                                    onChange={e => {
                                                        const elements = block.elements.map((x, j) => j === ei ? { ...x, image_url: e.target.value } : x) as SlackContextElement[]
                                                        set({ elements } as any)
                                                    }}
                                                    placeholder="Image URL"
                                                    className="text-sm"
                                                />
                                                <Input
                                                    value={(el as any).alt_text || ""}
                                                    onChange={e => {
                                                        const elements = block.elements.map((x, j) => j === ei ? { ...x, alt_text: e.target.value } : x) as SlackContextElement[]
                                                        set({ elements } as any)
                                                    }}
                                                    placeholder="Alt text"
                                                    className="text-sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => {
                                        const elements = block.elements.filter((_, j) => j !== ei) as SlackContextElement[]
                                        set({ elements } as any)
                                    }} className="shrink-0 size-7 flex items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors mt-0.5">
                                        <Icon icon="solar:close-circle-line-duotone" className="size-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {block.type === "actions" && (
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Nút (max 5)</label>
                            {block.elements.map((el, ei) => (
                                <div key={ei} className="flex gap-2 items-center">
                                    <Input
                                        value={el.text}
                                        onChange={e => {
                                            const elements = block.elements.map((x, j) => j === ei ? { ...x, text: e.target.value.slice(0, 75) } : x)
                                            set({ elements } as any)
                                        }}
                                        placeholder="Nhãn nút"
                                        className="text-sm h-8 flex-1"
                                    />
                                    <Input
                                        value={el.url || ""}
                                        onChange={e => {
                                            const elements = block.elements.map((x, j) => j === ei ? { ...x, url: e.target.value } : x)
                                            set({ elements } as any)
                                        }}
                                        placeholder="https://..."
                                        className="text-sm h-8 flex-1"
                                    />
                                    <Select
                                        value={el.style || "default"}
                                        onValueChange={v => {
                                            const elements = block.elements.map((x, j) => j === ei ? { ...x, style: v as SlackButtonStyle } : x)
                                            set({ elements } as any)
                                        }}
                                    >
                                        <SelectTrigger className="h-8 w-28 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default</SelectItem>
                                            <SelectItem value="primary">Primary</SelectItem>
                                            <SelectItem value="danger">Danger</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <button type="button" onClick={() => {
                                        const elements = block.elements.filter((_, j) => j !== ei)
                                        set({ elements } as any)
                                    }} className="shrink-0 size-7 flex items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors">
                                        <Icon icon="solar:close-circle-line-duotone" className="size-4" />
                                    </button>
                                </div>
                            ))}
                            {block.elements.length < 5 && (
                                <Button type="button" size="sm" variant="ghost" className="gap-1 text-xs h-7 w-full border border-dashed border-border/60 hover:border-[#4A154B]/50 hover:text-[#4A154B]"
                                    onClick={() => set({ elements: [...block.elements, { type: "button", text: "Button", style: "default" }] } as any)}>
                                    <Icon icon="solar:add-circle-line-duotone" className="size-3.5" /> Thêm nút
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export function SlackBlockBuilder({ blocks, onBlocksChange }: SlackBlockBuilderProps) {
    const addBlock = (type: SlackBlock["type"]) => {
        if (blocks.length >= MAX_BLOCKS) return
        onBlocksChange([...blocks, makeBlock(type)])
    }

    const updateBlock = (index: number, block: SlackBlock) => {
        onBlocksChange(blocks.map((b, i) => i === index ? block : b))
    }

    const removeBlock = (index: number) => {
        onBlocksChange(blocks.filter((_, i) => i !== index))
    }

    const moveBlock = (index: number, dir: -1 | 1) => {
        const ni = index + dir
        if (ni < 0 || ni >= blocks.length) return
        const next = [...blocks]
        ;[next[index], next[ni]] = [next[ni], next[index]]
        onBlocksChange(next)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{blocks.length}/{MAX_BLOCKS} blocks</p>
                <div className="flex flex-wrap gap-1 justify-end">
                    {(["header", "section", "divider", "image", "context", "actions"] as SlackBlock["type"][]).map(type => (
                        <Button
                            key={type}
                            type="button"
                            size="sm"
                            variant="outline"
                            className={cn("h-7 text-xs gap-1", type === "divider" && "px-2")}
                            disabled={blocks.length >= MAX_BLOCKS}
                            onClick={() => addBlock(type)}
                        >
                            <Icon icon={BLOCK_ICONS[type]} className="size-3.5" />
                            {BLOCK_LABELS[type]}
                        </Button>
                    ))}
                </div>
            </div>

            {blocks.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                    <Icon icon="solar:layers-minimalistic-line-duotone" className="size-8 opacity-40" />
                    <p>Chưa có block nào. Thêm block bằng các nút bên trên.</p>
                </div>
            )}

            {blocks.map((block, i) => (
                <BlockEditor
                    key={i}
                    block={block}
                    index={i}
                    totalBlocks={blocks.length}
                    onChange={b => updateBlock(i, b)}
                    onRemove={() => removeBlock(i)}
                    onMove={dir => moveBlock(i, dir)}
                />
            ))}

            {blocks.length > 0 && (
                <div className="rounded-lg bg-muted/30 border border-border/40 p-3 text-xs text-muted-foreground">
                    <p>Section: dùng <code className="bg-muted px-1 rounded">*bold*</code>, <code className="bg-muted px-1 rounded">_italic_</code>, <code className="bg-muted px-1 rounded">~strike~</code>, <code className="bg-muted px-1 rounded">`code`</code>, <code className="bg-muted px-1 rounded">{'<url|text>'}</code></p>
                </div>
            )}
        </div>
    )
}