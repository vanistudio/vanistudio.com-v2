/**
 * Định nghĩa cấu trúc cấu hình mặc định cho các Extensions (Modules) của hệ thống.
 * File này giúp lưu trữ các cấu trúc config mẫu để seed database hoặc đồng bộ khi khởi chạy app.
 */

// 1. Interface cấu hình chi tiết cho từng Extension cụ thể
export interface RegistrationFieldsConfig {
  fields: {
    identityCard: { show: boolean; required: boolean; label: string };
    taxId: { show: boolean; required: boolean; label: string };
    phone: { show: boolean; required: boolean; label: string };
    address: { show: boolean; required: boolean; label: string };
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

// 2. Interface chung cho một Extension bản ghi
export interface DefaultExtension {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  config: Record<string, any>;
}

// 3. Danh sách các Extension mặc định được đăng ký sẵn trong hệ thống
export const DEFAULT_EXTENSIONS: DefaultExtension[] = [
  {
    id: "user_registration_customizer",
    name: "Tùy biến Form Đăng ký",
    description: "Cấu hình hiển thị và yêu cầu bắt buộc nhập các trường thông tin mở rộng của người dùng (CCCD, Mã số thuế, Điện thoại, Địa chỉ...) khi đăng ký.",
    isEnabled: true, // Mặc định bật tính năng tùy biến này
    config: {
      fields: {
        identityCard: { show: false, required: false, label: "Căn cước công dân" },
        taxId: { show: false, required: false, label: "Mã số thuế" },
        phone: { show: true, required: true, label: "Số điện thoại" },
        address: { show: true, required: false, label: "Địa chỉ" },
      },
      requireEmailVerification: false,
      allowSocialLogin: true,
    } as RegistrationFieldsConfig,
  },
  {
    id: "payment_momo",
    name: "Cổng thanh toán MoMo",
    description: "Tích hợp cổng ví điện tử MoMo thanh toán quét mã QR.",
    isEnabled: false, // Mặc định tắt cho đến khi cấu hình Partner Credential
    config: {
      partnerCode: "",
      accessKey: "",
      secretKey: "",
      environment: "sandbox",
    } as MomoPaymentConfig,
  },
  {
    id: "payment_vnpay",
    name: "Cổng thanh toán VNPay",
    description: "Tích hợp cổng VNPay hỗ trợ thẻ ATM nội địa, thẻ quốc tế và mã QR ngân hàng.",
    isEnabled: false,
    config: {
      tmnCode: "",
      hashKey: "",
      environment: "sandbox",
    } as VNPayPaymentConfig,
  },
];
