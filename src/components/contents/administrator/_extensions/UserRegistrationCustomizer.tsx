"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { type RegistrationFieldsConfig } from "@/defaults/extension.default";

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

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
              <Icon icon="solar:user-rounded-line-duotone" className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base text-foreground leading-none">Cho phép Đăng ký Thành viên</h3>
              <p className="text-[13px] text-muted-foreground font-medium">Bật tùy chọn này để cho phép khách hàng đăng ký tài khoản thành viên mới trên website.</p>
            </div>
          </div>
          <button
            onClick={() => onEnabledChange(!isEnabled)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
              isEnabled ? "bg-vanixjnk" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                isEnabled ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </div>
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
          <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-card/30">
            <div className="flex flex-col gap-1 pr-4">
              <span className="text-sm font-bold text-foreground">Xác thực Email</span>
              <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                Yêu cầu người dùng xác minh địa chỉ email khi đăng ký tài khoản.
              </span>
            </div>
            <button
              onClick={() => onConfigChange({ requireEmailVerification: !(config.requireEmailVerification ?? false) })}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
                config.requireEmailVerification ? "bg-vanixjnk" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                  config.requireEmailVerification ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-card/30">
            <div className="flex flex-col gap-1 pr-4">
              <span className="text-sm font-bold text-foreground">Đăng nhập nhanh (Social OAuth)</span>
              <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                Cho phép hiển thị các nút đăng nhập qua mạng xã hội (Google, Github...) ngay trên form.
              </span>
            </div>
            <button
              onClick={() => onConfigChange({ allowSocialLogin: !(config.allowSocialLogin ?? false) })}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
                config.allowSocialLogin ? "bg-vanixjnk" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                  config.allowSocialLogin ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
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

        <div className="border rounded-xl overflow-hidden bg-card/30 border-t border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
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
                          className="h-9 max-w-[280px] bg-background text-[13px] shadow-sm"
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
        </div>
      </div>
    </div>
  );
}
