import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isSystemAdmin = email.toLowerCase() === 'admin@hanout.dz';
    login(email, isSystemAdmin ? 'admin' : 'user');
    navigate(isSystemAdmin ? '/admin' : '/');
  };

  return (
    <div className="max-w-md mx-auto my-20 p-8 card bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">Welcome Back</h1>
        <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Admin Checkbox removed for security/cleanliness */}

        <button type="submit" className="w-full btn-primary py-4 flex items-center justify-center gap-2">
          <LogIn size={20} />
          Sign In
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary-600 font-bold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
