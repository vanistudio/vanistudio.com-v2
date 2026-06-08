"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSetting } from "@/contexts/SettingContext";

export default function AuthRegister() {
    const setting = useSetting();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

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

            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(124,58,237,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,58,237,0.05)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md space-y-6">
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
                <Card className="w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto size-14 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center mb-3">
                            <Icon icon="solar:user-plus-rounded-line-duotone" className="size-7" />
                        </div>
                        <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
                        <CardDescription>Tạo tài khoản mới để trải nghiệm dịch vụ</CardDescription>
                    </CardHeader>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Họ và tên</Label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground/80">
                                        <Icon icon="solar:user-id-line-duotone" className="text-lg" />
                                    </span>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                        className="pl-10 h-10 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="username">Tên tài khoản</Label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground/80">
                                        <Icon icon="solar:user-line-duotone" className="text-lg" />
                                    </span>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="username"
                                        className="pl-10 h-10 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground/80">
                                        <Icon icon="solar:letter-line-duotone" className="text-lg" />
                                    </span>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-10 h-10 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground/80">
                                        <Icon icon="solar:lock-password-line-duotone" className="text-lg" />
                                    </span>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-10 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground/80">
                                        <Icon icon="solar:lock-password-line-duotone" className="text-lg" />
                                    </span>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-10 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-start gap-2 pt-1">
                                <Checkbox id="agree" className="mt-0.5" required />
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
                            >
                                <span>Đăng ký</span>
                            </Button>
                            <div className="relative flex py-1 items-center">
                                <div className="flex-grow border-t border-border/60"></div>
                                <span className="flex-shrink mx-4 text-[11px] text-muted-foreground/80 font-medium">Hoặc đăng ký bằng</span>
                                <div className="flex-grow border-t border-border/60"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pb-1">
                                <Button id="register-google" variant="outline" className="w-full h-10 rounded-xl cursor-pointer gap-2">
                                    <Icon icon="logos:google-icon" className="text-base" />
                                    <span className="text-xs font-semibold">Google</span>
                                </Button>
                                <Button id="register-github" variant="outline" className="w-full h-10 rounded-xl cursor-pointer gap-2">
                                    <Icon icon="logos:github-icon" className="text-base dark:invert" />
                                    <span className="text-xs font-semibold">GitHub</span>
                                </Button>
                            </div>
                        </CardContent>
                    </form>
                </Card>
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
