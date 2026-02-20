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
import BlogList from '@/components/contents/application/_blog/BlogList';
import BlogDetail from '@/components/contents/application/_blog/BlogDetail';
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
import AdminBlog from '@/components/contents/administrator/_blog/AdminBlog';
import BlogForm from '@/components/contents/administrator/_blog/BlogForm';
import AdminProjects from '@/components/contents/administrator/_projects/AdminProjects';
import ProjectForm from '@/components/contents/administrator/_projects/ProjectForm';
import NotFound from '@/components/contents/application/_notfound/NotFound';
import ProductDetail from '@/components/contents/application/_products/ProductDetail';
import ProductList from '@/components/contents/application/_products/ProductList';
import ProjectList from '@/components/contents/application/_projects/ProjectList';
import ProjectDetail from '@/components/contents/application/_projects/ProjectDetail';
import Tool2FA from '@/components/contents/application/_tools/Tool2FA';
import ToolCheckId from '@/components/contents/application/_tools/ToolCheckId';
import ToolCheckLiveUid from '@/components/contents/application/_tools/ToolCheckLiveUid';
import ToolCheckDomain from '@/components/contents/application/_tools/ToolCheckDomain';
import AdminServices from '@/components/contents/administrator/_services/AdminServices';
import ServiceForm from '@/components/contents/administrator/_services/ServiceForm';
import ServiceList from '@/components/contents/application/_services/ServiceList';
import ServiceDetail from '@/components/contents/application/_services/ServiceDetail';
import AppContact from '@/components/contents/application/_contact/AppContact';
import LicenseCheck from '@/components/contents/application/_license/LicenseCheck';
import AdminLicenses from '@/components/contents/administrator/_licenses/AdminLicenses';
import LicenseForm from '@/components/contents/administrator/_licenses/LicenseForm';
import AdminDashboard from '@/components/contents/administrator/_dashboard/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <RouterProgressHandler />
        <Routes>
          <Route path="/" element={<ConfigGuard><Layout /></ConfigGuard>}>
            <Route index element={<AppHome />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/:slug" element={<ProductDetail />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/:slug" element={<ProjectDetail />} />
            <Route path="tools/2fa" element={<Tool2FA />} />
            <Route path="tools/check-id" element={<ToolCheckId />} />
            <Route path="tools/check-live-uid" element={<ToolCheckLiveUid />} />
            <Route path="tools/check-domain" element={<ToolCheckDomain />} />
            <Route path="services" element={<ServiceList />} />
            <Route path="services/:slug" element={<ServiceDetail />} />
            <Route path="blog" element={<BlogList />} />
            <Route path="blog/:slug" element={<BlogDetail />} />
            <Route path="contact" element={<AppContact />} />
            <Route path="license" element={<LicenseCheck />} />
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
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="categories/create" element={<CategoryForm />} />
            <Route path="categories/:id/edit" element={<CategoryForm />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/create" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="database" element={<AdminDatabase />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="blog/create" element={<BlogForm />} />
            <Route path="blog/:id/edit" element={<BlogForm />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/create" element={<ProjectForm />} />
            <Route path="projects/:id/edit" element={<ProjectForm />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="services/create" element={<ServiceForm />} />
            <Route path="services/:id/edit" element={<ServiceForm />} />
            <Route path="licenses" element={<AdminLicenses />} />
            <Route path="licenses/create" element={<LicenseForm />} />
            <Route path="licenses/:id/edit" element={<LicenseForm />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
export default App;