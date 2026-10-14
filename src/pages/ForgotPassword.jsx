import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';

export default function ForgotPassword() {
  const { forgotPassword, authMode } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to process reset request.');
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
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Enter your account email to receive a password reset link
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-cream-dark p-8 animate-fade-in-up">
          {submitted ? (
            <div className="text-center space-y-4 py-3">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Reset Link Sent!</h2>
              <p className="text-sm text-gray-600">
                {authMode === 'supabase'
                  ? `We have dispatched a password recovery email to ${email}. Follow the instructions to reset your password.`
                  : `(Demo Mode) Recovery link simulated for ${email}. You can use the link below to set a new password directly.`}
              </p>
              <div className="pt-2">
                <Link to="/reset-password">
                  <Button className="w-full bg-fresh hover:bg-forest text-white py-2.5">
                    Proceed to Reset Password <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700 animate-fade-in">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
                  <div>{error}</div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-cream-light/50 text-sm focus:outline-none focus:ring-2 focus:ring-fresh"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-fresh hover:bg-forest text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-forest transition"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
