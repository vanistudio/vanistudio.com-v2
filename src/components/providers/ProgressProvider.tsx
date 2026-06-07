'use client';
 
import { ProgressProvider } from '@bprogress/next/app';
 
const ProgressProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider 
      height="4px"
      color="var(--vanixjnk)"
      options={{ showSpinner: true }}
    >
      {children}
    </ProgressProvider>
  );
};
 
export { ProgressProviders };