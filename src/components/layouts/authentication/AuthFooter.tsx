import { Link } from 'react-router-dom';
import AppDashed from '@/components/layouts/application/AppDashed';

const AuthFooter = () => {
  const currentYear = new Date().getFullYear();

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
            <Link to="/terms" className="text-xs font-medium tracking-widest text-muted-foreground hover:text-title transition-colors">
              Điều khoản
            </Link>
            <Link to="/privacy" className="text-xs font-medium tracking-widest text-muted-foreground hover:text-title transition-colors">
              Bảo mật
            </Link>
          </div>
        </div>
      </AppDashed>
      <div className="h-full">
        <div
          className="max-w-5xl mx-5 md:mx-auto relative p-3 h-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px), repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px)",
            backgroundPosition: "left top, right top",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1px 100%, 1px 100%",
          }}>
          <div className="w-full h-full sm:min-h-[120px] min-h-[60px] bg-dot-grid" />
        </div>
      </div>
    </footer>
  );
};

export default AuthFooter;
