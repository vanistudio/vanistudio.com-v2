import { Outlet } from "react-router-dom";
import AppDashed from "@/components/layouts/application/AppDashed";
import AuthHeader from "./AuthHeader";
import AuthFooter from "./AuthFooter";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      <AuthHeader />

      <div className="relative z-50 bg-background">
        <div
          className="max-w-5xl mx-5 md:mx-auto relative p-3"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px), repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px)",
            backgroundPosition: "left top, right top",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1px 100%, 1px 100%",
          }}>
          <div className="w-full h-full sm:min-h-[100px] min-h-[60px] bg-dot-grid" />
        </div>
      </div>

      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <AuthFooter />
    </div>
  );
};

export default AuthLayout;
