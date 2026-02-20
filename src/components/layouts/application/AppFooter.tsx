import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import AppDashed from './AppDashed';

const AppFooter = () => {
  const currentYear = new Date().getFullYear();

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

  const socialLinks = [
    { icon: "logos:facebook", label: "Facebook", href: "https://facebook.com/vanistudio" },
    { icon: "logos:discord-icon", label: "Discord", href: "https://discord.gg/vanistudio" },
    { icon: "logos:telegram", label: "Telegram", href: "https://t.me/vanistudio" },
    { icon: "mdi:github", label: "GitHub", href: "https://github.com/vanistudio" },
  ];

  return (
    <footer className="w-full mt-auto">
      <AppDashed noTopBorder padding="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img src="/vanistudio.png" alt="" className="w-7 h-7 rounded-md" />
              <span className="text-sm font-bold text-title">Vani Studio</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Thiết kế và phát triển phần mềm chuyên nghiệp. Biến ý tưởng thành sản phẩm chất lượng.
            </p>
            <div className="flex items-center gap-1.5">
              <Icon icon="solar:letter-bold-duotone" className="text-xs text-muted-foreground" />
              <a href="mailto:contact@vanistudio.com" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                contact@vanistudio.com
              </a>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform" title={s.label}>
                  <Icon icon={s.icon} className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
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

          {/* Policy */}
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
          <span className="text-[10px] text-muted-foreground/60 tracking-widest">
            © {currentYear}{" "}
            <a href="//vanistudio.com" target='_blank' rel="noreferrer" className="hover:text-primary transition-colors">
              Vani Studio
            </a>
            {" "}• All rights reserved
          </span>
        </div>
      </AppDashed>
    </footer>
  );
};

export default AppFooter;