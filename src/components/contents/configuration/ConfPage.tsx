'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
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
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/vanixjnk/color-picker';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TIMEZONE_DATA } from '@/constants/timezones.constant';
import { LANGUAGE_DATA } from '@/constants/languages.constant';
import { CURRENCY_DATA } from '@/constants/currencies.constant';

export function ConfPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const renderThemeToggle = () => (
    <div className="absolute top-4 right-4 z-50">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        title={mounted ? (theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối') : 'Chuyển đổi giao diện'}
        className="cursor-pointer"
      >
        {mounted ? (
          theme === 'dark' ? (
            <Icon icon="solar:sun-2-line-duotone" className="size-5" />
          ) : (
            <Icon icon="solar:moon-line-duotone" className="size-5" />
          )
        ) : (
          <div className="size-5" />
        )}
      </Button>
    </div>
  );

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [siteName, setSiteName] = useState('Vani Studio');
  const [siteUrl, setSiteUrl] = useState('https://vanistudio.com');
  const [siteColor, setSiteColor] = useState('#7c3aed');
  const [siteTimezone, setSiteTimezone] = useState('Asia/Ho_Chi_Minh');
  const [siteLanguage, setSiteLanguage] = useState('vi');
  const [siteCurrency, setSiteCurrency] = useState('VND');
  const [timezoneDialogOpen, setTimezoneDialogOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [currencySearch, setCurrencySearch] = useState('');

  const filteredTimezones = Object.values(TIMEZONE_DATA).filter((tz) =>
    tz.code.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
    tz.name.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
    tz.offset.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
    tz.country.toLowerCase().includes(timezoneSearch.toLowerCase())
  );

  const filteredLanguages = Object.values(LANGUAGE_DATA).filter((lang) =>
    lang.code.toLowerCase().includes(languageSearch.toLowerCase()) ||
    lang.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const filteredCurrencies = Object.values(CURRENCY_DATA).filter((curr) =>
    curr.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    curr.name.toLowerCase().includes(currencySearch.toLowerCase())
  );
  const siteLogo = '';
  const siteFavicon = '';
  const siteOgImage = '';
  const [siteMetaDescription, setSiteMetaDescription] = useState('Vani Studio - Đơn vị hàng đầu chuyên phát triển phần mềm doanh nghiệp, thiết kế website chuyên nghiệp, lập trình ứng dụng di động (iOS & Android), xây dựng chatbot AI thông minh và thiết kế UI/UX hiện đại tối ưu trải nghiệm người dùng.');
  const [siteMetaKeywords, setSiteMetaKeywords] = useState('phát triển phần mềm, thiết kế website chuyên nghiệp, lập trình ứng dụng, viết ứng dụng di động, thiết kế UI/UX, lập trình chatbot AI, xây dựng bot tự động, tối ưu trải nghiệm người dùng, công nghệ số, vanistudio');
  const [siteMetaAuthor, setSiteMetaAuthor] = useState('Vani Studio Team');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const { data: dbStatus, isLoading: isDbStatusLoading, refetch: refetchDbStatus } = trpc.configuration.dbStatus.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  });
  const pushSchemaMutation = trpc.configuration.pushSchema.useMutation();

  const [pushDialogOpen, setPushDialogOpen] = useState(false);
  const [pushLogs, setPushLogs] = useState('');
  const [pushState, setPushState] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  const handlePushSchema = () => {
    setPushDialogOpen(true);
    setPushState('running');
    setPushLogs('Đang kết nối và chuẩn bị đẩy cấu trúc các bảng vào cơ sở dữ liệu...\nChạy lệnh: npx drizzle-kit push...\n');

    pushSchemaMutation.mutate(undefined, {
      onSuccess: (res) => {
        // eslint-disable-next-line no-control-regex
        const cleanOutput = res.output.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
        setPushLogs((prev) => prev + '\nKết quả lệnh chạy:\n' + cleanOutput + '\n');
        
        if (res.success) {
          setPushState('success');
          toast.success('Đồng bộ cơ sở dữ liệu thành công!');
          refetchDbStatus();
        } else {
          setPushState('error');
          setPushLogs((prev) => prev + '\n[Gợi ý lỗi] Đồng bộ thất bại. Vui lòng đảm bảo rằng:\n1. PostgreSQL đã được khởi động và đang chạy (cổng 5432).\n2. Cấu hình APP_DATABASE_URI_VALUE trong file .env chính xác.\n');
          toast.error(res.error || 'Đồng bộ cơ sở dữ liệu thất bại.');
        }
      },
      onError: (err) => {
        setPushLogs((prev) => prev + '\nLỗi kết nối tRPC:\n' + err.message + '\n');
        setPushState('error');
        toast.error('Đồng bộ cơ sở dữ liệu thất bại.');
      }
    });
  };

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
    if (!adminUsername.trim()) {
      toast.error('Vui lòng nhập tên tài khoản quản trị viên.');
      return;
    }
    if (adminUsername.length < 3) {
      toast.error('Tên tài khoản phải có ít nhất 3 ký tự.');
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
        username: adminUsername,
        password: adminPassword,
      },
    });
  };

  if (isStatusLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4 relative">
        {renderThemeToggle()}
        <div className="flex flex-col items-center gap-2">
          <Icon icon="line-md:loading-twotone-loop" className="text-vanixjnk size-10" />
          <span className="text-sm text-muted-foreground">Đang tải cấu hình...</span>
        </div>
      </div>
    );
  }

  if (statusData?.configured) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4 relative">
        {renderThemeToggle()}
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center">
                <Icon icon="solar:check-circle-line-duotone" className="size-6" />
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
          <div className="flex items-center px-4 pt-0">
            <Button onClick={() => router.push('/')} variant="vanixjnk" className="w-full">
              Quay về trang chủ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const stepsConfig = [
    { id: 1, label: 'Giới thiệu' },
    { id: 2, label: 'Cấu hình Website' },
    { id: 3, label: 'Tạo tài khoản' },
    { id: 4, label: 'Hoàn tất' }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4 relative">
      {renderThemeToggle()}
      <div className="w-full max-w-xl flex flex-col items-center">
        <div className="w-full mb-10 select-none">
          <div className="flex items-start justify-between relative">
            <div className="absolute left-10 right-10 top-4 h-[2px] bg-border -translate-y-1/2 z-0">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300" 
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
            {stepsConfig.map((s) => (
              <div key={s.id} className="flex flex-col items-center z-10 w-20">
                <div className={`size-8 rounded-full flex items-center justify-center font-medium border text-sm transition-all duration-300 relative overflow-hidden ${
                  step === s.id
                    ? 'bg-emerald-500 text-white border-emerald-500 ring-4 ring-emerald-500/15'
                    : step > s.id
                    ? 'bg-background text-emerald-500 border border-emerald-500/25'
                    : 'bg-background text-muted-foreground border-border'
                }`}>
                  {step > s.id && (
                    <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                  )}
                  {step > s.id ? (
                    <Icon icon="mdi:check" className="size-4 animate-scale z-10" />
                  ) : (
                    s.id
                  )}
                </div>
                <span className={`text-[11px] mt-1.5 font-medium text-center leading-tight transition-colors duration-300 max-w-[80px] break-words ${
                  step === s.id
                    ? 'text-emerald-500 font-semibold'
                    : step > s.id
                    ? 'text-emerald-500 font-medium'
                    : 'text-muted-foreground'
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <Card className="w-full max-w-xl">
            <CardHeader className="text-center">
              <div className="mx-auto size-14 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center mb-3">
                <Icon icon="solar:rocket-line-duotone" className="size-7" />
              </div>
              <CardTitle className="text-2xl">Bắt đầu thiết lập hệ thống</CardTitle>
              <CardDescription>Chào mừng bạn đến với trình cấu hình ban đầu VaniStudio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-sm text-center leading-relaxed max-w-md mx-auto">
                Hệ thống đang sẵn sàng khởi chạy. Chúng tôi sẽ đi qua 4 bước đơn giản để chuẩn bị môi trường chạy tốt nhất cho website của bạn.
              </p>

              {/* Database status check */}
              <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30">
                <h4 className="font-semibold text-sm text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon icon="solar:database-line-duotone" className="text-emerald-500 size-5" />
                    Trạng thái Cơ sở dữ liệu:
                  </span>
                  {isDbStatusLoading ? (
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-normal">
                      <Icon icon="line-md:loading-twotone-loop" className="size-3.5 text-emerald-500 animate-spin" />
                      Đang kiểm tra...
                    </span>
                  ) : dbStatus?.connectionOk ? (
                    dbStatus?.tablesExist ? (
                      <span className="text-xs text-emerald-500 flex items-center gap-1 font-semibold">
                        <Icon icon="solar:check-circle-line-duotone" className="size-4" />
                        Sẵn sàng
                      </span>
                    ) : (
                      <span className="text-xs text-amber-500 flex items-center gap-1 font-semibold animate-pulse">
                        <Icon icon="solar:danger-triangle-line-duotone" className="size-4" />
                        Chưa đồng bộ
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-destructive flex items-center gap-1 font-semibold">
                      <Icon icon="solar:close-circle-line-duotone" className="size-4" />
                      Mất kết nối
                    </span>
                  )}
                </h4>

                {/* Status messages and actions */}
                <div className="text-xs space-y-2.5">
                  {isDbStatusLoading && !dbStatus ? (
                    <>
                      <div className="text-muted-foreground bg-muted/50 border border-border rounded-lg p-2.5 leading-relaxed flex items-center gap-2">
                        <Icon icon="line-md:loading-twotone-loop" className="size-4 shrink-0 text-emerald-500 animate-spin" />
                        <span>Đang kiểm tra kết nối cơ sở dữ liệu... Nếu quá trình này diễn ra quá lâu, bạn có thể kiểm tra cấu hình trong file `.env` hoặc thử các thao tác dưới đây.</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => refetchDbStatus()}
                          className="w-full flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Icon icon="solar:refresh-line-duotone" className="size-4" />
                          Kiểm tra lại
                        </Button>
                        <Button
                          type="button"
                          variant="vanixjnk"
                          size="sm"
                          onClick={handlePushSchema}
                          className="w-full flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Icon icon="solar:database-line-duotone" className="size-4" />
                          Đồng bộ bảng (Push Schema)
                        </Button>
                      </div>
                    </>
                  ) : !dbStatus?.connectionOk ? (
                    <>
                      <div className="text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2.5 leading-relaxed">
                        <strong>Lỗi kết nối:</strong> {dbStatus?.error || "Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra lại cấu hình DB trong file `.env` hoặc bật dịch vụ Database."}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => refetchDbStatus()}
                          className="w-full flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Icon icon="solar:refresh-line-duotone" className="size-4" />
                          Thử kết nối lại
                        </Button>
                        <Button
                          type="button"
                          variant="vanixjnk"
                          size="sm"
                          onClick={handlePushSchema}
                          className="w-full flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Icon icon="solar:database-line-duotone" className="size-4" />
                          Đồng bộ bảng (Push Schema)
                        </Button>
                      </div>
                    </>
                  ) : !dbStatus?.tablesExist ? (
                    <>
                      <div className="text-amber-600 dark:text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 leading-relaxed">
                        Kết nối thành công! Tuy nhiên cấu trúc các bảng dữ liệu chưa được khởi tạo. Vui lòng bấm vào nút dưới đây để tạo bảng dữ liệu.
                      </div>
                      <Button
                        type="button"
                        variant="vanixjnk"
                        size="sm"
                        onClick={handlePushSchema}
                        className="w-full flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Icon icon="solar:database-line-duotone" className="size-4" />
                        Đồng bộ cấu trúc bảng (Push Schema)
                      </Button>
                    </>
                  ) : (
                    <div className="text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 leading-relaxed flex items-center gap-2">
                      <Icon icon="solar:check-circle-line-duotone" className="size-4 shrink-0" />
                      <span>Hệ thống đã kết nối cơ sở dữ liệu và cấu trúc bảng đã sẵn sàng cho bước tiếp theo.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-vanixjnk/5 border border-vanixjnk/15 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Icon icon="solar:list-line-duotone" className="text-vanixjnk size-5" />
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
            <div className="flex items-center px-4 pt-0">
              <Button
                onClick={() => setStep(2)}
                variant="vanixjnk"
                className="w-full"
                disabled={isDbStatusLoading || !dbStatus?.connectionOk || !dbStatus?.tablesExist}
              >
                Bắt đầu ngay
                <Icon icon="mdi:arrow-right" className="ml-2 size-4" />
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="w-full max-w-xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center">
                  <Icon icon="solar:global-line-duotone" className="size-5" />
                </div>
                <div>
                  <CardTitle>Cấu hình thông tin Website</CardTitle>
                  <CardDescription>Nhập đầy đủ các thông tin cấu hình phục vụ website & SEO</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto py-2">
              <div className="space-y-4">
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
                    <ColorPicker
                      label="Mã màu chủ đạo (HEX) *"
                      value={siteColor}
                      onChange={setSiteColor}
                    />
                  </div>
                  <div className="space-y-2 cursor-pointer" onClick={() => setTimezoneDialogOpen(true)}>
                    <Label htmlFor="siteTimezone">Múi giờ hệ thống <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      {siteTimezone && TIMEZONE_DATA[siteTimezone] && (
                        <div className="absolute top-1/2 left-3 -translate-y-1/2 flex items-center pointer-events-none">
                          <Icon icon={`circle-flags:${TIMEZONE_DATA[siteTimezone].flag}`} className="size-5 rounded-full" />
                        </div>
                      )}
                      <Input
                        id="siteTimezone"
                        type="text"
                        className={cn("cursor-pointer pr-10 read-only:bg-background", siteTimezone && TIMEZONE_DATA[siteTimezone] && "pl-10")}
                        readOnly
                        value={siteTimezone ? `${siteTimezone} (${TIMEZONE_DATA[siteTimezone]?.country || ''} - ${TIMEZONE_DATA[siteTimezone]?.offset || ''})` : ''}
                        placeholder="Chọn múi giờ..."
                      />
                      <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
                        <Icon icon="solar:alt-arrow-down-line-duotone" className="size-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 cursor-pointer" onClick={() => setLanguageDialogOpen(true)}>
                    <Label htmlFor="siteLanguage">Ngôn ngữ mặc định <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      {siteLanguage && LANGUAGE_DATA[siteLanguage] && (
                        <div className="absolute top-1/2 left-3 -translate-y-1/2 flex items-center pointer-events-none">
                          <Icon icon={`circle-flags:${LANGUAGE_DATA[siteLanguage].flag}`} className="size-5 rounded-full" />
                        </div>
                      )}
                      <Input
                        id="siteLanguage"
                        type="text"
                        className={cn("cursor-pointer pr-10 read-only:bg-background", siteLanguage && LANGUAGE_DATA[siteLanguage] && "pl-10")}
                        readOnly
                        value={siteLanguage ? `${LANGUAGE_DATA[siteLanguage]?.name || siteLanguage} (${siteLanguage.toUpperCase()})` : ''}
                        placeholder="Chọn ngôn ngữ..."
                      />
                      <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
                        <Icon icon="solar:alt-arrow-down-line-duotone" className="size-4" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 cursor-pointer" onClick={() => setCurrencyDialogOpen(true)}>
                    <Label htmlFor="siteCurrency">Tiền tệ chính <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      {siteCurrency && CURRENCY_DATA[siteCurrency] && (
                        <div className="absolute top-1/2 left-3 -translate-y-1/2 flex items-center pointer-events-none">
                          <Icon icon={`circle-flags:${CURRENCY_DATA[siteCurrency].flag}`} className="size-5 rounded-full" />
                        </div>
                      )}
                      <Input
                        id="siteCurrency"
                        type="text"
                        className={cn("cursor-pointer pr-10 read-only:bg-background", siteCurrency && CURRENCY_DATA[siteCurrency] && "pl-10")}
                        readOnly
                        value={siteCurrency ? `${CURRENCY_DATA[siteCurrency]?.name || siteCurrency} (${siteCurrency})` : ''}
                        placeholder="Chọn tiền tệ..."
                      />
                      <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
                        <Icon icon="solar:alt-arrow-down-line-duotone" className="size-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteMetaDescription">Meta Description</Label>
                    <Textarea
                      id="siteMetaDescription"
                      placeholder="Mô tả website phục vụ công cụ tìm kiếm"
                      value={siteMetaDescription}
                      onChange={(e) => setSiteMetaDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteMetaKeywords">Meta Keywords</Label>
                    <Textarea
                      id="siteMetaKeywords"
                      placeholder="Từ khóa tìm kiếm (ngăn cách bằng dấu phẩy)"
                      value={siteMetaKeywords}
                      onChange={(e) => setSiteMetaKeywords(e.target.value)}
                      rows={2}
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
            <div className="flex justify-between px-4 gap-3">
              <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1">
                Quay lại
              </Button>
              <Button type="button" onClick={handleNextStep2} variant="vanixjnk" className="flex-1">
                Tiếp tục
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="w-full max-w-xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center">
                  <Icon icon="solar:shield-user-line-duotone" className="size-5" />
                </div>
                <div>
                  <CardTitle>Khởi tạo Tài khoản Quản trị</CardTitle>
                  <CardDescription>Tạo tài khoản quản trị hệ thống tối cao của bạn</CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 py-2">
                <div className="text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 rounded-lg p-3 text-xs flex gap-2.5 items-start">
                  <Icon icon="solar:info-circle-line-duotone" className="size-5 shrink-0 mt-0.5" />
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
                    <Label htmlFor="adminUsername">Tên tài khoản quản trị <span className="text-destructive">*</span></Label>
                    <Input
                      id="adminUsername"
                      type="text"
                      placeholder="Ví dụ: admin"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Mật khẩu tài khoản <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Input
                        id="adminPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu có độ dài ít nhất 6 ký tự"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none transition-colors"
                        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? (
                          <Icon icon="solar:eye-closed-line-duotone" className="size-5" />
                        ) : (
                          <Icon icon="solar:eye-line-duotone" className="size-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-between gap-3 px-4 pt-0">
                <Button type="button" onClick={() => setStep(2)} variant="outline" className="flex-1" disabled={isSubmitting}>
                  Quay lại
                </Button>
                <Button type="submit" disabled={isSubmitting} variant="vanixjnk" className="flex-1">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Icon icon="line-md:loading-twotone-loop" className="size-4 animate-spin" />
                      <span>Đang thiết lập...</span>
                    </div>
                  ) : (
                    <span>Hoàn tất & Khởi chạy</span>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {step === 4 && (
          <Card className="w-full max-w-xl">
            <CardHeader className="text-center">
              <div className="mx-auto size-14 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center mb-3">
                <Icon icon="solar:check-circle-line-duotone" className="size-7" />
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
            <div className="flex items-center px-4 pt-0">
              <Button onClick={() => {
                router.push('/');
                router.refresh();
              }} variant="vanixjnk" className="w-full">
                Đi đến Trang chủ
                <Icon icon="mdi:arrow-right" className="ml-2 size-4" />
              </Button>
            </div>
          </Card>
        )}
      </div>
      <Dialog open={timezoneDialogOpen} onOpenChange={setTimezoneDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2.5">
              <div className="size-8 rounded-full text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:global-line-duotone" className="size-4.5" />
              </div>
              <span>Chọn múi giờ hệ thống</span>
            </DialogTitle>
          </DialogHeader>
          <div className="relative my-3 shrink-0">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Icon icon="solar:magnifer-line-duotone" className="size-4" />
            </div>
            <Input
              type="text"
              placeholder="Tìm kiếm múi giờ (ví dụ: Asia, GMT, UTC)..."
              value={timezoneSearch}
              onChange={(e) => setTimezoneSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 max-h-[350px] pr-1">
            {filteredTimezones.map((tz) => (
              <button
                key={tz.code}
                type="button"
                onClick={() => {
                  setSiteTimezone(tz.code);
                  setTimezoneDialogOpen(false);
                  setTimezoneSearch('');
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm hover:bg-muted transition-colors cursor-pointer",
                  siteTimezone === tz.code && "bg-accent font-medium text-emerald-600"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon icon={`circle-flags:${tz.flag}`} className="size-5 rounded-full shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{tz.code}</span>
                    <span className="text-xs text-muted-foreground">{tz.country} - {tz.name}</span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{tz.offset}</span>
              </button>
            ))}
            {filteredTimezones.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Không tìm thấy múi giờ nào phù hợp
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2.5">
              <div className="size-8 rounded-full text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:global-line-duotone" className="size-4.5" />
              </div>
              <span>Chọn ngôn ngữ mặc định</span>
            </DialogTitle>
          </DialogHeader>
          <div className="relative my-3 shrink-0">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Icon icon="solar:magnifer-line-duotone" className="size-4" />
            </div>
            <Input
              type="text"
              placeholder="Tìm kiếm ngôn ngữ (ví dụ: vi, en, tiếng việt)..."
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 max-h-[350px] pr-1">
            {filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setSiteLanguage(lang.code);
                  setLanguageDialogOpen(false);
                  setLanguageSearch('');
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm hover:bg-muted transition-colors cursor-pointer",
                  siteLanguage === lang.code && "bg-accent font-medium text-emerald-600"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon icon={`circle-flags:${lang.flag}`} className="size-5 rounded-full" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{lang.name}</span>
                    <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{lang.code.toUpperCase()}</span>
              </button>
            ))}
            {filteredLanguages.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Không tìm thấy ngôn ngữ nào phù hợp
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={currencyDialogOpen} onOpenChange={setCurrencyDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2.5">
              <div className="size-8 rounded-full text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:global-line-duotone" className="size-4.5" />
              </div>
              <span>Chọn tiền tệ chính</span>
            </DialogTitle>
          </DialogHeader>
          <div className="relative my-3 shrink-0">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Icon icon="solar:magnifer-line-duotone" className="size-4" />
            </div>
            <Input
              type="text"
              placeholder="Tìm kiếm tiền tệ (ví dụ: vnd, usd, peso)..."
              value={currencySearch}
              onChange={(e) => setCurrencySearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 max-h-[350px] pr-1">
            {filteredCurrencies.map((curr) => (
              <button
                key={curr.code}
                type="button"
                onClick={() => {
                  setSiteCurrency(curr.code);
                  setCurrencyDialogOpen(false);
                  setCurrencySearch('');
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm hover:bg-muted transition-colors cursor-pointer",
                  siteCurrency === curr.code && "bg-accent font-medium text-emerald-600"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon icon={`circle-flags:${curr.flag}`} className="size-5 rounded-full" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{curr.code}</span>
                    <span className="text-xs text-muted-foreground">{curr.name}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">{curr.symbol}</span>
              </button>
            ))}
            {filteredCurrencies.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Không tìm thấy tiền tệ nào phù hợp
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Push Logs Dialog */}
      <Dialog open={pushDialogOpen} onOpenChange={setPushDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2.5">
              <div className="size-8 rounded-full text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:database-line-duotone" className="size-4.5" />
              </div>
              <span>Đồng bộ cơ sở dữ liệu</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-3 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">Lệnh: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-foreground">npx drizzle-kit push</code></span>
              <span className="flex items-center gap-1.5 text-xs font-medium">
                {pushState === 'running' && (
                  <span className="text-sky-500 flex items-center gap-1">
                    <Icon icon="line-md:loading-twotone-loop" className="size-3.5 animate-spin" />
                    Đang chạy...
                  </span>
                )}
                {pushState === 'success' && (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <Icon icon="solar:check-circle-line-duotone" className="size-4" />
                    Đồng bộ thành công
                  </span>
                )}
                {pushState === 'error' && (
                  <span className="text-destructive flex items-center gap-1">
                    <Icon icon="solar:close-circle-line-duotone" className="size-4" />
                    Lỗi đồng bộ
                  </span>
                )}
              </span>
            </div>

            {/* Terminal-like Logs box */}
            <div className="bg-zinc-950 dark:bg-zinc-900 rounded-lg p-3 font-mono text-xs text-zinc-200 overflow-y-auto flex-1 min-h-[180px] max-h-[300px] whitespace-pre-wrap selection:bg-zinc-700 selection:text-white border border-zinc-800">
              {pushLogs}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t shrink-0">
              {pushState === 'error' && (
                <Button type="button" variant="outline" size="sm" onClick={handlePushSchema}>
                  <Icon icon="solar:refresh-line-duotone" className="size-4 mr-1.5" />
                  Thử lại
                </Button>
              )}
              <Button
                type="button"
                variant={pushState === 'success' ? 'vanixjnk' : 'outline'}
                size="sm"
                onClick={() => setPushDialogOpen(false)}
                disabled={pushState === 'running'}
              >
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
