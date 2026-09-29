import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RegionProvider } from './context/RegionContext';
import { ShopFlowProvider } from './context/ShopFlowContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MerchantLayout from './components/MerchantLayout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DealsPage from './pages/DealsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WatchlistPage from './pages/WatchlistPage';
import CategoriesPage from './pages/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import StoreRegistrationPage from './pages/StoreRegistrationPage';
import StoreDashboardPage from './pages/StoreDashboardPage';
import StoreProductsPage from './pages/StoreProductsPage';
import CampaignManagerPage from './pages/CampaignManagerPage';
import StoreAnalyticsPage from './pages/StoreAnalyticsPage';
import StorePaymentPage from './pages/StorePaymentPage';
import StoreSettingsPage from './pages/StoreSettingsPage';
import HelpPage from './pages/HelpPage';
import LegalPage from './pages/LegalPage';
import MembershipPage from './pages/MembershipPage';
import ReferralProgramPage from './pages/ReferralProgramPage';
import MarketIntelligencePage from './pages/MarketIntelligencePage';
import InvestorThesisPage from './pages/InvestorThesisPage';
import SharedListPage from './pages/SharedListPage';
import ComparePage from './pages/ComparePage';
import CouponsPage from './pages/CouponsPage';
import ShippingCalculatorPage from './pages/ShippingCalculatorPage';
import CompareTray from './components/CompareTray';

const routerBasename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';

const NotFoundPage: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <p className="text-sm font-semibold text-indigo-600 mb-2">Page not found</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">This page is not part of the shop flow</h1>
      <p className="text-gray-500 mb-6">Search for a product, or go home and start from there.</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/" className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-medium">Go home</Link>
        <Link to="/search" className="px-5 py-2.5 border border-gray-300 rounded-full font-medium text-gray-700">Search</Link>
      </div>
    </div>
  </div>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isStorePortal = location.pathname.startsWith('/store') && location.pathname !== '/store/register';

  if (isAuthPage || isAdminPage) {
    return <>{children}</>;
  }

  if (isStorePortal) {
    return <MerchantLayout>{children}</MerchantLayout>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 pb-24 md:pb-16">{children}</main>
      <CompareTray />
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <RegionProvider>
          <ShopFlowProvider>
            <Router basename={routerBasename}>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/deals" element={<DealsPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/coupons" element={<CouponsPage />} />
                  <Route path="/shipping-calculator" element={<ShippingCalculatorPage />} />
                  <Route path="/watchlist" element={<WatchlistPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/membership" element={<MembershipPage />} />
                  <Route path="/referrals" element={<ReferralProgramPage />} />
                  <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
                  <Route path="/investors" element={<InvestorThesisPage />} />
                  <Route path="/shared-list/:listId" element={<SharedListPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/store/register" element={<StoreRegistrationPage />} />
                  <Route path="/store/dashboard" element={<StoreDashboardPage />} />
                  <Route path="/store/products" element={<StoreProductsPage />} />
                  <Route path="/store/campaigns" element={<CampaignManagerPage />} />
                  <Route path="/store/analytics" element={<StoreAnalyticsPage />} />
                  <Route path="/store/payment" element={<StorePaymentPage />} />
                  <Route path="/store/settings" element={<StoreSettingsPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/privacy" element={<LegalPage type="privacy" />} />
                  <Route path="/terms" element={<LegalPage type="terms" />} />
                  <Route path="/cookies" element={<LegalPage type="cookies" />} />
                  <Route path="/affiliate" element={<LegalPage type="affiliate" />} />
                  <Route path="/about" element={<LegalPage type="about" />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
            </Router>
          </ShopFlowProvider>
        </RegionProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
