import { SiGithub, SiX, SiDiscord } from 'react-icons/si';
import { Link } from 'react-router-dom';
import AppDashed from './AppDashed';
const AppFooter = () => {
  const currentYear = new Date().getFullYear();

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
      <AppDashed noTopBorder padding="p-8 pb-12">
        <div className="flex flex-col gap-2 justify-center items-center">
          <div className="flex items-center gap-2">
            <img src='/vanistudio.png' className='h-[80px]' />
          </div>
          <p className="text-sm text-muted-foreground max-w-[480px] text-center">
            Thiết kế và phát triển Website để giúp cho việc kiếm tiền online của bạn trở nên tự động hóa và hiệu quả hơn. 
          </p>
          <div className="flex gap-3">
            <a href="//github.com/vanistudio" target='_blank' rel="noreferrer" className="p-2 border border-border rounded-md hover:bg-muted-background transition-colors text-muted-foreground hover:text-foreground text-primary">
              <SiGithub size={16} />
            </a>
            <a href="//x.com/primary" target='_blank' rel="noreferrer" className="p-2 border border-border rounded-md hover:bg-muted-background transition-colors text-muted-foreground hover:text-foreground text-primary">
              <SiX size={16} />
            </a>
          </div>
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground tracking-widest">
              © {currentYear}{" "}
              <a href="//vanistudio.com" target='_blank' rel="noreferrer">
                Vani Studio
              </a>
              {" "}
              • All rights reserved
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {policyLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs font-medium tracking-widest text-muted-foreground hover:text-title transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </AppDashed>
      <div className="h-full">
        <div
          className="max-w-5xl mx-5 md:mx-auto relative p-3 h-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px),          repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px)",
            backgroundPosition: "left top, right top",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1px 100%, 1px 100%",
          }}>
          <div className="w-full h-full sm:min-h-[220px] min-h-[100px] bg-dot-grid" />
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;