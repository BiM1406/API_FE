import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const AuthPage = lazy(() => import('./pages/Auth/AuthPage'));
const PricingPage = lazy(() => import('./pages/HomePage/PricingPage'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const DashboardLayout = lazy(() => import('./pages/Dashboard/DashboardLayout'));
const MyProject = lazy(() => import('./pages/Dashboard/MyProject'));
const ChatDMP = lazy(() => import('./pages/Dashboard/ChatDMP'));
const Database = lazy(() => import('./pages/Dashboard/Database'));
const History = lazy(() => import('./pages/Dashboard/History'));
const Profile = lazy(() => import('./pages/Dashboard/Profile'));
const EditProfile = lazy(() => import('./pages/Dashboard/EditProfile'));
const TestApi = lazy(() => import('./pages/Dashboard/TestApi'));
const PlaceholderTool = lazy(() => import('./pages/Dashboard/PlaceholderTool'));
const AdminOverview = lazy(() => import('./pages/Dashboard/AdminOverview'));
const UserManagement = lazy(() => import('./pages/Dashboard/UserManagement'));
const RevenueManagement = lazy(() => import('./pages/Dashboard/RevenueManagement'));
const PaymentPage = lazy(() => import('./pages/Payment/PaymentPage'));
const PaymentSuccess = lazy(() => import('./pages/Payment/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/Payment/PaymentFailed'));
const ResetPassword = lazy(() => import('./pages/Auth/ForgotPassword').then((module) => ({ default: module.ResetPasswordView })));

function RouteLoader() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 shadow-2xl shadow-black/30">
        <div className="h-5 w-5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
        <span className="text-sm font-semibold text-slate-300">Đang tải giao diện...</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        }}
      />

      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<MyProject />} />
              <Route path="/workspace" element={<ChatDMP />} />
              <Route path="/workspace/:projectId" element={<ChatDMP />} />
              <Route path="/database" element={<Database />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/test-api" element={<TestApi />} />
              <Route path="/collections" element={<PlaceholderTool type="collections" />} />
              <Route path="/environments" element={<PlaceholderTool type="environments" />} />
              <Route path="/documentation" element={<PlaceholderTool type="documentation" />} />
              <Route path="/mock-server" element={<PlaceholderTool type="mockServer" />} />
            </Route>
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
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
    </BrowserRouter>
  );
}

export default App;
