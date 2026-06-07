export interface RegistrationFieldsConfig {
  fields: {
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
  activeProvider: "none" | "google" | "cloudflare" | "hcaptcha";
  google: { siteKey: string; secretKey: string };
  cloudflare: { siteKey: string; secretKey: string };
  hcaptcha: { siteKey: string; secretKey: string };
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
  isEnabled: boolean;
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
        identityCard: { show: false, required: false, label: "Căn cước công dân" },
        taxId: { show: false, required: false, label: "Mã số thuế" },
        phone: { show: true, required: true, label: "Số điện thoại" },
        address1: { show: true, required: false, label: "Địa chỉ dòng 1" },
        address2: { show: false, required: false, label: "Địa chỉ dòng 2" },
        city: { show: true, required: false, label: "Thành phố" },
        district: { show: true, required: false, label: "Quận/Huyện" },
        state: { show: false, required: false, label: "Tỉnh/Bang" },
        postalCode: { show: false, required: false, label: "Mã bưu chính" },
        country: { show: true, required: false, label: "Quốc gia" },
      },
      requireEmailVerification: false,
      allowSocialLogin: true,
    } as RegistrationFieldsConfig,
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
      zalo: { clientId: "", clientSecret: "", isEnabled: false },
    } as OauthProvidersConfig,
  },
  {
    id: "captcha_provider",
    name: "Cấu hình bảo mật CAPTCHA",
    description: "Tích hợp Google reCAPTCHA, Cloudflare Turnstile, hoặc hCaptcha chống spam/bot.",
    isEnabled: false,
    config: {
      activeProvider: "none",
      google: { siteKey: "", secretKey: "" },
      cloudflare: { siteKey: "", secretKey: "" },
      hcaptcha: { siteKey: "", secretKey: "" },
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
