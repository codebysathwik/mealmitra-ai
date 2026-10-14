import { describe, it, expect } from 'vitest';
import { matchRecipients } from '../lib/matching';
import { addHours, subHours } from 'date-fns';

describe('Smart Rescue AI Matching Engine', () => {
  const sampleListing = {
    id: 'l_test_1',
    name: 'Veg Meals',
    remainingQuantity: 40,
    category: 'veg',
    lat: 16.5062,
    lng: 80.6480,
    pickupDeadline: addHours(new Date(), 4).toISOString(),
  };

  const sampleOrgs = [
    {
      id: 'ngo_1',
      name: 'Grace Home',
      type: 'ngo',
      capacity: 50,
      preferences: ['veg'],
      location: 'Vijayawada',
      lat: 16.5100,
      lng: 80.6400,
    },
    {
      id: 'ngo_2',
      name: 'Non-Veg Shelter',
      type: 'ngo',
      capacity: 30,
      preferences: ['non-veg'],
      location: 'Vijayawada',
      lat: 16.5200,
      lng: 80.6500,
    },
    {
      id: 'rest_1',
      name: 'Hotel Partner',
      type: 'restaurant', // not an NGO
      location: 'Vijayawada',
    },
    {
      id: 'ngo_no_loc',
      name: 'Homeless Trust',
      type: 'ngo',
      location: null, // missing location
    },
  ];

  it('correctly filters out non-NGOs and orgs without locations', () => {
    const { eligible, ineligible } = matchRecipients(sampleListing, sampleOrgs, []);

    expect(ineligible.some(i => i.org.id === 'rest_1')).toBe(true);
    expect(ineligible.some(i => i.org.id === 'ngo_no_loc')).toBe(true);
    expect(eligible.length).toBe(2);
  });

  it('ranks higher matching dietary preferences and capacity', () => {
    const { eligible } = matchRecipients(sampleListing, sampleOrgs, []);
    
    // Grace Home (veg preference + 50 capacity > 40 quantity) should score higher than Non-Veg Shelter
    expect(eligible[0].org.id).toBe('ngo_1');
    expect(eligible[0].score).toBeGreaterThan(eligible[1].score);
  });

  it('excludes organizations with active or fulfilled requests', () => {
    const activeRequests = [
      { id: 'r1', listingId: 'l_test_1', orgId: 'ngo_1', status: 'requested' },
    ];

    const { eligible, ineligible } = matchRecipients(sampleListing, sampleOrgs, activeRequests);
    
    expect(eligible.some(e => e.org.id === 'ngo_1')).toBe(false);
    expect(ineligible.some(i => i.org.id === 'ngo_1' && i.reason.includes('active request'))).toBe(true);
  });

  it('rejects listings with passed deadlines', () => {
    const expiredListing = {
      ...sampleListing,
      pickupDeadline: subHours(new Date(), 2).toISOString(),
    };

    const { eligible, ineligible } = matchRecipients(expiredListing, sampleOrgs, []);
    expect(eligible.length).toBe(0);
    expect(ineligible.every(i => i.reason.includes('deadline') || i.reason.includes('Not a recipient') || i.reason.includes('Location'))).toBe(true);
  });

  it('ensures final score is clamped between 0 and 100', () => {
    const { eligible } = matchRecipients(sampleListing, sampleOrgs, []);
    eligible.forEach(match => {
      expect(match.score).toBeGreaterThanOrEqual(0);
      expect(match.score).toBeLessThanOrEqual(100);
    });
  });
});
