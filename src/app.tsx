import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layouts/application/AppLayout';
import RouterProgressHandler from '@/components/providers/RouteProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { GuestGuard, AuthGuard, ConfigGuard, SetupGuard } from '@/components/providers/AuthGuard';
import AppHome from '@/components/contents/application/_home/AppHome';
import AppPrivacy from '@/components/contents/application/_privacy/AppPrivacy';
import AppRefund from '@/components/contents/application/_refund/AppRefund';
import AppShipping from '@/components/contents/application/_shipping/AppShipping';
import AppWarranty from '@/components/contents/application/_warranty/AppWarranty';
import AppPayment from '@/components/contents/application/_payment/AppPayment';
import AppTerms from '@/components/contents/application/_terms/AppTerms';
import AuthLayout from '@/components/layouts/authentication/AuthLayout';
import AuthLogin from '@/components/contents/authentication/_login/AuthLogin';
import AppOnboarding from '@/components/contents/application/_onboarding/AppOnboarding';
import ConfigurationPage from '@/components/contents/configuration/ConfigurationPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <RouterProgressHandler />
        <Routes>
          <Route path="/" element={<ConfigGuard><Layout /></ConfigGuard>}>
            <Route index element={<AppHome />} />
            <Route path="privacy" element={<AppPrivacy />} />
            <Route path="refund" element={<AppRefund />} />
            <Route path="shipping" element={<AppShipping />} />
            <Route path="warranty" element={<AppWarranty />} />
            <Route path="payment" element={<AppPayment />} />
            <Route path="terms" element={<AppTerms />} />
          </Route>
          <Route path="/auth" element={<ConfigGuard><AuthLayout /></ConfigGuard>}>
            <Route path="login" element={<GuestGuard><AuthLogin /></GuestGuard>} />
          </Route>
          <Route path="/onboarding" element={<ConfigGuard><AuthLayout /></ConfigGuard>}>
            <Route index element={<AuthGuard><AppOnboarding /></AuthGuard>} />
          </Route>
          <Route path="/configuration" element={<AuthLayout />}>
            <Route index element={<SetupGuard><ConfigurationPage /></SetupGuard>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
export default App;