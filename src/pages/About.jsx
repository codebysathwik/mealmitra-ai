import { Leaf, Target, Lightbulb, Code2, Award, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
          <Leaf size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>About MealMitra AI</h1>
        <p className="text-gray-500 text-lg">Rescue Food. Reduce Waste. Feed Lives.</p>
        <div className="mt-3 inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-1.5 text-sm text-primary-700">
          <Award size={14} /> PromptWars 2026 · VVITU Hackathon Entry
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Target size={18} className="text-primary-600" />The Problem</h2>
          <p className="text-gray-600 leading-relaxed">
            India wastes an estimated 67 million tonnes of food annually. Meanwhile, millions go hungry. Restaurants, college canteens, hostels, caterers, and event venues regularly produce surplus food that could feed community groups, NGOs, and homeless shelters — but coordination is the missing link.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Lightbulb size={18} className="text-primary-600" />Our Solution</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            MealMitra AI is a web platform that connects food donors with verified NGO recipients using an explainable AI matching engine. The matching algorithm is deterministic and rule-based — not a black box. Every score is broken down transparently.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Transparent AI matching with score breakdowns',
              'Real-time surplus food listings',
              'Volunteer coordination system',
              'Impact tracking with honest metrics',
              'Food safety information on every listing',
              'Demo mode — no signup required to try',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-primary-500 font-bold mt-0.5">✓</span> {item}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Code2 size={18} className="text-primary-600" />Technology</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: 'React + Vite', desc: 'Frontend framework' },
              { name: 'Tailwind CSS', desc: 'Styling' },
              { name: 'React Router', desc: 'Client-side routing' },
              { name: 'Context + Hooks', desc: 'State management' },
              { name: 'Supabase (optional)', desc: 'Auth + Database' },
              { name: 'Vercel', desc: 'Deployment' },
            ].map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 text-sm">
                <div className="font-semibold text-gray-900">{t.name}</div>
                <div className="text-xs text-gray-500">{t.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Globe size={18} className="text-primary-600" />Languages</h2>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium">English</button>
            <button className="px-4 py-2 bg-white border-2 border-primary-200 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-50 transition-colors" disabled title="Coming soon">
              తెలుగు (Coming Soon)
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Full Telugu translation is planned. Language toggle is a UI hook — strings can be localised via i18n library.</p>
        </section>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <strong>⚠️ Demo Mode Active.</strong> All data in this demo is fictional/sample. No real food is tracked. To deploy to production, configure Supabase and review README.md.
        </div>
      </div>
    </div>
  );
}
