"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { PhoneInput } from "@/components/vanixjnk/phone-input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddAccountDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddAccountDialogProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [proxy, setProxy] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const [needTwoFactor, setNeedTwoFactor] = useState(false);

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      setStep("phone");
      setPhone("");
      setProxy("");
      setOtpCode("");
      setTwoFactorPassword("");
      setNeedTwoFactor(false);
    }
  };

  const sendLoginCodeMutation = trpc.application.telegram.sendLoginCode.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Mã xác minh OTP đã được gửi!");
        setStep("otp");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Gửi mã OTP thất bại");
    },
  });

  const submitLoginCodeMutation = trpc.application.telegram.submitLoginCode.useMutation({
    onSuccess: (data) => {
      if (data.need2FA) {
        setNeedTwoFactor(true);
        toast.info("Tài khoản yêu cầu mật khẩu 2 lớp (2FA).");
      } else if (data.success) {
        toast.success("Đăng nhập và liên kết tài khoản Telegram thành công!");
        handleOpenChange(false);
        onSuccess();
      }
    },
    onError: (err) => {
      toast.error(err.message || "Đăng nhập thất bại");
    },
  });

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Vui lòng điền số điện thoại");
      return;
    }
    sendLoginCodeMutation.mutate({
      phone,
      proxy: proxy || undefined,
    });
  };

  const handleSubmitOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error("Vui lòng điền mã OTP");
      return;
    }
    submitLoginCodeMutation.mutate({
      phone,
      code: otpCode,
      password: twoFactorPassword || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={step === "phone" ? handleSendOTP : handleSubmitOTP}>
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 mb-3">
              <Icon icon="ph:telegram-logo-duotone" className="text-2xl" />
            </div>
            <DialogTitle>Thêm tài khoản Telegram</DialogTitle>
            <DialogDescription>
              {step === "phone"
                ? "Nhập số điện thoại đăng nhập và proxy gán cho tài khoản để yêu cầu gửi mã OTP từ Telegram."
                : `Nhập mã OTP vừa được gửi tới số điện thoại ${phone}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {step === "phone" ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Số điện thoại
                  </label>
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    placeholder="Ví dụ: 987654321"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Proxy kết nối (Tùy chọn)
                  </label>
                  <Input
                    placeholder="Ví dụ: socks5://username:password@ip:port"
                    value={proxy}
                    onChange={(e) => setProxy(e.target.value)}
                    className="h-9 text-[13px]"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2 flex flex-col items-center">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground self-start">
                    Mã xác thực OTP (5 chữ số)
                  </label>
                  <div className="py-1">
                    <InputOTP
                      maxLength={5}
                      value={otpCode}
                      onChange={setOtpCode}
                    >
                      <InputOTPGroup className="w-full justify-center">
                        <InputOTPSlot index={0} className="h-11 w-11 text-base" />
                        <InputOTPSlot index={1} className="h-11 w-11 text-base" />
                        <InputOTPSlot index={2} className="h-11 w-11 text-base" />
                        <InputOTPSlot index={3} className="h-11 w-11 text-base" />
                        <InputOTPSlot index={4} className="h-11 w-11 text-base" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {needTwoFactor && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Mật khẩu 2FA (Bảo mật 2 lớp)
                    </label>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu 2FA của bạn..."
                      value={twoFactorPassword}
                      onChange={(e) => setTwoFactorPassword(e.target.value)}
                      className="h-9 text-[13px]"
                      required
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            {step === "otp" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("phone");
                  setOtpCode("");
                  setTwoFactorPassword("");
                  setNeedTwoFactor(false);
                }}
                className="mr-auto cursor-pointer"
              >
                Quay lại
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="vanixjnk"
              disabled={
                sendLoginCodeMutation.isPending ||
                submitLoginCodeMutation.isPending
              }
              className="cursor-pointer"
            >
              {sendLoginCodeMutation.isPending ||
              submitLoginCodeMutation.isPending ? (
                <Icon
                  icon="solar:restart-line-duotone"
                  className="mr-1.5 size-4 animate-spin"
                />
              ) : step === "phone" ? (
                <Icon icon="solar:paper-plane-line-duotone" className="mr-1.5 size-4" />
              ) : (
                <Icon icon="solar:shield-check-line-duotone" className="mr-1.5 size-4" />
              )}
              {step === "phone" ? "Gửi mã OTP" : "Xác nhận đăng nhập"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
