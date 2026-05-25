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
];
