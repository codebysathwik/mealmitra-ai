import { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Package, Heart, Users, Calendar, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard, PageHeader } from '../components/ui';
import { format, subDays, isAfter, isBefore, startOfDay } from 'date-fns';

// Meal estimation formula (documented)
// 1 serving = 1 meal
// 1 kg = 2.5 meals
// 1 pack = 1 meal (default)
// 1 box = 10 meals (default)
function estimateMeals(quantity, unit) {
  switch (unit) {
    case 'kg':       return quantity * 2.5;
    case 'litres':   return quantity;
    case 'boxes':    return quantity * 10;
    case 'servings':
    case 'plates':
    case 'pieces':
    case 'packs':
    default:         return quantity;
  }
}

const DATE_PRESETS = [
  { label: 'Last 7 days',  days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'All time',     days: 9999 },
];

export default function ImpactDashboard() {
  const { donations, listings, orgs } = useApp();
  const [preset, setPreset] = useState(30);

  const cutoff = startOfDay(subDays(new Date(), preset === 9999 ? 36500 : preset));

  const filteredDonations = useMemo(() =>
    donations.filter(d => isAfter(new Date(d.completedAt), cutoff)),
    [donations, cutoff]
  );

  const totalQty    = filteredDonations.reduce((s, d) => s + d.quantity, 0);
  const totalMeals  = Math.round(filteredDonations.reduce((s, d) => s + estimateMeals(d.quantity, d.unit), 0));
  const uniqueDonors = new Set(filteredDonations.map(d => d.donorId)).size;
  const uniqueRecips = new Set(filteredDonations.map(d => d.recipientId)).size;

  // Daily chart data (last 14 days)
  const dailyData = useMemo(() => {
    const days = [...Array(14)].map((_, i) => {
      const day = subDays(new Date(), 13 - i);
      const label = format(day, 'MMM d');
      const start = startOfDay(day);
      const end   = startOfDay(subDays(day, -1));
      const qty   = donations
        .filter(d => isAfter(new Date(d.completedAt), start) && isBefore(new Date(d.completedAt), end))
        .reduce((s, d) => s + d.quantity, 0);
      return { label, qty };
    });
    return days;
  }, [donations]);

  const maxQty = Math.max(...dailyData.map(d => d.qty), 1);

  const completedListings = listings.filter(l => l.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <PageHeader
        title="Impact Dashboard"
        subtitle="Verified completed donations only. All data from demo records."
      />

      {/* Demo disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-6 flex gap-2 items-start text-sm text-amber-800">
        <Info size={16} className="shrink-0 mt-0.5" />
        <span>
          ⚠️ <strong>Sample data only.</strong> All metrics below are computed from demo records only.
          Meals estimated using: 1 serving = 1 meal · 1 kg = 2.5 meals · 1 box = 10 meals · 1 pack = 1 meal.
          No fabricated CO₂ savings or live city stats. Numbers never exceed verified completed records.
        </span>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DATE_PRESETS.map(p => (
          <button key={p.days}
            onClick={() => setPreset(p.days)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${preset === p.days ? 'bg-primary-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package}  label="Total Quantity"     value={`${totalQty}`}        sub="verified units"          color="green"  />
        <StatCard icon={Heart}    label="Estimated Meals"    value={totalMeals}            sub="see formula above"       color="orange" />
        <StatCard icon={Users}    label="Donors Active"      value={uniqueDonors}          sub="in period"               color="blue"   />
        <StatCard icon={TrendingUp} label="Recipients Served" value={uniqueRecips}          sub="in period"               color="purple" />
      </div>

      {/* Mini chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">Daily Quantity Donated (last 14 days)</h2>
        <div className="flex items-end gap-1.5 h-32">
          {dailyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="relative w-full flex items-end justify-center" style={{ height: '96px' }}>
                <div
                  className="w-full bg-primary-400 rounded-t-sm transition-all duration-500 hover:bg-primary-600"
                  style={{ height: `${Math.round((d.qty / maxQty) * 96)}px`, minHeight: d.qty > 0 ? '4px' : '0' }}
                  title={`${d.label}: ${d.qty}`}
                />
              </div>
              <span className="text-[9px] text-gray-400 rotate-45 origin-left">{d.label.split(' ')[1]}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">Only verified completed donations · sample data</p>
      </div>

      {/* Donation log */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">Completed Donations Log</h2>
        {filteredDonations.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No completed donations in this period. Complete a full workflow to see records here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500">
                  <th className="pb-2 text-left font-medium">Date</th>
                  <th className="pb-2 text-left font-medium">From</th>
                  <th className="pb-2 text-left font-medium">To</th>
                  <th className="pb-2 text-right font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">~Meals</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2 text-gray-500 text-xs">{format(new Date(d.completedAt), 'MMM d, h:mm a')}</td>
                    <td className="py-2 font-medium text-gray-800">{d.donorOrg}</td>
                    <td className="py-2 text-gray-600">{d.recipientOrg}</td>
                    <td className="py-2 text-right text-gray-800 font-medium">{d.quantity} {d.unit}</td>
                    <td className="py-2 text-right text-primary-700 font-semibold">{Math.round(estimateMeals(d.quantity, d.unit))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={3} className="pt-2 text-sm font-semibold text-gray-700">Total</td>
                  <td className="pt-2 text-right font-bold text-gray-900">{totalQty}</td>
                  <td className="pt-2 text-right font-bold text-primary-700">{totalMeals}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Completed listings summary */}
      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
        <h2 className="font-semibold text-primary-900 mb-3 text-sm">All Completed Listings ({completedListings.length})</h2>
        {completedListings.length === 0 ? (
          <p className="text-sm text-primary-700">No listings completed yet. Complete the full workflow to see records.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {completedListings.map(l => (
              <div key={l.id} className="bg-white rounded-xl px-3 py-2 border border-primary-100 text-xs">
                <span className="font-medium text-gray-900">{l.name}</span>
                <span className="text-gray-400 ml-1">· {l.quantity} {l.unit}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
