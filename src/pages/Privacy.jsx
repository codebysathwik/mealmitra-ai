export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-xs text-gray-400 mb-6">⚠️ Demo Privacy Policy — not a legally binding document</p>
      <div className="space-y-6 text-sm text-gray-700 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <section>
          <h2 className="font-bold text-gray-900 mb-2">Data We Collect (Demo Mode)</h2>
          <p>In demo mode, all data is stored in your browser's localStorage only. No data is sent to any server. No personal information is collected.</p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 mb-2">Production Mode</h2>
          <p>If configured with Supabase, the platform would collect: name, email, phone number, organisation details, and food listing information. Data would be stored in Supabase PostgreSQL with Row-Level Security. API keys would never be exposed in client-side code.</p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 mb-2">Security</h2>
          <p>This demo platform has no real authentication. In production, Supabase Auth with email verification would be used. All privileged writes go through server-side validated paths or Supabase RLS policies.</p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 mb-2">Contact</h2>
          <p>For questions about privacy in a production deployment, contact the deploying organisation. This hackathon demo does not constitute a live service.</p>
        </section>
      </div>
    </div>
  );
}
