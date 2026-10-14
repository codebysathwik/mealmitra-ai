import { Link } from 'react-router-dom';
import { Leaf, Heart, Mail, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
                <Leaf size={16} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                MealMitra AI
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Rescue Food. Reduce Waste. Feed Lives.<br/>
              An AI-powered food rescue platform connecting surplus food donors with NGOs.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-400 bg-amber-900/30 border border-amber-800 px-3 py-2 rounded-lg w-fit">
              ⚠️ Demo Mode — Sample data only
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/find-food" className="hover:text-white transition-colors">Find Food</Link></li>
              <li><Link to="/donor" className="hover:text-white transition-colors">Donor Dashboard</Link></li>
              <li><Link to="/recipient" className="hover:text-white transition-colors">Recipient Dashboard</Link></li>
              <li><Link to="/ai-match" className="hover:text-white transition-colors">AI Matching</Link></li>
              <li><Link to="/impact" className="hover:text-white transition-colors">Impact Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Info</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/food-safety" className="hover:text-white transition-colors">Food Safety</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Built with <Heart size={10} className="inline text-red-400" /> for PromptWars 2026, VVITU
          </p>
          <p className="text-xs text-gray-500">
            © 2026 MealMitra AI. Platform does not certify food safety. Not a substitute for local food-safety law.
          </p>
        </div>
      </div>
    </footer>
  );
}
