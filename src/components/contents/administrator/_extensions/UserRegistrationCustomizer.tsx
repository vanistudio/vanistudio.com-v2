"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { type RegistrationFieldsConfig } from "@/defaults/extension.default";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  config: RegistrationFieldsConfig;
  onConfigChange: (config: Partial<RegistrationFieldsConfig>) => void;
}

const FIELD_METADATA: Record<
  string,
  { name: string; category: string; icon: string; theme: string }
> = {
  email: {
    name: "Địa chỉ Email",
    category: "Tài khoản",
    icon: "solar:letter-line-duotone",
    theme: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  name: {
    name: "Họ và tên",
    category: "Cá nhân",
    icon: "solar:user-rounded-line-duotone",
    theme: "text-teal-500 bg-teal-500/10 border-teal-500/20",
  },
  username: {
    name: "Tên đăng nhập",
    category: "Tài khoản",
    icon: "solar:shield-user-line-duotone",
    theme: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  },
  identityCard: {
    name: "Căn cước công dân (CCCD)",
    category: "Cá nhân",
    icon: "solar:user-id-line-duotone",
    theme: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  phone: {
    name: "Số điện thoại",
    category: "Cá nhân",
    icon: "solar:phone-line-duotone",
    theme: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  taxId: {
    name: "Mã số thuế",
    category: "Doanh nghiệp",
    icon: "solar:document-text-line-duotone",
    theme: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  address1: {
    name: "Địa chỉ dòng 1",
    category: "Địa chỉ",
    icon: "solar:map-point-line-duotone",
    theme: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  },
  address2: {
    name: "Địa chỉ dòng 2",
    category: "Địa chỉ",
    icon: "solar:map-point-line-duotone",
    theme: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  },
  city: {
    name: "Thành phố",
    category: "Địa chỉ",
    icon: "solar:city-line-duotone",
    theme: "text-violet-500 bg-violet-500/10 border-violet-500/20",
  },
  district: {
    name: "Quận / Huyện",
    category: "Địa chỉ",
    icon: "solar:compass-line-duotone",
    theme: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
  state: {
    name: "Tỉnh / Bang",
    category: "Địa chỉ",
    icon: "solar:map-line-duotone",
    theme: "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20",
  },
  postalCode: {
    name: "Mã bưu chính",
    category: "Địa chỉ",
    icon: "solar:mailbox-line-duotone",
    theme: "text-pink-500 bg-pink-500/10 border-pink-500/20",
  },
  country: {
    name: "Quốc gia",
    category: "Địa chỉ",
    icon: "solar:global-line-duotone",
    theme: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  },
};

export default function UserRegistrationCustomizer({
  isEnabled,
  onEnabledChange,
  config,
  onConfigChange,
}: Props) {
  const fields = config.fields || {};

  const handleFieldChange = (fieldKey: string, key: "show" | "required" | "label", value: any) => {
    if (key === "show" && value === false) {
      if (fieldKey === "email" || fieldKey === "phone" || fieldKey === "username") {
        const emailShow = fieldKey === "email" ? false : (fields.email?.show ?? true);
        const phoneShow = fieldKey === "phone" ? false : (fields.phone?.show ?? true);
        const usernameShow = fieldKey === "username" ? false : (fields.username?.show ?? true);
        if (!emailShow && !phoneShow && !usernameShow) {
          toast.error(
            "Cảnh báo: Không thể tắt đồng thời cả Email, Số điện thoại và Tên đăng nhập!"
          );
        }
      }
    }

    onConfigChange({
      fields: {
        ...fields,
        [fieldKey]: {
          ...fields[fieldKey as keyof typeof fields],
          [key]: value,
        },
      },
    });
  };

  const isAllDisabled =
    !(fields.email?.show ?? true) &&
    !(fields.phone?.show ?? true) &&
    !(fields.username?.show ?? true);

  return (
    <div className="flex flex-col gap-10">
      {isAllDisabled && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 flex items-start gap-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="size-9 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
            <Icon icon="solar:danger-triangle-line-duotone" className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm text-foreground">Cấu hình không hợp lệ</span>
            <span className="text-[13px] leading-relaxed text-muted-foreground">
              Bạn đang tắt đồng thời cả <strong>Email</strong>, <strong>Số điện thoại</strong> và <strong>Tên đăng nhập</strong>.
              Người dùng mới sẽ <strong>không thể đăng ký tài khoản</strong> vì thiếu thông tin định danh chính.
              Vui lòng bật lại ít nhất một trường để lưu cấu hình.
            </span>
          </div>
        </div>
      )}
      <Card className="bg-card/30! border-border shadow-sm p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
            <Icon icon="solar:user-rounded-line-duotone" className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-base text-foreground leading-none">Cho phép Đăng ký Thành viên</h3>
            <p className="text-[13px] text-muted-foreground font-medium">Bật tùy chọn này để cho phép khách hàng đăng ký tài khoản thành viên mới trên website.</p>
          </div>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={onEnabledChange}
        />
      </Card>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Icon icon="solar:settings-line-duotone" className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base text-foreground leading-none">Cấu hình quy trình</h3>
              <p className="text-[13px] text-muted-foreground font-medium">Thiết lập hành vi và luồng xác minh của Form Đăng ký thành viên.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex items-center justify-between p-5 bg-card/30! border-border shadow-sm flex-row">
            <div className="flex flex-col gap-1 pr-4">
              <span className="text-sm font-bold text-foreground">Xác thực Email</span>
              <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                Yêu cầu người dùng xác minh địa chỉ email khi đăng ký tài khoản.
              </span>
            </div>
            <Switch
              checked={config.requireEmailVerification ?? false}
              onCheckedChange={(checked) => onConfigChange({ requireEmailVerification: checked })}
            />
          </Card>

          <Card className="flex items-center justify-between p-5 bg-card/30! border-border shadow-sm flex-row">
            <div className="flex flex-col gap-1 pr-4">
              <span className="text-sm font-bold text-foreground">Đăng nhập nhanh (Social OAuth)</span>
              <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                Cho phép hiển thị các nút đăng nhập qua mạng xã hội (Google, Github...) ngay trên form.
              </span>
            </div>
            <Switch
              checked={config.allowSocialLogin ?? false}
              onCheckedChange={(checked) => onConfigChange({ allowSocialLogin: checked })}
            />
          </Card>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Icon icon="solar:user-speak-line-duotone" className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base text-foreground leading-none">Trường thông tin tùy biến</h3>
              <p className="text-[13px] text-muted-foreground font-medium">Bật/tắt, thay đổi nhãn hiển thị và đặt chế độ bắt buộc nhập.</p>
            </div>
          </div>
        </div>

        <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card/30! p-0!">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground text-xs font-bold uppercase">
                  <th className="p-4">Trường dữ liệu</th>
                  <th className="p-4">Nhãn hiển thị (Custom Label)</th>
                  <th className="p-4 text-center">Hiển thị</th>
                  <th className="p-4 text-center">Bắt buộc nhập</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {Object.entries(fields).map(([fieldKey, val]) => {
                  const fieldVal = val as { show: boolean; required: boolean; label: string };
                  const meta = FIELD_METADATA[fieldKey] || {
                    name: fieldKey,
                    category: "Khác",
                    icon: "solar:settings-line-duotone",
                    theme: "text-muted-foreground bg-muted/20 border-border/50",
                  };

                  return (
                    <tr key={fieldKey} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex size-9 items-center justify-center rounded-lg border shadow-sm",
                              meta.theme
                            )}
                          >
                            <Icon icon={meta.icon} className="size-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-foreground">{meta.name}</span>
                            <span className="text-[10px] font-medium text-muted-foreground">Phân loại: {meta.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Input
                          className="h-9 max-w-[280px]"
                          value={fieldVal.label || ""}
                          placeholder={`Nhập nhãn tùy chỉnh cho ${meta.name.toLowerCase()}...`}
                          onChange={(e) => handleFieldChange(fieldKey, "label", e.target.value)}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <Switch
                          checked={fieldVal.show || false}
                          onCheckedChange={(checked) => handleFieldChange(fieldKey, "show", checked)}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <Switch
                          checked={fieldVal.required || false}
                          disabled={!fieldVal.show}
                          onCheckedChange={(checked) =>
                            handleFieldChange(fieldKey, "required", checked)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="flex flex-col gap-6 p-6 border-border bg-card/30! shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <Icon icon="solar:lock-keyhole-line-duotone" className="size-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">Bảo mật & Tài khoản</span>
              <span className="text-[11px] text-muted-foreground font-medium">Thiết lập độ phức tạp mật khẩu và định dạng tên đăng nhập.</span>
            </div>
          </div>
          <div className="flex flex-col gap-5.5 pt-2">
            <div className="flex flex-col gap-3 pb-4 border-b border-border/40">
              <span className="text-[13px] font-bold text-foreground/90">Quy tắc Tên đăng nhập</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">Độ dài tối thiểu</label>
                  <Input
                    type="number"
                    min={3}
                    max={20}
                    value={config.usernameValidation?.minLength ?? 4}
                    onChange={(e) => onConfigChange({
                      usernameValidation: {
                        ...(config.usernameValidation || { minLength: 4, maxLength: 20, allowedCharacters: "lowercase_alphanumeric" }),
                        minLength: parseInt(e.target.value) || 4
                      }
                    })}
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">Độ dài tối đa</label>
                  <Input
                    type="number"
                    min={5}
                    max={50}
                    value={config.usernameValidation?.maxLength ?? 20}
                    onChange={(e) => onConfigChange({
                      usernameValidation: {
                        ...(config.usernameValidation || { minLength: 4, maxLength: 20, allowedCharacters: "lowercase_alphanumeric" }),
                        maxLength: parseInt(e.target.value) || 20
                      }
                    })}
                    className="h-9 text-[13px]"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Ký tự được chấp nhận</label>
                <Select
                  value={config.usernameValidation?.allowedCharacters ?? "lowercase_alphanumeric"}
                  onValueChange={(value) => onConfigChange({
                    usernameValidation: {
                      ...(config.usernameValidation || { minLength: 4, maxLength: 20, allowedCharacters: "lowercase_alphanumeric" }),
                      allowedCharacters: value as any
                    }
                  })}
                >
                  <SelectTrigger className="h-9 text-[13px] w-full">
                    <SelectValue placeholder="Chọn ký tự được chấp nhận" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lowercase_alphanumeric" className="text-[13px]">
                      <span className="flex items-center gap-2">
                        <Icon icon="solar:text-italic-line-duotone" className="size-3.5 shrink-0 text-blue-500" />
                        <span>Chữ thường, số và dấu gạch dưới (a-z, 0-9, _)</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="alphanumeric" className="text-[13px]">
                      <span className="flex items-center gap-2">
                        <Icon icon="solar:text-bold-line-duotone" className="size-3.5 shrink-0 text-indigo-500" />
                        <span>Chữ cái, số và dấu gạch dưới (a-z, A-Z, 0-9, _)</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="all" className="text-[13px]">
                      <span className="flex items-center gap-2">
                        <Icon icon="solar:globus-line-duotone" className="size-3.5 shrink-0 text-emerald-500" />
                        <span>Tất cả ký tự được hệ thống hỗ trợ</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-bold text-foreground/90">Quy tắc Mật khẩu</span>
              <div className="flex flex-col gap-1.5 pb-2">
                <label className="text-[11px] font-semibold text-muted-foreground">Độ dài mật khẩu tối thiểu</label>
                <Input
                  type="number"
                  min={6}
                  max={32}
                  value={config.passwordValidation?.minLength ?? 8}
                  onChange={(e) => onConfigChange({
                    passwordValidation: {
                      ...(config.passwordValidation || { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumber: true, requireSpecialChar: true }),
                      minLength: parseInt(e.target.value) || 8
                    }
                  })}
                  className="h-9 text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Chữ hoa (A-Z)</span>
                  <Switch
                    checked={config.passwordValidation?.requireUppercase ?? true}
                    onCheckedChange={(checked) => onConfigChange({
                      passwordValidation: {
                        ...(config.passwordValidation || { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumber: true, requireSpecialChar: true }),
                        requireUppercase: checked
                      }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Chữ thường (a-z)</span>
                  <Switch
                    checked={config.passwordValidation?.requireLowercase ?? true}
                    onCheckedChange={(checked) => onConfigChange({
                      passwordValidation: {
                        ...(config.passwordValidation || { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumber: true, requireSpecialChar: true }),
                        requireLowercase: checked
                      }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Chữ số (0-9)</span>
                  <Switch
                    checked={config.passwordValidation?.requireNumber ?? true}
                    onCheckedChange={(checked) => onConfigChange({
                      passwordValidation: {
                        ...(config.passwordValidation || { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumber: true, requireSpecialChar: true }),
                        requireNumber: checked
                      }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Ký tự đặc biệt (!@#...)</span>
                  <Switch
                    checked={config.passwordValidation?.requireSpecialChar ?? true}
                    onCheckedChange={(checked) => onConfigChange({
                      passwordValidation: {
                        ...(config.passwordValidation || { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumber: true, requireSpecialChar: true }),
                        requireSpecialChar: checked
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
        <div className="flex flex-col gap-8">
          <Card className="flex flex-col gap-6 p-6 border-border bg-card/30! shadow-sm">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Icon icon="solar:global-line-duotone" className="size-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">Bộ lọc tên miền Email</span>
                <span className="text-[11px] text-muted-foreground font-medium">Hạn chế hoặc cho phép các tên miền email đăng ký cụ thể.</span>
              </div>
            </div>
            <div className="flex flex-col gap-5 pt-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-foreground/90">Danh sách Tên miền Được phép</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold uppercase">Whitelist</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Nếu cấu hình, hệ thống CHỈ cho phép các tên miền email này được đăng ký. Để trống nếu cho phép tất cả.</p>
                <Textarea
                  value={(config.emailValidation?.allowedDomains || []).join(", ")}
                  onChange={(e) => onConfigChange({
                    emailValidation: {
                      ...(config.emailValidation || { allowedDomains: [] }),
                      allowedDomains: e.target.value.split(",").map(d => d.trim()).filter(Boolean)
                    }
                  })}
                  placeholder="vanistudio.com, gmail.com"
                  className="min-h-[90px] w-full"
                />
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-6 p-6 border-border bg-card/30! shadow-sm">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <Icon icon="solar:palette-round-line-duotone" className="size-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">Giao diện Biểu mẫu</span>
                <span className="text-[11px] text-muted-foreground font-medium">Tùy chỉnh tiêu đề, mô tả ngắn và nhãn nút nhấn đăng ký.</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Tiêu đề biểu mẫu</label>
                <Input
                  value={config.uiConfig?.title ?? "Đăng ký tài khoản"}
                  onChange={(e) => onConfigChange({
                    uiConfig: {
                      ...(config.uiConfig || { title: "Đăng ký tài khoản", description: "Tạo tài khoản mới để trải nghiệm dịch vụ.", submitButtonText: "Đăng ký" }),
                      title: e.target.value
                    }
                  })}
                  placeholder="Nhập tiêu đề trang đăng ký..."
                  className="h-9"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Mô tả ngắn</label>
                <Textarea
                  value={config.uiConfig?.description ?? "Tạo tài khoản mới để trải nghiệm dịch vụ."}
                  onChange={(e) => onConfigChange({
                    uiConfig: {
                      ...(config.uiConfig || { title: "Đăng ký tài khoản", description: "Tạo tài khoản mới để trải nghiệm dịch vụ.", submitButtonText: "Đăng ký" }),
                      description: e.target.value
                    }
                  })}
                  placeholder="Nhập mô tả ngắn..."
                  className="min-h-[60px] w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Chữ trên nút đăng ký</label>
                <Input
                  value={config.uiConfig?.submitButtonText ?? "Đăng ký"}
                  onChange={(e) => onConfigChange({
                    uiConfig: {
                      ...(config.uiConfig || { title: "Đăng ký tài khoản", description: "Tạo tài khoản mới để trải nghiệm dịch vụ.", submitButtonText: "Đăng ký" }),
                      submitButtonText: e.target.value
                    }
                  })}
                  placeholder="Nhập chữ hiển thị trên nút gửi..."
                  className="h-9"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}