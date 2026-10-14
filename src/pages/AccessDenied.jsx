import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';

export default function AccessDenied({ allowedRoles = [] }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  function handleGoToDashboard() {
    if (profile?.role === 'donor') navigate('/donor');
    else if (profile?.role === 'recipient') navigate('/recipient');
    else if (profile?.role === 'volunteer') navigate('/volunteer');
    else navigate('/');
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-cream-100">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-cream-dark p-8 text-center animate-fade-in-up">
        
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <ShieldAlert size={36} />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Access Restricted
        </h1>
        
        <p className="mt-2 text-sm text-gray-600">
          Your current account role (<strong className="capitalize text-forest font-bold">{profile?.role || 'Guest'}</strong>) does not have permission to view this resource.
        </p>

        {allowedRoles.length > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            This area is restricted to: <strong className="capitalize">{allowedRoles.join(' or ')}</strong> accounts only.
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            onClick={handleGoToDashboard}
            className="w-full bg-fresh hover:bg-forest text-white py-2.5"
          >
            <Home size={16} /> Return to My Dashboard
          </Button>

          <Button
            variant="secondary"
            onClick={logout}
            className="w-full py-2.5 text-gray-700 hover:text-red-600 border-gray-200 hover:border-red-200"
          >
            <LogOut size={16} /> Sign In with Different Account
          </Button>
        </div>
      </div>
    </div>
  );
}
