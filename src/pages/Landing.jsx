import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Users, Truck, BarChart3, Utensils, Heart, Star, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryBadge, StatusBadge } from '../components/ui';
import { format } from 'date-fns';

const STEPS = [
  { icon: Utensils, title: 'Donors List Surplus', desc: 'Hotels, canteens, caterers post surplus food with quantity, allergens, and pickup deadline.' },
  { icon: BarChart3, title: 'AI Finds Best Recipients', desc: 'Our rule-based AI engine scores eligible NGOs by proximity, capacity, urgency, and dietary preferences.' },
  { icon: Users, title: 'Recipient Requests Food', desc: 'NGOs browse matches, request the food, and donor accepts. No food is wasted.' },
  { icon: Truck, title: 'Volunteer Completes Pickup', desc: 'Volunteer assigned, collects food, delivers to NGO, marks complete. Impact recorded.' },
];

const TESTIMONIALS = [
  { name: 'Sister Mary', org: 'Grace Home Trust', text: 'MealMitra AI helped us receive 80 meals from a nearby college canteen in just 2 hours. The AI matching is transparent and easy to understand.', rating: 5 },
  { name: 'Chef Ravi Kumar', org: 'Hotel Srinivasa Grand', text: "We used to throw away so much food after events. Now we can list it in 2 minutes and it reaches people who need it. Wonderful platform.", rating: 5 },
  { name: 'Suresh (Volunteer)', org: 'MealMitra Volunteer', text: "The pickup assignment system is clear and simple. I always know exactly what to collect, from where, and where to deliver.", rating: 5 },
];

export default function Landing() {
  const { listings, donations, orgs } = useApp();
  const activeListing = listings.filter(l => ['listed','requested','accepted'].includes(l.status)).slice(0, 3);
  const mealsServed = donations.reduce((s, d) => s + d.quantity, 0);
  const completedCount = donations.length;

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <section className="hero-gradient text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-green-200">
            <Leaf size={14} /> PromptWars 2026 · VVITU
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-4 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Rescue Food.<br />
            <span className="text-green-300">Reduce Waste.</span><br />
            Feed Lives.
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            MealMitra AI connects restaurants, canteens, and caterers with NGOs and community groups — powered by explainable AI matching.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/add-listing"
              className="inline-flex items-center gap-2 bg-white text-green-900 font-bold px-7 py-3.5 rounded-xl hover:bg-green-50 transition-all shadow-lg text-base">
              List Surplus Food <ArrowRight size={16} />
            </Link>
            <Link to="/find-food"
              className="inline-flex items-center gap-2 bg-green-700/50 border border-green-500 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-green-700 transition-all text-base">
              Find Food Near You
            </Link>
          </div>
        </div>
      </section>

      {/* ── Impact stats ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Meals Rescued', value: mealsServed || '80+', note: '1 serving = 1 meal' },
              { label: 'Donations Completed', value: completedCount || 1, note: 'Verified records' },
              { label: 'Active Listings', value: activeListing.length, note: 'Available now' },
              { label: 'Organisations', value: orgs.length, note: 'Demo orgs' },
            ].map((s, i) => (
              <div key={i} className="py-4">
                <div className="text-3xl font-black text-primary-700 mb-1">{s.value}</div>
                <div className="text-sm font-semibold text-gray-800">{s.label}</div>
                <div className="text-xs text-gray-400">{s.note} · <em>sample data</em></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-4 bg-cream-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>How MealMitra AI Works</h2>
            <p className="text-gray-500 max-w-lg mx-auto">A simple 4-step process that gets surplus food to people who need it — fast.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center card-hover animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <step.icon size={24} className="text-white" />
                </div>
                <div className="text-primary-600 font-black text-sm mb-1">Step {i + 1}</div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured listings ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Available Food Now</h2>
              <p className="text-sm text-gray-500 mt-1">⚠️ Sample data — demo mode only</p>
            </div>
            <Link to="/find-food" className="flex items-center gap-1 text-sm text-primary-600 font-medium hover:underline">
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeListing.map(listing => {
              const org = orgs.find(o => o.id === listing.orgId);
              return (
                <div key={listing.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 card-hover overflow-hidden">
                  <div className={`h-1.5 w-full ${listing.category === 'veg' ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{listing.name}</h3>
                      <StatusBadge status={listing.status} />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{org?.name}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <CategoryBadge category={listing.category} />
                    </div>
                    <div className="text-sm text-gray-700 font-medium">{listing.remainingQuantity} {listing.unit} available</div>
                    <div className="text-xs text-gray-400 mt-1">{listing.location} · deadline {format(new Date(listing.pickupDeadline), 'h:mm a')}</div>
                    <Link to="/find-food" className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 font-medium hover:underline">
                      View details <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 bg-cream-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>What People Say</h2>
            <p className="text-xs text-gray-400">⚠️ SAMPLE testimonials — fictional for demo</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.org} · <em>Sample</em></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hero-gradient text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Heart size={32} className="mx-auto mb-4 text-green-300 animate-float" />
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Ready to Make an Impact?</h2>
          <p className="text-green-200 mb-6">Join MealMitra AI and help rescue food in your community.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/add-listing" className="bg-white text-green-900 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-all shadow-md">
              I Have Surplus Food
            </Link>
            <Link to="/find-food" className="bg-green-700/50 border border-green-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition-all">
              We Need Food
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
