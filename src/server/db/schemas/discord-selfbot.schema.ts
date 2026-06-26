import { pgTable, text, timestamp, boolean, jsonb, integer, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.schema";

// 1. Nhóm tài khoản Discord (Cho phép quản lý hàng loạt theo Group/Farm)
export const discordAccountGroups = pgTable("discord_account_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Ví dụ: "Farm 1 - Spammer", "Nick Chính", "Clone Mua Bán"
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Tài khoản Discord (Tokens)
export const discordAccounts = pgTable("discord_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Thông tin đăng nhập & xác thực (Phục vụ tự động đăng nhập lại và lấy Token mới khi Token cũ bị Die/Reset)
  token: text("token").notNull(), // Token Discord hiện tại (Đã mã hóa đối xứng)
  email: text("email"), // Email của tài khoản Discord (Nếu muốn tự động đăng nhập)
  password: text("password"), // Mật khẩu của tài khoản Discord (Đã mã hóa đối xứng)
  twoFactorSecret: text("two_factor_secret"), // 2FA Secret Key (Base32) để tự động tạo mã TOTP khi đăng nhập
  backupCodes: jsonb("backup_codes").$type<string[]>().default([]).notNull(), // Mã sao lưu phòng khi lỗi TOTP

  // Thông tin định danh tài khoản Discord
  discordId: text("discord_id"), // Discord User ID (snowflake)
  username: text("username"), // Username Discord
  discriminator: text("discriminator"), // Tag số (e.g. 0001) hoặc null đối với hệ thống username mới
  globalName: text("global_name"), // Tên hiển thị (Display Name)
  avatar: text("avatar"), // Mã hash avatar hoặc URL ảnh đại diện
  banner: text("banner"), // Mã hash banner hoặc URL ảnh banner
  accentColor: text("accent_color"), // Màu chủ đạo của profile (hex hoặc int)

  // Trạng thái tài khoản và thông số cấu hình an toàn
  status: text("status").default("active").notNull(), // active, invalid, rate_limited, phone_lock (kẹt xác minh SĐT), captcha_lock, suspended
  phone: text("phone"), // Số điện thoại liên kết (nếu có)
  hasMfa: boolean("has_mfa").default(false).notNull(), // Tài khoản có bật bảo mật 2 lớp không
  verified: boolean("verified").default(false).notNull(), // Tài khoản đã xác minh email chưa
  nitroType: text("nitro_type").default("None").notNull(), // None, Nitro Classic, Nitro Boost, Nitro Basic

  // Cấu hình Proxy chống quét IP (socks5://user:pass@ip:port hoặc http://...)
  proxy: text("proxy"),
  proxyStatus: text("proxy_status").default("unknown").notNull(), // active, dead, unknown
  lastProxyCheckAt: timestamp("last_proxy_check_at", { withTimezone: true }),

  // Thời gian hoạt động cuối cùng để kiểm soát tần suất gửi request (Rate limiting)
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),

  // Cấu hình client giả lập chi tiết chuẩn Discord Gateway để lách màng lọc phát hiện bot của Discord
  clientSettings: jsonb("client_settings").$type<{
    userAgent?: string; // Browser User-Agent string
    browser?: string; // Chrome, Firefox, Discord Client
    os?: string; // Windows, OS X, Linux, iOS, Android
    osVersion?: string; // Phiên bản hệ điều hành (ví dụ: "10.0.0")
    browserVersion?: string; // Phiên bản trình duyệt (ví dụ: "120.0.0")
    device?: string; // Tên thiết bị (nếu là Mobile)
    locale?: string; // Ngôn ngữ cấu hình (vi-VN, en-US)
    releaseChannel?: "stable" | "ptb" | "canary"; // Kênh phát hành client
    clientBuildNumber?: number; // Số Build hiện tại của Client Discord (Cực kỳ quan trọng để lách quét client cũ)
    capabilities?: number; // Cấu hình tính năng client hỗ trợ
  }>().default({}).notNull(),

  // Custom Tags/Meta để phân loại tài khoản
  tags: jsonb("tags").$type<string[]>().default([]).notNull(), 
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Bảng trung gian ánh xạ tài khoản vào nhóm (Many-to-Many)
export const discordAccountGroupMappings = pgTable("discord_account_group_mappings", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => discordAccounts.id, { onDelete: "cascade" }),
  groupId: uuid("group_id")
    .notNull()
    .references(() => discordAccountGroups.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Cấu hình Trạng thái & Rich Presence (Độ tùy biến siêu cao)
// Hỗ trợ hiển thị đồng thời cả Custom Status + RPC (Playing, Streaming, Listening...)
export const discordPresencePresets = pgTable("discord_presence_presets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Tên cấu hình mẫu
  
  // Trạng thái online: online, idle, dnd, invisible
  onlineStatus: text("online_status").default("online").notNull(),
  
  // Custom Status (Ví dụ: "Đang bận học bài 📝")
  customStatusText: text("custom_status_text"),
  customStatusEmoji: text("custom_status_emoji"), // Emoji name hoặc unicode
  customStatusExpiry: text("custom_status_expiry"), // Thời gian hết hạn custom status
  
  // Rich Presence Activities (Mảng các hoạt động đồng thời - Discord hỗ trợ nhiều hoạt động cùng lúc)
  activities: jsonb("activities").$type<Array<{
    type: number; // 0: Playing, 1: Streaming, 2: Listening, 3: Watching, 5: Competing
    name: string; // Tên game / Ứng dụng hiển thị chính
    applicationId?: string; // Client ID ứng dụng Discord (cho Rich Presence đầy đủ)
    details?: string; // Dòng chi tiết 1
    state?: string; // Dòng chi tiết 2
    largeImageKey?: string; // Key ảnh lớn hoặc URL ảnh
    largeText?: string;
    smallImageKey?: string; // Key ảnh nhỏ hoặc URL ảnh
    smallText?: string;
    party?: {
      id?: string;
      current?: number;
      max?: number;
    };
    timestamps?: {
      start?: number; // Epoch timestamp ms - Bắt đầu chơi game lúc...
      end?: number; // Epoch timestamp ms
    };
    buttons?: Array<{ label: string; url: string }>;
    streamUrl?: string; // Url stream nếu type = 1
  }>>().default([]).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Bộ xoay trạng thái tự động (Rotators)
// Cho phép xoay vòng (Rotate) nhiều trạng thái/cấu hình khác nhau sau mỗi khoảng thời gian
export const discordPresenceRotators = pgTable("discord_presence_rotators", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  intervalSeconds: integer("interval_seconds").default(300).notNull(), // Chu kỳ xoay vòng (giây)
  
  // Danh sách các Preset IDs sẽ xoay vòng theo thứ tự hoặc ngẫu nhiên
  presetIds: jsonb("preset_ids").$type<string[]>().default([]).notNull(),
  randomize: boolean("randomize").default(false).notNull(), // Xoay ngẫu nhiên hay tuần tự

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 5. Tự động hóa & Kích hoạt tác vụ (Schedulers & Automations)
// Đạt độ tùy biến siêu cao thông qua Triggers và Action chains (ví dụ: Tự động đổi Bio theo giờ, tự động đổi avatar, ...)
export const discordSelfbotAutomations = pgTable("discord_selfbot_automations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  
  // Loại Trigger kích hoạt:
  // - time_schedule: Hẹn giờ (dùng cron hoặc giờ cố định)
  // - interval: Lặp lại mỗi N giây/phút
  // - event: Dựa trên sự kiện Discord (ví dụ: khi nhận DM, khi bị tag, khi token bị lỗi)
  triggerType: text("trigger_type").notNull(),
  
  // Cấu hình chi tiết của Trigger (ví dụ: { cron: "0 8 * * *", targetGroupIds: [...] })
  triggerConfig: jsonb("trigger_config").$type<{
    cron?: string; // Biểu thức cron
    intervalMinutes?: number;
    eventName?: string; // dm_received, mention_received, token_invalid
    targetGroupIds?: string[]; // Áp dụng cho nhóm tài khoản nào (null = tất cả)
    targetAccountIds?: string[]; // Áp dụng cho các tài khoản cụ thể nào
  }>().notNull(),
  
  // Danh sách các hành động sẽ được thực hiện khi trigger chạy (Action Chains)
  // Cho phép kết hợp thay đổi nhiều thứ cùng lúc hoặc tuần tự.
  actions: jsonb("actions").$type<Array<{
    // action: change_status, change_avatar, change_bio, change_username, change_hypesquad, apply_rpc_preset, auto_reply, send_webhook
    actionType: string; 
    
    // Cấu hình cho hành động đó
    // Ví dụ đổi bio: { bioText: "Bây giờ là {{time}}" } -> Hỗ trợ placeholder động!
    // Ví dụ auto_reply: { keywords: ["hello", "hi"], replyText: "Chào bạn, mình đang bận!" }
    // Ví dụ change_avatar: { imageUrl: "https://..." hoặc chọn từ gallery }
    // Ví dụ apply_rpc_preset: { presetId: "uuid..." }
    config: Record<string, any>; 
  }>>().default([]).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 6. Quản lý trạng thái phiên chạy hiện tại của từng Token (Active Sessions)
export const discordSelfbotSessions = pgTable("discord_selfbot_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => discordAccounts.id, { onDelete: "cascade" })
    .unique(),
  
  // Trạng thái chạy hiện tại
  isRunning: boolean("is_running").default(false).notNull(),
  
  // Chế độ chạy:
  // - static_preset: Áp dụng một preset cố định
  // - rotator: Chạy theo vòng xoay rotator
  // - automation_only: Chỉ kích hoạt khi có automation trigger
  mode: text("mode").default("static_preset").notNull(),
  
  // ID cấu hình đang được áp dụng trực tiếp (nếu có)
  activePresetId: uuid("active_preset_id").references(() => discordPresencePresets.id, { onDelete: "set null" }),
  activeRotatorId: uuid("active_rotator_id").references(() => discordPresenceRotators.id, { onDelete: "set null" }),
  
  // Thông tin kỹ thuật phục vụ worker chạy ngầm
  workerPid: integer("worker_pid"), // ID tiến trình đang xử lý kết nối WebSocket (nếu chạy nền bằng child_process/worker)
  lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true }),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 7. Nhật ký hoạt động chi tiết (Audit & Activity Logs)
export const discordSelfbotLogs = pgTable("discord_selfbot_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => discordAccounts.id, { onDelete: "cascade" }),
  
  actionType: text("action_type").notNull(), // change_avatar, change_bio, rpc_update, auto_reply, trigger_fired...
  status: text("status").notNull(), // success, failed, warning
  
  message: text("message").notNull(), // Nội dung tóm tắt: "Đã cập nhật trạng thái tùy chỉnh thành công"
  details: jsonb("details"), // Log chi tiết JSON hoặc Response từ Discord API / Lỗi rate limit
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type DiscordAccountGroup = typeof discordAccountGroups.$inferSelect;
export type DiscordAccount = typeof discordAccounts.$inferSelect;
export type DiscordPresencePreset = typeof discordPresencePresets.$inferSelect;
export type DiscordPresenceRotator = typeof discordPresenceRotators.$inferSelect;
export type DiscordSelfbotAutomation = typeof discordSelfbotAutomations.$inferSelect;
export type DiscordSelfbotSession = typeof discordSelfbotSessions.$inferSelect;
export type DiscordSelfbotLog = typeof discordSelfbotLogs.$inferSelect;
