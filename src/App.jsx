import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import HomePage from './pages/HomePage/HomePage';
import AuthPage from './pages/Auth/AuthPage';
import PricingPage from './pages/HomePage/PricingPage';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
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

        {/* Pricing */}
        <Route path="/pricing" element={<PricingPage />} />

        {/* Reset Password */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard Layout for Main View */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<MyProject />} />
          <Route path="/workspace" element={<ChatDMP />} />
          <Route path="/database" element={<Database />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/test-api" element={<TestApi />} />

          {/* Admin Routes */}
          <Route path="/admin/overview" element={<AdminOverview />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/revenue" element={<RevenueManagement />} />
        </Route>

        {/* Redirect mọi route sai */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;