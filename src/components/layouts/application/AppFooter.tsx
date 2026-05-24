import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import AppDashed from './AppDashed';
import { useAuth } from '@/components/providers/AuthProvider';

const AppFooter = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useAuth();

  const quickLinks = [
    { label: "Sản phẩm", to: "/products" },
    { label: "Dự án", to: "/projects" },
    { label: "Dịch vụ", to: "/services" },
    { label: "Blog", to: "/blog" },
    { label: "Liên hệ", to: "/contact" },
    { label: "License", to: "/license" },
  ];

  const policyLinks = [
    { label: "Điều khoản", to: "/terms" },
    { label: "Bảo mật", to: "/privacy" },
    { label: "Hoàn tiền", to: "/refund" },
    { label: "Giao nhận", to: "/shipping" },
    { label: "Bảo hành", to: "/warranty" },
    { label: "Thanh toán", to: "/payment" },
  ];

  return (
    <footer className="w-full mt-auto">
      <AppDashed noTopBorder padding="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img src={settings?.siteLogo || "/vanistudio.png"} alt="" className="w-7 h-7 rounded-md object-contain" />
              <span className="text-sm font-bold text-title">{settings?.siteName || "Vani Studio"}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {settings?.siteDescription || "Thiết kế và phát triển phần mềm chuyên nghiệp. Biến ý tưởng thành sản phẩm chất lượng."}
            </p>
            {/* Dynamic Social Links */}
            {(settings?.socialFacebook || settings?.socialGithub || settings?.socialYoutube || settings?.socialTelegram || settings?.socialZalo) && (
              <div className="flex items-center gap-3 mt-1.5">
                {settings?.socialFacebook && (
                  <a href={settings.socialFacebook} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105" title="Facebook">
                    <Icon icon="solar:brand-facebook-bold-duotone" className="text-base" />
                  </a>
                )}
                {settings?.socialGithub && (
                  <a href={settings.socialGithub} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105" title="GitHub">
                    <Icon icon="solar:brand-github-bold-duotone" className="text-base" />
                  </a>
                )}
                {settings?.socialYoutube && (
                  <a href={settings.socialYoutube} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105" title="YouTube">
                    <Icon icon="solar:brand-youtube-bold-duotone" className="text-base" />
                  </a>
                )}
                {settings?.socialTelegram && (
                  <a href={settings.socialTelegram} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105" title="Telegram">
                    <Icon icon="solar:brand-telegram-bold-duotone" className="text-base" />
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-title uppercase tracking-wider">Liên kết</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors py-0.5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-title uppercase tracking-wider">Chính sách</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {policyLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors py-0.5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground/60 tracking-widest text-center">
            © {currentYear}{" "}
            <a href={settings?.siteUrl || "//vanistudio.com"} target='_blank' rel="noreferrer" className="hover:text-primary transition-colors">
              {settings?.siteName || "Vani Studio"}
            </a>
            {" "}• All rights reserved
          </span>
        </div>
      </AppDashed>
    </footer>
  );
};

export default AppFooter;