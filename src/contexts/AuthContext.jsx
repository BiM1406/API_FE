import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Giả lập check login từ localStorage
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    // MOCK LOGIN LOGIC
    if (email === 'admin' && password === '123456') {
      const adminData = {
        id: '1',
        name: 'Quản trị viên',
        email: 'admin@devai.com',
        role: 'admin',
        avatar: ''
      };
      setUser(adminData);
      localStorage.setItem('mockUser', JSON.stringify(adminData));
      localStorage.setItem('token', 'fake-jwt-token'); // For components that rely on token
      toast.success('Đăng nhập thành công với quyền Admin');
      return { success: true, role: 'admin' };
    }
    
    if (email === 'user' && password === '123456') {
      const userData = {
        id: '2',
        name: 'Người dùng',
        email: 'user@devai.com',
        role: 'user',
        avatar: ''
      };
      setUser(userData);
      localStorage.setItem('mockUser', JSON.stringify(userData));
      localStorage.setItem('token', 'fake-jwt-token'); 
      toast.success('Đăng nhập thành công với quyền User');
      return { success: true, role: 'user' };
    }

    toast.error('Email hoặc mật khẩu không đúng!');
    return { success: false };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
    localStorage.removeItem('token');
    toast.success('Đã đăng xuất ra khỏi hệ thống');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
