// ============================================================
// AI Matching Engine — Rule-Based (Deterministic Source of Truth)
// Gemini is only used to EXPLAIN validated results, never to
// invent recipients, locations, availability, or distances.
// ============================================================

import { isPast, differenceInHours } from 'date-fns';

/**
 * Documented scoring weights
 */
const WEIGHTS = {
  PROXIMITY:    0.30,  // only if real coords exist; never invent
  CAPACITY:     0.25,  // recipient capacity vs listing quantity
  URGENCY:      0.25,  // deadline closeness
  PREFERENCE:   0.20,  // category preference match
};

/**
 * Returns { eligible: [...{org, score, breakdown, reasons}], ineligible: [...{org, reason}] }
 */
export function matchRecipients(listing, orgs, requests) {
  const eligible = [];
  const ineligible = [];

  const alreadyFulfilled = new Set(
    requests
      .filter(r => r.listingId === listing.id && ['accepted','assigned','collected','completed'].includes(r.status))
      .map(r => r.orgId)
  );

  const alreadyRequested = new Set(
    requests
      .filter(r => r.listingId === listing.id && r.status === 'requested')
      .map(r => r.orgId)
  );

  for (const org of orgs) {
    if (org.type !== 'ngo') {
      ineligible.push({ org, reason: 'Not a recipient organisation' });
      continue;
    }
    if (alreadyFulfilled.has(org.id)) {
      ineligible.push({ org, reason: 'Already fulfilled for this listing' });
      continue;
    }
    if (alreadyRequested.has(org.id)) {
      ineligible.push({ org, reason: 'Already has an active request' });
      continue;
    }
    if (!org.location) {
      ineligible.push({ org, reason: 'Location not configured' });
      continue;
    }
    if (listing.remainingQuantity <= 0) {
      ineligible.push({ org, reason: 'No remaining quantity available' });
      continue;
    }

    // Score breakdown
    let breakdown = {};
    let score = 0;

    // 1. PROXIMITY — only if BOTH have real coords
    if (listing.lat && listing.lng && org.lat && org.lng) {
      const dist = haversineKm(listing.lat, listing.lng, org.lat, org.lng);
      const proxScore = Math.max(0, 1 - dist / 50); // 50km = 0 score
      breakdown.proximity = { score: proxScore, distanceKm: dist.toFixed(1) };
      score += proxScore * WEIGHTS.PROXIMITY;
    } else {
      breakdown.proximity = { score: 0, note: 'Coordinates not available — proximity not scored' };
      // Redistribute weight
    }

    // 2. CAPACITY vs QUANTITY
    const cap = org.capacity || 0;
    const capScore = cap >= listing.remainingQuantity ? 1
      : cap > 0 ? cap / listing.remainingQuantity
      : 0.3; // unknown capacity, partial score
    breakdown.capacity = { score: capScore, orgCapacity: cap, listingQty: listing.remainingQuantity };
    score += capScore * WEIGHTS.CAPACITY;

    // 3. URGENCY — how close to deadline
    const hoursLeft = differenceInHours(new Date(listing.pickupDeadline), new Date());
    let urgencyScore = 0;
    if (hoursLeft <= 0) {
      ineligible.push({ org, reason: 'Listing deadline has passed' });
      continue;
    } else if (hoursLeft <= 2) urgencyScore = 1.0;
    else if (hoursLeft <= 6) urgencyScore = 0.8;
    else if (hoursLeft <= 12) urgencyScore = 0.6;
    else if (hoursLeft <= 24) urgencyScore = 0.4;
    else urgencyScore = 0.2;
    breakdown.urgency = { score: urgencyScore, hoursLeft: hoursLeft.toFixed(1) };
    score += urgencyScore * WEIGHTS.URGENCY;

    // 4. PREFERENCE MATCH
    let prefScore = 0.5; // neutral if no preferences
    if (org.preferences && org.preferences.length > 0) {
      prefScore = org.preferences.includes(listing.category) ? 1.0 : 0.0;
    }
    breakdown.preference = { score: prefScore, orgPrefs: org.preferences, listingCategory: listing.category };
    score += prefScore * WEIGHTS.PREFERENCE;

    // Final score normalised 0-100
    const finalScore = Math.round(score * 100);

    const reasons = generateReasons(breakdown, finalScore, org, listing);

    eligible.push({ org, score: finalScore, breakdown, reasons });
  }

  eligible.sort((a, b) => b.score - a.score);
  return { eligible, ineligible };
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function deg2rad(d) { return d * Math.PI / 180; }

function generateReasons(breakdown, score, org, listing) {
  const reasons = [];
  if (breakdown.proximity?.distanceKm) {
    reasons.push(`${breakdown.proximity.distanceKm} km away — ${parseFloat(breakdown.proximity.distanceKm) < 10 ? 'very close' : 'moderate distance'}`);
  } else {
    reasons.push('Proximity not scored (coordinates unavailable)');
  }
  const cap = org.capacity || 0;
  if (cap >= listing.remainingQuantity) reasons.push(`Capacity (${cap}) covers full quantity (${listing.remainingQuantity})`);
  else if (cap > 0) reasons.push(`Capacity (${cap}) covers ${Math.round(cap/listing.remainingQuantity*100)}% of quantity`);
  else reasons.push('Capacity unknown — partial score assigned');

  const h = parseFloat(breakdown.urgency?.hoursLeft || 0);
  if (h <= 2) reasons.push('⚠️ Very urgent — deadline within 2 hours');
  else if (h <= 6) reasons.push(`Deadline in ~${h.toFixed(0)} hours — act soon`);
  else reasons.push(`Deadline in ~${h.toFixed(0)} hours`);

  if (breakdown.preference?.orgPrefs?.length > 0) {
    const match = breakdown.preference.score === 1;
    reasons.push(match ? `Preference match: ${listing.category}` : `Preference mismatch: org prefers ${breakdown.preference.orgPrefs.join('/')}, listing is ${listing.category}`);
  } else {
    reasons.push('No dietary preference restrictions');
  }
  return reasons;
}

/**
 * Rule-based AI assistant — answers platform FAQs only.
 * Does NOT certify food safety or replace professional advice.
 */
export const AI_ASSISTANT_RESPONSES = [
  {
    patterns: ['how do i list', 'add food', 'create listing', 'post food'],
    response: 'As a Donor, go to your Dashboard → "Add Listing". Fill in food name, quantity, pickup deadline, allergens and storage conditions. Once listed, eligible recipients can request it.',
  },
  {
    patterns: ['how do i request', 'get food', 'claim food'],
    response: 'As a Recipient/NGO, go to "Find Food", browse listings and click "Request". Your request goes to the donor, who can accept or reject. Once accepted, a volunteer may be assigned for pickup.',
  },
  {
    patterns: ['volunteer', 'pickup', 'collect'],
    response: 'Volunteers see assigned pickups on their dashboard. They update status from "Assigned" → "Collected" → "Delivered" to complete the chain.',
  },
  {
    patterns: ['safe', 'safety', 'expir', 'spoil'],
    response: '⚠️ MealMitra AI does not certify food safety. Always check preparation time, storage conditions, and allergens before accepting food. When in doubt, contact your local food safety authority.',
  },
  {
    patterns: ['impact', 'metric', 'meals saved', 'statistics'],
    response: 'Impact metrics on the dashboard count only verified completed donations. Estimated meals use the formula: 1 serving = 1 meal; 1 kg = 2.5 meals. Only completed, confirmed records are counted.',
  },
  {
    patterns: ['demo', 'sample', 'test data', 'real'],
    response: 'You are currently in Demo Mode. All data shown is fictional/sample for demonstration purposes. No real food is being tracked. To go live, configure Supabase credentials.',
  },
  {
    patterns: ['supabase', 'database', 'production', 'deploy'],
    response: 'To go to production: set up Supabase, configure env vars (VITE_SUPABASE_URL, etc.), run the SQL migrations in /supabase/migrations, and deploy to Vercel. See README.md for step-by-step instructions.',
  },
  {
    patterns: ['allergen', 'allergy', 'veg', 'non-veg', 'diet'],
    response: 'Each listing shows allergens, category (veg/non-veg), and storage conditions. Recipient orgs can set dietary preferences — the AI matching engine filters/scores based on these.',
  },
];

export function getAssistantResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  for (const item of AI_ASSISTANT_RESPONSES) {
    if (item.patterns.some(p => msg.includes(p))) {
      return item.response;
    }
  }
  return "I can help with: listing food, requesting food, understanding the matching process, food safety guidelines, volunteer pickups, impact metrics, and deployment. What would you like to know?";
}
