import React from 'react';
import { cn } from '@/lib/utils';

interface AppDashedProps {
  children?: React.ReactNode;
  className?: string;
  withDotGrid?: boolean;
  noTopBorder?: boolean;
  noBottomBorder?: boolean;
  padding?: string;
  maxWidth?: string;
  grow?: boolean;
}

const AppDashed: React.FC<AppDashedProps> = ({ 
  children, 
  className, 
  withDotGrid = false,
  noTopBorder = false,
  noBottomBorder = false,
  padding = "p-3",
  maxWidth = "max-w-5xl",
  grow = false
}) => {
  return (
    <div className={cn("relative w-full overflow-hidden", grow && "flex-grow")}>
      {!noTopBorder && (
        <div className="w-full h-px border-dashed-h" />
      )}
      
      <div 
        className={cn(
          maxWidth, "md:mx-auto mx-5 relative",
          padding,
          className,
          grow && "flex-grow"
        )}
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px), repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px)',
          backgroundSize: '1px 100%, 1px 100%',
          backgroundPosition: 'left top, right top',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {withDotGrid && (
          <div className="absolute inset-0 bg-dot-grid z-[-1] opacity-40" />
        )}
        <div className="relative z-10 h-full">
          {children}
        </div>
      </div>
      {!noBottomBorder && (
        <div className="w-full h-px border-dashed-h" />
      )}
    </div>
  );
};
export default AppDashed;