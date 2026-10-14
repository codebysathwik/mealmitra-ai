import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Building, MapPin, Eye, EyeOff,
  ArrowRight, ShieldCheck, HeartHandshake, Utensils, Truck,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import toast from 'react-hot-toast';

export default function Signup() {
  const { signup, authMode } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('restaurant');
  const [location, setLocation] = useState('Vijayawada');
  const [capacity, setCapacity] = useState('50');
  const [dietaryPrefs, setDietaryPrefs] = useState(['veg']);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength checker
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isStrong = hasMinLength && hasNumber;

  function toggleDietary(pref) {
    if (dietaryPrefs.includes(pref)) {
      if (dietaryPrefs.length > 1) {
        setDietaryPrefs(dietaryPrefs.filter(p => p !== pref));
      }
    } else {
      setDietaryPrefs([...dietaryPrefs, pref]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if ((role === 'donor' || role === 'recipient') && !orgName.trim()) {
      setError('Please provide your organization name.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the MealMitra food safety & fair redistribution charter.');
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        organizationName: orgName.trim(),
        organizationType: orgType,
        location,
        capacity: role === 'recipient' ? parseInt(capacity, 10) : null,
        dietaryPreferences: role === 'recipient' ? dietaryPrefs : [],
      });

      toast.success(`Account created! Welcome, ${name}.`);

      // Route to user's dedicated dashboard
      if (role === 'donor') navigate('/donor');
      else if (role === 'recipient') navigate('/recipient');
      else if (role === 'volunteer') navigate('/volunteer');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream-100">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-forest border border-emerald-200 mb-2">
            <ShieldCheck size={14} className="text-fresh" />
            <span>{authMode === 'supabase' ? 'Supabase Auth' : 'Verified Local Demo Auth'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-forest tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Join the Food Rescue Mission
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Create an account to start donating, receiving, or delivering surplus food.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-cream-dark p-6 sm:p-8 animate-fade-in-up">
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700 animate-fade-in">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                I am registering as a:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Donor */}
                <div
                  onClick={() => { setRole('donor'); setOrgType('restaurant'); }}
                  className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all flex flex-col items-center text-center ${
                    role === 'donor'
                      ? 'border-fresh bg-primary-50/70 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                    role === 'donor' ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Utensils size={20} />
                  </div>
                  <div className="text-sm font-bold text-gray-900">Food Donor</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Hotel, Canteen, Caterer</div>
                </div>

                {/* Recipient */}
                <div
                  onClick={() => { setRole('recipient'); setOrgType('ngo'); }}
                  className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all flex flex-col items-center text-center ${
                    role === 'recipient'
                      ? 'border-fresh bg-primary-50/70 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                    role === 'recipient' ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <HeartHandshake size={20} />
                  </div>
                  <div className="text-sm font-bold text-gray-900">Recipient Org</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">NGO, Community Kitchen</div>
                </div>

                {/* Volunteer */}
                <div
                  onClick={() => setRole('volunteer')}
                  className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all flex flex-col items-center text-center ${
                    role === 'volunteer'
                      ? 'border-fresh bg-primary-50/70 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                    role === 'volunteer' ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Truck size={20} />
                  </div>
                  <div className="text-sm font-bold text-gray-900">Volunteer</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Pickup & Delivery Hero</div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-cream-light/40 text-sm focus:outline-none focus:ring-2 focus:ring-fresh"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-cream-light/40 text-sm focus:outline-none focus:ring-2 focus:ring-fresh"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 bg-cream-light/40 text-sm focus:outline-none focus:ring-2 focus:ring-fresh"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className={`flex items-center gap-1 ${hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle2 size={12} /> 8+ chars
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle2 size={12} /> Number
                  </span>
                </div>
              )}
            </div>

            {/* Organization Info (for Donor & Recipient) */}
            {role !== 'volunteer' && (
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-dark space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                  <Building size={14} /> Organization Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder={role === 'donor' ? 'e.g. Grand Hotel Canteen' : 'e.g. Helping Hands Trust'}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-fresh"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Organization Type
                    </label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-fresh"
                    >
                      {role === 'donor' ? (
                        <>
                          <option value="restaurant">Restaurant / Hotel</option>
                          <option value="canteen">College / Office Canteen</option>
                          <option value="hostel">Hostel Mess</option>
                          <option value="caterer">Event Caterer</option>
                          <option value="event_organizer">Wedding / Event Organizer</option>
                        </>
                      ) : (
                        <>
                          <option value="ngo">Registered NGO</option>
                          <option value="community_kitchen">Community Kitchen</option>
                          <option value="shelter">Orphanage / Old Age Home</option>
                          <option value="other">Food Redistribution Center</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* City & Capacity (for NGO) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <MapPin size={12} /> City / Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Vijayawada, Gudlavalleru"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-fresh"
                    />
                  </div>

                  {role === 'recipient' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Daily Feeding Capacity (People)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="2000"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-fresh"
                      />
                    </div>
                  )}
                </div>

                {/* Dietary preferences for Recipient */}
                {role === 'recipient' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Accepted Dietary Categories
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDietary('veg')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          dietaryPrefs.includes('veg')
                            ? 'bg-green-600 text-white shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-700'
                        }`}
                      >
                        ✓ Vegetarian Food
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleDietary('non-veg')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          dietaryPrefs.includes('non-veg')
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-700'
                        }`}
                      >
                        ✓ Non-Vegetarian Food
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Terms and Safety Acknowledgment */}
            <div className="flex items-start gap-3 pt-2">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-fresh rounded border-gray-300 focus:ring-fresh"
              />
              <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer">
                I agree to the <Link to="/food-safety" className="text-forest font-semibold underline">MealMitra Food Safety Guidelines</Link> and certify that all shared or received food follows hygienic standards.
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-fresh hover:bg-forest text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Existing account */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-forest hover:text-fresh underline transition">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
