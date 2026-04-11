import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import HomePage from './pages/HomePage/HomePage';
import AuthPage from './pages/Auth/AuthPage';
import PricingPage from './pages/HomePage/PricingPage';
// import Dashboard from './pages/Dashboard/Dashboard';

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

      <Routes>
        {/* Trang mặc định */}
        <Route path="/" element={<HomePage />} />

        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Pricing */}
        <Route path="/pricing" element={<PricingPage />} />

        {/* Ví dụ dashboard */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}

        {/* Redirect mọi route sai về homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;