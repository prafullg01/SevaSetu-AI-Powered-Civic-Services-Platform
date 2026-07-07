import React, { useState } from 'react';
import { API_URL } from '../config';

export default function ComplaintTracker({ userId }: { userId: number }) {
  const [view, setView] = useState<'form' | 'timeline'>('form');
  const [complaintId, setComplaintId] = useState<number | null>(null);
  const [complaintStatus, setComplaintStatus] = useState<string>('');
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [category, setCategory] = useState('Pothole');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');

  React.useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${API_URL}/api/complaints/user/${userId}`);
        const data = await res.json();
        if (data && data.length > 0) {
          const latest = data[0];
          setComplaintId(latest.id);
          setComplaintStatus(latest.status);
          await fetchTimeline(latest.id);
        }
      } catch (err) { console.error(err); }
      finally { setLoadingInitial(false); }
    };
    init();
  }, [userId]);

  const submitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/complaints`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, category, description: desc, location })
    });
    const data = await res.json();
    setComplaintId(data.complaint_id); setComplaintStatus(data.status);
    fetchTimeline(data.complaint_id);
  };

  const fetchTimeline = async (id: number) => {
    try {
      const [tlRes, detailsRes] = await Promise.all([
        fetch(`${API_URL}/api/complaints/${id}/timeline`),
        fetch(`${API_URL}/api/complaints/${id}`)
      ]);
      setTimeline(await tlRes.json());
      setComplaintStatus((await detailsRes.json()).status);
      setView('timeline');
    } catch (err) { console.error(err); }
  };

  if (loadingInitial) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500">Loading complaints...</span>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    responded: { color: 'text-emerald-400', bg: 'badge-success', label: 'Responded' },
    resolved: { color: 'text-green-400', bg: 'badge-success', label: 'Resolved' },
    pending_assessment: { color: 'text-amber-400', bg: 'badge-warning', label: 'Pending' },
  };
  const st = statusConfig[complaintStatus] || { color: 'text-amber-400', bg: 'badge-warning', label: complaintStatus };

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-5 animate-fade-in-up">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
          </div>
          <h2 className="text-lg font-bold text-white">Complaint Tracker</h2>
        </div>
        {view === 'timeline' && (
          <div className="flex gap-2">
            <button onClick={() => complaintId && fetchTimeline(complaintId)} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
            <button onClick={() => setView('form')} className="btn-primary text-xs py-1.5 px-3">New Complaint</button>
          </div>
        )}
      </div>
      
      {view === 'form' ? (
        <form onSubmit={submitComplaint} className="glass-card p-6 max-w-2xl space-y-4 animate-fade-in-up stagger-1">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
            <div className="relative">
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2.5 glass-input text-sm cursor-pointer appearance-none pr-8">
                {['Pothole', 'Water Supply', 'Streetlight', 'Garbage Collection'].map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
              <svg className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Location</label>
            <input type="text" required value={location} onChange={e => setLocation(e.target.value)} placeholder="E.g. Main Street, Near Park" className="w-full p-2.5 glass-input text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea required rows={4} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the issue in detail..." className="w-full p-2.5 glass-input text-sm resize-none" />
          </div>
          <button type="submit" className="btn-primary w-full text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            Submit Complaint
          </button>
        </form>
      ) : (
        <div className="glass-card p-6 max-w-2xl animate-fade-in-up stagger-1">
          <div className="flex items-center justify-between mb-5 border-b border-white/[0.04] pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Ticket #{complaintId}</h3>
              <div className="mt-1.5">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${st.bg}`}>{st.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] badge-purple px-2.5 py-1 rounded-full font-semibold">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              Hash-Chained
            </div>
          </div>
          
          <div className="relative border-l-2 border-indigo-500/20 ml-3 pl-6 space-y-5">
            {timeline.map((event, idx) => {
              const isAdmin = event.event_type === 'ADMIN_RESPONSE';
              return (
                <div key={idx} className="relative group animate-fade-in-up" style={{animationDelay: `${idx * 0.1}s`}}>
                  <div className={`absolute -left-[29px] w-3 h-3 rounded-full border-[3px] border-[#080b14] shadow-lg transition-all duration-300 group-hover:scale-150 ${isAdmin ? 'bg-emerald-400 shadow-emerald-400/30' : 'bg-indigo-400 shadow-indigo-400/30'}`}></div>
                  <div className={`text-xs font-bold uppercase tracking-wider ${isAdmin ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {isAdmin ? 'Admin Response' : event.event_type.replace(/_/g, ' ')}
                  </div>
                  <div className="text-[10px] text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {new Date(event.timestamp).toLocaleString()} · {event.actor}
                  </div>
                  <div className={`text-sm p-3 rounded-xl transition-all duration-300 ${isAdmin ? 'bg-emerald-500/[0.06] border border-emerald-500/15 text-emerald-200 group-hover:bg-emerald-500/10' : 'bg-white/[0.03] border border-white/[0.06] text-slate-300 group-hover:bg-white/[0.05]'}`}>
                    {event.note}
                  </div>
                  <div className="mt-1 text-[8px] font-mono text-slate-700 truncate" title={event.previous_hash}>
                    {event.previous_hash?.substring(0, 48)}...
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
