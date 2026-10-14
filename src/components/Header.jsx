import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu, X, ChevronDown, LogOut, User, Building, Shield,
  Leaf, PlusCircle, Sparkles, LogIn, UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const NAV_LINKS = {
  donor: [
    { to: '/donor', label: 'Donor Dashboard' },
    { to: '/add-listing', label: 'Create Listing', highlight: true },
    { to: '/find-food', label: 'All Listings' },
    { to: '/impact', label: 'Impact' },
  ],
  recipient: [
    { to: '/recipient', label: 'Recipient Dashboard' },
    { to: '/find-food', label: 'Browse Food' },
    { to: '/ai-match', label: 'Smart Rescue AI' },
    { to: '/impact', label: 'Impact' },
  ],
  volunteer: [
    { to: '/volunteer', label: 'Pickup Missions' },
    { to: '/impact', label: 'Impact' },
    { to: '/about', label: 'About' },
  ],
  guest: [
    { to: '/find-food', label: 'Browse Food' },
    { to: '/ai-match', label: 'AI Matching' },
    { to: '/impact', label: 'Impact' },
    { to: '/food-safety', label: 'Food Safety' },
    { to: '/about', label: 'About' },
  ]
};

const ROLE_BADGES = {
  donor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  recipient: 'bg-blue-100 text-blue-800 border-blue-200',
  volunteer: 'bg-purple-100 text-purple-800 border-purple-200',
  admin: 'bg-gray-900 text-white border-gray-700',
};

export default function Header() {
  const { user, profile, isAuthenticated, logout, authMode } = useAuth();
  const { resetDemo } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRole = profile?.role || 'guest';
  const navLinks = isAuthenticated ? (NAV_LINKS[currentRole] || NAV_LINKS.guest) : NAV_LINKS.guest;

  async function handleLogout() {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-dark shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <Leaf size={19} className="text-emerald-300" />
            </div>
            <div>
              <span className="font-extrabold text-forest text-lg leading-none tracking-tight block" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                MealMitra<span className="text-fresh"> AI</span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide leading-none">Surplus Food Rescue</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-100 text-forest shadow-2xs'
                      : 'text-gray-600 hover:text-forest hover:bg-cream-50'
                  } ${l.highlight ? 'text-fresh font-bold' : ''}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Auth & Profile Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-gray-200 hover:border-fresh bg-cream-50/70 hover:bg-white transition-all text-sm"
                  aria-label="User profile menu"
                >
                  <div className="w-7 h-7 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs uppercase">
                    {(profile?.displayName || profile?.name || 'U')[0]}
                  </div>

                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[120px]">
                      {profile?.displayName || profile?.name}
                    </span>
                    <span className="text-[10px] text-gray-500 leading-none truncate max-w-[120px]">
                      {profile?.organizationName || profile?.role}
                    </span>
                  </div>

                  <span className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${ROLE_BADGES[profile?.role] || 'bg-gray-100'}`}>
                    {profile?.role}
                  </span>

                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
                    {/* User Summary */}
                    <div className="p-4 bg-cream-50 border-b border-cream-dark">
                      <div className="font-bold text-gray-900 text-sm truncate">
                        {profile?.displayName || profile?.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">{profile?.email}</div>
                      {profile?.organizationName && (
                        <div className="text-xs text-forest font-medium mt-1.5 flex items-center gap-1">
                          <Building size={12} /> {profile.organizationName}
                        </div>
                      )}
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${ROLE_BADGES[profile?.role]}`}>
                          {profile?.role}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {authMode === 'supabase' ? 'Supabase' : 'Local Demo'}
                        </span>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="p-2 space-y-1">
                      {profile?.role === 'donor' && (
                        <Link
                          to="/donor"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-primary-50 hover:text-forest rounded-xl transition"
                        >
                          <Shield size={14} /> Donor Dashboard
                        </Link>
                      )}
                      {profile?.role === 'recipient' && (
                        <Link
                          to="/recipient"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-primary-50 hover:text-forest rounded-xl transition"
                        >
                          <Shield size={14} /> Recipient Dashboard
                        </Link>
                      )}
                      {profile?.role === 'volunteer' && (
                        <Link
                          to="/volunteer"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-primary-50 hover:text-forest rounded-xl transition"
                        >
                          <Shield size={14} /> Volunteer Missions
                        </Link>
                      )}
                    </div>

                    {/* Switch / Reset / Logout */}
                    <div className="p-2 border-t border-gray-100 bg-gray-50/50 space-y-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition text-left"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-forest hover:bg-cream-50 border border-transparent hover:border-gray-200 transition"
                >
                  <LogIn size={15} className="inline mr-1 sm:hidden" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-fresh hover:bg-forest text-white shadow-xs hover:shadow transition flex items-center gap-1.5"
                >
                  <UserPlus size={15} />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-cream-dark px-4 py-4 space-y-2 animate-fade-in">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm font-semibold ${
                  isActive ? 'bg-primary-100 text-forest' : 'text-gray-700 hover:bg-cream-50'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {!isAuthenticated && (
            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-center rounded-xl text-xs font-bold text-forest border border-gray-200 bg-cream-50"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-center rounded-xl text-xs font-bold text-white bg-fresh"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
