import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { matchRecipients } from '../lib/matching';
import { getAssistantResponse } from '../lib/matching';
import { ScoreBar, EmptyState, Button, StatusBadge, CategoryBadge } from '../components/ui';
import { Sparkles, ChevronDown, ChevronUp, AlertTriangle, Info, Bot, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

function ScoreBreakdownCard({ breakdown }) {
  const factors = [
    { key: 'proximity',  label: 'Proximity',  weight: '30%' },
    { key: 'capacity',   label: 'Capacity',   weight: '25%' },
    { key: 'urgency',    label: 'Urgency',    weight: '25%' },
    { key: 'preference', label: 'Preference', weight: '20%' },
  ];
  return (
    <div className="space-y-2">
      {factors.map(f => (
        <div key={f.key} className="flex items-center gap-2 text-xs">
          <span className="w-24 text-gray-500 shrink-0">{f.label} <span className="text-gray-400">({f.weight})</span></span>
          <div className="flex-1">
            <ScoreBar score={Math.round((breakdown[f.key]?.score || 0) * 100)} />
          </div>
          {breakdown[f.key]?.distanceKm && <span className="text-gray-400 shrink-0">{breakdown[f.key].distanceKm} km</span>}
        </div>
      ))}
    </div>
  );
}

function MatchCard({ match, rank }) {
  const [open, setOpen] = useState(rank === 0);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
          rank === 0 ? 'bg-primary-600 text-white' :
          rank === 1 ? 'bg-primary-400 text-white' :
          'bg-gray-200 text-gray-600'
        }`}>{rank + 1}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">{match.org.name}</div>
          <div className="text-xs text-gray-500">{match.org.location} · Capacity: {match.org.capacity ?? '?'}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-black text-primary-600">{match.score}</div>
          <div className="text-xs text-gray-400">/ 100</div>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </div>

      {open && (
        <div className="border-t border-gray-100 p-4 space-y-4 animate-fade-in">
          {/* Score bars */}
          <ScoreBreakdownCard breakdown={match.breakdown} />

          {/* Reasons */}
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-2">Why this match?</div>
            <ul className="space-y-1">
              {match.reasons.map((r, i) => (
                <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                  <span className="text-primary-500 mt-0.5">•</span>{r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIMatching() {
  const { listings, orgs, requests, currentUser } = useApp();
  const [selectedListingId, setSelectedListingId] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { from: 'bot', text: 'Hi! I\'m MealMitra Assistant. I can explain how the AI matching works, answer food rescue FAQs, and guide you through the platform. What would you like to know?' }
  ]);

  const activeDonorListings = listings.filter(l =>
    ['listed','requested'].includes(l.status) && l.remainingQuantity > 0
  );

  const selectedListing = listings.find(l => l.id === selectedListingId);
  const recipientOrgs = orgs.filter(o => o.type === 'ngo');

  const matchResult = useMemo(() => {
    if (!selectedListing) return null;
    return matchRecipients(selectedListing, recipientOrgs, requests);
  }, [selectedListing, recipientOrgs, requests]);

  function sendChat() {
    if (!chatMsg.trim()) return;
    const userMsg = chatMsg.trim();
    const botReply = getAssistantResponse(userMsg);
    setChatHistory(h => [...h, { from: 'user', text: userMsg }, { from: 'bot', text: botReply }]);
    setChatMsg('');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={22} className="text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>AI Matching Engine</h1>
        </div>
        <p className="text-sm text-gray-500">Rule-based deterministic matching. Scores are computed from real data only — no fabrication.</p>
      </div>

      {/* AI Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex gap-3">
        <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>How it works:</strong> The matching engine filters ineligible recipients (capacity, preferences, expired deadlines, duplicates), then ranks eligible ones using documented weights: Proximity 30% · Capacity 25% · Urgency 25% · Preference 20%. Scores are computed from real app data only. If Gemini API is not configured, rule-based results are shown directly.
          <br/><strong>Limitations:</strong> Proximity scoring requires real GPS coordinates. Distances shown are Haversine estimates. The engine does not certify food safety or replace human judgment.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Listing selector + results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Select listing */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select a Food Listing to Match</label>
            <select
              id="listing-select"
              value={selectedListingId}
              onChange={e => setSelectedListingId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
            >
              <option value="">-- Choose a listing --</option>
              {activeDonorListings.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.remainingQuantity} {l.unit} · {l.location}
                </option>
              ))}
            </select>

            {activeDonorListings.length === 0 && (
              <p className="text-xs text-gray-400 mt-2">No active listings with remaining quantity. Add a listing first.</p>
            )}
          </div>

          {/* Listing detail */}
          {selectedListing && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">{selectedListing.name}</h3>
                <StatusBadge status={selectedListing.status} />
                <CategoryBadge category={selectedListing.category} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><span className="text-xs text-gray-400 block">Quantity</span><strong>{selectedListing.remainingQuantity}</strong> {selectedListing.unit}</div>
                <div><span className="text-xs text-gray-400 block">Location</span>{selectedListing.location}</div>
                <div><span className="text-xs text-gray-400 block">Deadline</span>{format(new Date(selectedListing.pickupDeadline), 'MMM d, h:mm a')}</div>
                <div><span className="text-xs text-gray-400 block">Allergens</span>{selectedListing.allergens?.join(', ') || 'None'}</div>
              </div>
            </div>
          )}

          {/* Match results */}
          {matchResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  Eligible Recipients ({matchResult.eligible.length})
                </h2>
                <span className="text-xs text-gray-400">{matchResult.ineligible.length} ineligible</span>
              </div>

              {matchResult.eligible.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                  <AlertTriangle size={28} className="mx-auto text-amber-500 mb-3" />
                  <h3 className="font-semibold text-amber-900 mb-2">No Eligible Recipients Found</h3>
                  <div className="text-sm text-amber-700 space-y-1">
                    {matchResult.ineligible.map((item, i) => (
                      <div key={i}>❌ <strong>{item.org.name}</strong> — {item.reason}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {matchResult.eligible.map((match, i) => (
                    <MatchCard key={match.org.id} match={match} rank={i} />
                  ))}

                  {/* Ineligible summary */}
                  {matchResult.ineligible.length > 0 && (
                    <details className="bg-gray-50 rounded-2xl border border-gray-100">
                      <summary className="px-4 py-3 text-sm text-gray-600 cursor-pointer font-medium">
                        {matchResult.ineligible.length} ineligible recipient(s)
                      </summary>
                      <div className="px-4 pb-3 space-y-1">
                        {matchResult.ineligible.map((item, i) => (
                          <div key={i} className="text-xs text-gray-500">
                            ❌ <strong>{item.org.name}</strong> — {item.reason}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </>
              )}
            </div>
          )}

          {!selectedListingId && (
            <EmptyState icon={Sparkles} title="Select a listing" description="Choose a food listing above to see AI-matched eligible recipients with scores and reasons." />
          )}
        </div>

        {/* Right: AI Assistant */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[520px]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <Bot size={18} className="text-primary-600" />
              <h3 className="font-semibold text-gray-900 text-sm">MealMitra Assistant</h3>
              <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Demo AI</span>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.from === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <input
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Ask about the platform..."
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
                aria-label="Ask the assistant"
              />
              <button onClick={sendChat}
                className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center text-white hover:bg-primary-700 transition-colors shrink-0"
                aria-label="Send">
                <Send size={14} />
              </button>
            </div>

            <div className="px-3 pb-2 text-[9px] text-gray-400 text-center">
              ⚠️ Demo assistant. Does NOT certify food safety. Not a substitute for professional advice.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
