"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { trpc } from "@/lib/trpc"
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";
import { useSetting } from "@/contexts/SettingContext";

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


interface SlackMessagePreviewProps {
    message: string
    channel?: string
    blocks?: SlackBlock[]
}
const DARK = {
    sidebarBg:      "#1a1d21",
    sidebarBorder:  "rgba(255,255,255,0.07)",
    workspaceLogo:  "#4A154B",
    workspaceName:  "#ffffff",
    navIcon:        "#b9babd",
    navText:        "#b9babd",
    sectionLabel:   "#9b9b9b",
    channelActive:  { bg: "rgba(255,255,255,0.1)", text: "#ffffff", hash: "#ffffff" },
    channelInactive:{ bg: "transparent", text: "#9b9b9b", hash: "#9b9b9b" },
    userBarBg:      "#1a1d21",
    userBarBorder:  "rgba(255,255,255,0.07)",
    username:       "#d9d9d9",
    onlineDot:      "#2bac76",
    onlineDotBorder:"#1a1d21",
    msgBg:          "#222529",
    headerBorder:   "rgba(255,255,255,0.07)",
    headerText:     "#e8e8e8",
    headerIcon:     "#9b9b9b",
    appIcon:        "#4A154B",
    appName:        "#e8e8e8",
    appBadge:       { bg: "#1264A3", text: "#ffffff" },
    timestamp:      "#9b9b9b",
    msgText:        "#d4d5d8",
    emptyText:      "#4a4f58",
    codeInline:     { bg: "#222529", text: "#e8912d", border: "rgba(255,255,255,0.1)" },
    link:           "#1d9bd1",
    inputBg:        "#2d3138",
    inputBorder:    "rgba(255,255,255,0.12)",
    inputPlaceholder:"#5a5e67",
    inputToolbar:   "rgba(255,255,255,0.07)",
    formatIcon:     "#9b9b9b",
    sendBtn:        "#2bac76",
}

const LIGHT = {
    sidebarBg:      "#3f0e40",
    sidebarBorder:  "rgba(255,255,255,0.1)",
    workspaceLogo:  "#ffffff",
    workspaceName:  "#ffffff",
    navIcon:        "rgba(255,255,255,0.7)",
    navText:        "rgba(255,255,255,0.7)",
    sectionLabel:   "rgba(255,255,255,0.6)",
    channelActive:  { bg: "rgba(255,255,255,0.2)", text: "#ffffff", hash: "#ffffff" },
    channelInactive:{ bg: "transparent", text: "rgba(255,255,255,0.7)", hash: "rgba(255,255,255,0.5)" },
    userBarBg:      "#3f0e40",
    userBarBorder:  "rgba(255,255,255,0.1)",
    username:       "#ffffff",
    onlineDot:      "#2bac76",
    onlineDotBorder:"#3f0e40",
    msgBg:          "#ffffff",
    headerBorder:   "#e8e8e8",
    headerText:     "#1d1c1d",
    headerIcon:     "#616061",
    appIcon:        "#4A154B",
    appName:        "#1d1c1d",
    appBadge:       { bg: "#1264A3", text: "#ffffff" },
    timestamp:      "#616061",
    msgText:        "#1d1c1d",
    emptyText:      "#b0b0b0",
    codeInline:     { bg: "#f8f8f8", text: "#e01e5a", border: "#e8e8e8" },
    link:           "#1264A3",
    inputBg:        "#ffffff",
    inputBorder:    "#d6d6d6",
    inputPlaceholder:"#aaaaaa",
    inputToolbar:   "#f8f8f8",
    formatIcon:     "#616061",
    sendBtn:        "#007a5a",
}

function renderSlackMrkdwn(text: string, tokens: typeof DARK): React.ReactNode[] {
    const result: React.ReactNode[] = []
    const lines = text.split("\n")
    lines.forEach((line, li) => {
        if (li > 0) result.push(<br key={`br-${li}`} />)
        const parts = line.split(/(\*[^*]+\*|_[^_]+_|~[^~]+~|`[^`]+`|\[[^\]]+\]\([^)]+\)|<[^>]+>)/g)
        parts.forEach((part, i) => {
            if (!part) return
            const key = `${li}-${i}`
            if (part.startsWith("*") && part.endsWith("*") && part.length > 2) { result.push(<strong key={key}>{part.slice(1, -1)}</strong>); return }
            if (part.startsWith("_") && part.endsWith("_") && part.length > 2) { result.push(<em key={key}>{part.slice(1, -1)}</em>); return }
            if (part.startsWith("~") && part.endsWith("~") && part.length > 2) { result.push(<s key={key}>{part.slice(1, -1)}</s>); return }
            if (part.startsWith("`") && part.endsWith("`")) {
                result.push(<code key={key} style={{ background: tokens.codeInline.bg, color: tokens.codeInline.text, fontFamily: "Monaco, Menlo, 'Courier New', monospace", fontSize: "12px", padding: "1px 5px", borderRadius: "3px", border: `1px solid ${tokens.codeInline.border}` }}>{part.slice(1, -1)}</code>)
                return
            }
            if (part.startsWith("[") && part.endsWith(")")) {
                const lm = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
                if (lm) { result.push(<a key={key} href={lm[2]} style={{ color: tokens.link, textDecoration: "none" }} target="_blank" rel="noopener noreferrer">{lm[1]}</a>); return }
            }
            if (part.startsWith("<") && part.endsWith(">")) {
                const inner = part.slice(1, -1)
                const pipeIdx = inner.indexOf("|")
                if (pipeIdx !== -1) {
                    const url = inner.slice(0, pipeIdx)
                    const label = inner.slice(pipeIdx + 1)
                    result.push(<a key={key} href={url} style={{ color: tokens.link, textDecoration: "none" }} target="_blank" rel="noopener noreferrer">{label}</a>)
                } else {
                    result.push(<a key={key} href={inner} style={{ color: tokens.link, textDecoration: "none" }} target="_blank" rel="noopener noreferrer">{inner}</a>)
                }
                return
            }
            result.push(<React.Fragment key={key}>{part}</React.Fragment>)
        })
    })
    return result
}

function getBlockText(val: any): string {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object" && typeof val.text === "string") return val.text;
    return "";
}

function renderSlackBlock(block: SlackBlock, t: typeof DARK, key: number): React.ReactNode {
    if (block.type === "divider") return <div key={key} style={{ borderTop: `1px solid ${t.headerBorder}`, margin: "8px 0" }} />

    if (block.type === "header") {
        const textVal = getBlockText(block.text);
        return (
            <div key={key} style={{ fontSize: "18px", fontWeight: 700, color: t.msgText, margin: "6px 0 4px", lineHeight: 1.3 }}>
                {textVal ? renderSlackMrkdwn(textVal, t) : <span style={{ color: t.emptyText, fontStyle: "italic" }}>Tiêu đề trống</span>}
            </div>
        );
    }

    if (block.type === "section") {
        const textVal = getBlockText(block.text);
        const fields = (block as any).fields as any[];
        return (
            <div key={key} style={{ display: "flex", gap: "12px", alignItems: "flex-start", margin: "4px 0" }}>
                <div style={{ flex: 1, color: t.msgText, fontSize: "14.5px", lineHeight: "1.46667", wordBreak: "break-word" }}>
                    {textVal && <div>{renderSlackMrkdwn(textVal, t)}</div>}
                    {fields && fields.filter(f => getBlockText(f).trim()).length > 0 && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", marginTop: textVal ? "10px" : "0", fontSize: "13px", lineHeight: "1.43" }}>
                            {fields.filter(f => getBlockText(f).trim()).map((f, fi) => (
                                <div key={fi} style={{ wordBreak: "break-word" }}>
                                    {renderSlackMrkdwn(getBlockText(f), t)}
                                </div>
                            ))}
                        </div>
                    )}
                    {!textVal && (!fields || fields.filter(f => getBlockText(f).trim()).length === 0) && (
                        <span style={{ color: t.emptyText, fontStyle: "italic" }}>Nội dung trống</span>
                    )}
                </div>
                {block.accessory_image_url && (
                    <img src={block.accessory_image_url} alt={block.accessory_alt_text || ""} style={{ width: "72px", height: "72px", borderRadius: "4px", objectFit: "cover", flexShrink: 0 }} />
                )}
            </div>
        );
    }

    if (block.type === "image") {
        const titleVal = getBlockText(block.title);
        return (
            <div key={key} style={{ margin: "6px 0" }}>
                {titleVal && <div style={{ color: t.msgText, fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>{renderSlackMrkdwn(titleVal, t)}</div>}
                {block.image_url
                    ? <img src={block.image_url} alt={block.alt_text} style={{ maxWidth: "100%", maxHeight: "180px", borderRadius: "4px", objectFit: "cover" }} />
                    : <div style={{ background: t.inputBg, border: `1px dashed ${t.inputBorder}`, borderRadius: "4px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", color: t.emptyText, fontSize: "12px" }}>Image URL</div>
                }
                {block.alt_text && <div style={{ color: t.timestamp, fontSize: "11px", marginTop: "3px" }}>{block.alt_text}</div>}
            </div>
        );
    }

    if (block.type === "context") return (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", margin: "4px 0" }}>
            {block.elements.map((el, ei) =>
                el.type === "image"
                    ? <img key={ei} src={(el as any).image_url} alt={(el as any).alt_text || ""} style={{ width: "20px", height: "20px", borderRadius: "3px", objectFit: "cover" }} />
                    : <span key={ei} style={{ color: t.timestamp, fontSize: "12px" }}>{renderSlackMrkdwn(getBlockText(el), t)}</span>
            )}
        </div>
    )

    if (block.type === "actions") return (
        <div key={key} style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "6px 0" }}>
            {block.elements.map((el, ei) => {
                const isPrimary = el.style === "primary"
                const isDanger = el.style === "danger"
                return (
                    <div key={ei} style={{
                        padding: "6px 14px", borderRadius: "4px", fontSize: "13px", fontWeight: 700,
                        border: isPrimary ? "2px solid #007a5a" : isDanger ? "2px solid #e01e5a" : `2px solid ${t.inputBorder}`,
                        color: isPrimary ? "#007a5a" : isDanger ? "#e01e5a" : t.msgText,
                        background: isPrimary ? "rgba(0,122,90,0.1)" : isDanger ? "rgba(224,30,90,0.1)" : t.inputBg,
                        cursor: "pointer"
                    }}>{el.text || "Button"}</div>
                )
            })}
        </div>
    )

    return null
}

export function SlackMessagePreview({ message, channel, blocks }: SlackMessagePreviewProps) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])
    
    const urlMatch = message?.match(/https?:\/\/[^\s"<>|)]+/i)
    const previewUrl = urlMatch ? urlMatch[0] : null

    const { data: linkPreviewData } = trpc.tools.getLinkPreview.useQuery(
        { url: previewUrl! },
        { enabled: !!previewUrl, staleTime: 1000 * 60 * 60, retry: false }
    )
    const linkMeta = (linkPreviewData as any)?.data as { title?: string, description?: string, images?: string[], siteName?: string } | undefined

    const dark = mounted ? resolvedTheme === "dark" : true
    const t = dark ? DARK : LIGHT

    const setting = useSetting()
    const siteTimezone = setting?.siteTimezone || "Asia/Ho_Chi_Minh"
    const now = new Date()
    const timeStr = formatWithSiteTimezone(now, siteTimezone, "HH:mm:ss")
    const channelName = channel?.replace(/^#/, "") || "general"

    const navItems = [
        { label: "Home", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill={t.navIcon}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> },
        { label: "DMs",  svg: <svg width="16" height="16" viewBox="0 0 24 24" fill={t.navIcon}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg> },
        { label: "Activity", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill={t.navIcon}><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg> },
    ]

    return (
        <div style={{ fontFamily: "'Lato', system-ui, -apple-system, 'Segoe UI', sans-serif", borderRadius: "8px", overflow: "hidden", border: dark ? "1px solid #0a0a0a" : "1px solid #e0e0e0", display: "flex", height: "550px", userSelect: "none", transition: "all 0.2s" }}>
            <div className="hidden sm:flex" style={{ width: "200px", flexShrink: 0, background: t.sidebarBg, flexDirection: "column", borderRight: `1px solid ${t.sidebarBorder}` }}>
                <div style={{ padding: "0 12px", height: "50px", display: "flex", alignItems: "center", gap: "8px", borderBottom: `1px solid ${t.sidebarBorder}` }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "5px", background: t.workspaceLogo === "#ffffff" ? "#4A154B" : t.workspaceLogo, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "white", fontSize: "12px", fontWeight: 900 }}>V</span>
                    </div>
                    <span style={{ color: t.workspaceName, fontSize: "15px", fontWeight: 700, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>VaniStudio</span>
                    <svg width="13" height="13" viewBox="0 0 20 20" fill={t.navIcon}><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
                <div style={{ padding: "6px 0" }}>
                    {navItems.map(item => (
                        <div key={item.label} style={{ padding: "4px 12px", display: "flex", alignItems: "center", gap: "8px", borderRadius: "4px", margin: "1px 4px", cursor: "pointer" }}>
                            {item.svg}
                            <span style={{ color: t.navText, fontSize: "14px" }}>{item.label}</span>
                        </div>
                    ))}
                </div>
                <div style={{ padding: "10px 12px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: t.sectionLabel, fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Channels</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={t.sectionLabel}><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                </div>
                {["announcements", channelName].filter((v, i, a) => a.indexOf(v) === i).map(ch => {
                    const active = ch === channelName
                    const s = active ? t.channelActive : t.channelInactive
                    return (
                        <div key={ch} style={{ padding: "3px 12px", display: "flex", alignItems: "center", gap: "5px", background: s.bg, borderRadius: "4px", margin: "1px 4px", cursor: "pointer" }}>
                            <span style={{ color: s.hash, fontSize: "16px", lineHeight: 1, fontWeight: 300 }}>#</span>
                            <span style={{ color: s.text, fontSize: "14px", fontWeight: active ? 700 : 400 }}>{ch}</span>
                        </div>
                    )
                })}
                <div style={{ marginTop: "auto", padding: "8px 12px", borderTop: `1px solid ${t.userBarBorder}`, display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#4A154B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "white", fontSize: "12px", fontWeight: 700 }}>A</span>
                        </div>
                        <div style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "9px", height: "9px", borderRadius: "50%", background: t.onlineDot, border: `1.5px solid ${t.onlineDotBorder}` }} />
                    </div>
                    <span style={{ color: t.username, fontSize: "13px", fontWeight: 600 }}>Admin</span>
                    <svg style={{ marginLeft: "auto" }} width="16" height="16" viewBox="0 0 24 24" fill={t.navIcon}><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                </div>
            </div>
            <div style={{ flex: 1, background: t.msgBg, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <div style={{ padding: "0 16px", height: "50px", display: "flex", alignItems: "center", borderBottom: `1px solid ${t.headerBorder}`, gap: "8px", flexShrink: 0 }}>
                    <span style={{ color: t.headerText, fontSize: "15px", fontWeight: 700 }}># {channelName}</span>
                    <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={t.headerIcon}><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={t.headerIcon}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                    </div>
                </div>
                <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: t.appIcon, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "white", fontWeight: 900, fontSize: "15px" }}>V</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px", flexWrap: "wrap" }}>
                                <span style={{ color: t.appName, fontSize: "15px", fontWeight: 700 }}>VaniStudio</span>
                                <span style={{ background: t.appBadge.bg, color: t.appBadge.text, fontSize: "10px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", letterSpacing: "0.3px", lineHeight: "15px", textTransform: "uppercase" }}>APP</span>
                                <span style={{ color: t.timestamp, fontSize: "12px" }}>{timeStr}</span>
                            </div>
                            {blocks && blocks.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {message && <div style={{ color: t.msgText, fontSize: "14.5px", lineHeight: "1.46667", marginBottom: "8px" }}>{message}</div>}
                                    {blocks.map((block, bi) => renderSlackBlock(block, t, bi))}
                                </div>
                            ) : (
                                <div style={{ color: t.msgText, fontSize: "14.5px", lineHeight: "1.46667", wordBreak: "break-word" }}>
                                    {message
                                        ? renderSlackMrkdwn(message, t)
                                        : <span style={{ color: t.emptyText, fontStyle: "italic" }}>Nội dung tin nhắn sẽ hiển thị ở đây...</span>
                                    }
                                </div>
                            )}
                            
                            {linkMeta && (
                                <div style={{ marginTop: "8px", borderLeft: `4px solid ${t.headerBorder}`, paddingLeft: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                                    {linkMeta.siteName && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            {linkMeta.images?.[0] && <img src={linkMeta.images[0]} style={{ width: "16px", height: "16px", borderRadius: "2px", objectFit: "cover" }} alt="" />}
                                            <span style={{ fontSize: "13px", fontWeight: 700, color: t.msgText }}>{linkMeta.siteName}</span>
                                        </div>
                                    )}
                                    <div style={{ color: t.link, fontSize: "15px", fontWeight: 700 }}>
                                        {linkMeta.title || previewUrl}
                                    </div>
                                    {linkMeta.description && (
                                        <div style={{ color: t.msgText, fontSize: "14px", lineHeight: "1.4" }}>{linkMeta.description}</div>
                                    )}
                                    {linkMeta.images?.[0] && (
                                        <img src={linkMeta.images[0]} style={{ maxWidth: "360px", maxHeight: "250px", borderRadius: "4px", marginTop: "4px", border: `1px solid ${t.headerBorder}` }} alt="Preview" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ padding: "0 16px 12px", flexShrink: 0 }}>
                    <div style={{ background: t.inputBg, borderRadius: "8px", border: `1px solid ${t.inputBorder}`, overflow: "hidden" }}>
                        <div style={{ padding: "10px 12px 4px", minHeight: "36px", display: "flex" }}>
                            <span style={{ color: t.inputPlaceholder, fontSize: "14px", flex: 1 }}>Message #{channelName}</span>
                        </div>
                        <div style={{ padding: "4px 8px 6px", display: "flex", alignItems: "center", gap: "2px", borderTop: `1px solid ${t.inputToolbar}` }}>
                            {[
                                <svg key="b" width="16" height="16" viewBox="0 0 24 24" fill={t.formatIcon}><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5S13.83 9.5 13 9.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>,
                                <svg key="i" width="16" height="16" viewBox="0 0 24 24" fill={t.formatIcon}><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>,
                                <svg key="s" width="16" height="16" viewBox="0 0 24 24" fill={t.formatIcon}><path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>,
                                <svg key="c" width="16" height="16" viewBox="0 0 24 24" fill={t.formatIcon}><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>,
                            ].map((icon, idx) => (
                                <div key={idx} style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", cursor: "pointer" }}>
                                    {icon}
                                </div>
                            ))}
                            <div style={{ marginLeft: "auto", width: "28px", height: "28px", borderRadius: "4px", background: t.sendBtn, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}