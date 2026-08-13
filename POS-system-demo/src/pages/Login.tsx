import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, AlertCircleIcon, Loader2Icon, ShieldCheckIcon, ZapIcon } from 'lucide-react';
import { Field, inputClass } from '../components/ui/Field';
import { useAuth } from '../contexts/AuthContext';

function NexPOSMark({ size = 40 }: { size?: number }) {
  return (
    <img 
      src="/logo.png" 
      alt="NexPOS Logo" 
      style={{ width: size, height: size, objectFit: 'contain' }} 
    />
  );
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('demo') === 'true') {
      const autoLogin = async () => {
        setEmail('demo@business.com');
        setPassword('demo123');
        setLoading(true);
        const { success, role } = await login('demo@business.com', 'demo123');
        setLoading(false);
        if (success) {
          if (role === 'SUPER_ADMIN') {
            navigate('/super-admin');
          } else {
            navigate('/dashboard');
          }
        } else {
          setError('Demo login failed. Please ensure the backend is running and seeded.');
        }
      };
      autoLogin();
    }
  }, [location.search, login, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email address and password');
      return;
    }
    setError('');
    setLoading(true);

    const { success, role } = await login(email, password);
    setLoading(false);
    if (success) {
      if (role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError('Invalid credentials. Use password: demo123');
    }
  }

  function quickLogin(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
  }

  return (
    <div className="relative flex min-h-full w-full items-center justify-center overflow-hidden bg-[#0b0f1e] px-4 py-12">

      {/* ── Background — animated radial glow + grid ──────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Deep glow behind the card */}
        <div
          className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #3B5BFF 0%, #1e1b4b 60%, transparent 100%)' }}
        />
        {/* Secondary soft glow */}
        <div
          className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full opacity-15 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #7f8cff 0%, transparent 70%)' }}
        />
        {/* Subtle dot-grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #7f8cff 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* ── Login card ──────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-[420px]">

        {/* Glowing ring around card */}
        <div
          className="absolute -inset-px rounded-[18px] opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(59,91,255,0.5) 0%, transparent 50%, rgba(127,140,255,0.3) 100%)',
          }}
          aria-hidden="true"
        />

        <div
          className="relative rounded-[17px] border border-white/10 p-8"
          style={{
            background: 'rgba(15, 20, 40, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 32px 64px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >

          {/* Brand identity */}
          <div className="flex items-center gap-3">
            <NexPOSMark size={40} />
            <div>
              <p className="text-base font-bold tracking-tight text-white">NexPOS</p>
              <p className="text-xs text-slate-400">Enterprise Point of Sale &amp; Inventory</p>
            </div>
          </div>

          <h1 className="mt-8 text-xl font-semibold tracking-tight text-white">
            Sign in to your account
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Enter your credentials to access the dashboard.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-invalid={Boolean(error)}
                  className={`block w-full rounded-lg border bg-white/5 px-3 py-2.5 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:ring-2 ${
                    error
                      ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-white/10 focus:border-brand-500 focus:ring-brand-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition-colors hover:text-slate-300"
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {error && (
                <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-400">
                  <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {error}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 hover:shadow-brand-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Authenticating…
                </>
              ) : (
                <>
                  <ZapIcon className="h-4 w-4" aria-hidden="true" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Panel */}
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5">
              <span className="text-base">🎬</span>
              <p className="text-xs font-semibold text-slate-300">Demo Mode — Click to pre-fill credentials</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-white/5">
              {[
                { label: 'Admin', email: 'admin@demo.com', color: 'hover:text-indigo-300', emoji: '👑' },
                { label: 'Manager', email: 'manager@demo.com', color: 'hover:text-emerald-300', emoji: '🏪' },
                { label: 'Cashier', email: 'cashier@demo.com', color: 'hover:text-sky-300', emoji: '💳' },
              ].map(({ label, email: demoEmail, color, emoji }) => (
                <button
                  key={label}
                  type="button"
                  id={`demo-login-${label.toLowerCase()}`}
                  onClick={() => quickLogin(demoEmail)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-2 text-slate-400 transition-colors ${color}`}
                >
                  <span className="text-base">{emoji}</span>
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
            <div className="px-3 py-2 border-t border-white/5">
              <p className="text-[11px] text-slate-600 text-center">
                All accounts use password: <code className="font-mono text-slate-500">demo123</code>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-600">
          NexPOS Enterprise &copy; {new Date().getFullYear()} &nbsp;·&nbsp; Built by{' '}
          <span className="text-slate-500 font-medium">Sithum Udayanga</span>
        </p>
      </div>
    </div>
  );
}

export default Login;