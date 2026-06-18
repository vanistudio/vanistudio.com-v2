"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";
import { useSetting } from "@/contexts/SettingContext";

interface TelegramRichMessageBuilderProps {
    message: string
    chatId?: string
    inlineKeyboard?: { rows: { buttons: { text: string; url: string }[] }[] }
}
const DARK = {
    panelBg:          "#17212b",
    panelBorder:      "rgba(255,255,255,0.05)",
    searchBg:         "#1c2733",
    searchText:       "#4a6278",
    searchIcon:       "#4a6278",
    chatRowHover:     "rgba(255,255,255,0.06)",
    chatRowActive:    "#2b5278",
    chatName:         "#ffffff",
    chatPreview:      "#6c8ea4",
    chatTime:         "#6c8ea4",
    unreadBadge:      "#2AABEE",
    headerBg:         "#17212b",
    headerBorder:     "rgba(255,255,255,0.05)",
    menuIcon:         "#5288c1",
    convHeaderBg:     "#17212b",
    convHeaderBorder: "rgba(255,255,255,0.05)",
    convHeaderIcon:   "#5288c1",
    convBotName:      "#ffffff",
    convBotSub:       "#5288c1",
    chatBg:           "#0e1621",
    datePill:         { bg: "rgba(23,33,43,0.88)", text: "#8ba5c3" },
    botNameInChat:    "#2AABEE",
    bubble:           "#182533",
    bubbleText:       "#e8edf0",
    bubbleTime:       "#6c8ea4",
    bubbleTail:       "#182533",
    emptyText:        "#4a5e72",
    codeInline:       { bg: "rgba(0,0,0,0.35)", text: "#b9d7e0" },
    link:             "#6ab3f3",
    inputBarBg:       "#17212b",
    inputBarBorder:   "rgba(255,255,255,0.05)",
    inputFieldBg:     "#242f3d",
    inputPlaceholder: "#4a6278",
    inputIcon:        "#5288c1",
    sendBg:           "#2AABEE",
}

const LIGHT = {
    panelBg:          "#ffffff",
    panelBorder:      "rgba(0,0,0,0.08)",
    searchBg:         "#f1f3f4",
    searchText:       "#aaaaaa",
    searchIcon:       "#aaaaaa",
    chatRowHover:     "rgba(0,0,0,0.04)",
    chatRowActive:    "#3390ec1a",
    chatName:         "#000000",
    chatPreview:      "#999999",
    chatTime:         "#999999",
    unreadBadge:      "#2AABEE",
    headerBg:         "#ffffff",
    headerBorder:     "rgba(0,0,0,0.08)",
    menuIcon:         "#707579",
    convHeaderBg:     "#ffffff",
    convHeaderBorder: "rgba(0,0,0,0.08)",
    convHeaderIcon:   "#707579",
    convBotName:      "#000000",
    convBotSub:       "#3390ec",
    chatBg:           "#c8d4de",
    datePill:         { bg: "rgba(0,0,0,0.28)", text: "#ffffff" },
    botNameInChat:    "#3390ec",
    bubble:           "#ffffff",
    bubbleText:       "#000000",
    bubbleTime:       "#939ba5",
    bubbleTail:       "#ffffff",
    emptyText:        "#939ba5",
    codeInline:       { bg: "#f1f3f4", text: "#cc3333" },
    link:             "#2678b6",
    inputBarBg:       "#ffffff",
    inputBarBorder:   "rgba(0,0,0,0.08)",
    inputFieldBg:     "#f1f3f4",
    inputPlaceholder: "#aaaaaa",
    inputIcon:        "#707579",
    sendBg:           "#2AABEE",
}
function renderTgHtml(html: string, t: typeof DARK): React.ReactNode[] {
    const result: React.ReactNode[] = []
    const tokenRegex = /<b>([\s\S]*?)<\/b>|<strong>([\s\S]*?)<\/strong>|<i>([\s\S]*?)<\/i>|<em>([\s\S]*?)<\/em>|<u>([\s\S]*?)<\/u>|<s>([\s\S]*?)<\/s>|<del>([\s\S]*?)<\/del>|<code>([\s\S]*?)<\/code>|<pre>([\s\S]*?)<\/pre>|<tg-spoiler>([\s\S]*?)<\/tg-spoiler>|<a href="([^"]*)">([\s\S]*?)<\/a>|(\n)/g
    let last = 0
    let match: RegExpExecArray | null
    let key = 0
    while ((match = tokenRegex.exec(html)) !== null) {
        if (match.index > last) {
            result.push(<React.Fragment key={key++}>{html.slice(last, match.index)}</React.Fragment>)
        }
        if (match[1] !== undefined || match[2] !== undefined) {
            result.push(<strong key={key++}>{match[1] ?? match[2]}</strong>)
        } else if (match[3] !== undefined || match[4] !== undefined) {
            result.push(<em key={key++}>{match[3] ?? match[4]}</em>)
        } else if (match[5] !== undefined) {
            result.push(<span key={key++} style={{ textDecoration: "underline" }}>{match[5]}</span>)
        } else if (match[6] !== undefined || match[7] !== undefined) {
            result.push(<span key={key++} style={{ textDecoration: "line-through" }}>{match[6] ?? match[7]}</span>)
        } else if (match[8] !== undefined) {
            result.push(<code key={key++} style={{ background: t.codeInline.bg, fontFamily: "monospace", fontSize: "13px", padding: "1px 4px", borderRadius: "3px", color: t.codeInline.text }}>{match[8]}</code>)
        } else if (match[9] !== undefined) {
            result.push(<pre key={key++} style={{ background: t.codeInline.bg, fontFamily: "monospace", fontSize: "12px", padding: "6px 8px", borderRadius: "4px", color: t.codeInline.text, margin: "4px 0", overflowX: "auto", whiteSpace: "pre-wrap" }}>{match[9]}</pre>)
        } else if (match[10] !== undefined) {
            result.push(<span key={key++} style={{ background: t.bubbleText, color: t.bubbleText, borderRadius: "3px", cursor: "pointer" }} title="Spoiler">{match[10]}</span>)
        } else if (match[11] !== undefined && match[12] !== undefined) {
            result.push(<a key={key++} href={match[11]} style={{ color: t.link, textDecoration: "none" }} target="_blank" rel="noopener noreferrer">{match[12]}</a>)
        } else if (match[13] !== undefined) {
            result.push(<br key={key++} />)
        }
        last = match.index + match[0].length
    }
    if (last < html.length) result.push(<React.Fragment key={key++}>{html.slice(last)}</React.Fragment>)
    return result
}
import { trpc } from "@/lib/trpc"
const FAKE_CHATS = [
    { name: "VaniStudio", preview: "Bot message preview...", time: "17:28", unread: 1 },
    { name: "Team Alpha", preview: "Đã gửi: Ảnh", time: "16:45", unread: 0 },
    { name: "Marketing", preview: "Meeting lúc 3h chiều nhé", time: "15:30", unread: 3 },
    { name: "Support", preview: "Ticket #4821 đã đóng", time: "14:10", unread: 0 },
]

export function TelegramRichMessageBuilder({ message, chatId, inlineKeyboard }: TelegramRichMessageBuilderProps) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])
    
    const urlMatch = message.match(/<a href="([^"]+)">/i)
    const previewUrl = urlMatch ? urlMatch[1] : null

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

    return (
        <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
            borderRadius: "10px",
            overflow: "hidden",
            border: dark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.1)",
            display: "flex",
            height: "550px",
            userSelect: "none",
            transition: "all 0.2s",
        }}>
            <div className="hidden sm:flex" style={{ width: "220px", flexShrink: 0, background: t.panelBg, flexDirection: "column", borderRight: `1px solid ${t.panelBorder}` }}>
                <div style={{ height: "52px", padding: "0 12px", display: "flex", alignItems: "center", gap: "10px", borderBottom: `1px solid ${t.headerBorder}`, background: t.headerBg }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={t.menuIcon}><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
                    <span style={{ color: t.chatName, fontSize: "16px", fontWeight: 600, flex: 1 }}>Telegram</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={t.menuIcon}><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                </div>
                <div style={{ padding: "8px 10px", borderBottom: `1px solid ${t.panelBorder}` }}>
                    <div style={{ background: t.searchBg, borderRadius: "20px", padding: "6px 10px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={t.searchIcon}><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                        <span style={{ color: t.searchText, fontSize: "13px" }}>Search</span>
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                    {FAKE_CHATS.map((chat, idx) => (
                        <div key={idx} style={{
                            padding: "8px 12px",
                            display: "flex", alignItems: "center", gap: "10px",
                            background: idx === 0 ? t.chatRowActive : "transparent",
                            borderRadius: idx === 0 ? "0" : "0",
                            cursor: "pointer",
                            transition: "background 0.15s",
                        }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: idx === 0 ? "linear-gradient(135deg, #2AABEE, #229ED9)" : idx === 1 ? "#9c69e2" : idx === 2 ? "#e56555" : "#3dbb76", fontWeight: 700, fontSize: "15px", color: "white" }}>
                                {chat.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "4px" }}>
                                    <span style={{ color: idx === 0 && dark ? "#ffffff" : t.chatName, fontSize: "14px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.name}</span>
                                    <span style={{ color: chat.unread > 0 ? t.unreadBadge : t.chatTime, fontSize: "11px", flexShrink: 0 }}>{chat.time}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: t.chatPreview, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{chat.preview}</span>
                                    {chat.unread > 0 && (
                                        <div style={{ background: t.unreadBadge, color: "white", fontSize: "11px", fontWeight: 700, minWidth: "18px", height: "18px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", flexShrink: 0, marginLeft: "4px" }}>
                                            {chat.unread}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <div style={{ height: "52px", padding: "0 16px", display: "flex", alignItems: "center", gap: "10px", background: t.convHeaderBg, borderBottom: `1px solid ${t.convHeaderBorder}` }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #2AABEE, #229ED9)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: t.convBotName, fontSize: "15px", fontWeight: 600, lineHeight: 1.2 }}>VaniStudio</div>
                        <div style={{ color: t.convBotSub, fontSize: "12px", lineHeight: 1.2 }}>bot</div>
                    </div>
                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={t.convHeaderIcon}><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={t.convHeaderIcon}><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    </div>
                </div>
                <div style={{ flex: 1, background: t.chatBg, padding: "12px 16px 8px", overflowY: "auto", minHeight: 0 }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                        <div style={{ background: t.datePill.bg, color: t.datePill.text, fontSize: "12px", fontWeight: 500, padding: "4px 14px", borderRadius: "12px" }}>
                            {formatWithSiteTimezone(now, siteTimezone, "DD/MM/YYYY HH:mm:ss")}
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: "6px", marginBottom: "4px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #2AABEE, #229ED9)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: (inlineKeyboard && inlineKeyboard.rows.length > 0) || chatId ? "auto" : "0" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg>
                        </div>
                        <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: "2px" }}>
                            <div style={{ position: "relative" }}>
                                <div style={{ color: t.botNameInChat, fontSize: "12px", fontWeight: 600, marginBottom: "3px", paddingLeft: "14px" }}>VaniStudio</div>
                                <div style={{ background: t.bubble, borderRadius: "4px 12px 12px 12px", padding: "8px 12px 6px", position: "relative", boxShadow: dark ? "0 1px 2px rgba(0,0,0,0.45)" : "0 1px 2px rgba(0,0,0,0.12)" }}>
                                    <div style={{ color: t.bubbleText, fontSize: "15px", lineHeight: "1.5", wordBreak: "break-word" }}>
                                        {message
                                            ? renderTgHtml(message, t)
                                            : <span style={{ color: t.emptyText, fontStyle: "italic" }}>Nội dung tin nhắn...</span>
                                        }
                                    </div>
                                    {message && previewUrl && (
                                        <div style={{
                                            marginTop: "6px",
                                            marginBottom: "2px",
                                            borderLeft: `2.5px solid ${t.unreadBadge}`,
                                            paddingLeft: "8px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "4px"
                                        }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                <div style={{ color: t.unreadBadge, fontSize: "13px", fontWeight: 600 }}>
                                                    {linkMeta?.siteName || "Trang liên kết"}
                                                </div>
                                                <div style={{ color: t.bubbleText, fontSize: "14px", fontWeight: 600, lineHeight: 1.3 }}>
                                                    {linkMeta?.title || previewUrl}
                                                </div>
                                                <div style={{ color: t.bubbleTime, fontSize: "13px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: linkMeta?.images?.length ? 2 : 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                    {linkMeta?.description || "Nhấn vào liên kết để truy cập và xem chi tiết theo hướng dẫn từ tin nhắn Telegram gốc."}
                                                </div>
                                            </div>
                                            {linkMeta?.images && linkMeta.images.length > 0 && (
                                                <div style={{ marginTop: "2px", borderRadius: "6px", overflow: "hidden", maxWidth: "100%", maxHeight: "160px", display: "flex" }}>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={linkMeta.images[0]} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "3px" }}>
                                        <span style={{ color: t.bubbleTime, fontSize: "11px" }}>{timeStr}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {chatId && (
                                <div style={{ display: "flex", marginTop: "4px" }}>
                                    <span style={{ background: dark ? "rgba(42,171,238,0.12)" : "rgba(42,171,238,0.1)", color: "#2AABEE", fontSize: "11px", padding: "3px 10px", borderRadius: "10px", border: "1px solid rgba(42,171,238,0.25)", fontWeight: 500 }}>
                                        📢 Broadcast: {chatId}
                                    </span>
                                </div>
                            )}

                            {inlineKeyboard && inlineKeyboard.rows.length > 0 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%" }}>
                                    {inlineKeyboard.rows.map((row, ri) => (
                                        <div key={ri} style={{ display: "flex", gap: "2px", width: "100%" }}>
                                            {row.buttons.filter(b => b.text).map((btn, bi) => (
                                                <div key={bi} style={{
                                                    flex: 1, minWidth: 0,
                                                    height: "34px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    background: dark ? "#202b36" : "rgba(255, 255, 255, 0.8)",
                                                    borderRadius: (ri === 0 && row.buttons.length === 1 && inlineKeyboard.rows.length === 1) ? "10px" : "8px",
                                                    color: dark ? "#ffffff" : "#3390ec",
                                                    fontSize: "14px",
                                                    fontWeight: 500,
                                                    position: "relative",
                                                    cursor: "pointer",
                                                    boxShadow: dark ? "0 1px 2px rgba(0,0,0,0.1)" : "0 1px 2px rgba(0,0,0,0.06)",
                                                    transition: "background 0.2s"
                                                }}>
                                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 20px" }}>
                                                        {btn.text}
                                                    </span>
                                                    {btn.url && (
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ position: "absolute", right: "8px", top: "6px", opacity: 0.8 }}>
                                                            <path d="M5 19V17H15.59L4 5.41L5.41 4L17 15.59V5H19V19H5Z"/>
                                                        </svg>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ background: t.inputBarBg, borderTop: `1px solid ${t.inputBarBorder}`, padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={t.inputIcon}><path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-6h2v6zm0-8h-2V7h2v1.5z"/></svg>
                    <div style={{ flex: 1, padding: "8px 14px", display: "flex", alignItems: "center" }}>
                        <span style={{ color: t.inputPlaceholder, fontSize: "14px" }}>Message</span>
                    </div>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={t.inputIcon}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/></svg>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: t.sendBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </div>
                </div>
            </div>
        </div>
    )
}