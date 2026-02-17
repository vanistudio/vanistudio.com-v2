import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './index.css';
import { ProgressProviders } from './components/providers/ProgressProvider';
import { ConsoleProvider } from './components/providers/ConsoleProvider';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProgressProviders>
      <ConsoleProvider />
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <Toaster position="top-center" richColors />
        <App />
      </ThemeProvider>
    </ProgressProviders>
  </React.StrictMode>
);