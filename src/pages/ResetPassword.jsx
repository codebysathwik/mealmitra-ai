import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(password);
      toast.success('Password successfully reset! Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream-100">
      <div className="max-w-md w-full space-y-6">
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-forest text-white shadow-md mb-3">
            <KeyRound size={28} className="text-gold" />
          </div>
          <h1 className="text-3xl font-extrabold text-forest tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Set New Password
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Create a secure password to protect your account
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-cream-dark p-8 animate-fade-in-up">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700 animate-fade-in">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 bg-cream-light/50 text-sm focus:outline-none focus:ring-2 focus:ring-fresh"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-cream-light/50 text-sm focus:outline-none focus:ring-2 focus:ring-fresh"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-fresh hover:bg-forest text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
              <ArrowRight size={16} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
