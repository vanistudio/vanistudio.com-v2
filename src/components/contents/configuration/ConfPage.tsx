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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Schema setting fields state
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [siteColor, setSiteColor] = useState('#7c3aed');
  const [siteTimezone, setSiteTimezone] = useState('Asia/Ho_Chi_Minh');
  const [siteLanguage, setSiteLanguage] = useState('vi');
  const [siteCurrency, setSiteCurrency] = useState('VND');
  const [siteLogo, setSiteLogo] = useState('');
  const [siteFavicon, setSiteFavicon] = useState('');
  const [siteOgImage, setSiteOgImage] = useState('');
  const [siteMetaDescription, setSiteMetaDescription] = useState('');
  const [siteMetaKeywords, setSiteMetaKeywords] = useState('');
  const [siteMetaAuthor, setSiteMetaAuthor] = useState('');

  // Admin credentials state
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check setup status
  const { data: statusData, isLoading: isStatusLoading } = trpc.configuration.status.useQuery();

  const setupMutation = trpc.configuration.setup.useMutation({
    onSuccess: () => {
      toast.success('Cấu hình hệ thống thành công!');
      setStep(4);
    },
    onError: (err) => {
      toast.error(err.message || 'Có lỗi xảy ra trong quá trình cấu hình.');
      setIsSubmitting(false);
    },
  });

  const handleNextStep2 = () => {
    if (!siteName.trim()) {
      toast.error('Vui lòng nhập tên trang web.');
      return;
    }
    if (!siteUrl.trim()) {
      toast.error('Vui lòng nhập địa chỉ URL trang web.');
      return;
    }
    if (!siteColor.trim()) {
      toast.error('Vui lòng nhập mã màu chủ đạo.');
      return;
    }
    if (!siteTimezone.trim()) {
      toast.error('Vui lòng nhập múi giờ.');
      return;
    }
    if (!siteLanguage.trim()) {
      toast.error('Vui lòng nhập ngôn ngữ mặc định.');
      return;
    }
    if (!siteCurrency.trim()) {
      toast.error('Vui lòng nhập tiền tệ mặc định.');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminName.trim()) {
      toast.error('Vui lòng nhập họ tên quản trị viên.');
      return;
    }
    if (!adminEmail.trim()) {
      toast.error('Vui lòng nhập email quản trị viên.');
      return;
    }
    if (!adminPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu quản trị viên.');
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
      siteColor,
      siteTimezone,
      siteLanguage,
      siteCurrency,
      siteLogo: siteLogo.trim() || null,
      siteFavicon: siteFavicon.trim() || null,
      siteOgImage: siteOgImage.trim() || null,
      siteMetaDescription: siteMetaDescription.trim() || null,
      siteMetaKeywords: siteMetaKeywords.trim() || null,
      siteMetaAuthor: siteMetaAuthor.trim() || null,
      admin: {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      },
    });
  };

  if (isStatusLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4">
        <div className="flex flex-col items-center gap-2">
          <Icon icon="line-md:loading-twotone-loop" className="text-vanixjnk size-10" />
          <span className="text-sm text-muted-foreground">Đang tải cấu hình...</span>
        </div>
      </div>
    );
  }

  if (statusData?.configured) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4">
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
            <p className="text-muted-foreground leading-relaxed text-sm">
              Hệ thống VaniStudio đã được cấu hình từ trước và đang hoạt động bình thường. Bạn không thể thực hiện cấu hình lại qua trang wizard này.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/')} className="w-full bg-vanixjnk text-white hover:bg-vanixjnk/90">
              Quay về trang chủ
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Step Indicator tracks Progress visually */}
        <div className="flex items-center justify-between w-full max-w-md mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`size-8 rounded-full flex items-center justify-center font-medium border text-sm transition-all ${
                step === s
                  ? 'bg-vanixjnk text-white border-vanixjnk'
                  : step > s
                  ? 'bg-vanixjnk/15 text-vanixjnk border-vanixjnk/20 font-semibold'
                  : 'bg-muted text-muted-foreground border-border'
              }`}>
                {step > s ? <Icon icon="mdi:check" className="size-4" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step > s ? 'bg-vanixjnk/40' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="w-full max-w-xl">
            <CardHeader className="text-center">
              <div className="mx-auto size-14 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center mb-3">
                <Icon icon="mdi:rocket-launch-outline" className="size-7" />
              </div>
              <CardTitle className="text-2xl">Bắt đầu thiết lập hệ thống</CardTitle>
              <CardDescription>Chào mừng bạn đến với trình cấu hình ban đầu VaniStudio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-sm text-center leading-relaxed max-w-md mx-auto">
                Hệ thống đang sẵn sàng khởi chạy. Chúng tôi sẽ đi qua 4 bước đơn giản để chuẩn bị môi trường chạy tốt nhất cho website của bạn.
              </p>

              <div className="bg-vanixjnk/5 border border-vanixjnk/15 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Icon icon="mdi:format-list-bulleted" className="text-vanixjnk size-5" />
                  Tổng quan các bước thiết lập:
                </h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground pl-1">
                  <li className="flex items-center gap-2.5">
                    <span className="size-5 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center font-medium text-xs">1</span>
                    <span className="text-foreground/80 font-medium">Giới thiệu tổng quan hệ thống</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="size-5 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center font-medium text-xs">2</span>
                    <span>Cấu hình thông tin Website & SEO (Cần nhập đủ)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="size-5 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center font-medium text-xs">3</span>
                    <span>Thiết lập tài khoản quản trị tối cao (Admin)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="size-5 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center font-medium text-xs">4</span>
                    <span>Hoàn tất thiết lập & Khởi chạy ứng dụng</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setStep(2)} className="w-full bg-vanixjnk text-white hover:bg-vanixjnk/90">
                Bắt đầu ngay
                <Icon icon="mdi:arrow-right" className="ml-2 size-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card className="w-full max-w-xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center">
                  <Icon icon="mdi:web" className="size-5" />
                </div>
                <div>
                  <CardTitle>Cấu hình thông tin Website</CardTitle>
                  <CardDescription>Nhập đầy đủ các thông tin cấu hình phục vụ website & SEO</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              {/* Basic configuration group */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-foreground border-b border-border pb-1">1. Thông tin chung</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Tên website <span className="text-destructive">*</span></Label>
                    <Input
                      id="siteName"
                      type="text"
                      placeholder="Ví dụ: Vani Store"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Địa chỉ URL website <span className="text-destructive">*</span></Label>
                    <Input
                      id="siteUrl"
                      type="text"
                      placeholder="Ví dụ: https://vanistudio.com"
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteColor">Mã màu chủ đạo (HEX) <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2">
                      <Input
                        id="siteColor"
                        type="text"
                        placeholder="#7c3aed"
                        value={siteColor}
                        onChange={(e) => setSiteColor(e.target.value)}
                        className="font-mono"
                      />
                      <input
                        type="color"
                        value={siteColor.startsWith('#') && siteColor.length === 7 ? siteColor : '#7c3aed'}
                        onChange={(e) => setSiteColor(e.target.value)}
                        className="size-10 p-0 border border-input rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteTimezone">Múi giờ hệ thống <span className="text-destructive">*</span></Label>
                    <Input
                      id="siteTimezone"
                      type="text"
                      placeholder="Asia/Ho_Chi_Minh"
                      value={siteTimezone}
                      onChange={(e) => setSiteTimezone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteLanguage">Ngôn ngữ mặc định <span className="text-destructive">*</span></Label>
                    <Input
                      id="siteLanguage"
                      type="text"
                      placeholder="vi"
                      value={siteLanguage}
                      onChange={(e) => setSiteLanguage(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteCurrency">Tiền tệ chính <span className="text-destructive">*</span></Label>
                    <Input
                      id="siteCurrency"
                      type="text"
                      placeholder="VND"
                      value={siteCurrency}
                      onChange={(e) => setSiteCurrency(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Media assets group */}
              <div className="space-y-4 pt-2">
                <h3 className="font-semibold text-sm text-foreground border-b border-border pb-1">2. Đường dẫn Hình ảnh</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteLogo">Logo URL</Label>
                    <Input
                      id="siteLogo"
                      type="text"
                      placeholder="Ví dụ: /logo.png hoặc URL tuyệt đối"
                      value={siteLogo}
                      onChange={(e) => setSiteLogo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteFavicon">Favicon URL</Label>
                    <Input
                      id="siteFavicon"
                      type="text"
                      placeholder="Ví dụ: /favicon.ico"
                      value={siteFavicon}
                      onChange={(e) => setSiteFavicon(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteOgImage">OG Image / Thumbnail URL</Label>
                    <Input
                      id="siteOgImage"
                      type="text"
                      placeholder="Ví dụ: /og-image.png"
                      value={siteOgImage}
                      onChange={(e) => setSiteOgImage(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SEO configuration group */}
              <div className="space-y-4 pt-2">
                <h3 className="font-semibold text-sm text-foreground border-b border-border pb-1">3. Cấu hình SEO Meta</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteMetaDescription">Meta Description</Label>
                    <Input
                      id="siteMetaDescription"
                      type="text"
                      placeholder="Mô tả website phục vụ công cụ tìm kiếm"
                      value={siteMetaDescription}
                      onChange={(e) => setSiteMetaDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteMetaKeywords">Meta Keywords</Label>
                    <Input
                      id="siteMetaKeywords"
                      type="text"
                      placeholder="Từ khóa tìm kiếm (ngăn cách bằng dấu phẩy)"
                      value={siteMetaKeywords}
                      onChange={(e) => setSiteMetaKeywords(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteMetaAuthor">Meta Author</Label>
                    <Input
                      id="siteMetaAuthor"
                      type="text"
                      placeholder="Tên tác giả / Công ty sở hữu"
                      value={siteMetaAuthor}
                      onChange={(e) => setSiteMetaAuthor(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-3 pt-4 border-t border-border mt-4">
              <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1">
                Quay lại
              </Button>
              <Button type="button" onClick={handleNextStep2} className="flex-1 bg-vanixjnk text-white hover:bg-vanixjnk/90">
                Tiếp tục
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card className="w-full max-w-xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center">
                  <Icon icon="mdi:account-key" className="size-5" />
                </div>
                <div>
                  <CardTitle>Khởi tạo Tài khoản Quản trị</CardTitle>
                  <CardDescription>Tạo tài khoản quản trị hệ thống tối cao của bạn</CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 rounded-lg p-3 text-xs flex gap-2.5 items-start">
                  <Icon icon="mdi:information-outline" className="size-5 shrink-0 mt-0.5" />
                  <span>
                    Chú ý: Đây là tài khoản quản trị tối cao (Super Admin). Vui lòng lưu thông tin đăng nhập cẩn thận vì hệ thống sẽ mã hóa bảo mật thông tin này.
                  </span>
                </div>

                <div className="space-y-4">
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
                    <Label htmlFor="adminPassword">Mật khẩu tài khoản <span className="text-destructive">*</span></Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Mật khẩu có độ dài ít nhất 6 ký tự"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-3 pt-4 border-t border-border mt-4">
                <Button type="button" onClick={() => setStep(2)} variant="outline" className="flex-1" disabled={isSubmitting}>
                  Quay lại
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-vanixjnk text-white hover:bg-vanixjnk/90">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Icon icon="line-md:loading-twotone-loop" className="size-4 animate-spin" />
                      <span>Đang thiết lập...</span>
                    </div>
                  ) : (
                    <span>Hoàn tất & Khởi chạy</span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {step === 4 && (
          <Card className="w-full max-w-xl">
            <CardHeader className="text-center">
              <div className="mx-auto size-14 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center mb-3">
                <Icon icon="mdi:check-circle-outline" className="size-7" />
              </div>
              <CardTitle className="text-2xl">Cấu hình hoàn tất!</CardTitle>
              <CardDescription>Ứng dụng VaniStudio đã sẵn sàng sử dụng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-sm text-muted-foreground max-w-md mx-auto">
                Hệ thống đã được thiết lập thành công. Mọi cấu hình cài đặt và cơ sở dữ liệu đã được đồng bộ hóa.
              </div>

              <div className="bg-vanixjnk/5 border border-vanixjnk/15 rounded-xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tên website:</span>
                  <span className="font-semibold text-foreground">{siteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Địa chỉ URL:</span>
                  <span className="font-semibold text-foreground font-mono">{siteUrl}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2.5">
                  <span className="text-muted-foreground">Tài khoản Admin:</span>
                  <span className="font-semibold text-foreground font-mono">{adminEmail}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                router.push('/');
                router.refresh();
              }} className="w-full bg-vanixjnk text-white hover:bg-vanixjnk/90">
                Đi đến Trang chủ
                <Icon icon="mdi:arrow-right" className="ml-2 size-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
