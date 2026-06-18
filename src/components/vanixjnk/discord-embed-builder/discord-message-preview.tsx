"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import type { DiscordEmbed } from "./discord-embed-builder"
import { trpc } from "@/lib/trpc"
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";
import { useSetting } from "@/contexts/SettingContext";

interface DiscordMessagePreviewProps {
    message?: string
    username?: string
    avatarUrl?: string
    embeds?: DiscordEmbed[]
}



const DARK = {
    bg:           "#313338",
    header:       "#313338",
    headerBorder: "#1e1f22",
    divider:      "#3f4147",
    dividerText:  "#80848e",
    username:     "#ffffff",
    timestamp:    "#80848e",
    msgText:      "#dbdee1",
    embedBg:      "#2b2d31",
    embedBorder:  "rgba(255,255,255,0.06)",
    embedTitle:   "#ffffff",
    embedDesc:    "#dbdee1",
    embedField:   { name: "#ffffff", value: "#dbdee1" },
    embedAuthor:  "#ffffff",
    embedFooter:  "#a3a6aa",
    embedLink:    "#00a8fc",
    codeInline:   { bg: "#111214", text: "#b5bac1", border: "#2b2d31" },
    inputBg:      "#383a40",
    inputText:    "#6d6f78",
    link:         "#00a8fc",
}

const LIGHT = {
    bg:           "#ffffff",
    header:       "#ffffff",
    headerBorder: "#e3e5e8",
    divider:      "#e3e5e8",
    dividerText:  "#747f8d",
    username:     "#060607",
    timestamp:    "#747f8d",
    msgText:      "#2e3338",
    embedBg:      "#f2f3f5",
    embedBorder:  "rgba(0,0,0,0.08)",
    embedTitle:   "#060607",
    embedDesc:    "#2e3338",
    embedField:   { name: "#060607", value: "#2e3338" },
    embedAuthor:  "#060607",
    embedFooter:  "#5c5e66",
    embedLink:    "#0067e0",
    codeInline:   { bg: "#f2f3f5", text: "#2e3338", border: "#d4d7dc" },
    inputBg:      "#ebedef",
    inputText:    "#abadb0",
    link:         "#0067e0",
}

function renderMarkdown(text: string, tokens: typeof DARK): React.ReactNode[] {
    const codeBlockParts = text.split(/(```[\s\S]*?```)/g)
    const result: React.ReactNode[] = []
    codeBlockParts.forEach((segment, si) => {
        if (segment.startsWith("```") && segment.endsWith("```")) {
            const code = segment.slice(3, -3).replace(/^\n/, "")
            result.push(
                <div key={`cb-${si}`} style={{ background: tokens.codeInline.bg, border: `1px solid ${tokens.codeInline.border}`, borderRadius: "4px", padding: "8px 12px", fontFamily: "Consolas, monospace", fontSize: "13px", color: tokens.codeInline.text, margin: "4px 0", whiteSpace: "pre-wrap", overflowX: "auto" }}>
                    {code}
                </div>
            )
            return
        }
        segment.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[([^\]]+)\]\(([^)]+)\)|\n)/g).forEach((p, i) => {
            if (!p) return
            const key = `${si}-${i}`
            if (p === "\n") { result.push(<br key={key} />); return }
            if (p.startsWith("**") && p.endsWith("**")) { result.push(<strong key={key}>{p.slice(2, -2)}</strong>); return }
            if (p.startsWith("*") && p.endsWith("*") && p.length > 2) { result.push(<em key={key}>{p.slice(1, -1)}</em>); return }
            if (p.startsWith("`") && p.endsWith("`")) {
                result.push(<code key={key} style={{ background: tokens.codeInline.bg, color: tokens.codeInline.text, fontFamily: "monospace", fontSize: "85%", padding: "0.2em 0.4em", borderRadius: "3px", border: `1px solid ${tokens.codeInline.border}` }}>{p.slice(1, -1)}</code>)
                return
            }
            const lm = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
            if (lm) { result.push(<a key={key} href={lm[2]} style={{ color: tokens.link, textDecoration: "none" }} target="_blank" rel="noopener noreferrer">{lm[1]}</a>); return }
            result.push(<React.Fragment key={key}>{p}</React.Fragment>)
        })
    })
    return result
}

function formatTimestamp(iso: string, siteTimezone: string): string {
    try {
        return formatWithSiteTimezone(new Date(iso), siteTimezone, "DD/MM/YYYY HH:mm:ss")
    } catch { return "" }
}
function DiscordEmbedRender({ embed, t, siteTimezone }: { embed: DiscordEmbed; t: typeof DARK; siteTimezone: string }) {
    const barColor = embed.colorHex ?? (embed.color !== undefined ? "#" + embed.color.toString(16).padStart(6, "0") : "#5865F2")
    const hasAuthor = embed.author?.name
    const hasTitle = embed.title
    const hasDesc = embed.description
    const hasImage = embed.image?.url
    const hasThumbnail = embed.thumbnail?.url
    const hasFooter = embed.footer?.text || embed.timestamp
    const hasFields = (embed.fields?.length ?? 0) > 0
    const hasContent = hasAuthor || hasTitle || hasDesc || hasImage || hasFields || hasFooter

    if (!hasContent) return null

    return (
        <div style={{ display: "flex", marginBottom: "4px" }}>
            <div style={{ width: "4px", borderRadius: "4px 0 0 4px", background: barColor, flexShrink: 0 }} />
            <div style={{ background: t.embedBg, borderRadius: "0 4px 4px 0", borderTop: `1px solid ${t.embedBorder}`, borderRight: `1px solid ${t.embedBorder}`, borderBottom: `1px solid ${t.embedBorder}`, borderLeft: "none", padding: "12px 16px 12px 12px", flex: 1, minWidth: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: hasThumbnail ? "1fr auto" : "1fr", gap: "0 16px", alignItems: "start" }}>
                    <div style={{ minWidth: 0 }}>
                        {hasAuthor && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                {embed.author?.icon_url && (
                                    <img src={embed.author.icon_url} alt="" style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                                )}
                                <span style={{ color: t.embedAuthor, fontSize: "13px", fontWeight: 600, lineHeight: 1 }}>
                                    {embed.author?.url
                                        ? <a href={embed.author.url} style={{ color: t.embedAuthor, textDecoration: "none" }} target="_blank" rel="noopener noreferrer">{embed.author.name}</a>
                                        : embed.author?.name
                                    }
                                </span>
                            </div>
                        )}
                        {hasTitle && (
                            <div style={{ marginBottom: "6px" }}>
                                {embed.url
                                    ? <a href={embed.url} style={{ color: t.embedLink, fontSize: "16px", fontWeight: 600, textDecoration: "none", lineHeight: 1.375 }} target="_blank" rel="noopener noreferrer">{embed.title}</a>
                                    : <div style={{ color: t.embedTitle, fontSize: "16px", fontWeight: 600, lineHeight: 1.375 }}>{embed.title}</div>
                                }
                            </div>
                        )}
                        {hasDesc && (
                            <div style={{ color: t.embedDesc, fontSize: "14px", lineHeight: 1.5, wordBreak: "break-word", marginBottom: hasFields || hasImage || hasFooter ? "12px" : 0 }}>
                                {renderMarkdown(embed.description!, t)}
                            </div>
                        )}
                    </div>
                    {hasThumbnail && (
                        <img
                            src={embed.thumbnail!.url}
                            alt=""
                            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px", marginTop: "2px" }}
                            onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                    )}
                </div>
                {hasFields && (() => {
                    const fields = embed.fields!
                    const rows: { fields: typeof fields; inline: boolean }[] = []
                    let i = 0
                    while (i < fields.length) {
                        if (fields[i].inline) {
                            const group: typeof fields = []
                            while (i < fields.length && fields[i].inline && group.length < 3) {
                                group.push(fields[i++])
                            }
                            rows.push({ fields: group, inline: true })
                        } else {
                            rows.push({ fields: [fields[i]], inline: false })
                            i++
                        }
                    }
                    return (
                        <div style={{ marginBottom: hasImage || hasFooter ? "12px" : 0 }}>
                            {rows.map((row, ri) => (
                                <div
                                    key={ri}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: row.inline ? `repeat(${row.fields.length}, 1fr)` : "1fr",
                                        gap: "8px",
                                        marginBottom: ri < rows.length - 1 ? "8px" : 0,
                                    }}
                                >
                                    {row.fields.map((field, fi) => (
                                        <div key={fi} style={{ minWidth: 0 }}>
                                            <div style={{ color: t.embedField.name, fontSize: "13px", fontWeight: 700, marginBottom: "3px", wordBreak: "break-word" }}>
                                                {field.name || "\u200b"}
                                            </div>
                                            <div style={{ color: t.embedField.value, fontSize: "14px", lineHeight: 1.375, wordBreak: "break-word" }}>
                                                {field.value ? renderMarkdown(field.value, t) : "\u200b"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )
                })()}

                {hasImage && (
                    <div style={{ marginBottom: hasFooter ? "12px" : 0 }}>
                        <img
                            src={embed.image!.url}
                            alt=""
                            style={{ maxWidth: "100%", borderRadius: "4px", display: "block" }}
                            onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                    </div>
                )}

                {hasFooter && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        {embed.footer?.icon_url && (
                            <img src={embed.footer.icon_url} alt="" style={{ width: "16px", height: "16px", borderRadius: "50%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                        )}
                        {embed.footer?.text && (
                            <span style={{ color: t.embedFooter, fontSize: "12px", fontWeight: 500 }}>{embed.footer.text}</span>
                        )}
                        {embed.footer?.text && embed.timestamp && (
                            <span style={{ color: t.embedFooter, fontSize: "12px" }}>•</span>
                        )}
                        {embed.timestamp && (
                            <span style={{ color: t.embedFooter, fontSize: "12px" }}>{formatTimestamp(embed.timestamp, siteTimezone)}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export function DiscordMessagePreview({ message, username, avatarUrl, embeds }: DiscordMessagePreviewProps) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])
    
    const urlMatch = message?.match(/https?:\/\/[^\s"'<>|)]+/i)
    const previewUrl = urlMatch ? urlMatch[0] : null
    
    const { data: linkPreviewData } = trpc.tools.getLinkPreview.useQuery(
        { url: previewUrl! },
        { enabled: !!previewUrl, staleTime: 1000 * 60 * 60, retry: false }
    )
    const linkMeta = (linkPreviewData as any)?.data as { title?: string, description?: string, images?: string[], siteName?: string } | undefined
    
    const generatedEmbed: DiscordEmbed | undefined = linkMeta ? {
        author: linkMeta.siteName ? { name: linkMeta.siteName, url: previewUrl!, icon_url: "" } : undefined,
        title: linkMeta.title,
        url: previewUrl!,
        description: linkMeta.description,
        image: linkMeta.images?.[0] ? { url: linkMeta.images[0] } : undefined,
        colorHex: "#e3e5e8",
        color: 0xe3e5e8,
    } : undefined

    const dark = mounted ? resolvedTheme === "dark" : true
    const t = dark ? DARK : LIGHT

    const displayName = username || "VaniStudio Bot"
    const setting = useSetting()
    const siteTimezone = setting?.siteTimezone || "Asia/Ho_Chi_Minh"
    const now = new Date()
    const timeStr = formatWithSiteTimezone(now, siteTimezone, "HH:mm:ss")
    const hasContent = message || (embeds && embeds.some(e => e.title || e.description || e.author?.name || (e.fields?.length ?? 0) > 0))
    return (
        <div style={{ fontFamily: "'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif", borderRadius: "8px", overflow: "hidden", border: `1px solid ${t.headerBorder}`, display: "flex", flexDirection: "column", height: "550px", userSelect: "none", transition: "all 0.2s" }}>
            <div style={{ background: t.header, borderBottom: `1px solid ${t.headerBorder}`, padding: "0 16px", height: "48px", flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M10.99 3H13.01L12.97 5H17V7H12.93L12.77 11H17V13H12.73L12.69 15H10.67L10.71 13H6V11H10.75L10.91 7H6V5H10.95L10.99 3Z" fill={t.dividerText} />
                </svg>
                <span style={{ color: t.username, fontSize: "16px", fontWeight: 600, letterSpacing: "0.01em" }}>announcements</span>
            </div>
            <div style={{ background: t.bg, padding: "16px 16px 0", flex: 1, overflowY: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <div style={{ flex: 1, height: "1px", background: t.divider }} />
                    <span style={{ color: t.dividerText, fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {formatWithSiteTimezone(now, siteTimezone, "DD/MM/YYYY")}
                    </span>
                    <div style={{ flex: 1, height: "1px", background: t.divider }} />
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", paddingBottom: "16px" }}>
                    <div style={{ flexShrink: 0, width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", background: "#5865F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {avatarUrl
                            ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                            : <span style={{ color: "white", fontSize: "18px", fontWeight: 700 }}>{displayName.charAt(0).toUpperCase()}</span>
                        }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px", flexWrap: "wrap" }}>
                            <span style={{ color: t.username, fontSize: "16px", fontWeight: 500 }}>{displayName}</span>
                            <span style={{ background: "#5865F2", color: "white", fontSize: "10px", fontWeight: 600, padding: "1px 5px", borderRadius: "3px", letterSpacing: "0.4px", lineHeight: "16px", textTransform: "uppercase" }}>BOT</span>
                            <span style={{ color: t.timestamp, fontSize: "12px", marginLeft: "4px" }}>Today at {timeStr}</span>
                        </div>
                        {message && (
                            <div style={{ color: t.msgText, fontSize: "16px", lineHeight: "1.375", wordBreak: "break-word", marginBottom: ((embeds?.length ?? 0) > 0 || generatedEmbed) ? "8px" : 0 }}>
                                {renderMarkdown(message, t)}
                            </div>
                        )}
                        {embeds && embeds.length > 0 && embeds.map((embed, idx) => (
                            <DiscordEmbedRender key={idx} embed={embed} t={t} siteTimezone={siteTimezone} />
                        ))}
                        {generatedEmbed && (
                            <DiscordEmbedRender key="generated" embed={generatedEmbed} t={t} siteTimezone={siteTimezone} />
                        )}
                        {!hasContent && !generatedEmbed && (
                            <span style={{ color: t.dividerText, fontStyle: "italic", fontSize: "15px" }}>
                                Nội dung tin nhắn sẽ hiển thị ở đây...
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div style={{ background: t.bg, padding: "0 16px 16px", flexShrink: 0 }}>
                <div style={{ background: t.inputBg, borderRadius: "8px", padding: "11px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={t.inputText}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                    <span style={{ color: t.inputText, fontSize: "16px", flex: 1 }}>Message #announcements</span>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={t.inputText}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/></svg>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={t.inputText}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </div>
            </div>
        </div>
    )
}