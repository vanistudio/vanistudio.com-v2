'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ConfPage() {
  const router = useRouter();
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check setup status
  const { data: statusData, isLoading: isStatusLoading } = trpc.configuration.status.useQuery();

  const setupMutation = trpc.configuration.setup.useMutation({
    onSuccess: () => {
      toast.success('Cấu hình hệ thống thành công!');
      router.push('/');
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.message || 'Có lỗi xảy ra trong quá trình cấu hình.');
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!siteName || !siteUrl || !adminName || !adminEmail || !adminPassword) {
      toast.error('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.');
      return;
    }

    if (adminPassword.length < 6) {
      toast.error('Mật khẩu quản trị viên phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSubmitting(true);
    setupMutation.mutate({
      siteName,
      siteUrl,
      admin: {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      },
    });
  };

  if (isStatusLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between py-12">
        <header className="border-b border-border w-full py-4 bg-background mb-8">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:cog" className="text-vanixjnk size-6" />
              <span className="font-semibold text-lg">VaniStudio Setup</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Wizard</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 w-full flex flex-col items-center flex-1 justify-center">
          <div className="flex flex-col items-center gap-2">
            <Icon icon="line-md:loading-twotone-loop" className="text-vanixjnk size-10" />
            <span className="text-sm text-muted-foreground">Đang tải cấu hình...</span>
          </div>
        </main>
      </div>
    );
  }

  if (statusData?.configured) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between py-12">
        <header className="border-b border-border w-full py-4 bg-background mb-8">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:cog" className="text-vanixjnk size-6" />
              <span className="font-semibold text-lg">VaniStudio Setup</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Wizard</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 w-full flex flex-col items-center flex-1 justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center">
                  <Icon icon="mdi:check-circle-outline" className="size-6" />
                </div>
                <div>
                  <CardTitle>Hệ thống đã được cấu hình</CardTitle>
                  <CardDescription>Trang web đã hoàn tất các thiết lập ban đầu.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Hệ thống VaniStudio đã được cấu hình từ trước và đang hoạt động bình thường. Bạn không thể thực hiện cấu hình lại qua trang wizard này.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push('/')} className="w-full bg-vanixjnk text-white hover:bg-vanixjnk/90">
                Quay về trang chủ
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between py-12">
      {/* Uniform Layout Header aligned with max-w-7xl */}
      <header className="border-b border-border w-full py-4 bg-background mb-8">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:cog" className="text-vanixjnk size-6" />
            <span className="font-semibold text-lg">VaniStudio Setup</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Wizard</span>
          </div>
        </div>
      </header>

      {/* Main Content using max-w-7xl for uniform layout */}
      <main className="max-w-7xl mx-auto px-4 w-full flex flex-col items-center flex-1 justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-lg">
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                {/* Uniform Dialog/Sheet-like header styling with custom circle and icon */}
                <div className="size-10 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center">
                  <Icon icon="mdi:rocket-launch-outline" className="size-5" />
                </div>
                <div>
                  <CardTitle>Cấu hình hệ thống ban đầu</CardTitle>
                  <CardDescription>Thiết lập các thông tin cơ bản để kích hoạt website của bạn</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Alert styling using the flat text/bg/border rule to replace gradient/transparent */}
              <div className="text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 rounded-lg p-3 text-sm flex gap-2.5 items-start">
                <Icon icon="mdi:information-outline" className="size-5 shrink-0 mt-0.5" />
                <span>
                  Lưu ý: Tài khoản quản trị viên đầu tiên sẽ được cấp quyền tối cao. Vui lòng ghi nhớ thông tin này để quản lý hệ thống.
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">Thông tin website</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="siteName">Tên trang web <span className="text-destructive">*</span></Label>
                  <Input
                    id="siteName"
                    type="text"
                    placeholder="Ví dụ: VaniStudio"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Địa chỉ URL trang web <span className="text-destructive">*</span></Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    placeholder="Ví dụ: https://vanistudio.com"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="border-t border-border my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">Tài khoản quản trị</h3>

                <div className="space-y-2">
                  <Label htmlFor="adminName">Họ tên quản trị viên <span className="text-destructive">*</span></Label>
                  <Input
                    id="adminName"
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email đăng nhập <span className="text-destructive">*</span></Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="Ví dụ: admin@vanistudio.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Mật khẩu <span className="text-destructive">*</span></Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Mật khẩu ít nhất 6 ký tự"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-vanixjnk text-white font-medium hover:bg-vanixjnk/90 transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Icon icon="line-md:loading-twotone-loop" className="size-4" />
                    <span>Đang khởi tạo hệ thống...</span>
                  </div>
                ) : (
                  <span>Hoàn tất thiết lập</span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  );
}
