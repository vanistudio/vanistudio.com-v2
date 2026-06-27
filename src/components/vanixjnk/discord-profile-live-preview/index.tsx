"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Icon } from "@iconify/react"

export interface DiscordProfileLivePreviewProps {
    status?: "online" | "idle" | "dnd" | "invisible"
    customEmoji?: string
    customText?: string
    bannerColor?: string
    bio?: string
    activityType?: "playing" | "streaming" | "listening" | "watching" | "competing"
    activityName?: string
    details?: string
    state?: string
    largeImage?: string
    largeText?: string
    smallImage?: string
    smallText?: string
    btn1Label?: string
    btn1Url?: string
    btn2Label?: string
    btn2Url?: string
    displayName?: string
    username?: string
    avatarUrl?: string
}

// Styling tokens for Dark/Light Discord Profile Card
const DARK = {
    cardBg: "#1e1f22",
    innerBg: "#111214",
    textPrimary: "#ffffff",
    textSecondary: "#dbdee1",
    textMuted: "#949ba4",
    border: "rgba(255, 255, 255, 0.06)",
    badgeBg: "#111214",
    tabActive: "#ffffff",
    tabInactive: "#b5bac1",
    tabUnderline: "#ffffff",
    btnBg: "#4e5058",
    btnText: "#ffffff",
    btnHover: "#6d6f78",
    playBg: "#1f2023",
    activityHeading: "#949ba4",
    linkText: "#00a8fc",
    codeBg: "#2b2d31",
    bubbleBg: "#111214",
    bubbleBorder: "#232428",
    bubbleText: "#dbdee1",
}

const LIGHT = {
    cardBg: "#e3e5e8",
    innerBg: "#ffffff",
    textPrimary: "#060607",
    textSecondary: "#2e3338",
    textMuted: "#5c5e66",
    border: "rgba(0, 0, 0, 0.08)",
    badgeBg: "#ffffff",
    tabActive: "#060607",
    tabInactive: "#5c5e66",
    tabUnderline: "#060607",
    btnBg: "#e3e5e8",
    btnText: "#2e3338",
    btnHover: "#d4d7dc",
    playBg: "#f2f3f5",
    activityHeading: "#5c5e66",
    linkText: "#0067e0",
    codeBg: "#f2f3f5",
    bubbleBg: "#ffffff",
    bubbleBorder: "#e3e5e8",
    bubbleText: "#313338",
}

function renderMarkdown(text: string, tokens: typeof DARK): React.ReactNode[] {
    if (!text) return []
    const result: React.ReactNode[] = []
    
    // Split bold, italic, code
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\n)/g)
    parts.forEach((p, i) => {
        if (!p) return
        const key = `bio-${i}`
        if (p === "\n") {
            result.push(<br key={key} />)
            return
        }
        if (p.startsWith("**") && p.endsWith("**")) {
            result.push(<strong key={key} style={{ color: tokens.textPrimary, fontWeight: 700 }}>{p.slice(2, -2)}</strong>)
            return
        }
        if (p.startsWith("*") && p.endsWith("*") && p.length > 2) {
            result.push(<em key={key} style={{ fontStyle: "italic" }}>{p.slice(1, -1)}</em>)
            return
        }
        if (p.startsWith("`") && p.endsWith("`")) {
            result.push(
                <code
                    key={key}
                    style={{
                        background: tokens.codeBg,
                        color: tokens.textSecondary,
                        fontFamily: "monospace",
                        fontSize: "90%",
                        padding: "2px 4px",
                        borderRadius: "3px",
                    }}
                >
                    {p.slice(1, -1)}
                </code>
            )
            return
        }
        result.push(<React.Fragment key={key}>{p}</React.Fragment>)
    })
    return result
}

export function DiscordProfileLivePreview({
    status = "online",
    customEmoji = "",
    customText = "",
    bannerColor = "#5865F2",
    bio = "",
    activityType = "playing",
    activityName = "",
    details = "",
    state = "",
    largeImage = "",
    largeText = "",
    smallImage = "",
    smallText = "",
    btn1Label = "",
    btn1Url = "",
    btn2Label = "",
    btn2Url = "",
    displayName = "Vani Dev",
    username = "vanixjnk",
    avatarUrl = ""
}: DiscordProfileLivePreviewProps) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])

    // Generate unique ID for SVG masks to prevent collisions on same page
    const componentId = React.useId()
    const avatarMaskId = `avatar-mask-${componentId.replace(/:/g, "")}`
    const idleMaskId = `idle-mask-${componentId.replace(/:/g, "")}`
    const dndMaskId = `dnd-mask-${componentId.replace(/:/g, "")}`
    const offlineMaskId = `offline-mask-${componentId.replace(/:/g, "")}`

    const isDark = mounted ? resolvedTheme === "dark" : true
    const t = isDark ? DARK : LIGHT

    const hasActivity = activityName && activityName.trim().length > 0
    const isSpotify = activityType === "listening" && (activityName.toLowerCase() === "spotify" || activityName.toLowerCase() === "listening to spotify")

    const getActivityHeading = () => {
        if (isSpotify) return "LISTENING TO SPOTIFY"
        switch (activityType) {
            case "playing": return "PLAYING A GAME"
            case "streaming": return "LIVE ON STREAM"
            case "listening": return "LISTENING TO"
            case "watching": return "WATCHING"
            case "competing": return "COMPETING IN"
            default: return "PLAYING A GAME"
        }
    }

    const renderStatusBadge = () => {
        switch (status) {
            case "online":
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8" fill="#23a55a" />
                    </svg>
                )
            case "idle":
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8" fill="#f0b232" />
                        <circle cx="8" cy="8" r="6.5" fill={t.cardBg} />
                    </svg>
                )
            case "dnd":
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8" fill="#f23f43" />
                        <rect x="5" y="10.5" width="14" height="3" rx="1.5" fill={t.cardBg} />
                    </svg>
                )
            default:
                // offline/invisible
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8" fill="#80848e" />
                        <circle cx="12" cy="12" r="4.5" fill={t.cardBg} />
                    </svg>
                )
        }
    }

    return (
        <div
            style={{
                fontFamily: "'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                width: "100%",
                borderRadius: "16px",
                overflow: "hidden",
                background: t.cardBg,
                border: `1px solid ${t.border}`,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.24)",
                display: "flex",
                flexDirection: "column",
                userSelect: "none",
                transition: "all 0.2s ease-in-out"
            }}
        >
            {/* Custom Banner */}
            <div
                style={{
                    height: "105px",
                    width: "100%",
                    backgroundColor: bannerColor || "#5865F2",
                    position: "relative",
                    transition: "background-color 0.3s ease",
                }}
            />

            {/* Main content body */}
            <div
                style={{
                    padding: "12px",
                    position: "relative",
                    background: t.cardBg,
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                {/* Avatar container */}
                <div
                    style={{
                        position: "absolute",
                        top: "-52px",
                        left: "12px",
                        width: "80px",
                        height: "80px",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: "relative", overflow: "visible" }}>
                        <defs>
                            <mask id={avatarMaskId}>
                                <circle cx="40" cy="40" r="40" fill="white" />
                                <circle cx="68" cy="68" r="14" fill="black" />
                            </mask>
                        </defs>
                        
                        {/* Group containing background border and image, both masked */}
                        <g mask={`url(#${avatarMaskId})`}>
                            <circle cx="40" cy="40" r="40" fill={t.cardBg} />
                            <foreignObject x="6" y="6" width="68" height="68">
                                <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#5865F2" }}>
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Avatar"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = "none"
                                            }}
                                        />
                                    ) : (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                                            <svg width="34" height="34" viewBox="0 0 127.14 96.36" fill="white">
                                                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.87-.64,1.71-1.32,2.51-2a75.76,75.76,0,0,0,65.88,0c.8,0.7,1.64,1.38,2.51,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.2,54.65,123.68,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </foreignObject>
                        </g>

                        {/* Status badge placed exactly at the cutout position (cx=68, cy=68, r=8) */}
                        <g transform="translate(56, 56)">
                            {renderStatusBadge()}
                        </g>
                    </svg>
                </div>

                {/* Custom Status Speech Bubble next to Avatar */}
                {(customEmoji || customText) && (
                    <div
                        style={{
                            position: "absolute",
                            left: "85px",
                            top: "16px",
                            zIndex: 10,
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                padding: "4px 10px",
                                background: t.innerBg,
                                border: `1px solid ${t.border}`,
                                borderRadius: "12px",
                                color: t.textSecondary,
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.16)",
                                maxWidth: "160px",
                                minHeight: "26px",
                                boxSizing: "border-box",
                            }}
                        >
                            {/* Medium connection dot (:before) */}
                            <div
                                style={{
                                    background: "inherit",
                                    border: "inherit",
                                    borderRadius: "50%",
                                    boxShadow: "inherit",
                                    boxSizing: "border-box",
                                    height: "20px",
                                    left: "10px",
                                    position: "absolute",
                                    top: "-8px",
                                    width: "20px",
                                    zIndex: -1,
                                }}
                            />
                            {/* Small connection dot (:after) */}
                            <div
                                style={{
                                    background: "inherit",
                                    border: "inherit",
                                    borderRadius: "50%",
                                    boxShadow: "inherit",
                                    boxSizing: "border-box",
                                    height: "10px",
                                    left: "-3px",
                                    position: "absolute",
                                    top: "-15px",
                                    width: "10px",
                                    zIndex: -2,
                                }}
                            />

                            {/* Content wrapper */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    maxHeight: "18px",
                                    overflow: "hidden",
                                }}
                            >
                                {customEmoji && (
                                    <span style={{ flexShrink: 0, fontSize: "14px", lineHeight: "14px" }}>
                                        {customEmoji}
                                    </span>
                                )}
                                {customText && (
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            lineHeight: "14px",
                                            fontWeight: 500,
                                            color: t.textSecondary,
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {customText}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Badges container */}
                <div
                    style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 6px",
                        background: isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.6)",
                        borderRadius: "8px",
                        height: "22px",
                        boxSizing: "border-box",
                    }}
                >
                    <span title="Discord Partner" style={{ display: "flex", alignItems: "center" }}>
                        <Icon icon="logos:discord-icon" style={{ width: "13px", height: "13px" }} />
                    </span>
                    <span title="Active Developer" style={{ display: "flex", alignItems: "center" }}>
                        <Icon icon="solar:verified-check-bold" style={{ width: "13px", height: "13px", color: "#5865f2" }} />
                    </span>
                    <span title="Server Booster" style={{ display: "flex", alignItems: "center" }}>
                        <Icon icon="solar:crown-minimalistic-bold-duotone" style={{ width: "13px", height: "13px", color: "#f47fff" }} />
                    </span>
                </div>

                {/* Info block */}
                <div style={{ marginTop: "40px", display: "flex", flexDirection: "column" }}>
                    {/* User display name & tag */}
                    <div>
                        <span style={{ color: t.textPrimary, fontSize: "17px", fontWeight: 700, lineHeight: "20px" }}>
                            {displayName}
                        </span>
                        <div style={{ color: t.textMuted, fontSize: "12px", lineHeight: "16px", fontWeight: 500 }}>
                            @{username}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div
                        style={{
                            display: "flex",
                            gap: "16px",
                            borderBottom: `1px solid ${t.border}`,
                            paddingBottom: "0px",
                            marginTop: "12px",
                            marginBottom: "12px"
                        }}
                    >
                        <div
                            style={{
                                color: t.tabActive,
                                fontSize: "12px",
                                fontWeight: 600,
                                paddingBottom: "6px",
                                borderBottom: `2px solid ${t.tabUnderline}`,
                                cursor: "default"
                            }}
                        >
                            Hồ sơ người dùng
                        </div>
                        <div
                            style={{
                                color: t.tabInactive,
                                fontSize: "12px",
                                fontWeight: 600,
                                paddingBottom: "6px",
                                borderBottom: "2px solid transparent",
                                cursor: "default"
                            }}
                        >
                            Máy chủ chung
                        </div>
                    </div>

                    {/* Inner Panel */}
                    <div
                        style={{
                            background: t.innerBg,
                            borderRadius: "8px",
                            padding: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        {/* About me (Bio) */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ color: t.textMuted, fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>
                                VỀ TÔI
                            </span>
                            <div
                                style={{
                                    color: t.textSecondary,
                                    fontSize: "12px",
                                    lineHeight: "16px",
                                    wordBreak: "break-word",
                                    fontWeight: 400
                                }}
                            >
                                {bio ? renderMarkdown(bio, t) : <span style={{ color: t.textMuted, fontStyle: "italic" }}>Không có tiểu sử.</span>}
                            </div>
                        </div>

                        {/* Member Since */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ color: t.textMuted, fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>
                                THÀNH VIÊN TỪ
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Icon icon="solar:calendar-line-duotone" style={{ width: "15px", height: "15px", color: t.textMuted }} />
                                <span style={{ color: t.textSecondary, fontSize: "12px", fontWeight: 500 }}>
                                    20 thg 12, 2019
                                </span>
                            </div>
                        </div>

                        {/* Activity Section */}
                        {hasActivity && (
                            <>
                                <div style={{ height: "1px", background: t.border, margin: "2px 0" }} />
                                
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <span style={{ color: t.textMuted, fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>
                                        {getActivityHeading()}
                                    </span>

                                    <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
                                        {/* Large/Small images container */}
                                        <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0 }}>
                                            {largeImage ? (
                                                <img
                                                    src={largeImage}
                                                    alt={largeText || "Activity Large Asset"}
                                                    style={{
                                                        width: "48px",
                                                        height: "48px",
                                                        borderRadius: "8px",
                                                        objectFit: "cover",
                                                        background: "black"
                                                    }}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = "none"
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: "48px",
                                                        height: "48px",
                                                        borderRadius: "8px",
                                                        background: t.playBg,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        border: `1px solid ${t.border}`,
                                                    }}
                                                >
                                                    <Icon icon="solar:gamepad-old-line-duotone" style={{ width: "24px", height: "24px", color: t.textMuted }} />
                                                </div>
                                            )}
                                            {smallImage && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        bottom: "-4px",
                                                        right: "-4px",
                                                        width: "18px",
                                                        height: "18px",
                                                        borderRadius: "50%",
                                                        background: t.innerBg,
                                                        padding: "2px",
                                                        boxSizing: "border-box"
                                                    }}
                                                >
                                                    <img
                                                        src={smallImage}
                                                        alt={smallText || "Activity Small Asset"}
                                                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = "none"
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Activity details text */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                                            <span style={{ color: t.textPrimary, fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {activityName}
                                            </span>
                                            {details && (
                                                <span style={{ color: t.textSecondary, fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {details}
                                                </span>
                                            )}
                                            {state && (
                                                <span style={{ color: t.textSecondary, fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {state}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Spotify Progress Bar */}
                                    {isSpotify && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                                            <div style={{ width: "100%", height: "4px", borderRadius: "2px", background: "rgba(255, 255, 255, 0.16)", position: "relative" }}>
                                                <div style={{ width: "42%", height: "100%", borderRadius: "2px", background: "#1db954", position: "absolute", top: 0, left: 0 }} />
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: t.textMuted }}>
                                                <span>1:36</span>
                                                <span>3:54</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Activity Buttons */}
                                    {!isSpotify && (btn1Label || btn2Label) && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                                            {btn1Label && (
                                                <a
                                                    href={btn1Url || "#"}
                                                    onClick={(e) => e.preventDefault()}
                                                    style={{
                                                        width: "100%",
                                                        padding: "6px 12px",
                                                        boxSizing: "border-box",
                                                        background: t.btnBg,
                                                        borderRadius: "4px",
                                                        color: t.btnText,
                                                        fontSize: "12px",
                                                        fontWeight: 600,
                                                        textAlign: "center",
                                                        textDecoration: "none",
                                                        transition: "background 0.2s",
                                                        cursor: "pointer",
                                                        border: "none",
                                                        height: "32px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    }}
                                                    onMouseOver={(e) => {
                                                        (e.currentTarget as HTMLElement).style.background = t.btnHover
                                                    }}
                                                    onMouseOut={(e) => {
                                                        (e.currentTarget as HTMLElement).style.background = t.btnBg
                                                    }}
                                                >
                                                    {btn1Label}
                                                </a>
                                            )}
                                            {btn2Label && (
                                                <a
                                                    href={btn2Url || "#"}
                                                    onClick={(e) => e.preventDefault()}
                                                    style={{
                                                        width: "100%",
                                                        padding: "6px 12px",
                                                        boxSizing: "border-box",
                                                        background: t.btnBg,
                                                        borderRadius: "4px",
                                                        color: t.btnText,
                                                        fontSize: "12px",
                                                        fontWeight: 600,
                                                        textAlign: "center",
                                                        textDecoration: "none",
                                                        transition: "background 0.2s",
                                                        cursor: "pointer",
                                                        border: "none",
                                                        height: "32px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    }}
                                                    onMouseOver={(e) => {
                                                        (e.currentTarget as HTMLElement).style.background = t.btnHover
                                                    }}
                                                    onMouseOut={(e) => {
                                                        (e.currentTarget as HTMLElement).style.background = t.btnBg
                                                    }}
                                                >
                                                    {btn2Label}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Note Section */}
                        <div style={{ height: "1px", background: t.border, margin: "2px 0" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ color: t.textMuted, fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>
                                GHI CHÚ
                            </span>
                            <textarea
                                placeholder="Nhấp để thêm ghi chú..."
                                disabled
                                style={{
                                    width: "100%",
                                    background: "transparent",
                                    border: "none",
                                    fontSize: "11px",
                                    color: t.textSecondary,
                                    outline: "none",
                                    resize: "none",
                                    padding: 0,
                                    height: "36px",
                                    fontFamily: "inherit"
                                }}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default DiscordProfileLivePreview
