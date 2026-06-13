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
];
