import { ShieldAlert, Thermometer, Clock, CheckSquare, AlertTriangle } from 'lucide-react';

const TIPS = [
  { icon: Thermometer, title: 'Temperature Control', content: 'Hot food must be kept above 60°C. Cold food must be kept below 5°C. Food between 5°C–60°C is in the "danger zone" and should not sit there for more than 2 hours.' },
  { icon: Clock, title: 'Time Limits', content: 'Cooked food should be consumed within 4 hours of preparation (if kept warm) or within 2 hours if left at room temperature. Check prep time on each listing.' },
  { icon: CheckSquare, title: 'Inspect Before Accepting', content: 'Always inspect food at handover. Check for unusual smell, colour, or texture. When in doubt, do not accept or consume.' },
  { icon: ShieldAlert, title: 'Allergens', content: 'Check allergen information on every listing. MealMitra AI shows allergens as declared by the donor. We cannot verify this independently — always confirm with the donor if there is any uncertainty.' },
];

export default function FoodSafety() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={24} className="text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Food Safety Guidance</h1>
        <p className="text-gray-500">Essential information for donors, recipients, and volunteers.</p>
      </div>

      {/* MAIN DISCLAIMER */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-8">
        <div className="flex gap-3">
          <AlertTriangle size={22} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-red-900 mb-2">Important Disclaimer</h2>
            <p className="text-sm text-red-800 leading-relaxed">
              <strong>MealMitra AI does not certify food safety.</strong> The platform provides information as declared by donors and is not a substitute for your local food-safety laws, regulations, or professional advice. In an emergency involving food poisoning or contamination, contact your local health authorities immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="grid gap-4 mb-8">
        {TIPS.map((tip, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
              <tip.icon size={18} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{tip.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
        <strong>References:</strong> FSSAI (Food Safety and Standards Authority of India) · WHO Food Safety Fact Sheets · Local Municipal Corporation Food Safety Offices. Always consult local regulations for your state.
      </div>
    </div>
  );
}
