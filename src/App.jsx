import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import HomePage from './pages/HomePage/HomePage';
import AuthPage from './pages/Auth/AuthPage';
import PricingPage from './pages/HomePage/PricingPage';
import MenuHome from './pages/MenuHome/MenuHome';
import AiWorkspace from './pages/AiWorkspace/AiWorkspace';
import AiDatabase from './pages/AiWorkspace/AiDatabase';
import History from './pages/AiWorkspace/History';
import Profile from './pages/AiWorkspace/Profile';
import TestApi from './pages/AiWorkspace/TestApi';
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
        {/* Trang mặc định */}
        <Route path="/" element={<HomePage />} />

        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Pricing */}
        <Route path="/pricing" element={<PricingPage />} />

        {/* Reset Password */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* MenuHome = layout cha */}
        <Route path="/MenuHome" element={<MenuHome />}>
          {/* default khi vào MenuHome */}
          <Route index element={<AiWorkspace />} />

          {/* các trang con */}
          <Route path="workspace" element={<AiWorkspace />} />
          <Route path="database" element={<AiDatabase />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="test-api" element={<TestApi />} />
        </Route>

        {/* Redirect mọi route sai */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;