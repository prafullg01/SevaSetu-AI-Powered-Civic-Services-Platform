import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function DocumentWizard({ userId }: { userId: number }) {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/services`).then(r => r.json()).then(setServices).catch(console.error);
  }, []);

  const handleApply = async () => {
    setLoading(true);
    try { const res = await fetch(`${API_URL}/api/applications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, service_id: selectedService.id }) }); if (res.ok) setSuccess(true); }
    catch {} finally { setLoading(false); }
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    'Identity': <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>,
    'Finance': <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>,
    'Social Welfare': <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
    'Transport': <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.029-.504 1.125-1.125a3.75 3.75 0 00-2.953-4.059L16.5 12.75M5.25 5.653c0-.856.917-1.398 1.667-.986L11.25 6.966V4.5a.75.75 0 011.5 0v2.466l4.333-2.3c.75-.411 1.667.131 1.667.987V18m-13.5 0V5.653z" /></svg>,
  };
  const defaultIcon = <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;

  if (success) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md animate-fade-in-up">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Application Submitted</h2>
          <p className="text-slate-400 mb-6 text-sm">Your application for <span className="text-indigo-300 font-medium">{selectedService.name}</span> has been submitted. Check Admin tab for status.</p>
          <button onClick={() => { setSuccess(false); setSelectedService(null); }} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      <div className="flex items-center gap-2.5 mb-5 animate-fade-in-up">
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <h2 className="text-lg font-bold text-white">Service Applications</h2>
      </div>
      
      {!selectedService ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((svc, i) => (
            <div key={svc.id} onClick={() => setSelectedService(svc)} className="glass-card p-5 cursor-pointer transition-all duration-300 hover:border-indigo-500/25 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-indigo-500/5 group animate-fade-in-up" style={{animationDelay: `${i * 0.06}s`}}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-500/20 transition-all duration-300">
                  {categoryIcons[svc.category] || defaultIcon}
                </div>
                <div>
                  <div className="text-[9px] font-bold text-indigo-400/70 uppercase tracking-widest">{svc.category}</div>
                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{svc.name}</h3>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 ml-[52px]">Dept: {svc.department}</p>
              <div className="mt-3 ml-[52px] flex items-center gap-1 text-[9px] text-indigo-400/50 group-hover:text-indigo-400/80 transition-colors">
                <span>Apply now</span>
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-6 max-w-2xl animate-slide-right">
          <button onClick={() => setSelectedService(null)} className="text-xs text-indigo-400/70 hover:text-indigo-300 mb-4 inline-flex items-center gap-1 transition-colors group">
            <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to services
          </button>
          
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              {categoryIcons[selectedService.category] || defaultIcon}
            </div>
            <h3 className="text-lg font-bold text-white">{selectedService.name}</h3>
          </div>
          
          <div className="mt-5">
            <h4 className="text-[9px] font-bold text-slate-400 mb-3 border-b border-white/[0.04] pb-2 uppercase tracking-widest flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Eligibility
            </h4>
            <ul className="space-y-1.5">
              {Object.entries(selectedService.eligibility_json).map(([key, val]) => (
                <li key={key} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
                  <span><span className="font-medium text-slate-200 capitalize">{key.replace(/_/g, ' ')}</span>: {String(val)}</span>
                </li>
              ))}
              {Object.keys(selectedService.eligibility_json).length === 0 && <li className="text-sm text-slate-500">Open to all citizens</li>}
            </ul>
          </div>
          
          <div className="mt-5">
            <h4 className="text-[9px] font-bold text-slate-400 mb-3 border-b border-white/[0.04] pb-2 uppercase tracking-widest flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Required Documents
            </h4>
            <div className="space-y-1.5">
              {selectedService.required_docs.map((doc: string, idx: number) => (
                <label key={idx} className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05] cursor-pointer hover:bg-white/[0.04] hover:border-indigo-500/15 transition-all group">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 rounded accent-indigo-500 bg-transparent border-white/20" />
                  <div>
                    <div className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{doc}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Required</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mt-7 flex justify-end">
            <button onClick={handleApply} disabled={loading} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
              {loading ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Submitting...</> :
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> Submit Application</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
