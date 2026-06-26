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
    badgeBg: "rgba(0, 0, 0, 0.4)",
    tabActive: "#ffffff",
    tabInactive: "#b5bac1",
    tabUnderline: "#5865f2",
    btnBg: "#4e5058",
    btnText: "#ffffff",
    btnHover: "#6d6f78",
    playBg: "#1f2023",
    activityHeading: "#949ba4",
    linkText: "#00a8fc",
    codeBg: "#2b2d31",
}

const LIGHT = {
    cardBg: "#e3e5e8",
    innerBg: "#ffffff",
    textPrimary: "#060607",
    textSecondary: "#2e3338",
    textMuted: "#5c5e66",
    border: "rgba(0, 0, 0, 0.08)",
    badgeBg: "rgba(255, 255, 255, 0.6)",
    tabActive: "#060607",
    tabInactive: "#5c5e66",
    tabUnderline: "#5865f2",
    btnBg: "#e3e5e8",
    btnText: "#2e3338",
    btnHover: "#d4d7dc",
    playBg: "#f2f3f5",
    activityHeading: "#5c5e66",
    linkText: "#0067e0",
    codeBg: "#f2f3f5",
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
            result.push(<strong key={key} style={{ color: tokens.textPrimary }}>{p.slice(2, -2)}</strong>)
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

    const isDark = mounted ? resolvedTheme === "dark" : true
    const t = isDark ? DARK : LIGHT

    const hasActivity = activityName && activityName.trim().length > 0

    const getActivityHeading = () => {
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
        const strokeColor = t.cardBg
        switch (status) {
            case "online":
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ position: "absolute", bottom: "-2px", right: "-2px" }}>
                        <circle cx="12" cy="12" r="10" fill={strokeColor} />
                        <circle cx="12" cy="12" r="6" fill="#23a55a" />
                    </svg>
                )
            case "idle":
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ position: "absolute", bottom: "-2px", right: "-2px" }}>
                        <circle cx="12" cy="12" r="10" fill={strokeColor} />
                        <circle cx="12" cy="12" r="6" fill="#f0b232" />
                        <circle cx="9.5" cy="9.5" r="5.5" fill={strokeColor} />
                    </svg>
                )
            case "dnd":
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ position: "absolute", bottom: "-2px", right: "-2px" }}>
                        <circle cx="12" cy="12" r="10" fill={strokeColor} />
                        <circle cx="12" cy="12" r="6" fill="#f23f43" />
                        <rect x="8" y="11" width="8" height="2" rx="0.5" fill={strokeColor} />
                    </svg>
                )
            default:
                // offline/invisible
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ position: "absolute", bottom: "-2px", right: "-2px" }}>
                        <circle cx="12" cy="12" r="10" fill={strokeColor} />
                        <circle cx="12" cy="12" r="6" fill="#80848e" />
                        <circle cx="12" cy="12" r="3" fill={strokeColor} />
                    </svg>
                )
        }
    }

    return (
        <div
            style={{
                fontFamily: "'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                width: "100%",
                maxWidth: "300px",
                borderRadius: "12px",
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
                    height: "60px",
                    width: "100%",
                    backgroundColor: bannerColor,
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
                        top: "-42px",
                        left: "10px",
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background: t.cardBg,
                        padding: "5px",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            overflow: "hidden",
                            background: "#5865F2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative"
                        }}
                    >
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
                            <svg width="34" height="34" viewBox="0 0 127.14 96.36" fill="white">
                                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.87-.64,1.71-1.32,2.51-2a75.76,75.76,0,0,0,65.88,0c.8,0.7,1.64,1.38,2.51,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.2,54.65,123.68,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
                            </svg>
                        )}
                    </div>
                    {renderStatusBadge()}
                </div>

                {/* Badges container */}
                <div
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px",
                        background: t.badgeBg,
                        borderRadius: "4px",
                        border: `1px solid ${t.border}`,
                        height: "22px",
                        boxSizing: "border-box",
                    }}
                >
                    <span title="Discord Partner" style={{ display: "flex", alignItems: "center" }}><Icon icon="logos:discord-icon" style={{ width: "13px", height: "13px" }} /></span>
                    <span title="Active Developer" style={{ display: "flex", alignItems: "center" }}><Icon icon="solar:verified-check-bold" style={{ width: "13px", height: "13px", color: "#3898fc" }} /></span>
                    <span title="Server Booster" style={{ display: "flex", alignItems: "center" }}><Icon icon="solar:crown-minimalistic-bold-duotone" style={{ width: "13px", height: "13px", color: "#f0b232" }} /></span>
                </div>

                {/* Info block */}
                <div style={{ marginTop: "36px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* User display name & tag */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ color: t.textPrimary, fontSize: "15px", fontWeight: 700, lineHeight: "18px" }}>
                                {displayName}
                            </span>
                        </div>
                        <div style={{ color: t.textMuted, fontSize: "11px", lineHeight: "14px", fontWeight: 500 }}>
                            @{username}
                        </div>
                    </div>

                    {/* Custom Status */}
                    {(customEmoji || customText) && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 8px",
                                background: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                                borderRadius: "4px",
                                border: `1px solid ${t.border}`,
                                color: t.textSecondary,
                                fontSize: "11px",
                                lineHeight: "14px",
                            }}
                        >
                            {customEmoji && (
                                <span style={{ flexShrink: 0, fontSize: "13px" }}>
                                    {customEmoji}
                                </span>
                            )}
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {customText}
                            </span>
                        </div>
                    )}

                    {/* Inner Panel */}
                    <div
                        style={{
                            background: t.innerBg,
                            borderRadius: "8px",
                            padding: "10px",
                            border: `1px solid ${t.border}`,
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                        }}
                    >
                        {/* About me (Bio) */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <span style={{ color: t.textPrimary, fontSize: "9px", fontWeight: 700, letterSpacing: "0.5px" }}>
                                ABOUT ME
                            </span>
                            <div
                                style={{
                                    color: t.textSecondary,
                                    fontSize: "11px",
                                    lineHeight: "15px",
                                    wordBreak: "break-word",
                                    fontWeight: 400
                                }}
                            >
                                {bio ? renderMarkdown(bio, t) : <span style={{ color: t.textMuted, fontStyle: "italic" }}>Không có tiểu sử.</span>}
                            </div>
                        </div>

                        {/* Member Since */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <span style={{ color: t.textPrimary, fontSize: "9px", fontWeight: 700, letterSpacing: "0.5px" }}>
                                MEMBER SINCE
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Icon icon="solar:calendar-line-duotone" style={{ width: "14px", height: "14px", color: t.textMuted }} />
                                <span style={{ color: t.textSecondary, fontSize: "11px", fontWeight: 500 }}>
                                    Dec 20, 2019
                                </span>
                            </div>
                        </div>

                        {/* Activity Section */}
                        {hasActivity && (
                            <>
                                <div style={{ height: "1px", background: t.border, margin: "2px 0" }} />
                                
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <span style={{ color: t.textPrimary, fontSize: "9px", fontWeight: 700, letterSpacing: "0.5px" }}>
                                        {getActivityHeading()}
                                    </span>

                                    <div style={{ display: "flex", gap: "8px", alignItems: "start" }}>
                                        {/* Large/Small images container */}
                                        <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0 }}>
                                            {largeImage ? (
                                                <img
                                                    src={largeImage}
                                                    alt={largeText || "Activity Large Asset"}
                                                    style={{
                                                        width: "48px",
                                                        height: "48px",
                                                        borderRadius: "6px",
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
                                                        borderRadius: "6px",
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
                                                        bottom: "-3px",
                                                        right: "-3px",
                                                        width: "18px",
                                                        height: "18px",
                                                        borderRadius: "50%",
                                                        background: t.innerBg,
                                                        padding: "1.5px",
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
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1px", overflow: "hidden" }}>
                                            <span style={{ color: t.textPrimary, fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {activityName}
                                            </span>
                                            {details && (
                                                <span style={{ color: t.textSecondary, fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {details}
                                                </span>
                                            )}
                                            {state && (
                                                <span style={{ color: t.textSecondary, fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {state}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Activity Buttons */}
                                    {(btn1Label || btn2Label) && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
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
                                                        fontSize: "11px",
                                                        fontWeight: 600,
                                                        textAlign: "center",
                                                        textDecoration: "none",
                                                        transition: "background 0.2s",
                                                        cursor: "pointer",
                                                        border: `1px solid ${t.border}`,
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
                                                        fontSize: "11px",
                                                        fontWeight: 600,
                                                        textAlign: "center",
                                                        textDecoration: "none",
                                                        transition: "background 0.2s",
                                                        cursor: "pointer",
                                                        border: `1px solid ${t.border}`,
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
                        </div>
                    </div>
                </div>
            </div>
        )
    }

export default DiscordProfileLivePreview
