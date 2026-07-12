import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isAuthenticated } from '../../services/authService';


export default function Header() {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isLoggedIn] = useState(isAuthenticated());
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
    
    // Nếu là logo hoặc yêu cầu về trang chủ mà đang ở trang chủ rồi
    if ((path === '/' || path === '/#top') && location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Nếu là scroll đến section ngay trên trang chủ
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-4 md:pl-8 md:pr-[90px] h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">ChatDMP</span>
        </div>

        {/* Center: Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <button 
            onClick={() => handleNavigation('/#features')}
            className="hover:text-white transition-colors"
          >
            {t('header.features')}
          </button>
          <button 
            onClick={() => handleNavigation('/#guide')}
            className="hover:text-white transition-colors"
          >
            {t('header.guide')}
          </button>
          <button 
            onClick={() => handleNavigation('/pricing')}
            className="hover:text-white transition-colors"
          >
            {t('header.pricing')}
          </button>
        </nav>

        {/* Right: Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/40 transition-all hover:scale-105 active:scale-95"
                title={t('header.dashboard')}
              >
                <ArrowRight size={20} />
              </button>
          ) : (
            <>
              <button
                onClick={() => handleNavigation('/auth')}
                className="px-5 py-2.5 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
              >
                {t('header.login')}
              </button>
              <button
                onClick={() => handleNavigation('/auth?mode=register')}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                {t('header.start_free')}
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Language Switcher (Desktop - Absolute Right) */}
      <div className="hidden md:block absolute right-4 md:right-6 top-1/2 -translate-y-1/2">
        <div className="relative">
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {i18n.language === 'vi' ? 'VN' : 'ENG'}
            <ChevronDown size={14} className={`transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {isLangMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsLangMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-24 bg-slate-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => { i18n.changeLanguage('vi'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${i18n.language === 'vi' ? 'text-violet-400 font-bold' : 'text-slate-300'}`}
                >
                  VN
                </button>
                <button
                  onClick={() => { i18n.changeLanguage('en'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${i18n.language === 'en' ? 'text-violet-400 font-bold' : 'text-slate-300'}`}
                >
                  ENG
                </button>
              </div>
            </>
          )}
        </div>
      </div>


      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950 px-6 py-4 space-y-4">
          <button 
            onClick={() => handleNavigation('/#features')}
            className="block text-gray-300 hover:text-white py-2 w-full text-left"
          >
            {t('header.features')}
          </button>
          <button 
            onClick={() => handleNavigation('/#guide')}
            className="block text-gray-300 hover:text-white py-2 w-full text-left"
          >
            {t('header.guide')}
          </button>
          <button 
            onClick={() => handleNavigation('/pricing')}
            className="block text-gray-300 hover:text-white py-2 w-full text-left"
          >
            {t('header.pricing')}
          </button>
          <div className="pt-4 flex flex-col gap-3 border-t border-white/10">
            <div className="flex justify-center border-b border-white/10 pb-4 mb-2">
              <div className="flex bg-slate-900 rounded-lg p-1 border border-white/10">
                <button
                  onClick={() => i18n.changeLanguage('vi')}
                  className={`px-4 py-1.5 rounded-md text-sm transition-colors ${i18n.language === 'vi' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  VN
                </button>
                <button
                  onClick={() => i18n.changeLanguage('en')}
                  className={`px-4 py-1.5 rounded-md text-sm transition-colors ${i18n.language === 'en' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  ENG
                </button>
              </div>
            </div>

            {isLoggedIn ? (
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full hover:opacity-90 transition-opacity"
              >
                <span>{t('header.dashboard')}</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation('/auth')}
                  className="w-full px-5 py-2.5 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
                >
                  {t('header.login')}
                </button>
                <button
                  onClick={() => handleNavigation('/auth?mode=register')}
                  className="w-full px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full hover:opacity-90 transition-opacity"
                >
                  {t('header.start_free')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
