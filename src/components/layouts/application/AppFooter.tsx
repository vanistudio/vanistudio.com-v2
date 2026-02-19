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
    </footer>
  );
};

export default AppFooter;