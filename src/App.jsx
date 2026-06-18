import React, { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const AuthPage = lazy(() => import('./pages/Auth/AuthPage'));
const PricingPage = lazy(() => import('./pages/HomePage/PricingPage'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const DashboardLayout = lazy(() => import('./pages/Dashboard/DashboardLayout'));
const MyProject = lazy(() => import('./pages/Projects/MyProject'));
const ChatDMP = lazy(() => import('./pages/Editor/ChatDMP'));
const Database = lazy(() => import('./pages/Editor/Database'));
const History = lazy(() => import('./pages/Dashboard/History'));
const Profile = lazy(() => import('./pages/Dashboard/Profile'));
const EditProfile = lazy(() => import('./pages/Dashboard/EditProfile'));
const Settings = lazy(() => import('./pages/Dashboard/Settings'));
const TestApi = lazy(() => import('./pages/ApiTester/TestApi'));
const Collections = lazy(() => import('./pages/Dashboard/Collections'));
const Environments = lazy(() => import('./pages/Dashboard/Environments'));
const Documentation = lazy(() => import('./pages/Dashboard/Documentation'));
const MockServer = lazy(() => import('./pages/Dashboard/MockServer'));
import AdminOverview from './pages/Dashboard/AdminOverview';
import UserManagement from './pages/Dashboard/UserManagement';
import RevenueManagement from './pages/Dashboard/RevenueManagement';
const PaymentPage = lazy(() => import('./pages/Payment/PaymentPage'));
const PaymentSuccess = lazy(() => import('./pages/Payment/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/Payment/PaymentFailed'));
const OAuthSuccess = lazy(() => import('./pages/Auth/OAuthSuccess'));
const ResetPassword = lazy(() => import('./pages/Auth/ForgotPassword').then((module) => ({ default: module.ResetPasswordView })));

function RouteLoader() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 shadow-2xl shadow-black/30">
        <div className="h-5 w-5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
        <span className="text-sm font-semibold text-slate-300">{t('common.loading_ui')}</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<MyProject />} />
              <Route path="/workspace" element={<ChatDMP />} />
              <Route path="/database" element={<Database />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/test-api" element={<TestApi />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/environments" element={<Environments />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/mock-server" element={<MockServer />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/overview" element={<AdminOverview />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/revenue" element={<RevenueManagement />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </BrowserRouter>
  );
}

export default App;
