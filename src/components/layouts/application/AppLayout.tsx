import { Outlet } from "react-router-dom";
import AppPublicHeader from "./AppPublicHeader";
import AppFooter from "./AppFooter";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      <AppPublicHeader />
      <main className="flex-grow flex flex-col items-center pt-3">
        <div className="w-full">
          <Outlet />
        </div>
        <div className="flex-grow w-full flex">
          <div
            className="flex-grow max-w-5xl mx-5 md:mx-auto"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px), repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px)",
              backgroundPosition: "left top, right top",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1px 100%, 1px 100%",
            }}
          />
        </div>
      </main>
      <AppFooter />
    </div>
  );
};
export default AppLayout;