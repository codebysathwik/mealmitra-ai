import { useState, useMemo } from 'react';
import {
  Truck, CheckCircle, Package, MapPin, Phone, Clock, AlertTriangle,
  ShieldCheck, Check, Sparkles, Navigation
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  StatusBadge, EmptyState, StatCard, Button, ConfirmDialog, PageHeader
} from '../components/ui';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function VolunteerDashboard() {
  const { assignments, listings, requests, orgs, users, updateAssignment, assignVolunteer } = useApp();
  const { profile } = useAuth();
  const [confirm, setConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('my-missions'); // 'my-missions' | 'available' | 'completed'

  const currentVolunteerId = profile?.id || 'u5';

  // My assigned pickups
  const myAssignments = useMemo(() => {
    return assignments.filter(a => a.volunteerId === currentVolunteerId);
  }, [assignments, currentVolunteerId]);

  const active = myAssignments.filter(a => ['assigned', 'collected'].includes(a.status));
  const completed = myAssignments.filter(a => a.status === 'completed');

  // Available unassigned pickups looking for a volunteer
  const unassignedRequests = useMemo(() => {
    return requests.filter(r => {
      const hasAssignment = assignments.some(a => a.requestId === r.id);
      return r.status === 'accepted' && !hasAssignment;
    });
  }, [requests, assignments]);

  function handleClaimMission(req) {
    assignVolunteer(req.listingId, req.id, currentVolunteerId, `Claimed by ${profile?.displayName || 'Volunteer'}`);
    toast.success('Pickup mission claimed! Ready for collection.');
    setActiveTab('my-missions');
  }

  function handleStatusUpdate(assignment, newStatus) {
    updateAssignment(assignment.id, newStatus);
    toast.success(newStatus === 'collected' ? 'Marked as Collected from donor!' : 'Food delivered successfully! 🎉');
    setConfirm(null);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cream-dark">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Volunteer Courier Hub
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome, <strong>{profile?.displayName || profile?.name}</strong>. Coordinate food rescue pickups and deliver to verified shelters.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          <ShieldCheck size={14} className="text-purple-600" />
          <span>Active Volunteer Courier</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Truck} label="Active Missions" value={active.length} color="orange" />
        <StatCard icon={CheckCircle} label="Completed Pickups" value={completed.length} color="green" />
        <StatCard icon={Sparkles} label="Open Opportunities" value={unassignedRequests.length} color="blue" />
        <StatCard icon={Package} label="Total Rescues" value={myAssignments.length} color="purple" />
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('my-missions')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'my-missions'
                ? 'border-forest text-forest'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Truck size={16} /> My Missions ({active.length})
          </button>

          <button
            onClick={() => setActiveTab('available')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'available'
                ? 'border-forest text-forest'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles size={16} className="text-gold" /> Open Pickups ({unassignedRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'border-forest text-forest'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle size={16} /> Completed History
          </button>
        </div>

        {/* Tab 1: My Missions */}
        {activeTab === 'my-missions' && (
          <div className="space-y-4">
            {active.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="No active missions right now"
                description="You have no pickups in progress. Check the 'Open Pickups' tab to claim available missions in your city."
                action={
                  <Button onClick={() => setActiveTab('available')} className="bg-fresh hover:bg-forest text-white">
                    <Sparkles size={14} /> View Open Pickups
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {active.map(assignment => {
                  const listing = listings.find(l => l.id === assignment.listingId);
                  const request = requests.find(r => r.id === assignment.requestId);
                  const donorOrg = orgs.find(o => o.id === listing?.orgId);
                  const recipOrg = orgs.find(o => o.id === request?.orgId);
                  const donor = users.find(u => u.id === listing?.donorId);

                  const nextStatus = assignment.status === 'assigned' ? 'collected' : 'completed';
                  const nextLabel = assignment.status === 'assigned' ? 'Mark as Collected' : 'Mark as Delivered ✓';

                  return (
                    <div key={assignment.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 card-hover">
                      <div className="flex flex-col lg:flex-row gap-6">
                        
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-lg">{listing?.name}</h3>
                            <StatusBadge status={assignment.status} />
                            <span className="text-xs text-gray-500">
                              Portion: <strong>{request?.quantity} {listing?.unit}</strong>
                            </span>
                          </div>

                          {/* Route Details Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Step 1: Pickup Donor */}
                            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4">
                              <div className="text-[11px] text-amber-800 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Package size={12} /> 1. Pickup Location (Donor)
                              </div>
                              <div className="font-bold text-gray-900 text-sm">{donorOrg?.name || donor?.name}</div>
                              <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                <MapPin size={12} className="text-amber-700 shrink-0" /> {listing?.location}
                              </div>
                              {donor?.phone && (
                                <div className="text-xs text-forest font-semibold flex items-center gap-1 mt-1 bg-white p-1 rounded-lg border border-amber-100">
                                  <Phone size={11} /> Authorized Contact: {donor.phone}
                                </div>
                              )}
                            </div>

                            {/* Step 2: Destination NGO */}
                            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4">
                              <div className="text-[11px] text-blue-800 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Navigation size={12} /> 2. Delivery Destination (NGO)
                              </div>
                              <div className="font-bold text-gray-900 text-sm">{recipOrg?.name}</div>
                              <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                <MapPin size={12} className="text-blue-700 shrink-0" /> {recipOrg?.location}
                              </div>
                              <div className="text-xs text-blue-900 font-medium mt-1">
                                Capacity: {recipOrg?.capacity || '50+'} people
                              </div>
                            </div>
                          </div>

                          {/* Time & Safety instructions */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 bg-cream-50 p-3 rounded-xl border border-cream-dark">
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-gray-400" /> Deadline: {listing?.pickupDeadline ? format(new Date(listing.pickupDeadline), 'MMM d, h:mm a') : 'Today'}
                            </span>
                            {listing?.storageConditions && (
                              <span>Storage: <strong>{listing.storageConditions}</strong></span>
                            )}
                          </div>
                        </div>

                        {/* Status update action */}
                        <div className="flex flex-col justify-center items-stretch sm:items-end gap-2 lg:border-l lg:border-gray-100 lg:pl-6 shrink-0">
                          <Button
                            onClick={() => setConfirm({ assignment, nextStatus, nextLabel })}
                            className="bg-fresh hover:bg-forest text-white py-3 px-6 shadow-sm text-sm"
                          >
                            {nextLabel}
                          </Button>
                          <p className="text-[11px] text-gray-400 text-center sm:text-right">
                            Confirm in-person handover
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Available Open Pickups */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            {unassignedRequests.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="All pickups currently assigned"
                description="There are no pending donations waiting for volunteer assignment. Check back soon!"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unassignedRequests.map(req => {
                  const listing = listings.find(l => l.id === req.listingId);
                  const donorOrg = orgs.find(o => o.id === listing?.orgId);
                  const recipOrg = orgs.find(o => o.id === req.orgId);

                  return (
                    <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between">
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            Awaiting Volunteer
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">{listing?.location}</span>
                        </div>

                        <h4 className="font-bold text-gray-900 text-base">{listing?.name}</h4>
                        <p className="text-xs text-gray-600">
                          Quantity: <strong>{req.quantity} {listing?.unit}</strong>
                        </p>

                        <div className="text-xs text-gray-500 space-y-1 pt-1">
                          <div>From: <strong>{donorOrg?.name || 'Hotel Partner'}</strong></div>
                          <div>To: <strong>{recipOrg?.name || 'Local Shelter'}</strong></div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleClaimMission(req)}
                        className="w-full bg-fresh hover:bg-forest text-white"
                      >
                        Claim This Mission
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Completed History */}
        {activeTab === 'completed' && (
          <div className="space-y-3">
            {completed.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No completed pickups yet"
                description="Pickups you successfully deliver to recipient organizations will appear here."
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 shadow-xs">
                {completed.map(a => {
                  const listing = listings.find(l => l.id === a.listingId);
                  const request = requests.find(r => r.id === a.requestId);
                  const recip = orgs.find(o => o.id === request?.orgId);

                  return (
                    <div key={a.id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{listing?.name}</div>
                        <div className="text-gray-500">
                          Delivered to {recip?.name} • {request?.quantity} {listing?.unit}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Delivered
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(confirm)}
        title="Confirm Status Handover"
        message={`Are you ready to mark this assignment as "${confirm?.nextStatus}"? Please ensure the food containers are checked for hygiene.`}
        confirmLabel={confirm?.nextLabel || 'Confirm'}
        onConfirm={() => handleStatusUpdate(confirm?.assignment, confirm?.nextStatus)}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
