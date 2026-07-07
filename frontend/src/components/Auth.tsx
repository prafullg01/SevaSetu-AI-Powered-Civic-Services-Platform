import React, { useState } from 'react';

type AuthProps = {
  onLogin: (user: { id: number; name: string; phone: string }) => void;
};

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setError(''); setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { phone } : { phone, name };
    try {
      const res = await fetch(`http://localhost:8000${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) setError(data.detail || 'Authentication failed');
      else onLogin(data);
    } catch { setError("Failed to connect to the server."); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/[0.08] rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/[0.08] rounded-full blur-[120px] animate-float" style={{animationDelay: '3s'}}></div>
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(rgba(99,102,241,0.4) 1px, transparent 1px)', backgroundSize: '28px 28px'}}></div>
        {/* Orbiting particles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
          <div className="w-2 h-2 rounded-full bg-indigo-400/30" style={{animation: 'orbit 20s linear infinite'}}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400/20" style={{animation: 'orbit 30s linear infinite reverse'}}></div>
        </div>
      </div>

      <div className="w-full max-w-md glass-panel p-8 relative z-10 animate-fade-in-up">
        {/* Logo with glow ring */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-2xl animate-gradient">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="absolute -inset-3 rounded-3xl bg-indigo-500/10 blur-xl" style={{animation: 'pulse-ring 3s ease-in-out infinite'}}></div>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mt-5">CivicSaathi</h2>
          <p className="text-sm text-slate-400 mt-1.5">AI-powered civic services platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="animate-fade-in-up">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" className="w-full p-3 glass-input text-sm" required={!isLogin} />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210" className="w-full p-3 glass-input text-sm" required />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm p-3 rounded-xl bg-red-500/5 border border-red-500/15 flex items-center gap-2 animate-fade-in">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}
          
          <button type="submit" disabled={loading || !phone} className="w-full btn-primary p-3 text-sm mt-2 flex items-center justify-center gap-2">
            {loading ? (
              <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Processing...</>
            ) : (
              <>{isLogin ? 'Sign In' : 'Create Account'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? "New here? " : "Already registered? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
            {isLogin ? "Create Account" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
