import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, CheckCircle, Clock, Heart, ArrowRight, AlertTriangle,
  Building, MapPin, Users, Sparkles, Search, CheckCircle2,
  XCircle, Filter, Truck, Check, HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  StatusBadge, CategoryBadge, EmptyState, StatCard, StatusTimeline,
  Button, ScoreBar, FoodCard
} from '../components/ui';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import toast from 'react-hot-toast';

export default function RecipientDashboard() {
  const { orgs, requests, listings, assignments, users, addRequest, updateAssignment } = useApp();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'requested' | 'accepted' | 'completed' | 'rejected' | 'ai-recommendations'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const currentRecipientId = profile?.id || 'u3';
  const myOrg = orgs.find(o => o.id === profile?.org) || {
    name: profile?.organizationName || 'Grace Home Trust',
    type: profile?.organizationType || 'Registered NGO',
    capacity: profile?.capacity || 60,
    preferences: profile?.dietaryPreferences || ['veg'],
    location: profile?.location || 'Vijayawada'
  };

  // User's own requests
  const myRequests = useMemo(() => {
    return requests.filter(r => r.recipientId === currentRecipientId || (profile?.org && r.orgId === profile.org));
  }, [requests, currentRecipientId, profile]);

  const requestedReqs = myRequests.filter(r => r.status === 'requested');
  const acceptedReqs = myRequests.filter(r => ['accepted', 'assigned', 'collected'].includes(r.status));
  const completedReqs = myRequests.filter(r => r.status === 'completed');
  const rejectedReqs = myRequests.filter(r => ['rejected', 'cancelled'].includes(r.status));
  const activeReqs = myRequests.filter(r => ['requested', 'accepted', 'assigned', 'collected'].includes(r.status));

  // Available food surplus listings
  const availableListings = useMemo(() => {
    return listings.filter(l => ['listed', 'requested'].includes(l.status) && l.remainingQuantity > 0 && !isPast(new Date(l.pickupDeadline)));
  }, [listings]);

  // AI Recommended Food Matching for this NGO
  const recommendedFood = useMemo(() => {
    return availableListings.map(listing => {
      let score = 70; // baseline
      const reasons = [];

      // Dietary preference match
      const orgPrefs = myOrg.preferences || ['veg'];
      if (orgPrefs.includes(listing.category) || orgPrefs.includes('any')) {
        score += 15;
        reasons.push(`Matches dietary preference (${listing.category})`);
      } else {
        score -= 20;
        reasons.push(`Differs from primary preference`);
      }

      // Capacity match
      const cap = myOrg.capacity || 50;
      if (listing.remainingQuantity <= cap) {
        score += 10;
        reasons.push(`Portion fits within feeding capacity (${listing.remainingQuantity} / ${cap})`);
      } else {
        reasons.push(`Portion exceeds capacity by ${listing.remainingQuantity - cap} servings`);
      }

      // Location match
      if (listing.location?.toLowerCase() === myOrg.location?.toLowerCase()) {
        score += 15;
        reasons.push(`Direct city proximity (${listing.location})`);
      }

      const clampedScore = Math.min(98, Math.max(40, score));
      return { listing, score: clampedScore, reasons };
    }).sort((a, b) => b.score - a.score);
  }, [availableListings, myOrg]);

  // Filtered requests according to tab
  const tabRequests = useMemo(() => {
    if (activeTab === 'requested') return requestedReqs;
    if (activeTab === 'accepted') return acceptedReqs;
    if (activeTab === 'completed') return completedReqs;
    if (activeTab === 'rejected') return rejectedReqs;
    return activeReqs;
  }, [activeTab, requestedReqs, acceptedReqs, completedReqs, rejectedReqs, activeReqs]);

  // Handle direct request
  function handleQuickRequest(listingId, quantity) {
    addRequest(listingId, quantity, `Requested by ${myOrg.name}`);
    toast.success('Food request submitted to donor!');
    setActiveTab('requested');
  }

  // Handle delivery confirmation
  function handleConfirmDelivery(assignmentId) {
    updateAssignment(assignmentId, 'completed');
    toast.success('Food pickup & delivery confirmed! Thank you!');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cream-dark">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Recipient NGO Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track incoming donations, discover Smart Rescue AI surplus matches, and confirm deliveries.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate('/ai-match')}
            className="text-forest border-forest/30 hover:bg-primary-50 text-xs sm:text-sm py-2"
          >
            <Sparkles size={16} className="text-gold" /> Smart Rescue AI
          </Button>
          <Button
            onClick={() => navigate('/find-food')}
            className="bg-fresh hover:bg-forest text-white text-xs sm:text-sm py-2"
          >
            <Package size={16} /> Browse Food
          </Button>
        </div>
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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                Verified NGO
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1.5">
              <span className="flex items-center gap-1"><Users size={13} className="text-gray-400" /> Daily Capacity: <strong>{myOrg.capacity || 50} people</strong></span>
              <span className="flex items-center gap-1"><MapPin size={13} className="text-gray-400" /> {myOrg.location || 'Vijayawada'}</span>
              <span className="flex items-center gap-1">
                Dietary: <strong className="capitalize">{myOrg.preferences?.join(', ') || 'Vegetarian'}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-cream-50 border border-cream-dark rounded-2xl p-3.5 flex items-center gap-4 text-xs">
          <div>
            <div className="text-gray-500">Authorized Receiver</div>
            <div className="font-bold text-gray-900">{profile?.displayName || profile?.name || 'NGO Director'}</div>
          </div>
          <div className="h-8 w-px bg-cream-dark" />
          <div>
            <div className="text-gray-500">Total Requested</div>
            <div className="font-bold text-forest">{myRequests.length} donations</div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Active In-Progress"
          value={activeReqs.length}
          color="orange"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed Deliveries"
          value={completedReqs.length}
          color="green"
        />
        <StatCard
          icon={Sparkles}
          label="Surplus Available"
          value={availableListings.length}
          color="blue"
        />
        <StatCard
          icon={XCircle}
          label="Rejected / Cancelled"
          value={rejectedReqs.length}
          color="purple"
        />
      </div>

      {/* Smart Rescue AI Recommendations Banner */}
      {recommendedFood.length > 0 && (
        <section className="bg-gradient-to-r from-emerald-900 to-forest rounded-3xl p-6 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/20 mb-1">
                <Sparkles size={12} className="text-gold" /> Smart Rescue AI Engine
              </div>
              <h2 className="text-lg font-bold text-white">Top Recommended Surplus for {myOrg.name}</h2>
              <p className="text-xs text-gray-200">
                Ranked automatically based on your feeding capacity, dietary preference, and location.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/find-food')}
              className="bg-white/95 text-forest hover:bg-white text-xs border-transparent self-start sm:self-auto"
            >
              View All Food <ArrowRight size={13} />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedFood.slice(0, 3).map(({ listing, score, reasons }) => (
              <div key={listing.id} className="bg-white rounded-2xl p-4 text-gray-900 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-gray-500 uppercase">{listing.location}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-forest border border-emerald-200">
                      {score}% Match
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm mb-1">{listing.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <CategoryBadge category={listing.category} />
                    <span className="text-xs text-gray-600 font-semibold">
                      {listing.remainingQuantity} {listing.unit} left
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    {reasons.slice(0, 2).map((r, i) => (
                      <div key={i} className="text-[11px] text-gray-600 flex items-center gap-1">
                        <Check size={11} className="text-fresh shrink-0" /> {r}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleQuickRequest(listing.id, Math.min(listing.remainingQuantity, myOrg.capacity || 30))}
                  className="w-full bg-fresh hover:bg-forest text-white text-xs py-2"
                >
                  Request {Math.min(listing.remainingQuantity, myOrg.capacity || 30)} Servings
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Requests Tabs Pipeline */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-1">
          {[
            { id: 'active', label: 'All Active', count: activeReqs.length },
            { id: 'requested', label: 'Requested (Pending)', count: requestedReqs.length },
            { id: 'accepted', label: 'Accepted & In Transit', count: acceptedReqs.length },
            { id: 'completed', label: 'Completed Deliveries', count: completedReqs.length },
            { id: 'rejected', label: 'Rejected / Cancelled', count: rejectedReqs.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-forest text-forest'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Requests List */}
        {tabRequests.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No requests in this category"
            description="Explore surplus listings from verified hotels and canteens and submit requests for your organization."
            action={
              <Button onClick={() => navigate('/find-food')} className="bg-fresh hover:bg-forest text-white">
                <Package size={15} /> Find Available Food
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {tabRequests.map(req => {
              const listing = listings.find(l => l.id === req.listingId);
              const assignment = assignments.find(a => a.requestId === req.id);
              const volunteer = assignment ? users.find(u => u.id === assignment.volunteerId) : null;
              const donorOrg = orgs.find(o => o.id === listing?.orgId);

              const isDeliverable = ['accepted', 'assigned', 'collected'].includes(req.status);

              return (
                <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-base">{listing?.name || 'Surplus Food'}</h3>
                        <StatusBadge status={req.status} />
                        {listing?.category && <CategoryBadge category={listing.category} />}
                      </div>

                      <div className="text-sm text-gray-700">
                        Requested: <strong className="text-forest font-bold">{req.quantity} {listing?.unit || 'servings'}</strong> from <strong>{donorOrg?.name || 'Partner Donor'}</strong>
                      </div>

                      {listing && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-gray-400" /> Deadline: {format(new Date(listing.pickupDeadline), 'MMM d, h:mm a')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-gray-400" /> {listing.location}
                          </span>
                        </div>
                      )}

                      {/* Volunteer Assignment Info */}
                      {volunteer && (
                        <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-900 flex items-center gap-2">
                          <Truck size={14} className="text-purple-600 shrink-0" />
                          <div>
                            Volunteer Courier: <strong>{volunteer.name}</strong> • Phone: <strong>{volunteer.phone || 'Provided on pickup'}</strong>
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="max-w-md pt-1">
                        <StatusTimeline status={req.status} />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                      <div className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                      </div>

                      {assignment && ['assigned', 'collected'].includes(assignment.status) && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmDelivery(assignment.id)}
                          className="bg-fresh hover:bg-forest text-white text-xs"
                        >
                          <CheckCircle2 size={14} /> Confirm Delivery Received
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
    </div>
  );
}
