import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import { DemoBanner } from './components/ui';

// Pages
import Landing            from './pages/Landing';
import Login              from './pages/Login';
import Signup             from './pages/Signup';
import ForgotPassword     from './pages/ForgotPassword';
import ResetPassword      from './pages/ResetPassword';
import AccessDenied       from './pages/AccessDenied';
import DonorDashboard     from './pages/DonorDashboard';
import AddEditListing     from './pages/AddEditListing';
import FindFood           from './pages/FindFood';
import RecipientDashboard from './pages/RecipientDashboard';
import AIMatching         from './pages/AIMatching';
import VolunteerDashboard from './pages/VolunteerDashboard';
import ImpactDashboard    from './pages/ImpactDashboard';
import About              from './pages/About';
import FoodSafety         from './pages/FoodSafety';
import Contact            from './pages/Contact';
import Privacy            from './pages/Privacy';

// Route Guard requiring authentication
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-forest border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Authenticating...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}

// Route Guard enforcing specific account roles
function RoleGuard({ allowed, children }) {
  const { profile, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-forest border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Checking permissions...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const userRole = profile?.role || 'guest';
  if (!allowed.includes(userRole)) {
    return <AccessDenied allowedRoles={allowed} />;
  }

  return children;
}

// Redirect already-logged-in users away from login/signup
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, profile, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    const role = profile?.role;
    if (role === 'donor') return <Navigate to="/donor" replace />;
    if (role === 'recipient') return <Navigate to="/recipient" replace />;
    if (role === 'volunteer') return <Navigate to="/volunteer" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppLayout() {
  const { authMode } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-gray-900 font-sans">
      <DemoBanner authMode={authMode} />
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public Pages */}
          <Route path="/"                 element={<Landing />} />
          <Route path="/find-food"        element={<FindFood />} />
          <Route path="/ai-match"         element={<AIMatching />} />
          <Route path="/impact"           element={<ImpactDashboard />} />
          <Route path="/about"            element={<About />} />
          <Route path="/food-safety"      element={<FoodSafety />} />
          <Route path="/contact"          element={<Contact />} />
          <Route path="/privacy"          element={<Privacy />} />
          <Route path="/access-denied"    element={<AccessDenied />} />

          {/* Authentication Pages (Logged out only) */}
          <Route path="/login"            element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup"           element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/forgot-password"  element={<ForgotPassword />} />
          <Route path="/reset-password"   element={<ResetPassword />} />

          {/* Donor Routes */}
          <Route
            path="/donor"
            element={
              <ProtectedRoute>
                <RoleGuard allowed={['donor', 'admin']}>
                  <DonorDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-listing"
            element={
              <ProtectedRoute>
                <RoleGuard allowed={['donor', 'admin']}>
                  <AddEditListing />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-listing/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowed={['donor', 'admin']}>
                  <AddEditListing />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Recipient Routes */}
          <Route
            path="/recipient"
            element={
              <ProtectedRoute>
                <RoleGuard allowed={['recipient', 'admin']}>
                  <RecipientDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Volunteer Routes */}
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute>
                <RoleGuard allowed={['volunteer', 'admin']}>
                  <VolunteerDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppLayout />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#FFFFFF',
                color: '#174C3C',
                borderRadius: '16px',
                border: '1px solid #e8e3d3',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 10px 30px rgba(23, 76, 60, 0.08)',
                fontWeight: 500,
              },
              success: {
                iconTheme: {
                  primary: '#2F8057',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#DC2626',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
