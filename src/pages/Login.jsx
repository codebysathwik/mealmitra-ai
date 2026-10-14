import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Leaf, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, authMode } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quick demo fill buttons
  const demoAccounts = [
    { label: 'Donor Demo', email: 'ravi@example.com', role: 'donor', desc: 'Hotel Srinivasa' },
    { label: 'Recipient Demo', email: 'mary@example.com', role: 'recipient', desc: 'Grace Home Trust' },
    { label: 'Volunteer Demo', email: 'suresh@example.com', role: 'volunteer', desc: 'Pickup Hero' },
  ];

  function handleDemoSelect(demoEmail) {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success('Welcome back to MealMitra AI!');
      
      // Determine redirection target
      const userRole = res?.profile?.role || 'recipient';
      let target = redirectPath;
      if (!target || target === '/' || target === '/login') {
        if (userRole === 'donor') target = '/donor';
        else if (userRole === 'recipient') target = '/recipient';
        else if (userRole === 'volunteer') target = '/volunteer';
        else target = '/';
      }
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream-100">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header Card */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-forest text-white shadow-md mb-3">
            <Leaf size={28} className="text-emerald-300" />
          </div>
          <h1 className="text-3xl font-extrabold text-forest tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Welcome to MealMitra
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Sign in to access your surplus food rescue dashboard
          </p>

          {/* Mode Badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-forest border border-emerald-200">
            <ShieldCheck size={14} className="text-fresh" />
            <span>{authMode === 'supabase' ? 'Supabase Auth Active' : 'Demo Auth Mode (Local Storage)'}</span>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-3xl shadow-xl border border-cream-dark p-8 animate-fade-in-up">
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700 animate-fade-in">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-cream-light/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fresh focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-fresh hover:text-forest transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 bg-cream-light/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fresh focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-fresh hover:bg-forest text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2.5">
              <Sparkles size={14} className="text-gold" />
              <span>One-Click Demo Credentials:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map(demo => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleDemoSelect(demo.email)}
                  className="text-left p-2 rounded-xl border border-gray-200 hover:border-fresh hover:bg-primary-50 transition group"
                >
                  <div className="text-[11px] font-bold text-gray-800 group-hover:text-forest capitalize">
                    {demo.role}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">{demo.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-600">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-bold text-forest hover:text-fresh underline transition">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
