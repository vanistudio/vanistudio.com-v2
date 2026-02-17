import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layouts/application/AppLayout';
import AdminLayout from '@/components/layouts/administrator/AdminLayout';
import RouterProgressHandler from '@/components/providers/RouteProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { GuestGuard, AuthGuard, ConfigGuard, SetupGuard, AdminGuard } from '@/components/providers/AuthGuard';
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
import AdminUsers from '@/components/contents/administrator/_users/AdminUsers';
import AdminCategories from '@/components/contents/administrator/_categories/AdminCategories';
import CategoryForm from '@/components/contents/administrator/_categories/CategoryForm';
import AdminProducts from '@/components/contents/administrator/_products/AdminProducts';
import ProductForm from '@/components/contents/administrator/_products/ProductForm';
import AdminDatabase from '@/components/contents/administrator/_database/AdminDatabase';
import AdminSettings from '@/components/contents/administrator/_settings/AdminSettings';

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
          <Route path="/admin" element={<ConfigGuard><AdminGuard><AdminLayout /></AdminGuard></ConfigGuard>}>
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="categories/create" element={<CategoryForm />} />
            <Route path="categories/:id/edit" element={<CategoryForm />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/create" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="database" element={<AdminDatabase />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
export default App;