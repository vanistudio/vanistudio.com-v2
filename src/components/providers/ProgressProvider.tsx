import { ProgressProvider } from '@bprogress/react';

const ProgressProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider
      height="4px"
      color="var(--primary)"
      options={{ showSpinner: true }}
    >
      {children}
    </ProgressProvider>
  );
};

export { ProgressProviders };
