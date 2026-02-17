import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './index.css';
import { ProgressProviders } from './components/providers/ProgressProvider';
import { ConsoleProvider } from './components/providers/ConsoleProvider';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { useTheme } from 'next-themes';
import { Toaster } from "sileo";
import "sileo/styles.css";

function SileoToaster() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <Toaster
      position="top-center"
      options={{
        fill: isDark ? "black" : "white",
        styles: { description: isDark ? "text-white/75!" : "text-black/75!" },
      }}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProgressProviders>
      <ConsoleProvider />
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <SileoToaster />
        <App />
      </ThemeProvider>
    </ProgressProviders>
  </React.StrictMode>
);
