"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSetting } from "@/contexts/SettingContext";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const FIELD_METADATA: Record<
    string,
    { label: string; placeholder: string; icon: string; type: string }
> = {
    email: {
        label: "Địa chỉ Email",
        placeholder: "name@example.com",
        icon: "solar:letter-line-duotone",
        type: "email",
    },
    name: {
        label: "Họ và tên",
        placeholder: "Nguyễn Văn A",
        icon: "solar:user-rounded-line-duotone",
        type: "text",
    },
    username: {
        label: "Tên tài khoản",
        placeholder: "username",
        icon: "solar:shield-user-line-duotone",
        type: "text",
    },
    phone: {
        label: "Số điện thoại",
        placeholder: "0901234567",
        icon: "solar:phone-line-duotone",
        type: "tel",
    },
    identityCard: {
        label: "Căn cước công dân (CCCD)",
        placeholder: "012345678901",
        icon: "solar:user-id-line-duotone",
        type: "text",
    },
    taxId: {
        label: "Mã số thuế",
        placeholder: "8501234567",
        icon: "solar:document-text-line-duotone",
        type: "text",
    },
    address1: {
        label: "Địa chỉ dòng 1",
        placeholder: "Số nhà, ngõ/ngách, tên đường...",
        icon: "solar:map-point-line-duotone",
        type: "text",
    },
    address2: {
        label: "Địa chỉ dòng 2",
        placeholder: "Tòa nhà, căn hộ, phường/xã...",
        icon: "solar:map-point-line-duotone",
        type: "text",
    },
    city: {
        label: "Thành phố",
        placeholder: "Hà Nội, TP. HCM...",
        icon: "solar:city-line-duotone",
        type: "text",
    },
    district: {
        label: "Quận / Huyện",
        placeholder: "Cầu Giấy, Quận 1...",
        icon: "solar:compass-line-duotone",
        type: "text",
    },
    state: {
        label: "Tỉnh / Bang",
        placeholder: "Tỉnh...",
        icon: "solar:map-line-duotone",
        type: "text",
    },
    postalCode: {
        label: "Mã bưu chính",
        placeholder: "100000",
        icon: "solar:mailbox-line-duotone",
        type: "text",
    },
    country: {
        label: "Quốc gia",
        placeholder: "Việt Nam...",
        icon: "solar:global-line-duotone",
        type: "text",
    },
};

interface AuthRegisterProps {
    initialConfig: {
        isEnabled: boolean;
        config: {
            fields?: Record<string, { show: boolean; required: boolean; label?: string }>;
            allowSocialLogin?: boolean;
            uiConfig?: {
                title?: string;
                description?: string;
                submitButtonText?: string;
            };
        };
    };
    isOauthEnabled?: boolean;
}

export default function AuthRegister({ initialConfig, isOauthEnabled = true }: AuthRegisterProps) {
    const setting = useSetting();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState<Record<string, string>>({
        password: "",
        confirmPassword: "",
    });
    const [agree, setAgree] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const regConfig = initialConfig;

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const handleInputChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const registerMutation = trpc.authentication.register.useMutation({
        onSuccess: () => {
            toast.success("Đăng ký thành công!");
            router.push("/");
            router.refresh();
        },
        onError: (err) => {
            toast.error(err.message || "Đăng ký thất bại");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        if (!agree) {
            toast.error("Bạn phải đồng ý với Điều khoản dịch vụ!");
            return;
        }

        const fieldsConfig = regConfig?.config?.fields || {
            email: { show: true, required: true },
            name: { show: true, required: true },
            username: { show: true, required: false },
        };

        const activeFields = Object.entries(fieldsConfig)
            .map(([key, cfg]: [string, any]) => ({
                key,
                show: cfg.show ?? (key === "email" || key === "name" || key === "username"),
            }))
            .filter((f) => f.show);

        const payload: any = {
            password: formData.password,
            name: formData.name || "",
        };

        activeFields.forEach((field) => {
            payload[field.key] = formData[field.key] || "";
        });

        registerMutation.mutate(payload);
    };

    const fieldsConfig = regConfig?.config?.fields || {
        email: { show: true, required: true },
        name: { show: true, required: true },
        username: { show: true, required: false },
    };

    const activeFields = Object.entries(fieldsConfig)
        .map(([key, cfg]: [string, any]) => ({
            key,
            show: cfg.show ?? (key === "email" || key === "name" || key === "username"),
            required: cfg.required ?? (key === "email" || key === "name"),
            label: cfg.label || FIELD_METADATA[key]?.label || key,
        }))
        .filter((f) => f.show);

    const getColSpan = (key: string) => {
        if (["name", "email", "address1", "address2", "identityCard", "taxId"].includes(key)) {
            return "col-span-2";
        }
        return "col-span-2 sm:col-span-1";
    };

    const isRegisterEnabled = regConfig?.isEnabled ?? true;

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-12 overflow-hidden select-none">
            <div className="absolute top-4 right-4 z-50">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={toggleTheme}
                    title={mounted ? (theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối") : "Chuyển đổi giao diện"}
                    className="cursor-pointer"
                >
                    {mounted ? (
                        theme === "dark" ? (
                            <Icon icon="solar:sun-2-line-duotone" className="size-5" />
                        ) : (
                            <Icon icon="solar:moon-line-duotone" className="size-5" />
                        )
                    ) : (
                        <div className="size-5" />
                    )}
                </Button>
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(124,58,237,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,58,237,0.05)_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />

            <div className={cn(
                "relative z-10 w-full space-y-6 transition-all duration-300",
                activeFields.length > 4 && isRegisterEnabled ? "max-w-xl" : "max-w-md"
            )}>
                <div className="flex flex-col items-center gap-2.5 text-center">
                    <Link href="/" className="flex items-center gap-2 cursor-pointer focus:outline-none">
                        <img
                            src={setting?.siteLogo || "/vani-1.png"}
                            alt="Logo"
                            className="h-10 w-auto object-contain rounded-xl shadow-sm"
                        />
                        <span className="font-heading font-bold text-xl text-foreground tracking-wide">
                            {setting?.siteName || "Vani Studio"}
                        </span>
                    </Link>
                </div>

                {!isRegisterEnabled ? (
                    <Card className="w-full border-rose-500/25 bg-rose-500/2">
                        <CardHeader className="text-center">
                            <div className="mx-auto size-14 rounded-full text-rose-500 bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mb-3">
                                <Icon icon="solar:danger-triangle-line-duotone" className="size-7" />
                            </div>
                            <CardTitle className="text-2xl text-rose-500">Đăng ký tạm đóng</CardTitle>
                            <CardDescription className="pt-2 text-sm leading-relaxed text-muted-foreground">
                                Tính năng đăng ký thành viên hiện đang tạm khóa bởi quản trị viên. Vui lòng quay lại sau.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <Button asChild variant="outline" className="w-full h-10 rounded-xl">
                                <Link href="/">Quay lại Trang chủ</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="w-full">
                        <CardHeader className="text-center">
                            <div className="mx-auto size-14 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center mb-3">
                                <Icon icon="solar:user-plus-rounded-line-duotone" className="size-7" />
                            </div>
                            <CardTitle className="text-2xl">{regConfig.config?.uiConfig?.title || "Đăng ký tài khoản"}</CardTitle>
                            <CardDescription>{regConfig.config?.uiConfig?.description || "Tạo tài khoản mới để trải nghiệm dịch vụ"}</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">

                                    {activeFields.map((field) => {
                                        const meta = FIELD_METADATA[field.key] || {
                                            placeholder: "",
                                            icon: "solar:question-square-line-duotone",
                                            type: "text"
                                        };
                                        return (
                                            <div key={field.key} className={cn("space-y-1.5", getColSpan(field.key))}>
                                                <Label htmlFor={field.key} className="text-xs font-semibold text-foreground/90">
                                                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                                                </Label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground/80">
                                                        <Icon icon={meta.icon} className="text-lg" />
                                                    </span>
                                                    <Input
                                                        id={field.key}
                                                        type={meta.type}
                                                        placeholder={meta.placeholder}
                                                        value={formData[field.key] || ""}
                                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                        className="pl-10 h-10 rounded-xl"
                                                        required={field.required}
                                                        disabled={registerMutation.isPending}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}


                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <Label htmlFor="password">Mật khẩu <span className="text-rose-500">*</span></Label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground/80">
                                                <Icon icon="solar:lock-password-line-duotone" className="text-lg" />
                                            </span>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => handleInputChange("password", e.target.value)}
                                                className="pl-10 h-10 rounded-xl"
                                                required
                                                disabled={registerMutation.isPending}
                                            />
                                        </div>
                                    </div>


                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <Label htmlFor="confirm-password">Xác nhận mật khẩu <span className="text-rose-500">*</span></Label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground/80">
                                                <Icon icon="solar:lock-password-line-duotone" className="text-lg" />
                                            </span>
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                                className="pl-10 h-10 rounded-xl"
                                                required
                                                disabled={registerMutation.isPending}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 pt-1">
                                    <Checkbox
                                        id="agree"
                                        className="mt-0.5"
                                        checked={agree}
                                        onCheckedChange={(checked) => setAgree(!!checked)}
                                        required
                                        disabled={registerMutation.isPending}
                                    />
                                    <Label
                                        htmlFor="agree"
                                        className="text-xs text-muted-foreground cursor-pointer select-none leading-normal"
                                    >
                                        Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật
                                    </Label>
                                </div>

                                <Button
                                    id="register-submit"
                                    type="submit"
                                    variant="vanixjnk"
                                    className="w-full h-10 rounded-xl text-sm font-semibold cursor-pointer mt-2"
                                    disabled={registerMutation.isPending}
                                >
                                    {registerMutation.isPending ? (
                                        <Icon icon="solar:spinner-line-duotone" className="size-5 animate-spin mx-auto" />
                                    ) : (
                                        <span>{regConfig.config?.uiConfig?.submitButtonText || "Đăng ký"}</span>
                                    )}
                                </Button>

                                {((regConfig.config?.allowSocialLogin ?? true) && isOauthEnabled) && (
                                    <>
                                        <div className="relative flex py-1 items-center">
                                            <div className="grow border-t border-border/60"></div>
                                            <span className="shrink mx-4 text-[11px] text-muted-foreground/80 font-medium">Hoặc đăng ký bằng</span>
                                            <div className="grow border-t border-border/60"></div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pb-1">
                                            <Button id="register-google" variant="outline" className="w-full h-10 rounded-xl cursor-pointer gap-2" disabled={registerMutation.isPending}>
                                                <Icon icon="logos:google-icon" className="text-base" />
                                                <span className="text-xs font-semibold">Google</span>
                                            </Button>
                                            <Button id="register-github" variant="outline" className="w-full h-10 rounded-xl cursor-pointer gap-2" disabled={registerMutation.isPending}>
                                                <Icon icon="logos:github-icon" className="text-base dark:invert" />
                                                <span className="text-xs font-semibold">GitHub</span>
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </form>
                    </Card>
                )}

                <p className="text-center text-xs text-muted-foreground">
                    Đã có tài khoản?{" "}
                    <Link
                        href="/authentication/login"
                        className="font-semibold text-vanixjnk hover:underline"
                    >
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
