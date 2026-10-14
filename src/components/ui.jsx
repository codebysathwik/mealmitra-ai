import React from 'react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { AlertTriangle, Clock, MapPin, Leaf, Drumstick, ShieldAlert } from 'lucide-react';

// ── Status Badge ─────────────────────────────────────────────
export function StatusBadge({ status }) {
  const labels = {
    draft: 'Draft', listed: 'Listed', requested: 'Requested',
    accepted: 'Accepted', assigned: 'Assigned', collected: 'Collected',
    completed: 'Completed', cancelled: 'Cancelled', expired: 'Expired', rejected: 'Rejected',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold badge-${status}`}>
      {labels[status] || status}
    </span>
  );
}

// ── Category Badge ────────────────────────────────────────────
export function CategoryBadge({ category }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      category === 'veg'
        ? 'bg-green-100 text-green-800 border border-green-200'
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {category === 'veg' ? <Leaf size={10} /> : <Drumstick size={10} />}
      {category === 'veg' ? 'Veg' : 'Non-Veg'}
    </span>
  );
}

// ── Food Listing Card ─────────────────────────────────────────
export function FoodCard({ listing, orgs, actions }) {
  const org = orgs?.find(o => o.id === listing.orgId);
  const deadlinePast = isPast(new Date(listing.pickupDeadline));
  const urgentSoon = !deadlinePast && new Date(listing.pickupDeadline) - Date.now() < 3 * 60 * 60 * 1000;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 card-hover overflow-hidden animate-fade-in-up">
      {/* Colour band */}
      <div className={`h-1.5 w-full ${listing.category === 'veg' ? 'bg-green-400' : 'bg-red-400'}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-base leading-tight">{listing.name}</h3>
            {org && <p className="text-xs text-gray-500 mt-0.5">{org.name}</p>}
          </div>
          <StatusBadge status={listing.status} />
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{listing.description}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          <CategoryBadge category={listing.category} />
          {listing.allergens?.map(a => (
            <span key={a} className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs">{a}</span>
          ))}
        </div>

        <div className="space-y-1.5 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{listing.remainingQuantity}</span>
            <span className="text-gray-400">/</span>
            <span>{listing.quantity} {listing.unit} remaining</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-gray-400 shrink-0" />
            <span>{listing.location}</span>
          </div>
          <div className={`flex items-center gap-1.5 ${deadlinePast ? 'text-red-600' : urgentSoon ? 'text-orange-600 font-medium' : ''}`}>
            <Clock size={13} className="shrink-0" />
            {deadlinePast
              ? 'Deadline passed'
              : `Pickup by ${format(new Date(listing.pickupDeadline), 'MMM d, h:mm a')} (${formatDistanceToNow(new Date(listing.pickupDeadline), { addSuffix: true })})`
            }
            {urgentSoon && <AlertTriangle size={13} />}
          </div>
          <div className="text-xs text-gray-400">{listing.storageConditions}</div>
        </div>

        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {/* DEMO label */}
      <div className="px-5 pb-3">
        <span className="text-[10px] text-gray-400 italic">⚠️ Sample data — demo mode</span>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-5 space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-12 w-full" />
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="skeleton h-8 w-28 rounded-lg" />
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:   'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
    secondary: 'bg-white text-primary-700 border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
    ghost:     'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    accent:    'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm',
  };
  const sizes = {
    sm:  'px-3 py-1.5 text-sm',
    md:  'px-4 py-2 text-sm',
    lg:  'px-6 py-3 text-base',
    xl:  'px-8 py-4 text-lg',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────
export function Input({ label, error, id, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        id={id}
        className={`w-full px-3 py-2.5 rounded-xl border ${error ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-200 bg-white focus:ring-primary-400'} text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={12}/>{error}</p>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────
export function Textarea({ label, error, id, rows = 3, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        id={id} rows={rows}
        className={`w-full px-3 py-2.5 rounded-xl border ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'} text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={12}/>{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
export function Select({ label, error, id, options, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}
      <select
        id={id}
        className={`w-full px-3 py-2.5 rounded-xl border ${error ? 'border-red-400' : 'border-gray-200'} bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={12}/>{error}</p>}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
          <Icon size={28} className="text-primary-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

// ── Score Bar ─────────────────────────────────────────────────
export function ScoreBar({ score, max = 100 }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-right">{score}</span>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, sub, color = 'green' }) {
  const colors = {
    green:  'bg-green-50  text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue:   'bg-blue-50   text-blue-600  border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${colors[color]} border flex items-center justify-center mb-3`}>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-600">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Confirmation Dialog ───────────────────────────────────────
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up">
        <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

// ── Demo Banner (Hidden) ───────────────────────────────────────
export function DemoBanner() {
  return null;
}

// ── Page Header ────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

// ── Progress Steps ─────────────────────────────────────────────
export function StatusTimeline({ status }) {
  const steps = ['listed','requested','accepted','assigned','collected','completed'];
  const idx = steps.indexOf(status);
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < idx ? 'bg-green-500 text-white' :
              i === idx ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
              'bg-gray-200 text-gray-400'
            }`}>{i < idx ? '✓' : i + 1}</div>
            <span className="text-[9px] text-gray-500 mt-1 hidden sm:block capitalize">{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 transition-all ${i < idx ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
