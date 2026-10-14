import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  DEMO_USERS, DEMO_ORGS,
  INITIAL_LISTINGS, INITIAL_REQUESTS,
  INITIAL_ASSIGNMENTS, INITIAL_DONATIONS
} from '../data/demoData';
import { useAuth } from './AuthContext';

// ─── Storage helpers ────────────────────────────────────────
const LS_KEY = 'mealmitra_demo_state';

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
function saveState(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
}

// ─── Initial state ───────────────────────────────────────────
function initialState() {
  const saved = loadState();
  return saved || {
    currentUser: DEMO_USERS[0],
    users: DEMO_USERS,
    orgs: DEMO_ORGS,
    listings: INITIAL_LISTINGS,
    requests: INITIAL_REQUESTS,
    assignments: INITIAL_ASSIGNMENTS,
    donations: INITIAL_DONATIONS,
    nextId: 100,
  };
}

// ─── Reducer ─────────────────────────────────────────────────
function reducer(state, action) {
  let next = state;
  switch (action.type) {

    case 'SYNC_AUTH_USER': {
      if (!action.profile) return state;
      const prof = action.profile;
      // Ensure org exists in state.orgs
      let orgs = state.orgs;
      if (prof.org && !orgs.some(o => o.id === prof.org)) {
        orgs = [...orgs, {
          id: prof.org,
          name: prof.organizationName || `${prof.displayName}'s Organization`,
          type: prof.organizationType || (prof.role === 'donor' ? 'restaurant' : 'ngo'),
          capacity: prof.capacity || (prof.role === 'recipient' ? 50 : null),
          preferences: prof.dietaryPreferences || ['veg'],
          location: prof.location || 'Vijayawada',
          lat: 16.506,
          lng: 80.648,
        }];
      }
      next = {
        ...state,
        currentUser: {
          id: prof.id,
          name: prof.displayName || prof.name || prof.email,
          role: prof.role,
          org: prof.org,
          email: prof.email,
          phone: prof.phone,
        },
        orgs,
      };
      break;
    }

    case 'SWITCH_USER':
      next = { ...state, currentUser: state.users.find(u => u.id === action.userId) };
      break;

    case 'RESET_DEMO':
      next = {
        currentUser: DEMO_USERS[0],
        users: DEMO_USERS, orgs: DEMO_ORGS,
        listings: INITIAL_LISTINGS, requests: INITIAL_REQUESTS,
        assignments: INITIAL_ASSIGNMENTS, donations: INITIAL_DONATIONS,
        nextId: 100,
      };
      localStorage.removeItem(LS_KEY);
      return next;

    case 'ADD_LISTING': {
      const id = `l${state.nextId}`;
      const donorId = action.donorId || state.currentUser?.id || 'u1';
      const orgId = action.orgId || state.currentUser?.org || 'o1';
      const listing = {
        ...action.listing,
        id,
        donorId,
        orgId,
        remainingQuantity: action.listing.quantity,
        status: 'listed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      next = { ...state, nextId: state.nextId + 1, listings: [listing, ...state.listings] };
      break;
    }

    case 'UPDATE_LISTING': {
      next = { ...state, listings: state.listings.map(l =>
        l.id === action.id ? { ...l, ...action.changes, updatedAt: new Date().toISOString() } : l
      )};
      break;
    }

    case 'CANCEL_LISTING': {
      next = { ...state, listings: state.listings.map(l =>
        l.id === action.id ? { ...l, status: 'cancelled', updatedAt: new Date().toISOString() } : l
      )};
      break;
    }

    case 'ADD_REQUEST': {
      const recipientId = action.recipientId || state.currentUser?.id || 'u3';
      const orgId = action.orgId || state.currentUser?.org || 'o3';

      // Prevent duplicate active requests for same listing+recipient
      const existing = state.requests.find(r =>
        r.listingId === action.listingId &&
        r.recipientId === recipientId &&
        ['requested','accepted','assigned','collected'].includes(r.status)
      );
      if (existing) return state;

      // Check remaining quantity
      const listing = state.listings.find(l => l.id === action.listingId);
      if (!listing || listing.remainingQuantity < action.quantity) return state;

      const id = `r${state.nextId}`;
      const req = {
        id,
        listingId: action.listingId,
        recipientId,
        orgId,
        quantity: action.quantity,
        status: 'requested',
        notes: action.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Reserve quantity
      const updatedListings = state.listings.map(l =>
        l.id === action.listingId
          ? { ...l, remainingQuantity: l.remainingQuantity - action.quantity, status: 'requested', updatedAt: new Date().toISOString() }
          : l
      );
      next = { ...state, nextId: state.nextId + 1, requests: [req, ...state.requests], listings: updatedListings };
      break;
    }

    case 'UPDATE_REQUEST': {
      const req = state.requests.find(r => r.id === action.id);
      if (!req) return state;
      const newRequests = state.requests.map(r =>
        r.id === action.id ? { ...r, status: action.status, updatedAt: new Date().toISOString() } : r
      );
      // If rejected/cancelled, restore quantity
      let newListings = state.listings;
      if (['rejected','cancelled'].includes(action.status)) {
        newListings = state.listings.map(l =>
          l.id === req.listingId
            ? { ...l, remainingQuantity: l.remainingQuantity + req.quantity, updatedAt: new Date().toISOString() }
            : l
        );
      }
      if (action.status === 'accepted') {
        newListings = state.listings.map(l =>
          l.id === req.listingId ? { ...l, status: 'accepted', updatedAt: new Date().toISOString() } : l
        );
      }
      next = { ...state, requests: newRequests, listings: newListings };
      break;
    }

    case 'ASSIGN_VOLUNTEER': {
      const id = `a${state.nextId}`;
      const assignment = {
        id,
        listingId: action.listingId,
        requestId: action.requestId,
        volunteerId: action.volunteerId,
        status: 'assigned',
        pickupTime: null,
        deliveryTime: null,
        notes: action.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedListings = state.listings.map(l =>
        l.id === action.listingId ? { ...l, status: 'assigned', updatedAt: new Date().toISOString() } : l
      );
      const updatedRequests = state.requests.map(r =>
        r.id === action.requestId ? { ...r, status: 'assigned', updatedAt: new Date().toISOString() } : r
      );
      next = { ...state, nextId: state.nextId + 1, assignments: [assignment, ...state.assignments], listings: updatedListings, requests: updatedRequests };
      break;
    }

    case 'UPDATE_ASSIGNMENT': {
      const assignment = state.assignments.find(a => a.id === action.id);
      if (!assignment) return state;
      const updates = { ...assignment, status: action.status, updatedAt: new Date().toISOString() };
      if (action.status === 'collected') updates.pickupTime = new Date().toISOString();
      if (action.status === 'completed') updates.deliveryTime = new Date().toISOString();

      let newListings = state.listings;
      let newRequests = state.requests;
      let newDonations = state.donations;

      if (action.status === 'collected') {
        newListings = state.listings.map(l => l.id === assignment.listingId ? { ...l, status: 'collected', updatedAt: new Date().toISOString() } : l);
        newRequests = state.requests.map(r => r.id === assignment.requestId ? { ...r, status: 'collected', updatedAt: new Date().toISOString() } : r);
      }
      if (action.status === 'completed') {
        newListings = state.listings.map(l => l.id === assignment.listingId ? { ...l, status: 'completed', updatedAt: new Date().toISOString() } : l);
        newRequests = state.requests.map(r => r.id === assignment.requestId ? { ...r, status: 'completed', updatedAt: new Date().toISOString() } : r);

        // Create donation record
        const listing = state.listings.find(l => l.id === assignment.listingId);
        const request = state.requests.find(r => r.id === assignment.requestId);
        const donorOrg = state.orgs.find(o => o.id === listing?.orgId);
        const recipientOrg = state.orgs.find(o => o.id === request?.orgId);
        const donId = `d${state.nextId}`;
        newDonations = [{
          id: donId,
          listingId: assignment.listingId,
          requestId: assignment.requestId,
          assignmentId: assignment.id,
          donorId: listing?.donorId,
          recipientId: request?.recipientId,
          volunteerId: assignment.volunteerId,
          quantity: request?.quantity || 0,
          unit: listing?.unit || 'servings',
          category: listing?.category,
          donorOrg: donorOrg?.name || 'Hotel Partner',
          recipientOrg: recipientOrg?.name || 'NGO Partner',
          location: listing?.location || 'Vijayawada',
          completedAt: new Date().toISOString(),
        }, ...state.donations];
      }

      next = {
        ...state,
        nextId: state.nextId + 1,
        assignments: state.assignments.map(a => a.id === action.id ? updates : a),
        listings: newListings,
        requests: newRequests,
        donations: newDonations,
      };
      break;
    }

    default: return state;
  }
  saveState(next);
  return next;
}

// ─── Context ─────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, initialState);
  const { profile } = useAuth();

  // Sync authenticated profile with app state
  useEffect(() => {
    if (profile) {
      dispatch({ type: 'SYNC_AUTH_USER', profile });
    }
  }, [profile]);

  const switchUser = useCallback((userId) => dispatch({ type: 'SWITCH_USER', userId }), []);
  const resetDemo  = useCallback(() => dispatch({ type: 'RESET_DEMO' }), []);
  
  const addListing = useCallback((listing) => {
    const donorId = profile?.id || state.currentUser?.id;
    const orgId = profile?.org || state.currentUser?.org;
    dispatch({ type: 'ADD_LISTING', listing, donorId, orgId });
  }, [profile, state.currentUser]);

  const updateListing = useCallback((id, changes) => dispatch({ type: 'UPDATE_LISTING', id, changes }), []);
  const cancelListing = useCallback((id) => dispatch({ type: 'CANCEL_LISTING', id }), []);
  
  const addRequest = useCallback((listingId, quantity, notes) => {
    const recipientId = profile?.id || state.currentUser?.id;
    const orgId = profile?.org || state.currentUser?.org;
    dispatch({ type: 'ADD_REQUEST', listingId, quantity, notes, recipientId, orgId });
  }, [profile, state.currentUser]);

  const updateRequest = useCallback((id, status) => dispatch({ type: 'UPDATE_REQUEST', id, status }), []);
  const assignVolunteer = useCallback((listingId, requestId, volunteerId, notes) => dispatch({ type: 'ASSIGN_VOLUNTEER', listingId, requestId, volunteerId, notes }), []);
  const updateAssignment = useCallback((id, status) => dispatch({ type: 'UPDATE_ASSIGNMENT', id, status }), []);

  return (
    <AppContext.Provider value={{
      ...state,
      currentUser: profile ? {
        id: profile.id,
        name: profile.displayName || profile.name || profile.email,
        role: profile.role,
        org: profile.org,
        email: profile.email,
        phone: profile.phone,
      } : state.currentUser,
      switchUser,
      resetDemo,
      addListing,
      updateListing,
      cancelListing,
      addRequest,
      updateRequest,
      assignVolunteer,
      updateAssignment,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
