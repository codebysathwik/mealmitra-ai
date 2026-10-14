import { describe, it, expect } from 'vitest';

// Validation helpers matching Signup & Login components
function validateLogin(email, password) {
  if (!email || !email.includes('@')) return { valid: false, error: 'Invalid email' };
  if (!password) return { valid: false, error: 'Password required' };
  return { valid: true };
}

function validateSignup({ name, email, password, role, orgName, termsAccepted }) {
  if (!name || !name.trim()) return { valid: false, error: 'Name is required' };
  if (!email || !email.includes('@')) return { valid: false, error: 'Invalid email' };
  if (!password || password.length < 6) return { valid: false, error: 'Password too short' };
  if ((role === 'donor' || role === 'recipient') && (!orgName || !orgName.trim())) {
    return { valid: false, error: 'Organization name is required' };
  }
  if (!termsAccepted) return { valid: false, error: 'Terms must be accepted' };
  return { valid: true };
}

function checkAccess(userRole, allowedRoles) {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

function sanitizeProfileUpdate(currentProfile, updates) {
  // Security rule: users cannot change their role to obtain unauthorized access
  if (updates.role && updates.role !== currentProfile.role) {
    throw new Error('Permission denied: You cannot alter your account role.');
  }
  return { ...currentProfile, ...updates };
}

describe('Authentication & Role-Based Access Control (RBAC)', () => {
  describe('Login Validation', () => {
    it('rejects empty or invalid email addresses', () => {
      expect(validateLogin('', 'Password123!').valid).toBe(false);
      expect(validateLogin('invalidemail', 'Password123!').valid).toBe(false);
    });

    it('rejects empty passwords', () => {
      expect(validateLogin('user@example.com', '').valid).toBe(false);
    });

    it('accepts well-formed credentials', () => {
      expect(validateLogin('user@example.com', 'Password123!').valid).toBe(true);
    });
  });

  describe('Sign-Up Validation & Role Rules', () => {
    it('requires organization name for donors and recipients', () => {
      const donorWithoutOrg = {
        name: 'John',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'donor',
        orgName: '',
        termsAccepted: true,
      };
      expect(validateSignup(donorWithoutOrg).valid).toBe(false);

      const recipientWithoutOrg = { ...donorWithoutOrg, role: 'recipient' };
      expect(validateSignup(recipientWithoutOrg).valid).toBe(false);
    });

    it('allows volunteers to register without organization name', () => {
      const volunteerData = {
        name: 'Suresh',
        email: 'suresh@example.com',
        password: 'Password123!',
        role: 'volunteer',
        orgName: '',
        termsAccepted: true,
      };
      expect(validateSignup(volunteerData).valid).toBe(true);
    });

    it('requires explicit acceptance of food safety charter', () => {
      const unacceptedTerms = {
        name: 'Priya',
        email: 'priya@example.com',
        password: 'Password123!',
        role: 'donor',
        orgName: 'Grand Hotel',
        termsAccepted: false,
      };
      expect(validateSignup(unacceptedTerms).valid).toBe(false);
    });
  });

  describe('RBAC Route Guard Permissions', () => {
    const DONOR_ROLES = ['donor', 'admin'];
    const RECIPIENT_ROLES = ['recipient', 'admin'];
    const VOLUNTEER_ROLES = ['volunteer', 'admin'];

    it('permits donors to access donor routes and denies recipients/volunteers', () => {
      expect(checkAccess('donor', DONOR_ROLES)).toBe(true);
      expect(checkAccess('recipient', DONOR_ROLES)).toBe(false);
      expect(checkAccess('volunteer', DONOR_ROLES)).toBe(false);
    });

    it('permits recipients to access recipient routes and denies donors/volunteers', () => {
      expect(checkAccess('recipient', RECIPIENT_ROLES)).toBe(true);
      expect(checkAccess('donor', RECIPIENT_ROLES)).toBe(false);
      expect(checkAccess('volunteer', RECIPIENT_ROLES)).toBe(false);
    });

    it('permits volunteers to access pickup routes and denies unauthorized guests', () => {
      expect(checkAccess('volunteer', VOLUNTEER_ROLES)).toBe(true);
      expect(checkAccess('guest', VOLUNTEER_ROLES)).toBe(false);
    });
  });

  describe('Profile Immutability & Security', () => {
    it('prevents a user from escalating their own role', () => {
      const userProfile = { id: 'u1', role: 'recipient', displayName: 'Mary' };
      expect(() => sanitizeProfileUpdate(userProfile, { role: 'admin' })).toThrow(/Permission denied/);
      expect(() => sanitizeProfileUpdate(userProfile, { role: 'donor' })).toThrow(/Permission denied/);
    });

    it('allows safe updates to display name or contact information', () => {
      const userProfile = { id: 'u1', role: 'donor', displayName: 'Chef Ravi', phone: '123' };
      const updated = sanitizeProfileUpdate(userProfile, { displayName: 'Head Chef Ravi', phone: '456' });
      expect(updated.displayName).toBe('Head Chef Ravi');
      expect(updated.role).toBe('donor');
    });
  });
});
