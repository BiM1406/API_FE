/**
 * OAuthSuccess.jsx
 *
 * BE redirects here after Google OAuth:
 *   http://localhost:5173/oauth-success?token=<JWT>
 *
 * This page:
 *  1. Reads the JWT from the URL query param
 *  2. Fetches /api/auth/me to get the user profile
 *  3. Saves auth to localStorage (same format as normal login)
 *  4. Redirects to /dashboard or /admin/overview
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { saveAuth } from '../../services/authService';

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('Không tìm thấy token xác thực. Vui lòng thử lại.');
      return;
    }

    async function handleOAuth() {
      try {
        // Fetch user profile using the JWT from BE
        const profileResp = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const beUser = profileResp?.data || {};

        const user = {
          id: beUser.id,
          username: beUser.username || beUser.email,
          name: beUser.name || beUser.username || beUser.email,
          email: beUser.email,
          role: String(beUser.role || 'USER').toUpperCase(),
          plan: beUser.planName || 'Free',
          status: String(beUser.status || 'ACTIVE').toUpperCase(),
          avatarUrl: beUser.avatarUrl || null,
          phone: beUser.phone || null,
          createdAt: beUser.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        // Lưu auth (cùng format với login thường)
        saveAuth(user, token);

        // Redirect based on role
        if (user.role === 'ADMIN') {
          navigate('/admin/overview', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('[OAuthSuccess] Error:', err);
        setError(err?.message || 'Xác thực Google thất bại. Vui lòng thử lại.');
      }
    }

    handleOAuth();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white px-6">
        <div className="max-w-md text-center rounded-2xl border border-red-400/20 bg-red-500/10 p-8">
          <h1 className="text-xl font-bold text-red-300 mb-3">Đăng nhập thất bại</h1>
          <p className="text-sm text-slate-400">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-slate-200 transition"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
      <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
      <p className="text-sm text-slate-400">Đang xác thực tài khoản Google...</p>
    </div>
  );
}
