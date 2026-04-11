import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import OtpVerification from './OtpVerification';
import ForgotPassword from './ForgotPassword';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [registeredEmail, setRegisteredEmail] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden text-slate-200">
      {/* Background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-violet-600/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-600/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-md mx-4 p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden z-10">
        
        <div className="relative">
          <div style={{ display: view === 'login' ? 'block' : 'none' }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: view === 'login' ? 1 : 0, x: view === 'login' ? 0 : -50 }}
              transition={{ duration: 0.3 }}
            >
              <Login 
                onSwitch={() => setView('register')} 
                onForgot={() => setView('forgot')}
              />
            </motion.div>
          </div>

          <div style={{ display: view === 'register' ? 'block' : 'none' }}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: view === 'register' ? 1 : 0, x: view === 'register' ? 0 : 50 }}
              transition={{ duration: 0.3 }}
            >
              <Register 
                onSwitch={() => setView('login')} 
                onRegisterSuccess={(email) => {
                  setRegisteredEmail(email);
                  setView('otp');
                }}
              />
            </motion.div>
          </div>

          <div style={{ display: view === 'otp' ? 'block' : 'none' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: view === 'otp' ? 1 : 0, scale: view === 'otp' ? 1 : 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <OtpVerification 
                email={registeredEmail}
                onBack={() => setView('login')}
                onVerified={() => setView('login')}
              />
            </motion.div>
          </div>

          <div style={{ display: view === 'forgot' ? 'block' : 'none' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: view === 'forgot' ? 1 : 0, scale: view === 'forgot' ? 1 : 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <ForgotPassword 
                onBack={() => setView('login')}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
