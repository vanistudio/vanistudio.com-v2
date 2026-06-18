"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from "@/components/vanixjnk/color-picker"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

export interface DiscordEmbedAuthor {
    name?: string
    url?: string
    icon_url?: string
}

export interface DiscordEmbedFooter {
    text?: string
    icon_url?: string
}

export interface DiscordEmbedField {
    name?: string
    value?: string
    inline?: boolean
}

export interface DiscordEmbedImage {
    url: string
}

export interface DiscordEmbed {
    author?: DiscordEmbedAuthor
    title?: string
    url?: string
    description?: string
    color?: number
    colorHex?: string
    fields?: DiscordEmbedField[]
    image?: DiscordEmbedImage
    thumbnail?: DiscordEmbedImage
    footer?: DiscordEmbedFooter
    timestamp?: string
}
export interface DiscordMessage {
    content: string
    embeds: DiscordEmbed[]
    username?: string
    avatarUrl?: string
}

function hexToDecimal(hex: string): number {
    const clean = hex.replace("#", "")
    const n = parseInt(clean.padEnd(6, "0"), 16)
    return isNaN(n) ? 0 : n
}
function decimalToHex(dec?: number): string {
    if (dec === undefined || dec === null || isNaN(dec)) return "#5865F2"
    return "#" + Math.max(0, Math.min(16777215, dec)).toString(16).padStart(6, "0").toUpperCase()
}

function CharCount({ value, max, className = "" }: { value: string | undefined; max: number; className?: string }) {
    const len = value?.length ?? 0
    const over = len > max
    return (
        <span className={`text-[11px] tabular-nums ${over ? "text-destructive font-semibold" : "text-muted-foreground"} ${className}`}>
            {len}/{max}
        </span>
    )
}
export function makeEmptyEmbed(): DiscordEmbed {
    return {
        colorHex: "#5865F2",
        color: 0x5865F2,
        author: { name: "", url: "", icon_url: "" },
        title: "",
        url: "",
        description: "",
        fields: [],
        image: { url: "" },
        thumbnail: { url: "" },
        footer: { text: "", icon_url: "" },
        timestamp: undefined,
    }
}
function Section({
    title, icon, badge, children, defaultOpen = true
}: {
    title: string; icon: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean
}) {
    const [open, setOpen] = React.useState(defaultOpen)
    return (
        <div className="rounded-lg border border-border/60 overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-medium"
            >
                <Icon icon={icon} className="size-4 text-muted-foreground flex-shrink-0" />
                <span className="leading-none">{title}</span>
                {badge && <span className="ml-1 text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{badge}</span>}
                <Icon icon={open ? "solar:alt-arrow-up-line-duotone" : "solar:alt-arrow-down-line-duotone"} className="size-4 ml-auto text-muted-foreground shrink-0" />
            </button>
            {open && <div className="p-4 space-y-3">{children}</div>}
        </div>
    )
}
function FieldRow({
    field, idx, total,
    onUpdate, onRemove, onMove
}: {
    field: DiscordEmbedField; idx: number; total: number;
    onUpdate: (p: Partial<DiscordEmbedField>) => void;
    onRemove: () => void;
    onMove: (dir: -1 | 1) => void;
}) {
    return (
        <div className="rounded-md border border-border/60 p-3 space-y-2 bg-muted/10 group">
            <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Field {idx + 1}</span>
                <div className="flex items-center gap-0.5 ml-auto opacity-60 group-hover:opacity-100 transition-opacity">
                    <button type="button" disabled={idx === 0} onClick={() => onMove(-1)}
                        className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed" title="Move up">
                        <Icon icon="solar:alt-arrow-up-line-duotone" className="size-3.5" />
                    </button>
                    <button type="button" disabled={idx === total - 1} onClick={() => onMove(1)}
                        className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed" title="Move down">
                        <Icon icon="solar:alt-arrow-down-line-duotone" className="size-3.5" />
                    </button>
                    <button type="button" onClick={onRemove}
                        className="p-1 rounded hover:bg-destructive/10 text-destructive" title="Remove field">
                        <Icon icon="solar:close-circle-line-duotone" className="size-3.5" />
                    </button>
                </div>
            </div>
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <Label className="text-xs">Name</Label>
                    <CharCount value={field.name} max={256} />
                </div>
                <Input
                    value={field.name ?? ""}
                    maxLength={256}
                    placeholder="Field name"
                    onChange={e => onUpdate({ name: e.target.value })}
                    className="h-7 text-sm"
                />
            </div>
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <Label className="text-xs">Value</Label>
                    <CharCount value={field.value} max={1024} />
                </div>
                <Textarea
                    value={field.value ?? ""}
                    maxLength={1024}
                    placeholder={"Field value...\n\nSupports **bold**, *italic*, `code`, [links](url)"}
                    rows={2}
                    onChange={e => onUpdate({ value: e.target.value })}
                    className="text-sm resize-none"
                />
            </div>
            <div className="flex items-center gap-2">
                <Switch id={`field-inline-${idx}`} checked={!!field.inline} onCheckedChange={v => onUpdate({ inline: v })} />
                <Label htmlFor={`field-inline-${idx}`} className="text-xs cursor-pointer select-none">
                    Inline <span className="text-muted-foreground">(display side by side)</span>
                </Label>
            </div>
        </div>
    )
}
interface EmbedEditorProps {
    embed: DiscordEmbed
    onChange: (updated: DiscordEmbed) => void
    onRemove: () => void
    onDuplicate: () => void
    onMoveLeft: () => void
    onMoveRight: () => void
    isFirst: boolean
    isLast: boolean
}

function EmbedEditor({ embed, onChange, onRemove, onDuplicate, onMoveLeft, onMoveRight, isFirst, isLast }: EmbedEditorProps) {
    function up(patch: Partial<DiscordEmbed>) { onChange({ ...embed, ...patch }) }

    function upAuthor(patch: Partial<DiscordEmbedAuthor>) {
        const current: DiscordEmbedAuthor = {
            name: embed.author?.name ?? "",
            url: embed.author?.url ?? "",
            icon_url: embed.author?.icon_url ?? "",
        }
        onChange({ ...embed, author: { ...current, ...patch } })
    }

    function upFooter(patch: Partial<DiscordEmbedFooter>) {
        const current: DiscordEmbedFooter = {
            text: embed.footer?.text ?? "",
            icon_url: embed.footer?.icon_url ?? "",
        }
        onChange({ ...embed, footer: { ...current, ...patch } })
    }

    function addField() {
        if ((embed.fields?.length ?? 0) >= 25) return
        up({ fields: [...(embed.fields ?? []), { name: "", value: "", inline: false }] })
    }
    function updateField(idx: number, patch: Partial<DiscordEmbedField>) {
        const fields = [...(embed.fields ?? [])]
        fields[idx] = { ...fields[idx], ...patch }
        up({ fields })
    }
    function removeField(idx: number) {
        const fields = [...(embed.fields ?? [])]
        fields.splice(idx, 1)
        up({ fields })
    }
    function moveField(idx: number, dir: -1 | 1) {
        const fields = [...(embed.fields ?? [])]
        const to = idx + dir
        if (to < 0 || to >= fields.length) return;
        [fields[idx], fields[to]] = [fields[to], fields[idx]]
        up({ fields })
    }
    const colorHex = embed.colorHex ?? decimalToHex(embed.color)
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex-1 min-w-[180px]">
                    <ColorPicker
                        value={colorHex}
                        onChange={(hex: string) => {
                            const valid = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : colorHex
                            up({ colorHex: hex, color: hexToDecimal(valid) })
                        }}
                        className="size-8"
                    />
                </div>

                <div className="flex items-center gap-1 ml-auto">
                    <button type="button" disabled={isFirst} onClick={onMoveLeft}
                        className="p-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed" title="Move embed left">
                        <Icon icon="solar:arrow-left-line-duotone" className="size-3.5" />
                    </button>
                    <button type="button" disabled={isLast} onClick={onMoveRight}
                        className="p-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed" title="Move embed right">
                        <Icon icon="solar:arrow-right-line-duotone" className="size-3.5" />
                    </button>
                    <button type="button" onClick={onDuplicate}
                        className="p-1.5 rounded hover:bg-muted" title="Duplicate embed">
                        <Icon icon="solar:copy-line-duotone" className="size-3.5" />
                    </button>
                    <button type="button" onClick={onRemove}
                        className="p-1.5 rounded hover:bg-destructive/10 text-destructive" title="Delete embed">
                        <Icon icon="solar:trash-bin-2-line-duotone" className="size-3.5" />
                    </button>
                </div>
            </div>
            <Section title="Author" icon="solar:user-id-line-duotone">
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs">Author Name</Label>
                        <CharCount value={embed.author?.name} max={256} />
                    </div>
                    <Input
                        value={embed.author?.name ?? ""}
                        maxLength={256}
                        placeholder="Author name"
                        onChange={e => upAuthor({ name: e.target.value })}
                        className="h-8 text-sm"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label className="text-xs">Author URL</Label>
                        <Input
                            value={embed.author?.url ?? ""}
                            placeholder="https://..."
                            onChange={e => upAuthor({ url: e.target.value })}
                            className="h-8 text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Author Icon URL</Label>
                        <Input
                            value={embed.author?.icon_url ?? ""}
                            placeholder="https://..."
                            onChange={e => upAuthor({ icon_url: e.target.value })}
                            className="h-8 text-sm"
                        />
                    </div>
                </div>
            </Section>
            <Section title="Body" icon="solar:text-field-line-duotone">
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs">Title</Label>
                        <CharCount value={embed.title} max={256} />
                    </div>
                    <Input
                        value={embed.title ?? ""}
                        maxLength={256}
                        placeholder="Embed title"
                        onChange={e => up({ title: e.target.value })}
                        className="h-8 text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Title URL <span className="text-muted-foreground">(makes title a hyperlink)</span></Label>
                    <Input
                        value={embed.url ?? ""}
                        placeholder="https://..."
                        onChange={e => up({ url: e.target.value })}
                        className="h-8 text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs">Description</Label>
                        <CharCount value={embed.description} max={2048} />
                    </div>
                    <Textarea
                        value={embed.description ?? ""}
                        maxLength={2048}
                        placeholder={"Embed description...\n\nSupports Discord Markdown:\n**bold**, *italic*, ~~strike~~, `code`, ```code block```, [text](url)\n> blockquote\n- list item"}
                        rows={6}
                        onChange={e => up({ description: e.target.value })}
                        className="text-sm resize-none font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground">
                        Markdown: <code className="bg-muted px-1 rounded text-[10px]">**bold**</code>{" "}
                        <code className="bg-muted px-1 rounded text-[10px]">*italic*</code>{" "}
                        <code className="bg-muted px-1 rounded text-[10px]">~~strike~~</code>{" "}
                        <code className="bg-muted px-1 rounded text-[10px]">`code`</code>{" "}
                        <code className="bg-muted px-1 rounded text-[10px]">[text](url)</code>{" "}
                        <code className="bg-muted px-1 rounded text-[10px]">&gt; quote</code>
                    </p>
                </div>
            </Section>
            <Section
                title="Fields"
                icon="solar:document-text-line-duotone"
                badge={`${embed.fields?.length ?? 0}/25`}
            >
                <div className="space-y-2">
                    {(embed.fields ?? []).map((field, idx) => (
                        <FieldRow
                            key={idx}
                            field={field}
                            idx={idx}
                            total={embed.fields?.length ?? 0}
                            onUpdate={p => updateField(idx, p)}
                            onRemove={() => removeField(idx)}
                            onMove={dir => moveField(idx, dir)}
                        />
                    ))}
                    {(embed.fields?.length ?? 0) < 25 ? (
                        <Button type="button" variant="outline" size="sm" className="w-full gap-2 h-8 border-dashed" onClick={addField}>
                            <Icon icon="solar:add-circle-line-duotone" className="size-3.5" />
                            Add field
                        </Button>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">Maximum 25 fields reached.</p>
                    )}
                    {(embed.fields?.length ?? 0) > 0 && (
                        <p className="text-[11px] text-muted-foreground italic">
                            Tip: Up to 3 inline fields will appear side by side. Non-inline fields span the full width.
                        </p>
                    )}
                </div>
            </Section>
            <Section title="Images" icon="solar:gallery-minimalistic-line-duotone" defaultOpen={false}>
                <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs">
                            Image URL
                            <span className="text-muted-foreground ml-1">(large image below description)</span>
                        </Label>
                        <Input
                            value={embed.image?.url ?? ""}
                            placeholder="https://..."
                            onChange={e => up({ image: { url: e.target.value } })}
                            className="h-8 text-sm"
                        />
                        {embed.image?.url && (
                            <img
                                src={embed.image.url}
                                alt="preview"
                                className="mt-1 max-h-24 rounded border border-border/40 object-cover"
                                onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                            />
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">
                            Thumbnail URL
                            <span className="text-muted-foreground ml-1">(small image top-right)</span>
                        </Label>
                        <Input
                            value={embed.thumbnail?.url ?? ""}
                            placeholder="https://..."
                            onChange={e => up({ thumbnail: { url: e.target.value } })}
                            className="h-8 text-sm"
                        />
                        {embed.thumbnail?.url && (
                            <img
                                src={embed.thumbnail.url}
                                alt="preview"
                                className="mt-1 w-12 h-12 rounded border border-border/40 object-cover"
                                onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                            />
                        )}
                    </div>
                </div>
            </Section>
            <Section title="Footer" icon="solar:clock-circle-line-duotone" defaultOpen={false}>
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs">Footer Text</Label>
                        <CharCount value={embed.footer?.text} max={2048} />
                    </div>
                    <Input
                        value={embed.footer?.text ?? ""}
                        maxLength={2048}
                        placeholder="Footer text..."
                        onChange={e => upFooter({ text: e.target.value })}
                        className="h-8 text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Footer Icon URL</Label>
                    <Input
                        value={embed.footer?.icon_url ?? ""}
                        placeholder="https://..."
                        onChange={e => upFooter({ icon_url: e.target.value })}
                        className="h-8 text-sm"
                    />
                </div>
                <div className="pt-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="embed-ts"
                            checked={!!embed.timestamp}
                            onCheckedChange={v => up({ timestamp: v ? new Date().toISOString() : undefined })}
                        />
                        <Label htmlFor="embed-ts" className="text-xs cursor-pointer select-none">
                            Show timestamp
                        </Label>
                    </div>
                    {embed.timestamp && (
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Custom date/time (default: now)</Label>
                            <Input
                                type="datetime-local"
                                className="h-8 text-sm"
                                value={embed.timestamp.slice(0, 16)}
                                onChange={e => up({ timestamp: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString() })}
                            />
                        </div>
                    )}
                </div>
            </Section>
        </div>
    )
}
export interface DiscordEmbedBuilderProps {
    content: string
    onContentChange: (v: string) => void
    embeds: DiscordEmbed[]
    onEmbedsChange: (embeds: DiscordEmbed[]) => void
}

export function DiscordEmbedBuilder({ content, onContentChange, embeds, onEmbedsChange }: DiscordEmbedBuilderProps) {
    const [activeTab, setActiveTab] = React.useState<"content" | number>("content")

    function addEmbed() {
        if (embeds.length >= 10) return
        const next = [...embeds, makeEmptyEmbed()]
        onEmbedsChange(next)
        setActiveTab(next.length - 1)
    }

    function removeEmbed(idx: number) {
        const next = embeds.filter((_, i) => i !== idx)
        onEmbedsChange(next)
        if (next.length === 0) setActiveTab("content")
        else setActiveTab(Math.min(idx, next.length - 1))
    }

    function duplicateEmbed(idx: number) {
        if (embeds.length >= 10) return
        const clone = JSON.parse(JSON.stringify(embeds[idx])) as DiscordEmbed
        const next = [...embeds.slice(0, idx + 1), clone, ...embeds.slice(idx + 1)]
        onEmbedsChange(next)
        setActiveTab(idx + 1)
    }

    function moveEmbed(idx: number, dir: -1 | 1) {
        const to = idx + dir
        if (to < 0 || to >= embeds.length) return
        const next = [...embeds];
        [next[idx], next[to]] = [next[to], next[idx]]
        onEmbedsChange(next)
        setActiveTab(to)
    }

    function updateEmbed(idx: number, updated: DiscordEmbed) {
        onEmbedsChange(embeds.map((e, i) => i === idx ? updated : e))
    }
    const totalChars = embeds.reduce((sum, e) => {
        return sum +
            (e.author?.name?.length ?? 0) +
            (e.title?.length ?? 0) +
            (e.description?.length ?? 0) +
            (e.footer?.text?.length ?? 0) +
            (e.fields ?? []).reduce((fs, f) => fs + (f.name?.length ?? 0) + (f.value?.length ?? 0), 0)
    }, 0)
    const charLimitOk = totalChars <= 6000

    const applyTag = (open: string, close: string) => {
        const ta = document.getElementById("dc-content") as HTMLTextAreaElement
        if (!ta) return
        const { selectionStart: s, selectionEnd: e, value } = ta
        const selected = value.slice(s, e)
        if (!selected) return
        const newVal = value.slice(0, s) + open + selected + close + value.slice(e)
        onContentChange(newVal)
        setTimeout(() => { ta.focus(); ta.setSelectionRange(s + open.length, e + open.length) }, 0)
    }

    return (
        <Tabs value={activeTab.toString()} onValueChange={v => setActiveTab(v === "content" ? "content" : Number(v))} className="w-full">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <TabsList className="flex flex-wrap justify-start h-auto">
                    <TabsTrigger value="content" className="gap-1.5">
                        <Icon icon="solar:document-text-line-duotone" className="size-4" />
                        Nội dung
                    </TabsTrigger>
                    {embeds.map((e, idx) => (
                        <TabsTrigger value={idx.toString()} key={idx} className="gap-1.5">
                            <div
                                className="size-2.5 rounded-sm shrink-0 shadow-sm"
                                style={{ background: e.colorHex ?? "#5865F2" }}
                            />
                            Embed {idx + 1}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <div className="flex items-center gap-2">
                    {embeds.length < 10 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addEmbed}
                            className="h-9 gap-1.5 border-dashed border-[#5865F2]/40 text-[#5865F2] hover:bg-[#5865F2]/10"
                        >
                            <Icon icon="solar:add-circle-line-duotone" className="size-4" />
                            Thêm Embed
                        </Button>
                    )}
                </div>
            </div>

            {embeds.length > 0 && (
                <div className={cn("flex items-center gap-2 text-[12px] mb-3 p-2.5 rounded-lg border shadow-sm", charLimitOk ? "bg-muted/10 border-border/40 text-muted-foreground" : "bg-destructive/10 border-destructive/20 text-destructive font-medium")}>
                    <Icon icon={charLimitOk ? "solar:check-circle-line-duotone" : "solar:danger-triangle-line-duotone"} className="size-4" />
                    <span>Tổng kí tự các Embed: <strong>{totalChars}/6000</strong></span>
                    {!charLimitOk && " (Vượt quá giới hạn của Discord!)"}
                </div>
            )}

            <TabsContent value="content" className="space-y-4">
                <div className="flex flex-col rounded-lg border border-border/40 bg-card overflow-hidden shadow-sm">
                    <div className="flex flex-wrap gap-1 p-2 border-b border-border/40 bg-muted/10">
                        {[
                            { label: "B", open: "**", close: "**", title: "Bold", cls: "font-bold" },
                            { label: "I", open: "*", close: "*", title: "Italic", cls: "italic" },
                            { label: "S", open: "~~", close: "~~", title: "Strikethrough", cls: "line-through" },
                            { label: "</>", open: "`", close: "`", title: "Inline code", cls: "font-mono" },
                            { label: "pre", open: "```\n", close: "\n```", title: "Code block", cls: "font-mono" },
                        ].map(f => (
                            <button
                                key={f.open}
                                type="button"
                                title={f.title}
                                onClick={() => applyTag(f.open, f.close)}
                                className={cn("h-7 min-w-[28px] px-2 rounded text-[13px] border border-transparent bg-transparent hover:bg-[#5865F2]/10 hover:text-[#5865F2] transition-colors", f.cls)}
                            >{f.label}</button>
                        ))}
                    </div>

                    <div className="relative">
                        <Textarea
                            id="dc-content"
                            value={content}
                            onChange={e => {
                                if (e.target.value.length <= 2000) onContentChange(e.target.value)
                            }}
                            placeholder={"Soạn nội dung Discord...\n\nVí dụ: Dùng **Markdown** cho chữ đặc biệt \nHoặc Mentions: @everyone, @here, <@userId>, <#channelId>, <@&roleId>"}
                            rows={8}
                            className="font-mono text-[13px] leading-relaxed resize-none border-0 focus-visible:ring-0 rounded-none shadow-none bg-transparent p-3"
                        />
                        <span className={cn("absolute bottom-2 right-3 text-[10px]", content.length > 2000 * 0.9 ? "text-amber-500" : "text-muted-foreground")}>
                            {content.length}/2000
                        </span>
                    </div>
                </div>

                {embeds.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-10 text-[#5865F2] text-sm border-2 border-dashed border-[#5865F2]/20 bg-[#5865F2]/5 rounded-lg shadow-sm">
                        <Icon icon="solar:layers-minimalistic-line-duotone" className="size-8 opacity-60" />
                        <p className="font-medium opacity-80">Chưa có Embed nào. Bấm "Thêm Embed" để tạo Rich Text nổi bật.</p>
                        <Button type="button" variant="outline" size="sm" className="gap-2 mx-auto mt-2 bg-background border-[#5865F2]/30 text-[#5865F2] hover:bg-[#5865F2]/10" onClick={addEmbed}>
                            <Icon icon="solar:add-circle-line-duotone" className="size-4" />
                            Thêm Embed
                        </Button>
                    </div>
                )}
            </TabsContent>

            {embeds.map((e, idx) => (
                <TabsContent value={idx.toString()} key={idx}>
                    <EmbedEditor
                        embed={e}
                        onChange={updated => updateEmbed(idx, updated)}
                        onRemove={() => removeEmbed(idx)}
                        onDuplicate={() => duplicateEmbed(idx)}
                        onMoveLeft={() => moveEmbed(idx, -1)}
                        onMoveRight={() => moveEmbed(idx, 1)}
                        isFirst={idx === 0}
                        isLast={idx === embeds.length - 1}
                    />
                </TabsContent>
            ))}
        </Tabs>
    )
}