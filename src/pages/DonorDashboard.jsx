import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit3, Trash2, CheckCircle, XCircle, Clock, Package,
  ChevronRight, Users, Building, Phone, MapPin, Truck, AlertTriangle,
  History, Sparkles, Filter, CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  StatusBadge, CategoryBadge, EmptyState, PageHeader, Button,
  ConfirmDialog, StatusTimeline, StatCard
} from '../components/ui';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function DonorDashboard() {
  const { listings, requests, orgs, assignments, cancelListing, updateRequest, assignVolunteer, users, donations } = useApp();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'pickups' | 'history'
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const currentDonorId = profile?.id || 'u1';
  const myOrg = orgs.find(o => o.id === profile?.org) || {
    name: profile?.organizationName || 'Hotel Grand',
    type: profile?.organizationType || 'Restaurant',
    location: profile?.location || 'Vijayawada',
    phone: profile?.phone || '9876543210'
  };

  // Derive listings owned by this donor
  const myListings = useMemo(() => {
    return listings.filter(l => l.donorId === currentDonorId || (profile?.org && l.orgId === profile.org));
  }, [listings, currentDonorId, profile]);

  // Derive incoming requests for this donor's listings
  const myRequests = useMemo(() => {
    return requests.filter(r => {
      const listing = listings.find(l => l.id === r.listingId);
      return listing?.donorId === currentDonorId || (profile?.org && listing?.orgId === profile.org);
    });
  }, [requests, listings, currentDonorId, profile]);

  // Derived metrics
  const activeListings = myListings.filter(l => ['listed', 'requested', 'accepted', 'assigned', 'collected'].includes(l.status));
  const completedListings = myListings.filter(l => l.status === 'completed');
  const pendingRequests = myRequests.filter(r => r.status === 'requested');

  // Available food quantity (servings)
  const availableServings = activeListings.reduce((sum, l) => sum + (l.remainingQuantity || 0), 0);

  // Total food rescued (servings)
  const donorDonations = donations.filter(d => d.donorId === currentDonorId || (profile?.org && d.donorOrg === myOrg.name));
  const totalFoodRescued = donorDonations.reduce((sum, d) => sum + (d.quantity || 0), 0) + (completedListings.length * 40);

  // Filtered listings
  const filteredListings = useMemo(() => {
    if (statusFilter === 'all') return myListings;
    if (statusFilter === 'active') return activeListings;
    if (statusFilter === 'completed') return completedListings;
    if (statusFilter === 'cancelled') return myListings.filter(l => ['cancelled', 'expired'].includes(l.status));
    return myListings.filter(l => l.status === statusFilter);
  }, [myListings, statusFilter, activeListings, completedListings]);

  // Upcoming pickups
  const upcomingPickups = useMemo(() => {
    return assignments.filter(a => {
      const listing = listings.find(l => l.id === a.listingId);
      return (listing?.donorId === currentDonorId || (profile?.org && listing?.orgId === profile.org)) &&
        ['assigned', 'collected'].includes(a.status);
    });
  }, [assignments, listings, currentDonorId, profile]);

  const volunteers = users.filter(u => u.role === 'volunteer');

  function handleAccept(req) {
    updateRequest(req.id, 'accepted');
    const vol = volunteers[0];
    if (vol) {
      assignVolunteer(req.listingId, req.id, vol.id, 'Auto-assigned via donor confirmation.');
    }
    toast.success('Donation request accepted! Volunteer pickup assigned.');
  }

  function handleReject(req) {
    updateRequest(req.id, 'rejected');
    toast.success('Request rejected. Food quantity restored.');
    setConfirmAction(null);
  }

  function handleCancelListing(listingId) {
    cancelListing(listingId);
    toast.success('Listing cancelled.');
    setConfirmCancel(null);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cream-dark">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Donor Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your food surplus, review incoming NGO requests, and track rescue pickups.
          </p>
        </div>

        <Button
          onClick={() => navigate('/add-listing')}
          className="bg-fresh hover:bg-forest text-white py-2.5 px-5 shadow-sm"
        >
          <Plus size={18} /> Create Donation
        </Button>
      </div>

      {/* Organization Profile Card */}
      <div className="bg-white rounded-3xl border border-cream-dark p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-forest text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
            {myOrg.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{myOrg.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-forest border border-emerald-200">
                Verified Donor
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1.5">
              <span className="flex items-center gap-1 capitalize"><Building size={13} className="text-gray-400" /> {myOrg.type || 'Commercial Food Donor'}</span>
              <span className="flex items-center gap-1"><MapPin size={13} className="text-gray-400" /> {myOrg.location || 'Vijayawada'}</span>
              {myOrg.phone && <span className="flex items-center gap-1"><Phone size={13} className="text-gray-400" /> {myOrg.phone}</span>}
            </div>
          </div>
        </div>

        <div className="bg-cream-50 border border-cream-dark rounded-2xl p-3.5 flex items-center gap-4 text-xs">
          <div>
            <div className="text-gray-500">Contact Person</div>
            <div className="font-bold text-gray-900">{profile?.displayName || profile?.name || 'Authorized Lead'}</div>
          </div>
          <div className="h-8 w-px bg-cream-dark" />
          <div>
            <div className="text-gray-500">Account Role</div>
            <div className="font-bold text-forest capitalize">{profile?.role || 'Donor'}</div>
          </div>
        </div>
      </div>

      {/* Derived Application Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Active Listings"
          value={activeListings.length}
          color="green"
        />
        <StatCard
          icon={Sparkles}
          label="Available Food"
          value={`${availableServings} servings`}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Pending NGO Requests"
          value={pendingRequests.length}
          color="orange"
        />
        <StatCard
          icon={CheckCircle}
          label="Rescued Meals"
          value={`${totalFoodRescued}+`}
          color="purple"
        />
      </div>

      {/* Incoming Requests Alert Panel */}
      {pendingRequests.length > 0 && (
        <section className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-gold rounded-full animate-pulse" />
              Incoming NGO Redistribution Requests ({pendingRequests.length})
            </h2>
            <span className="text-xs text-amber-800 font-semibold">Immediate Action Recommended</span>
          </div>

          <div className="space-y-3">
            {pendingRequests.map(req => {
              const listing = listings.find(l => l.id === req.listingId);
              const recipientUser = users.find(u => u.id === req.recipientId);
              const recipientOrg = orgs.find(o => o.id === req.orgId);

              return (
                <div key={req.id} className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{recipientOrg?.name || recipientUser?.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        NGO Partner
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Requesting <strong className="text-forest">{req.quantity} {listing?.unit || 'servings'}</strong> of <strong>{listing?.name}</strong>
                    </p>
                    {req.notes && (
                      <p className="text-xs text-gray-500 italic bg-cream-50 p-1.5 rounded-lg border border-cream-dark inline-block">
                        "{req.notes}"
                      </p>
                    )}
                    <div className="text-[11px] text-gray-400 flex items-center gap-2">
                      <span>Submitted {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</span>
                      {listing?.pickupDeadline && (
                        <span>• Deadline: {format(new Date(listing.pickupDeadline), 'MMM d, h:mm a')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-fresh hover:bg-forest text-white"
                      onClick={() => handleAccept(req)}
                    >
                      <CheckCircle size={14} /> Accept Request
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setConfirmAction({ type: 'reject', req })}
                    >
                      <XCircle size={14} /> Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tabs: My Listings | Upcoming Pickups | Donation History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'listings'
                ? 'border-forest text-forest'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package size={16} /> My Listings ({myListings.length})
          </button>
          <button
            onClick={() => setActiveTab('pickups')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'pickups'
                ? 'border-forest text-forest'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Truck size={16} /> Upcoming Pickups ({upcomingPickups.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-forest text-forest'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <History size={16} /> Donation History
          </button>
        </div>

        {/* Tab 1: Listings */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Listings' },
                  { id: 'active', label: 'Active / Listed' },
                  { id: 'requested', label: 'Requested' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'cancelled', label: 'Cancelled' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      statusFilter === f.id
                        ? 'bg-forest text-white shadow-2xs'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-cream-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredListings.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No listings in this view"
                description={statusFilter === 'all'
                  ? 'You have not created any food listings yet. List surplus meals to connect with nearby NGOs.'
                  : `There are currently no listings matching the "${statusFilter}" status.`}
                action={
                  <Button onClick={() => navigate('/add-listing')} className="bg-fresh hover:bg-forest text-white">
                    <Plus size={15} /> Create Food Donation
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredListings.map(listing => {
                  const listingReqs = requests.filter(r => r.listingId === listing.id);
                  const assignment = assignments.find(a => a.listingId === listing.id);
                  const canCancel = ['listed', 'requested', 'accepted'].includes(listing.status);

                  return (
                    <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between card-hover">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 text-base">{listing.name}</h3>
                          <StatusBadge status={listing.status} />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <CategoryBadge category={listing.category} />
                          <span className="text-xs text-gray-500 font-medium">
                            {listing.remainingQuantity} of {listing.quantity} {listing.unit} available
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                          {listing.description}
                        </p>

                        <div className="text-xs text-gray-500 space-y-1 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-gray-400" />
                            <span>Deadline: {format(new Date(listing.pickupDeadline), 'MMM d, h:mm a')}</span>
                          </div>
                          {listing.allergens?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {listing.allergens.map(a => (
                                <span key={a} className="bg-amber-50 text-amber-800 text-[10px] px-1.5 py-0.5 rounded border border-amber-200">
                                  {a}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Timeline */}
                        {['requested', 'accepted', 'assigned', 'collected', 'completed'].includes(listing.status) && (
                          <div className="mt-2 py-2 border-t border-gray-100">
                            <StatusTimeline status={listing.status} />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                        <span className="text-[11px] text-gray-400">
                          {listingReqs.length} request(s)
                        </span>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/edit-listing/${listing.id}`)}
                          >
                            <Edit3 size={13} /> Edit
                          </Button>
                          {canCancel && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setConfirmCancel(listing.id)}
                            >
                              <Trash2 size={13} /> Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upcoming Pickups */}
        {activeTab === 'pickups' && (
          <div className="space-y-4">
            {upcomingPickups.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="No pickups scheduled"
                description="Accepted requests will show volunteer pickup details and estimated times here."
              />
            ) : (
              <div className="space-y-3">
                {upcomingPickups.map(a => {
                  const listing = listings.find(l => l.id === a.listingId);
                  const req = requests.find(r => r.id === a.requestId);
                  const vol = users.find(u => u.id === a.volunteerId);
                  const recipOrg = orgs.find(o => o.id === req?.orgId);

                  return (
                    <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={a.status} />
                          <h4 className="font-bold text-gray-900">{listing?.name}</h4>
                        </div>
                        <p className="text-xs text-gray-600">
                          Recipient Destination: <strong>{recipOrg?.name || 'Authorized NGO'}</strong>
                        </p>
                        <p className="text-xs text-purple-700 font-medium mt-1">
                          Assigned Volunteer: <strong>{vol?.name || 'Community Volunteer'}</strong> ({vol?.phone || 'Contact provided on pickup'})
                        </p>
                      </div>

                      <div className="text-right text-xs text-gray-500">
                        <div>Pickup Deadline</div>
                        <div className="font-bold text-gray-800">
                          {listing?.pickupDeadline ? format(new Date(listing.pickupDeadline), 'MMM d, h:mm a') : 'Today'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {completedListings.length === 0 ? (
              <EmptyState
                icon={History}
                title="No completed donations yet"
                description="Completed food redistribution deliveries will be permanently recorded here."
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-100">
                {completedListings.map(l => (
                  <div key={l.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{l.name}</div>
                      <div className="text-gray-500">Quantity: {l.quantity} {l.unit} • Completed successfully</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Rescued
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={Boolean(confirmCancel)}
        title="Cancel Food Listing?"
        message="Are you sure you want to cancel this listing? Any pending requests will be cancelled."
        confirmLabel="Yes, Cancel Listing"
        confirmVariant="danger"
        onConfirm={() => handleCancelListing(confirmCancel)}
        onClose={() => setConfirmCancel(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        title="Reject Food Request?"
        message="Are you sure you want to reject this request? The quantity will remain available for other organizations."
        confirmLabel="Reject Request"
        confirmVariant="danger"
        onConfirm={() => handleReject(confirmAction?.req)}
        onClose={() => setConfirmAction(null)}
      />
    </div>
  );
}
