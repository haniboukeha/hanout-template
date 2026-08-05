import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { validateLogin } from '../../lib/validators';
import { useToastStore } from '../../store/useToastStore';

const Login = () => {
  const [email, setEmail] = useState('admin@hanout.dz');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { loginWithCredentials, isLoading, error: authError, clearError } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});

    const success = await loginWithCredentials(email, password);
    if (success) {
      addToast({ message: 'Welcome back!', type: 'success', title: 'Signed in' });
      const isAdmin = email.toLowerCase() === 'admin@hanout.dz';
      navigate(isAdmin ? '/admin' : from, { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Welcome Back</h1>
            <p className="text-slate-500 mt-2 text-sm">Sign in to your account to continue</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span className="font-medium">{authError}</span>
            </div>
          )}

          <div className="mb-6 p-4 bg-primary-50 border border-primary-100 rounded-2xl text-xs">
            <p className="font-black text-primary-900 uppercase tracking-widest text-[10px] mb-1">Demo Accounts</p>
            <p className="text-primary-700 font-medium">Admin: admin@hanout.dz / admin123</p>
            <p className="text-primary-600 font-medium">User: any email + any password ≥3 chars</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-bold text-sm ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="name@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-2 text-xs text-red-500 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-bold text-sm ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-red-500 font-medium">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-bold text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                Remember me
              </label>
              <Link to="/contact" className="font-bold text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">Don't have an account? </span>
            <Link to="/signup" className="text-primary-600 font-black hover:underline">
              Create Account
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6 font-medium">
          Secure login protected by HANOUT SSL • Encrypted & Safe
        </p>
      </div>
    </div>
  );
};

export default Login;
