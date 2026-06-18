export interface RegistrationFieldsConfig {
  fields: {
    email: { show: boolean; required: boolean; label: string };
    name: { show: boolean; required: boolean; label: string };
    username: { show: boolean; required: boolean; label: string };
    identityCard: { show: boolean; required: boolean; label: string };
    taxId: { show: boolean; required: boolean; label: string };
    phone: { show: boolean; required: boolean; label: string };
    address1: { show: boolean; required: boolean; label: string };
    address2: { show: boolean; required: boolean; label: string };
    city: { show: boolean; required: boolean; label: string };
    district: { show: boolean; required: boolean; label: string };
    state: { show: boolean; required: boolean; label: string };
    postalCode: { show: boolean; required: boolean; label: string };
    country: { show: boolean; required: boolean; label: string };
  };
  requireEmailVerification: boolean;
  allowSocialLogin: boolean;
  passwordValidation?: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSpecialChar: boolean;
  };
  usernameValidation?: {
    minLength: number;
    maxLength: number;
    allowedCharacters: "lowercase_alphanumeric" | "alphanumeric" | "all";
  };
  emailValidation?: {
    allowedDomains: string[];
  };
  uiConfig?: {
    title?: string;
    description?: string;
    submitButtonText?: string;
  };
}

export interface LoginFieldsConfig {
  allowedMethods: {
    email: boolean;
    phone: boolean;
    username: boolean;
  };
  rememberMe: {
    enabled: boolean;
    defaultChecked: boolean;
  };
  forgotPasswordEnabled?: boolean;
  showRegisterLink?: boolean;
  allowSocialLogin?: boolean;
  uiConfig?: {
    title?: string;
    description?: string;
    submitButtonText?: string;
  };
}

export interface MomoPaymentConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  environment: "sandbox" | "production";
}

export interface VNPayPaymentConfig {
  tmnCode: string;
  hashKey: string;
  environment: "sandbox" | "production";
}

export interface OauthProviderItem {
  clientId: string;
  clientSecret: string;
  isEnabled: boolean;
}

export interface OauthProvidersConfig {
  google: OauthProviderItem;
  discord: OauthProviderItem;
  github: OauthProviderItem;
  gitlab: OauthProviderItem;
  zalo: OauthProviderItem;
}

export interface CaptchaConfig {
  siteGoogleV2: { siteStatus: boolean; siteKey: string; siteSecretKey: string; siteAppliedFunctions: string[] };
  siteCloudflare: { siteStatus: boolean; siteKey: string; siteSecretKey: string; siteAppliedFunctions: string[] };
  siteHCaptcha: { siteStatus: boolean; siteKey: string; siteSecretKey: string; siteAppliedFunctions: string[] };
}

export interface AnalyticsMarketingConfig {
  googleAnalytics: {
    measurementId: string;
    isEnabled: boolean;
  };
  googleAdsRemarketing: {
    conversionId: string;
    label: string;
    isEnabled: boolean;
  };
}

export interface StorageConfig {
  siteActiveStorage: "local" | "cloudinary" | "r2" | "tigris";
  siteCloudinary: {
    siteCloudName: string;
    siteApiKey: string;
    siteApiSecret: string;
  };
  siteR2: {
    siteAccountId: string;
    siteAccessKeyId: string;
    siteSecretAccessKey: string;
    siteBucketName: string;
    sitePublicUrl: string;
  };
  siteTigris: {
    siteAccessKeyId: string;
    siteSecretAccessKey: string;
    siteBucketName: string;
  };
  siteImageProcessing: {
    enabled: boolean;
    convertToWebp: boolean;
    convertFormats: string[];
    quality: number;
    maxWidth: number;
    maxHeight: number;
    stripMetadata: boolean;
    progressive: boolean;
    preserveOriginal: boolean;
  };
}

export interface SecuritySettingsConfig {
  rateLimit: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  ipSpamProtection: {
    enabled: boolean;
    apiSpamLimit: number;
    banDurationMs: number;
  };
  bruteForceProtection: {
    enabled: boolean;
    maxPasswordAttempts: number;
    lockoutDurationMs: number;
  };
  sessionSecurity: {
    restrictMultipleSessions: boolean;
    ipChangeDetection: boolean;
    userAgentChangeDetection: boolean;
  };
}

export type ContactFieldType = "text" | "email" | "tel" | "textarea" | "select" | "file";

export interface ContactFieldItem {
  show: boolean;
  required: boolean;
  label: string;
  placeholder?: string;
  type: ContactFieldType;
  options?: string[];
}

export interface CustomFieldItem extends ContactFieldItem {
  key: string;
}

export interface ContactPageCustomizerConfig {
  fields: {
    name: ContactFieldItem;
    email: ContactFieldItem;
    phone: ContactFieldItem;
    company: ContactFieldItem;
    subject: ContactFieldItem;
    message: ContactFieldItem;
    attachments: ContactFieldItem & {
      maxFiles: number;
      maxSizeMb: number;
      allowedExtensions: string[];
    };
    customFields: CustomFieldItem[];
  };
  socialChannels: {
    address: { show: boolean; value: string; label: string; icon: string; mapUrl?: string };
    phone: { show: boolean; value: string; label: string; icon: string };
    email: { show: boolean; value: string; label: string; icon: string };
    zalo: { show: boolean; value: string; label: string; icon: string };
    facebook: { show: boolean; value: string; label: string; icon: string };
    mapEmbedUrl: { show: boolean; value: string; height: number };
    workingHours: { show: boolean; value: string; label: string; icon: string };
  };
  destination: {
    saveToDb: boolean;
    sendToEmails: {
      enabled: boolean;
      addresses: string[];
    };
    telegram: {
      isEnabled: boolean;
      botToken: string;
      chatId: string;
      sendFormat: "text" | "markdown" | "html";
    };
    discord: {
      isEnabled: boolean;
      webhookUrl: string;
      avatarUrl?: string;
      username?: string;
    };
  };
  autoResponder: {
    enabled: boolean;
    senderName: string;
    senderEmail: string;
    subject: string;
    bodyMdx: string;
  };
  uiConfig: {
    title: string;
    description: string;
    submitButtonText: string;
    loadingButtonText: string;
    successTitle: string;
    successMessage: string;
    layout: "split_form_left" | "split_form_right" | "centered_card" | "full_width";
    colorTheme: "default" | "brand" | "glassmorphism";
  };
}

export interface DefaultExtension {
  id: string;
  name: string;
  description: string;
  isEnabled?: boolean;
  config: Record<string, any>;
}

export const DEFAULT_EXTENSIONS: DefaultExtension[] = [
  {
    id: "user_registration_customizer",
    name: "Tùy biến Form Đăng ký",
    description: "Cấu hình hiển thị và yêu cầu bắt buộc nhập các trường thông tin mở rộng của người dùng (CCCD, Mã số thuế, Điện thoại, Địa chỉ...) khi đăng ký.",
    isEnabled: true,
    config: {
      fields: {
        email: { show: true, required: true, label: "Địa chỉ Email" },
        name: { show: true, required: true, label: "Họ và tên" },
        username: { show: true, required: false, label: "Tên đăng nhập" },
        identityCard: { show: false, required: false, label: "Căn cước công dân" },
        taxId: { show: false, required: false, label: "Mã số thuế" },
        phone: { show: true, required: true, label: "Số điện thoại" },
        address1: { show: true, required: false, label: "Địa chỉ dòng 1" },
        address2: { show: false, required: false, label: "Địa chỉ dòng 2" },
        city: { show: true, required: false, label: "Thành phố" },
        district: { show: false, required: false, label: "Quận/Huyện" },
        state: { show: false, required: false, label: "Tỉnh/Bang" },
        postalCode: { show: false, required: false, label: "Mã bưu chính" },
        country: { show: true, required: false, label: "Quốc gia" },
      },
      requireEmailVerification: false,
      allowSocialLogin: true,
      passwordValidation: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialChar: true,
      },
      usernameValidation: {
        minLength: 4,
        maxLength: 20,
        allowedCharacters: "lowercase_alphanumeric",
      },
      emailValidation: {
        allowedDomains: [],
      },
      uiConfig: {
        title: "Đăng ký tài khoản",
        description: "Tạo tài khoản mới để trải nghiệm dịch vụ.",
        submitButtonText: "Đăng ký",
      },
    } as RegistrationFieldsConfig,
  },
  {
    id: "user_login_customizer",
    name: "Tùy biến Form Đăng nhập",
    description: "Cấu hình phương thức đăng nhập và giao diện của trang đăng nhập thành viên.",
    config: {
      allowedMethods: {
        email: true,
        phone: true,
        username: true,
      },
      rememberMe: {
        enabled: true,
        defaultChecked: true,
      },
      forgotPasswordEnabled: true,
      showRegisterLink: true,
      allowSocialLogin: true,
      uiConfig: {
        title: "Đăng nhập",
        description: "Đăng nhập tài khoản của bạn để tiếp tục.",
        submitButtonText: "Đăng nhập",
      },
    } as LoginFieldsConfig,
  },
  {
    id: "oauth_providers",
    name: "Cấu hình Social Login (OAuth)",
    description: "Cấu hình đăng nhập bằng tài khoản mạng xã hội như Google, Discord, GitHub, GitLab và Zalo.",
    isEnabled: false,
    config: {
      google: { clientId: "", clientSecret: "", isEnabled: false },
      discord: { clientId: "", clientSecret: "", isEnabled: false },
      github: { clientId: "", clientSecret: "", isEnabled: false },
      gitlab: { clientId: "", clientSecret: "", isEnabled: false },
    } as OauthProvidersConfig,
  },
  {
    id: "captcha_provider",
    name: "Cấu hình bảo mật CAPTCHA",
    description: "Tích hợp Google reCAPTCHA, Cloudflare Turnstile, hoặc hCaptcha chống spam/bot.",
    isEnabled: false,
    config: {
      siteGoogleV2: { siteStatus: false, siteKey: "", siteSecretKey: "", siteAppliedFunctions: [] },
      siteCloudflare: { siteStatus: false, siteKey: "", siteSecretKey: "", siteAppliedFunctions: [] },
      siteHCaptcha: { siteStatus: false, siteKey: "", siteSecretKey: "", siteAppliedFunctions: [] },
    } as CaptchaConfig,
  },
  {
    id: "analytics_marketing",
    name: "Cấu hình Analytics & Marketing",
    description: "Tích hợp Google Analytics (GA4) và Google Ads Remarketing để theo dõi lượng truy cập và tối ưu quảng cáo.",
    isEnabled: false,
    config: {
      googleAnalytics: { measurementId: "", isEnabled: false },
      googleAdsRemarketing: { conversionId: "", label: "", isEnabled: false },
    } as AnalyticsMarketingConfig,
  },
  {
    id: "storage_config",
    name: "Cấu hình Lưu trữ & Tối ưu hình ảnh",
    description: "Cấu hình lưu trữ đám mây (Cloudinary, Cloudflare R2, Tigris) hoặc lưu trữ cục bộ (Local), đi kèm với các thiết lập xử lý và tối ưu hóa hình ảnh tải lên.",
    isEnabled: true,
    config: {
      siteActiveStorage: "local",
      siteCloudinary: { siteCloudName: "", siteApiKey: "", siteApiSecret: "" },
      siteR2: { siteAccountId: "", siteAccessKeyId: "", siteSecretAccessKey: "", siteBucketName: "", sitePublicUrl: "" },
      siteTigris: { siteAccessKeyId: "", siteSecretAccessKey: "", siteBucketName: "" },
      siteImageProcessing: {
        enabled: false,
        convertToWebp: true,
        convertFormats: ["png", "jpg", "jpeg", "bmp", "tiff"],
        quality: 80,
        maxWidth: 1920,
        maxHeight: 1080,
        stripMetadata: true,
        progressive: true,
        preserveOriginal: false,
      },
    } as StorageConfig,
  },
  {
    id: "security_settings",
    name: "Cấu hình Bảo mật hệ thống",
    description: "Cấu hình các cơ chế tự động phòng chống spam, brute force tài khoản, giới hạn request và bảo vệ phiên đăng nhập người dùng.",
    isEnabled: true,
    config: {
      rateLimit: {
        enabled: true,
        maxRequests: 120,
        windowMs: 60000,
      },
      ipSpamProtection: {
        enabled: true,
        apiSpamLimit: 5,
        banDurationMs: 3600000,
      },
      bruteForceProtection: {
        enabled: true,
        maxPasswordAttempts: 5,
        lockoutDurationMs: 900000,
      },
      sessionSecurity: {
        restrictMultipleSessions: false,
        ipChangeDetection: true,
        userAgentChangeDetection: true,
      },
    } as SecuritySettingsConfig,
  },
  /*
  // TODO: Sẽ làm sau - contact_page_customizer
  {
    id: "contact_page_customizer",
    name: "Tùy biến Trang Liên hệ",
    description: "Cấu hình chi tiết các trường dữ liệu biểu mẫu, thông tin liên hệ đa kênh, bản đồ nhúng, cài đặt email và các kênh thông báo tự động (Telegram, Discord).",
    isEnabled: true,
    config: {
      fields: {
        name: { show: true, required: true, label: "Họ và tên", placeholder: "Nhập họ và tên của bạn", type: "text" },
        email: { show: true, required: true, label: "Địa chỉ Email", placeholder: "example@gmail.com", type: "email" },
        phone: { show: true, required: false, label: "Số điện thoại", placeholder: "Nhập số điện thoại liên hệ", type: "tel" },
        company: { show: false, required: false, label: "Tên công ty", placeholder: "Tên doanh nghiệp của bạn", type: "text" },
        subject: { show: true, required: true, label: "Tiêu đề liên hệ", placeholder: "Bạn cần hỗ trợ về vấn đề gì?", type: "text" },
        message: { show: true, required: true, label: "Nội dung lời nhắn", placeholder: "Mô tả chi tiết yêu cầu của bạn...", type: "textarea" },
        attachments: {
          show: false,
          required: false,
          label: "Tài liệu đính kèm",
          type: "file",
          maxFiles: 3,
          maxSizeMb: 5,
          allowedExtensions: ["png", "jpg", "jpeg", "pdf", "zip", "rar"]
        },
        customFields: []
      },
      socialChannels: {
        address: { show: true, value: "123 Đường Tôn Đức Thắng, Quận 1, TP. Hồ Chí Minh", label: "Trụ sở chính", icon: "solar:map-point-line-duotone" },
        phone: { show: true, value: "0900.123.456", label: "Hotline hỗ trợ", icon: "solar:phone-calling-line-duotone" },
        email: { show: true, value: "support@vanistudio.com", label: "Email liên hệ", icon: "solar:letter-line-duotone" },
        zalo: { show: true, value: "https://zalo.me/0900123456", label: "Zalo Chat", icon: "solar:chat-round-dots-line-duotone" },
        facebook: { show: true, value: "https://facebook.com/vanistudio", label: "Fanpage", icon: "solar:globus-line-duotone" },
        mapEmbedUrl: { show: true, value: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.509749174542!2d106.70200831526019!3d10.77259466217436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4165555555%3A0x1111111111111111!2sVaniStudio!5e0!3m2!1svi!2svn!4v1624000000000!5m2!1svi!2svn", height: 250 },
        workingHours: { show: true, value: "Thứ 2 - Thứ 6: 08:30 - 17:30", label: "Thời gian làm việc", icon: "solar:clock-square-line-duotone" }
      },
      destination: {
        saveToDb: true,
        sendToEmails: {
          enabled: false,
          addresses: ["admin@vanistudio.com"]
        },
        telegram: {
          isEnabled: false,
          botToken: "",
          chatId: "",
          sendFormat: "markdown"
        },
        discord: {
          isEnabled: false,
          webhookUrl: ""
        }
      },
      autoResponder: {
        enabled: false,
        senderName: "VaniStudio Team",
        senderEmail: "no-reply@vanistudio.com",
        subject: "Cảm ơn bạn đã liên hệ với VaniStudio!",
        bodyMdx: "Chào {{name}},\n\nChúng tôi đã nhận được thông tin liên hệ của bạn về chủ đề: **{{subject}}**.\nĐội ngũ kỹ thuật sẽ xem xét và phản hồi lại bạn trong vòng 24 giờ làm việc.\n\nTrân trọng,\nVaniStudio Team."
      },
      uiConfig: {
        title: "Liên hệ với chúng tôi",
        description: "Chúng tôi luôn sẵn sàng lắng nghe ý kiến và hỗ trợ giải đáp các thắc mắc của bạn.",
        submitButtonText: "Gửi tin nhắn liên hệ",
        loadingButtonText: "Đang gửi thông tin...",
        successTitle: "Gửi thành công!",
        successMessage: "Cảm ơn bạn đã gửi liên hệ. Chúng tôi đã gửi email xác nhận và sẽ phản hồi sớm nhất có thể.",
        layout: "split_form_left",
        colorTheme: "brand"
      }
    } as ContactPageCustomizerConfig,
  },
  */
];
