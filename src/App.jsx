import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/Auth/AuthPage';
import { ResetPasswordView as ResetPassword } from './pages/Auth/ForgotPassword';

// Trang tạm thời - dev khác sẽ tự thay bằng trang thật của mình
function HomePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🏠 Trang Chủ (Homepage)</h1>
      <p>Dev làm trang chủ sẽ thay thế component này.</p>
      <a href="/auth" style={{ color: 'blue' }}>→ Đi tới trang Auth</a>
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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Dev khác thêm route của mình vào đây */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;