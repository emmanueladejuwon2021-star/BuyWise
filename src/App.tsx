import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RegionProvider } from './context/RegionContext';
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
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <RegionProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Shopper / Consumer Marketplace Routes */}
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

                {/* Developer / Platform Owner Central Command */}
                <Route path="/admin" element={<AdminDashboard />} />

                {/* Store Merchant B2B Suite */}
                <Route path="/store/register" element={<StoreRegistrationPage />} />
                <Route path="/store/dashboard" element={<StoreDashboardPage />} />
                <Route path="/store/products" element={<StoreProductsPage />} />
                <Route path="/store/campaigns" element={<CampaignManagerPage />} />
                <Route path="/store/analytics" element={<StoreAnalyticsPage />} />
                <Route path="/store/payment" element={<StorePaymentPage />} />
                <Route path="/store/settings" element={<StoreSettingsPage />} />

                {/* Support & Legal */}
                <Route path="/help" element={<HelpPage />} />
                <Route path="/privacy" element={<LegalPage type="privacy" />} />
                <Route path="/terms" element={<LegalPage type="terms" />} />
                <Route path="/cookies" element={<LegalPage type="cookies" />} />
                <Route path="/affiliate" element={<LegalPage type="affiliate" />} />
                <Route path="/about" element={<LegalPage type="about" />} />

                {/* Authentication */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Routes>
            </Layout>
          </Router>
        </RegionProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
