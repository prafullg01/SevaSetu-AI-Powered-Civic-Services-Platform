import React, { useState } from 'react';
import Chat from './components/Chat';
import DocumentWizard from './components/DocumentWizard';
import ComplaintTracker from './components/ComplaintTracker';
import Dashboard from './components/Dashboard';
import Explain from './components/Explain';
import Auth from './components/Auth';
import { AdminDashboard } from './components/AdminDashboard';

export type User = { id: number; name: string; phone: string };

const tabs = [
  { key: 'chat', label: 'Chat', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
  )},
  { key: 'services', label: 'Services', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  )},
  { key: 'complaints', label: 'Complaints', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
  )},
  { key: 'dashboard', label: 'Audit', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
  )},
  { key: 'explain', label: 'Simplify', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  )},
  { key: 'admin', label: 'Admin', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  )},
] as const;

type TabKey = typeof tabs[number]['key'];

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('chat');
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="h-screen flex flex-col items-center p-3 sm:p-4 md:p-5 overflow-hidden">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-30%] left-[-15%] w-[600px] h-[600px] bg-indigo-600/[0.07] rounded-full blur-[150px] animate-float"></div>
        <div className="absolute bottom-[-30%] right-[-15%] w-[600px] h-[600px] bg-purple-600/[0.06] rounded-full blur-[150px] animate-float" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute top-[20%] right-[30%] w-[250px] h-[250px] bg-cyan-500/[0.03] rounded-full blur-[100px] animate-float" style={{animationDelay: '4s'}}></div>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'radial-gradient(rgba(99,102,241,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
      </div>

      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between mb-3 gap-3 animate-fade-in-up">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('chat')}>
          {/* Animated Logo */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-500 group-hover:scale-110 animate-gradient">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-20 blur-md transition-all duration-500"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors duration-300">CivicSaathi</h1>
            <div className="text-[10px] text-slate-500 font-medium tracking-wide">Welcome, {user.name || user.phone}</div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')} className="text-xs glass-input py-1.5 px-3 pr-7 cursor-pointer appearance-none">
                <option value="en" className="bg-slate-900">English</option>
                <option value="hi" className="bg-slate-900">Hindi</option>
              </select>
              <svg className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
            <button onClick={() => setUser(null)} className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
          <nav className="flex gap-0.5 glass-card p-1 !rounded-xl">
            {tabs.map(tab => (
              <button 
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === tab.key ? 'tab-active' : 'tab-inactive'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl flex-1 glass-panel glow-subtle flex flex-col overflow-hidden relative animate-fade-in-up stagger-2">
        {tabs.map(tab => (
          <div key={tab.key} className={`absolute inset-0 flex flex-col transition-all duration-300 ${activeTab === tab.key ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 pointer-events-none -z-10 translate-y-2'}`}>
            {tab.key === 'chat' && <Chat userId={user.id} language={language} />}
            {tab.key === 'services' && <DocumentWizard userId={user.id} />}
            {tab.key === 'complaints' && <ComplaintTracker userId={user.id} />}
            {tab.key === 'dashboard' && <Dashboard userId={user.id} />}
            {tab.key === 'explain' && <Explain />}
            {tab.key === 'admin' && <AdminDashboard />}
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
