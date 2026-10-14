// ============================================================
// DEMO DATA — All data here is SAMPLE/FICTIONAL for demo only
// ============================================================

import { addDays, subDays, subHours } from 'date-fns';

const now = new Date();

export const DEMO_USERS = [
  { id: 'u1', name: 'Ravi Kumar', role: 'donor', org: 'o1', phone: '9876543210', email: 'ravi@example.com' },
  { id: 'u2', name: 'Priya Sharma', role: 'donor', org: 'o2', phone: '9876543211', email: 'priya@example.com' },
  { id: 'u3', name: 'Sister Mary', role: 'recipient', org: 'o3', phone: '9876543212', email: 'mary@example.com' },
  { id: 'u4', name: 'Anand NGO Lead', role: 'recipient', org: 'o4', phone: '9876543213', email: 'anand@example.com' },
  { id: 'u5', name: 'Suresh Vol', role: 'volunteer', org: null, phone: '9876543214', email: 'suresh@example.com' },
  { id: 'u6', name: 'Meera Vol', role: 'volunteer', org: null, phone: '9876543215', email: 'meera@example.com' },
  { id: 'u7', name: 'Admin User', role: 'admin', org: null, phone: '9876543216', email: 'admin@example.com' },
];

export const DEMO_ORGS = [
  { id: 'o1', name: 'Hotel Srinivasa Grand', type: 'restaurant', capacity: null, preferences: [], location: 'Vijayawada', lat: 16.5062, lng: 80.648 },
  { id: 'o2', name: 'VVITU College Canteen', type: 'canteen', capacity: null, preferences: [], location: 'Gudlavalleru', lat: 16.352, lng: 81.055 },
  { id: 'o3', name: 'Grace Home Trust', type: 'ngo', capacity: 50, preferences: ['veg'], location: 'Vijayawada', lat: 16.511, lng: 80.632 },
  { id: 'o4', name: 'Helping Hands Society', type: 'ngo', capacity: 100, preferences: ['veg', 'non-veg'], location: 'Gudlavalleru', lat: 16.360, lng: 81.060 },
];

export const INITIAL_LISTINGS = [
  {
    id: 'l1', donorId: 'u1', orgId: 'o1',
    name: 'Biryani & Curry (Veg)', description: 'Freshly prepared veg biryani with dal curry. Packed in food-grade containers.',
    quantity: 30, remainingQuantity: 30, unit: 'servings', category: 'veg',
    allergens: ['dairy', 'gluten'], prepTime: subHours(now, 2).toISOString(),
    storageConditions: 'Keep warm. Consume within 4 hours of pickup.',
    location: 'Vijayawada', lat: 16.5062, lng: 80.648,
    pickupDeadline: addDays(now, 0).toISOString().replace(/T.*/, 'T20:00:00'),
    status: 'listed', imageUrl: null,
    createdAt: subHours(now, 1).toISOString(), updatedAt: subHours(now, 1).toISOString(),
  },
  {
    id: 'l2', donorId: 'u2', orgId: 'o2',
    name: 'Rice & Sambar Meal', description: 'Leftover lunch from college canteen. Standard South Indian meal.',
    quantity: 60, remainingQuantity: 45, unit: 'servings', category: 'veg',
    allergens: ['peanuts'], prepTime: subHours(now, 3).toISOString(),
    storageConditions: 'Keep at room temp. Consume within 3 hours.',
    location: 'Gudlavalleru', lat: 16.352, lng: 81.055,
    pickupDeadline: addDays(now, 0).toISOString().replace(/T.*/, 'T17:00:00'),
    status: 'listed', imageUrl: null,
    createdAt: subHours(now, 2).toISOString(), updatedAt: subHours(now, 2).toISOString(),
  },
  {
    id: 'l3', donorId: 'u1', orgId: 'o1',
    name: 'Chicken Curry & Roti', description: 'Event surplus — 40 portions of chicken curry with roti. Non-veg.',
    quantity: 40, remainingQuantity: 40, unit: 'servings', category: 'non-veg',
    allergens: ['gluten'], prepTime: subHours(now, 1).toISOString(),
    storageConditions: 'Keep refrigerated. Consume within 2 hours of pickup.',
    location: 'Vijayawada', lat: 16.505, lng: 80.65,
    pickupDeadline: addDays(now, 0).toISOString().replace(/T.*/, 'T21:00:00'),
    status: 'listed', imageUrl: null,
    createdAt: subHours(now, 0.5).toISOString(), updatedAt: subHours(now, 0.5).toISOString(),
  },
  {
    id: 'l4', donorId: 'u2', orgId: 'o2',
    name: 'Bread & Jam Packs', description: 'Morning breakfast surplus. 80 individual packed units.',
    quantity: 80, remainingQuantity: 0, unit: 'packs', category: 'veg',
    allergens: ['gluten', 'dairy'], prepTime: subHours(now, 5).toISOString(),
    storageConditions: 'Room temperature. Consume same day.',
    location: 'Gudlavalleru', lat: 16.354, lng: 81.057,
    pickupDeadline: subHours(now, 1).toISOString(),
    status: 'completed', imageUrl: null,
    createdAt: subHours(now, 6).toISOString(), updatedAt: subHours(now, 0.5).toISOString(),
  },
  {
    id: 'l5', donorId: 'u1', orgId: 'o1',
    name: 'Festival Sweets Box', description: 'Assorted sweets from a wedding event. 20 boxes each with ~500g.',
    quantity: 20, remainingQuantity: 20, unit: 'boxes', category: 'veg',
    allergens: ['dairy', 'nuts', 'sugar'], prepTime: subHours(now, 4).toISOString(),
    storageConditions: 'Keep cool. Best consumed within 24 hours.',
    location: 'Vijayawada', lat: 16.508, lng: 80.642,
    pickupDeadline: addDays(now, 1).toISOString().replace(/T.*/, 'T12:00:00'),
    status: 'listed', imageUrl: null,
    createdAt: subHours(now, 4).toISOString(), updatedAt: subHours(now, 4).toISOString(),
  },
];

export const INITIAL_REQUESTS = [
  {
    id: 'r1', listingId: 'l2', recipientId: 'u3', orgId: 'o3',
    quantity: 15, status: 'accepted',
    notes: 'Will send vehicle by 4 PM.',
    createdAt: subHours(now, 1.5).toISOString(), updatedAt: subHours(now, 1).toISOString(),
  },
  {
    id: 'r2', listingId: 'l4', recipientId: 'u4', orgId: 'o4',
    quantity: 80, status: 'completed',
    notes: '',
    createdAt: subHours(now, 5.5).toISOString(), updatedAt: subHours(now, 0.5).toISOString(),
  },
];

export const INITIAL_ASSIGNMENTS = [
  {
    id: 'a1', listingId: 'l2', requestId: 'r1', volunteerId: 'u5',
    status: 'assigned',
    pickupTime: null, deliveryTime: null,
    notes: 'Contact Priya at canteen gate.',
    createdAt: subHours(now, 0.75).toISOString(), updatedAt: subHours(now, 0.75).toISOString(),
  },
  {
    id: 'a2', listingId: 'l4', requestId: 'r2', volunteerId: 'u6',
    status: 'completed',
    pickupTime: subHours(now, 2).toISOString(),
    deliveryTime: subHours(now, 1).toISOString(),
    notes: '',
    createdAt: subHours(now, 5).toISOString(), updatedAt: subHours(now, 1).toISOString(),
  },
];

export const INITIAL_DONATIONS = [
  {
    id: 'd1', listingId: 'l4', requestId: 'r2', assignmentId: 'a2',
    donorId: 'u2', recipientId: 'u4', volunteerId: 'u6',
    quantity: 80, unit: 'packs', category: 'veg',
    donorOrg: 'VVITU College Canteen', recipientOrg: 'Helping Hands Society',
    location: 'Gudlavalleru',
    completedAt: subHours(now, 1).toISOString(),
  },
];

// Status state machine transitions
export const STATUS_TRANSITIONS = {
  draft:     ['listed', 'cancelled'],
  listed:    ['requested', 'cancelled', 'expired'],
  requested: ['accepted', 'rejected', 'cancelled'],
  accepted:  ['assigned', 'cancelled'],
  assigned:  ['collected', 'cancelled'],
  collected: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  expired:   [],
  rejected:  [],
};
