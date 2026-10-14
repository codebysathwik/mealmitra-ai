import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500">Get in touch with the MealMitra AI team.</p>
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg inline-block">
          ⚠️ Demo contact info — not a real support channel
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        {[
          { icon: Mail,   label: 'Email',    value: 'hello@mealmitra.ai (demo — not monitored)' },
          { icon: Phone,  label: 'Phone',    value: '+91-0000-000000 (demo)' },
          { icon: MapPin, label: 'Location', value: 'VVIT University, Gudlavalleru, Andhra Pradesh, India' },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
              <item.icon size={15} className="text-primary-600" />
            </div>
            <div>
              <div className="font-medium text-gray-700">{item.label}</div>
              <div className="text-gray-500">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-primary-50 border border-primary-100 rounded-2xl p-4 text-sm text-primary-800">
        Built for <strong>PromptWars 2026</strong> at VVITU. This is a hackathon demo — not a live production service.
      </div>
    </div>
  );
}
