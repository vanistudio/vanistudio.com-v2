import { Outlet } from 'react-router-dom';
import AppFooter from './AppFooter';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      <main className="flex-grow flex flex-col items-center">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
      <AppFooter />
    </div>
  );
};
export default AppLayout;