import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Menu, X } from 'lucide-react';
import { isAuthenticated } from '../../services/authService';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = isAuthenticated();

  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);

    if ((path === '/' || path === '/#top') && location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (path.startsWith('/#') && location.pathname === '/') {
      const id = path.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    navigate(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">ChatDMP</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <button onClick={() => handleNavigation('/#features')} className="hover:text-white transition-colors">
            Tính năng
          </button>
          <button onClick={() => handleNavigation('/#guide')} className="hover:text-white transition-colors">
            Hướng dẫn
          </button>
          <button onClick={() => handleNavigation('/pricing')} className="hover:text-white transition-colors">
            Gói dịch vụ
          </button>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {loggedIn ? (
            <>
              <button
                onClick={() => handleNavigation('/profile/edit?tab=subscription')}
                className="px-5 py-2.5 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
              >
                Hồ sơ
              </button>
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavigation('/auth')}
                className="px-5 py-2.5 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => handleNavigation('/auth?mode=register')}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                Bắt đầu miễn phí
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950 px-6 py-4 space-y-4">
          <button onClick={() => handleNavigation('/#features')} className="block text-gray-300 hover:text-white py-2 w-full text-left">
            Tính năng
          </button>
          <button onClick={() => handleNavigation('/#guide')} className="block text-gray-300 hover:text-white py-2 w-full text-left">
            Hướng dẫn
          </button>
          <button onClick={() => handleNavigation('/pricing')} className="block text-gray-300 hover:text-white py-2 w-full text-left">
            Gói dịch vụ
          </button>
          <div className="pt-4 flex flex-col gap-3 border-t border-white/10">
            {loggedIn ? (
              <>
                <button
                  onClick={() => handleNavigation('/profile/edit?tab=subscription')}
                  className="w-full px-5 py-2.5 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
                >
                  Hồ sơ
                </button>
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className="w-full px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full hover:opacity-90 transition-opacity"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation('/auth')}
                  className="w-full px-5 py-2.5 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => handleNavigation('/auth?mode=register')}
                  className="w-full px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full hover:opacity-90 transition-opacity"
                >
                  Bắt đầu miễn phí
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
