"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { type LoginFieldsConfig } from "@/defaults/extension.default";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface Props {
  config: LoginFieldsConfig;
  onConfigChange: (config: Partial<LoginFieldsConfig>) => void;
}

export default function UserLoginCustomizer({
  config,
  onConfigChange,
}: Props) {
  return (
    <div className="flex flex-col gap-8">


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="flex flex-col gap-6 p-6 border-border bg-card/30! shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <Icon icon="solar:user-rounded-line-duotone" className="size-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">Phương thức & Tính năng</span>
              <span className="text-[11px] text-muted-foreground font-medium">Cấu hình các phương thức đăng nhập hợp lệ và chế độ ghi nhớ.</span>
            </div>
          </div>

          <div className="flex flex-col gap-5 pt-2">
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Phương thức đăng nhập</span>
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Địa chỉ Email</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Cho phép người dùng đăng nhập bằng địa chỉ email đã xác minh.</span>
                  </div>
                  <Switch
                    checked={config.allowedMethods?.email ?? true}
                    onCheckedChange={(val) => onConfigChange({
                      allowedMethods: {
                        ...(config.allowedMethods || { email: true, phone: true, username: true }),
                        email: val
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Số điện thoại</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Cho phép người dùng đăng nhập bằng số điện thoại liên kết.</span>
                  </div>
                  <Switch
                    checked={config.allowedMethods?.phone ?? true}
                    onCheckedChange={(val) => onConfigChange({
                      allowedMethods: {
                        ...(config.allowedMethods || { email: true, phone: true, username: true }),
                        phone: val
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between pb-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Tên đăng nhập (Username)</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Cho phép người dùng đăng nhập bằng tên tài khoản định dạng chữ và số.</span>
                  </div>
                  <Switch
                    checked={config.allowedMethods?.username ?? true}
                    onCheckedChange={(val) => onConfigChange({
                      allowedMethods: {
                        ...(config.allowedMethods || { email: true, phone: true, username: true }),
                        username: val
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Chế độ duy trì phiên</span>
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Ghi nhớ đăng nhập (Remember Me)</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Hiển thị hộp kiểm ghi nhớ đăng nhập ở giao diện người dùng.</span>
                  </div>
                  <Switch
                    checked={config.rememberMe?.enabled ?? true}
                    onCheckedChange={(val) => onConfigChange({
                      rememberMe: {
                        ...(config.rememberMe || { enabled: true, defaultChecked: true }),
                        enabled: val
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Mặc định chọn sẵn</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Tự động tích chọn sẵn hộp kiểm Ghi nhớ đăng nhập.</span>
                  </div>
                  <Switch
                    checked={config.rememberMe?.defaultChecked ?? true}
                    onCheckedChange={(val) => onConfigChange({
                      rememberMe: {
                        ...(config.rememberMe || { enabled: true, defaultChecked: true }),
                        defaultChecked: val
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Liên kết biểu mẫu</span>
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Liên kết Quên mật khẩu</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Hiển thị liên kết khôi phục mật khẩu ở giao diện đăng nhập.</span>
                  </div>
                  <Switch
                    checked={config.forgotPasswordEnabled ?? true}
                    onCheckedChange={(val) => onConfigChange({ forgotPasswordEnabled: val })}
                  />
                </div>

                 <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Nút chuyển hướng Đăng ký</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Hiển thị liên kết tạo tài khoản mới bên dưới biểu mẫu.</span>
                  </div>
                  <Switch
                    checked={config.showRegisterLink ?? true}
                    onCheckedChange={(val) => onConfigChange({ showRegisterLink: val })}
                  />
                </div>

                <div className="flex items-center justify-between pb-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Đăng nhập nhanh (Social OAuth)</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Hiển thị các nút đăng nhập qua bên thứ ba (Google, GitHub).</span>
                  </div>
                  <Switch
                    checked={config.allowSocialLogin ?? true}
                    onCheckedChange={(val) => onConfigChange({ allowSocialLogin: val })}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <Card className="flex flex-col gap-6 p-6 border-border bg-card/30! shadow-sm">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <Icon icon="solar:palette-round-line-duotone" className="size-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">Giao diện Biểu mẫu</span>
                <span className="text-[11px] text-muted-foreground font-medium">Tùy chỉnh tiêu đề, mô tả ngắn và nhãn nút nhấn đăng nhập.</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Tiêu đề biểu mẫu</label>
                <Input
                  value={config.uiConfig?.title ?? "Đăng nhập"}
                  onChange={(e) => onConfigChange({
                    uiConfig: {
                      ...(config.uiConfig || { title: "Đăng nhập", description: "Đăng nhập tài khoản của bạn để tiếp tục.", submitButtonText: "Đăng nhập" }),
                      title: e.target.value
                    }
                  })}
                  placeholder="Nhập tiêu đề trang đăng nhập..."
                  className="h-9"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Mô tả ngắn</label>
                <Textarea
                  value={config.uiConfig?.description ?? "Đăng nhập tài khoản của bạn để tiếp tục."}
                  onChange={(e) => onConfigChange({
                    uiConfig: {
                      ...(config.uiConfig || { title: "Đăng nhập", description: "Đăng nhập tài khoản của bạn để tiếp tục.", submitButtonText: "Đăng nhập" }),
                      description: e.target.value
                    }
                  })}
                  placeholder="Nhập mô tả ngắn..."
                  className="min-h-[60px] w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Chữ trên nút đăng nhập</label>
                <Input
                  value={config.uiConfig?.submitButtonText ?? "Đăng nhập"}
                  onChange={(e) => onConfigChange({
                    uiConfig: {
                      ...(config.uiConfig || { title: "Đăng nhập", description: "Đăng nhập tài khoản của bạn để tiếp tục.", submitButtonText: "Đăng nhập" }),
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
