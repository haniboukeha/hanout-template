import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Mail, Lock, UserPlus, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { validateSignUp } from '../../lib/validators';
import { useToastStore } from '../../store/useToastStore';

const SignUp = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isLoading, error: authError, clearError } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const validation = validateSignUp(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});

    const success = await register(form.name, form.email, form.password);
    if (success) {
      addToast({ message: 'Account created successfully!', type: 'success', title: 'Welcome to HANOUT' });
      navigate('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Create Account</h1>
            <p className="text-slate-500 mt-2 text-sm">Join us for a premium shopping experience</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span className="font-medium">{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-bold text-sm ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-2 text-xs text-red-500 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-bold text-sm ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="mt-2 text-xs text-red-500 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full pl-12 pr-12 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-bold text-sm ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-xs text-red-500 font-medium">{errors.password}</p>}
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { label: '6+ chars', ok: form.password.length >= 6 },
                  { label: 'Uppercase', ok: /[A-Z]/.test(form.password) },
                  { label: 'Number', ok: /\d/.test(form.password) },
                ].map((c, i) => (
                  <div key={i} className={`text-[10px] font-bold flex items-center gap-1 ${c.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CheckCircle2 size={10} className={c.ok ? 'text-emerald-500' : 'text-slate-300'} />
                    {c.label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-bold text-sm ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="mt-2 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start gap-3 text-xs">
              <input type="checkbox" required id="terms" className="mt-1 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              <label htmlFor="terms" className="text-slate-600 leading-relaxed">
                I agree to the <Link to="/about" className="font-bold text-slate-900 hover:underline">Terms of Service</Link> and <Link to="/about" className="font-bold text-slate-900 hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] disabled:opacity-50">
              {isLoading ? 'Creating account...' : <><UserPlus size={20} /> Create Account</>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">Already have an account? </span>
            <Link to="/login" className="text-primary-600 font-black hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
