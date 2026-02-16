import { motion, AnimatePresence } from "framer-motion";
import { IconType } from "react-icons";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
interface NavLink {
  name: string;
  href: string;
  icon: IconType;
}

interface AppMenuConfigProps {
  isFloating: boolean;
  navLinks: NavLink[];
}

const AppMenuConfig = ({ isFloating, navLinks }: AppMenuConfigProps) => {
  return (
    <AnimatePresence>
      {isFloating && (
        <>
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-2 left-0 right-0 z-[110] w-full max-w-[800px] mx-auto rounded-xl border border-border bg-background backdrop-blur-xl shadow-xl hidden md:flex items-center justify-center py-2 pointer-events-auto"
          >
            <div className="max-w-[800px] w-full flex items-center justify-between px-4">
              <Link to="/" className="flex items-center gap-2 select-none">
                <img src="/image.png" alt="Logo" className="h-[50px]" />
              </Link>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-2 mr-2">
                  {navLinks.map((link) => {
                    const isExternal = link.href.startsWith("http");
                    const content = (
                      <>
                        <link.icon size={20} className="" />
                        <span className="hidden lg:inline">{link.name}</span>
                      </>
                    );
                    const className = "flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted-background cursor-pointer";

                    if (isExternal) {
                      return (
                        <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                          {content}
                        </a>
                      );
                    }

                    return (
                      <Link key={link.name} to={link.href} className={className}>
                        {content}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-[90%] justify-between fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex md:hidden items-center gap-2 p-2 rounded-2xl border border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl pointer-events-auto"
          >
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith("http");
              const content = (
                <link.icon size={24} />
              );
              const className = cn(
                "p-3 rounded-xl transition-all",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                "flex items-center justify-center"
              );

              if (isExternal) {
                return (
                  <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                    {content}
                  </a>
                );
              }

              return (
                <Link key={link.name} to={link.href} className={className}>
                  {content}
                </Link>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default AppMenuConfig;