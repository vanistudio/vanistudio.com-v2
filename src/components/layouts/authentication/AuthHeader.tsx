import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function AuthHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-full fixed top-0 right-0 z-[100] pointer-events-none">
      <div className="pointer-events-none">
        <div className="flex justify-end p-3 pointer-events-auto">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-[6px] hover:bg-muted-background border border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="h-4 w-4 hidden dark:block" />
          </button>
        </div>
      </div>
    </div>
  );
}
