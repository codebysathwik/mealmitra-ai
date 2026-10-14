import { describe, it, expect } from 'vitest';

// Inventory management simulation logic mirroring AppContext reducer
function requestFood(listing, requestedQuantity) {
  if (requestedQuantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }
  if (requestedQuantity > listing.remainingQuantity) {
    throw new Error('Requested quantity exceeds available surplus');
  }

  const updatedRemaining = listing.remainingQuantity - requestedQuantity;
  return {
    ...listing,
    remainingQuantity: updatedRemaining,
    status: updatedRemaining === 0 ? 'requested' : 'listed',
  };
}

function restoreFood(listing, returnedQuantity) {
  const restoredQuantity = Math.min(listing.quantity, listing.remainingQuantity + returnedQuantity);
  return {
    ...listing,
    remainingQuantity: restoredQuantity,
    status: 'listed',
  };
}

function transitionStatus(currentStatus, action) {
  const validTransitions = {
    listed: ['requested', 'cancelled'],
    requested: ['accepted', 'rejected', 'cancelled'],
    accepted: ['assigned', 'cancelled'],
    assigned: ['collected', 'cancelled'],
    collected: ['completed'],
    completed: [],
    cancelled: [],
    rejected: [],
  };

  const allowed = validTransitions[currentStatus] || [];
  if (!allowed.includes(action)) {
    throw new Error(`Invalid status transition from "${currentStatus}" to "${action}"`);
  }
  return action;
}

describe('Food Surplus Inventory & Status Lifecycle', () => {
  const initialListing = {
    id: 'l_test_100',
    quantity: 50,
    remainingQuantity: 50,
    status: 'listed',
  };

  describe('Inventory Reservation & Quantity Checks', () => {
    it('successfully reserves quantity when available', () => {
      const updated = requestFood(initialListing, 30);
      expect(updated.remainingQuantity).toBe(20);
      expect(updated.status).toBe('listed');
    });

    it('marks listing as fully requested when all surplus is claimed', () => {
      const updated = requestFood(initialListing, 50);
      expect(updated.remainingQuantity).toBe(0);
      expect(updated.status).toBe('requested');
    });

    it('throws error when requesting more than remaining inventory', () => {
      expect(() => requestFood(initialListing, 60)).toThrow(/exceeds available surplus/);
    });

    it('restores food quantity when request is rejected or cancelled', () => {
      const reserved = requestFood(initialListing, 25);
      expect(reserved.remainingQuantity).toBe(25);

      const restored = restoreFood(reserved, 25);
      expect(restored.remainingQuantity).toBe(50);
      expect(restored.status).toBe('listed');
    });
  });

  describe('Workflow Status Lifecycle Transitions', () => {
    it('follows valid sequence from listed to completed', () => {
      let status = 'listed';
      status = transitionStatus(status, 'requested');
      expect(status).toBe('requested');

      status = transitionStatus(status, 'accepted');
      expect(status).toBe('accepted');

      status = transitionStatus(status, 'assigned');
      expect(status).toBe('assigned');

      status = transitionStatus(status, 'collected');
      expect(status).toBe('collected');

      status = transitionStatus(status, 'completed');
      expect(status).toBe('completed');
    });

    it('blocks illegal status skips or regressions', () => {
      // Cannot jump from listed directly to completed
      expect(() => transitionStatus('listed', 'completed')).toThrow(/Invalid status transition/);
      // Cannot jump from completed back to requested
      expect(() => transitionStatus('completed', 'requested')).toThrow(/Invalid status transition/);
    });
  });
});
