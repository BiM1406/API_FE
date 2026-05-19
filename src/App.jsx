import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import HomePage from './pages/HomePage/HomePage';
import AuthPage from './pages/Auth/AuthPage';
import PricingPage from './pages/HomePage/PricingPage';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import MyProject from './pages/Projects/MyProject';
import ChatDMP from './pages/Editor/ChatDMP';
import Database from './pages/Editor/Database';
import History from './pages/Dashboard/History';
import Profile from './pages/Dashboard/Profile';
import EditProfile from './pages/Dashboard/EditProfile';
import TestApi from './pages/ApiTester/TestApi';
import AdminOverview from './pages/Dashboard/AdminOverview';
import UserManagement from './pages/Dashboard/UserManagement';
import RevenueManagement from './pages/Dashboard/RevenueManagement';
import Settings from './pages/Dashboard/Settings';
import { ResetPasswordView as ResetPassword } from './pages/Auth/ForgotPassword';
import PaymentPage from './pages/Payment/PaymentPage';
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import PaymentFailed from './pages/Payment/PaymentFailed';

function App() {
  return (
    <BrowserRouter>

      {/* Toast config */}
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

      <Routes>
        {/* Trang mặc định (Landing) */}
        <Route path="/" element={<HomePage />} />

        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Pricing & Payment */}
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />

        {/* Reset Password */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard Layout for Main View */}
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
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/overview" element={<AdminOverview />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/revenue" element={<RevenueManagement />} />
          </Route>
        </Route>

        {/* Redirect mọi route sai */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;