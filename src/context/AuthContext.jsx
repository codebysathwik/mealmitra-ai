import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_USERS, DEMO_ORGS } from '../data/demoData';
import toast from 'react-hot-toast';

const AUTH_STORAGE_KEY = 'mealmitra_auth_session';
const USERS_STORAGE_KEY = 'mealmitra_registered_users';

// Initialize default seed users with test passwords if not already saved
function getSeedUsers() {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}

  const initial = DEMO_USERS.map(u => ({
    ...u,
    password: 'Password123!',
    displayName: u.name,
    organizationName: DEMO_ORGS.find(o => o.id === u.org)?.name || '',
    organizationType: DEMO_ORGS.find(o => o.id === u.org)?.type || '',
    location: DEMO_ORGS.find(o => o.id === u.org)?.location || 'Vijayawada',
    capacity: DEMO_ORGS.find(o => o.id === u.org)?.capacity || null,
    dietaryPreferences: DEMO_ORGS.find(o => o.id === u.org)?.preferences || [],
  }));

  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return { id: parsed.id, email: parsed.email };
      }
    } catch {}
    return null;
  });

  const [profile, setProfile] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isLoading, setIsLoading] = useState(Boolean(isSupabaseConfigured));
  const authMode = isSupabaseConfigured ? 'supabase' : 'demo';

  // Restore session on mount
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser(session.user);
            // Fetch profile
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setProfile(prof || {
              id: session.user.id,
              role: session.user.user_metadata?.role || 'recipient',
              displayName: session.user.user_metadata?.display_name || session.user.email,
              organizationName: session.user.user_metadata?.organization_name || '',
            });
          }
        } catch (err) {
          console.error('Supabase auth restoration error:', err);
        }
      } else {
        // Local Demo Auth restoration
        try {
          const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
          if (savedSession) {
            const parsed = JSON.parse(savedSession);
            if (parsed && parsed.id && mounted) {
              const allUsers = getSeedUsers();
              const found = allUsers.find(u => u.id === parsed.id);
              if (found) {
                setUser({ id: found.id, email: found.email });
                setProfile(found);
              } else {
                localStorage.removeItem(AUTH_STORAGE_KEY);
              }
            }
          }
        } catch (err) {
          console.error('Local session restoration error:', err);
        }
      }

      if (mounted) setIsLoading(false);
    }

    initAuth();

    // Listen to Supabase auth events if configured
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(prof || {
            id: session.user.id,
            role: session.user.user_metadata?.role || 'recipient',
            displayName: session.user.user_metadata?.display_name || session.user.email,
          });
        } else {
          setUser(null);
          setProfile(null);
        }
      });
      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => { mounted = false; };
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Profile loaded via onAuthStateChange
        return { success: true, user: data.user };
      } else {
        // Local Auth verification
        const users = getSeedUsers();
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!found) {
          throw new Error('No account found with this email. Please check your credentials or sign up.');
        }

        // Demo password check: accept Password123! or matching stored password
        if (found.password && found.password !== password && password !== 'Password123!') {
          throw new Error('Incorrect password. Please verify your password or use demo preset.');
        }

        const sessionUser = { id: found.id, email: found.email };
        setUser(sessionUser);
        setProfile(found);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
        return { success: true, profile: found };
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign up handler
  const signup = useCallback(async ({
    name,
    email,
    password,
    role,
    organizationName,
    organizationType = 'restaurant',
    phone = '',
    location = 'Vijayawada',
    capacity = null,
    dietaryPreferences = [],
  }) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
              role,
              organization_name: organizationName,
              organization_type: organizationType,
              phone,
              location,
            },
          },
        });
        if (error) throw error;

        if (data.user) {
          // Insert profile record
          await supabase.from('profiles').insert([{
            id: data.user.id,
            role,
            display_name: name,
            organization_name: organizationName,
            organization_type: organizationType,
            phone,
            location,
            capacity: capacity ? parseInt(capacity, 10) : null,
            dietary_preferences: dietaryPreferences,
          }]);
        }
        return { success: true, user: data.user };
      } else {
        // Local Auth registration
        const users = getSeedUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('An account with this email address already exists. Please login instead.');
        }

        const newId = `u_${Date.now()}`;
        const newOrgId = `o_${Date.now()}`;
        const newUserProfile = {
          id: newId,
          name,
          displayName: name,
          email: email.toLowerCase(),
          password,
          role,
          org: newOrgId,
          organizationName: organizationName || `${name}'s Organization`,
          organizationType: organizationType || (role === 'donor' ? 'restaurant' : 'ngo'),
          phone: phone || '9999999999',
          location: location || 'Vijayawada',
          capacity: capacity ? parseInt(capacity, 10) : (role === 'recipient' ? 50 : null),
          dietaryPreferences: dietaryPreferences || ['veg'],
          createdAt: new Date().toISOString(),
        };

        const updatedUsers = [...users, newUserProfile];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

        setUser({ id: newId, email: email.toLowerCase() });
        setProfile(newUserProfile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUserProfile));
        return { success: true, profile: newUserProfile };
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setProfile(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      toast.success('Successfully logged out');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (email) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return true;
    } else {
      // Check if user exists in local store
      const users = getSeedUsers();
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        throw new Error('No account found matching this email address.');
      }
      // Demo simulation
      return true;
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (newPassword) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return true;
    } else {
      if (!user?.email && !profile?.email) {
        throw new Error('No active reset session found.');
      }
      const targetEmail = user?.email || profile?.email;
      const users = getSeedUsers();
      const updated = users.map(u => u.email === targetEmail ? { ...u, password: newPassword } : u);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      return true;
    }
  }, [user, profile]);

  // Update profile
  const updateProfile = useCallback(async (changes) => {
    if (!profile) return;
    // Security check: users cannot elevate their role!
    if (changes.role && changes.role !== profile.role) {
      throw new Error('Permission denied: You cannot alter your account role.');
    }

    const updatedProfile = { ...profile, ...changes, updatedAt: new Date().toISOString() };
    setProfile(updatedProfile);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').update(changes).eq('id', profile.id);
    } else {
      const users = getSeedUsers();
      const updated = users.map(u => u.id === profile.id ? updatedProfile : u);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedProfile));
    }
    toast.success('Profile updated successfully');
  }, [profile]);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated: Boolean(user && profile),
      isLoading,
      authMode,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
