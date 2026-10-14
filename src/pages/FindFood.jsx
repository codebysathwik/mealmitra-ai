import { useState, useMemo } from 'react';
import { Search, Filter, X, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FoodCard, EmptyState, CardSkeleton, Button, Input, Select, ConfirmDialog } from '../components/ui';
import { isPast } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'listed', label: 'Listed' },
  { value: 'requested', label: 'Requested' },
  { value: 'accepted', label: 'Accepted' },
];
const CATEGORY_OPTS = [
  { value: '', label: 'All Categories' },
  { value: 'veg', label: '🌿 Vegetarian' },
  { value: 'non-veg', label: '🍗 Non-Vegetarian' },
];

export default function FindFood() {
  const { listings, orgs, currentUser, requests, addRequest } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('listed');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [requestModal, setRequestModal] = useState(null); // { listing }
  const [reqQty, setReqQty] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [reqErrors, setReqErrors] = useState({});

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (statusFilter && l.status !== statusFilter) return false;
      if (categoryFilter && l.category !== categoryFilter) return false;
      if (locationFilter && !l.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!l.name.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q) && !l.location.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [listings, search, statusFilter, categoryFilter, locationFilter]);

  function openRequest(listing) {
    if (currentUser.role !== 'recipient') {
      toast.error('Switch to a Recipient role to request food.');
      return;
    }
    // Check already requested
    const existing = requests.find(r =>
      r.listingId === listing.id && r.recipientId === currentUser.id &&
      ['requested','accepted','assigned','collected'].includes(r.status)
    );
    if (existing) { toast.error('You already have an active request for this listing.'); return; }
    setReqQty(String(listing.remainingQuantity));
    setReqNotes('');
    setReqErrors({});
    setRequestModal(listing);
  }

  function submitRequest() {
    const errs = {};
    const qty = Number(reqQty);
    if (!reqQty || isNaN(qty) || qty <= 0) errs.qty = 'Enter a positive quantity.';
    if (qty > requestModal.remainingQuantity) errs.qty = `Max available: ${requestModal.remainingQuantity}`;
    if (Object.keys(errs).length) { setReqErrors(errs); return; }

    addRequest(requestModal.id, qty, reqNotes);
    toast.success('Request submitted! Waiting for donor approval.');
    setRequestModal(null);
  }

  const myActiveRequests = requests.filter(r =>
    r.recipientId === currentUser.id && ['requested','accepted','assigned','collected'].includes(r.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Find Surplus Food</h1>
        <p className="text-sm text-gray-500">⚠️ Sample listings — demo mode. Browse and request available food.</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
              placeholder="Search food, location..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select id="status-filter" options={STATUS_OPTS} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} />
          <Select id="cat-filter" options={CATEGORY_OPTS} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} />
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
              placeholder="Filter by location..."
              value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
            />
          </div>
        </div>
        {(search || categoryFilter || locationFilter || statusFilter !== 'listed') && (
          <button onClick={() => { setSearch(''); setStatusFilter('listed'); setCategoryFilter(''); setLocationFilter(''); }}
            className="mt-3 text-xs text-primary-600 hover:underline flex items-center gap-1">
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">{filtered.length} listing{filtered.length !== 1 ? 's' : ''} found</span>
      </div>

      {filtered.length === 0
        ? <EmptyState icon={Search} title="No listings found" description="Try adjusting your search or filters. New food is listed throughout the day." />
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(listing => {
              const alreadyRequested = requests.some(r =>
                r.listingId === listing.id && r.recipientId === currentUser.id &&
                ['requested','accepted','assigned','collected'].includes(r.status)
              );
              const expired = isPast(new Date(listing.pickupDeadline));
              const noQty = listing.remainingQuantity <= 0;

              const actions = currentUser.role === 'recipient' ? [
                <Button key="req" size="sm"
                  disabled={alreadyRequested || expired || noQty || listing.status === 'completed'}
                  onClick={() => openRequest(listing)}>
                  {alreadyRequested ? '✓ Requested' : expired ? 'Expired' : noQty ? 'None Left' : 'Request Food'}
                </Button>
              ] : null;

              return <FoodCard key={listing.id} listing={listing} orgs={orgs} actions={actions} />;
            })}
          </div>
        )
      }

      {/* Request Modal */}
      {requestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Request Food</h3>
            <p className="text-sm text-gray-500 mb-4">
              Requesting from: <strong>{requestModal.name}</strong> · {requestModal.remainingQuantity} {requestModal.unit} available
            </p>

            {/* Allergen warning */}
            {requestModal.allergens?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800 flex gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span><strong>Allergens:</strong> {requestModal.allergens.join(', ')}. Verify suitability before accepting.</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity to Request *</label>
                <input
                  type="number" min="1" max={requestModal.remainingQuantity}
                  value={reqQty} onChange={e => { setReqQty(e.target.value); setReqErrors({}); }}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${reqErrors.qty ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {reqErrors.qty && <p className="text-xs text-red-600 mt-1">{reqErrors.qty}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea
                  rows={2} value={reqNotes} onChange={e => setReqNotes(e.target.value)}
                  placeholder="e.g. Will send vehicle by 4 PM."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 my-4 text-xs text-blue-800">
              The donor will accept or reject your request. Quantity is reserved until the request is resolved.
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setRequestModal(null)}>Cancel</Button>
              <Button onClick={submitRequest}>Submit Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
