import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import axios from 'axios';

interface Application { id: number; status: string; submitted_at: string; user_name: string; service_name: string; }
interface Complaint { id: number; status: string; category: string; description: string; location: string; created_at: string; }

export function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [complaintResponses, setComplaintResponses] = useState<Record<number, string>>({});
  const [docTitle, setDocTitle] = useState(''); const [docUrl, setDocUrl] = useState(''); const [docContent, setDocContent] = useState('');
  const [addingDoc, setAddingDoc] = useState(false);

  const fetchAll = async () => {
    try {
      const [a, c] = await Promise.all([axios.get(`${API_URL}/api/admin/applications`), axios.get(`${API_URL}/api/admin/complaints`)]);
      setApplications(a.data); setComplaints(c.data);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const handleVerify = async (id: number, status: string) => { try { await axios.post(`${API_URL}/api/admin/applications/${id}/verify`, { status }); fetchAll(); } catch { alert('Failed'); } };
  const handleAddDoc = async (e: React.FormEvent) => { e.preventDefault(); if (!docTitle || !docUrl || !docContent) return; setAddingDoc(true); try { await axios.post(`${API_URL}/api/admin/documents`, { title: docTitle, source_url: docUrl, content: docContent, jurisdiction: "Local" }); alert('Added!'); setDocTitle(''); setDocUrl(''); setDocContent(''); } catch { alert('Failed'); } finally { setAddingDoc(false); } };
  const handleRespond = async (id: number) => { const t = complaintResponses[id]; if (!t) return; try { await axios.post(`${API_URL}/api/admin/complaints/${id}/respond`, { response: t }); setComplaintResponses(p => ({ ...p, [id]: '' })); fetchAll(); } catch { alert('Failed'); } };

  const badge = (status: string) => {
    const m: Record<string, { l: string; c: string }> = {
      approved: { l: 'Approved', c: 'badge-success' }, rejected: { l: 'Rejected', c: 'badge-danger' },
      responded: { l: 'Responded', c: 'badge-info' }, pending_assessment: { l: 'Pending', c: 'badge-warning' }, pending: { l: 'Pending', c: 'badge-warning' },
    };
    const s = m[status] || { l: 'Pending', c: 'badge-warning' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${s.c}`}>{s.l}</span>;
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div><span className="text-xs text-slate-500">Loading...</span></div></div>;

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-center gap-2.5 mb-5 animate-fade-in-up">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
        <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
      </div>

      {/* Applications */}
      <div className="glass-card overflow-hidden mb-6 animate-fade-in-up stagger-1">
        <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-2">
          <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <h2 className="text-sm font-semibold text-slate-200">Service Applications</h2>
          <span className="ml-auto text-[10px] badge-info px-2 py-0.5 rounded-full font-semibold">{applications.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead><tr className="border-b border-white/[0.04]">
              {['ID','Applicant','Service','Date','Status','Actions'].map(h => <th key={h} className="px-5 py-2.5 text-left text-[9px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>)}
            </tr></thead>
            <tbody>
              {applications.length === 0 ? <tr><td colSpan={6} className="px-5 py-6 text-center text-slate-600 text-xs">No applications yet</td></tr> :
              applications.map((app, i) => (
                <tr key={app.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors animate-fade-in" style={{animationDelay:`${i*0.05}s`}}>
                  <td className="px-5 py-3 text-xs font-medium text-slate-300">#{app.id}</td>
                  <td className="px-5 py-3 text-xs text-slate-400">{app.user_name}</td>
                  <td className="px-5 py-3 text-xs text-slate-200 font-medium">{app.service_name}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(app.submitted_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">{badge(app.status)}</td>
                  <td className="px-5 py-3 text-right">{app.status === 'pending' && (
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleVerify(app.id, 'approved')} className="text-[10px] font-semibold badge-success px-3 py-1 rounded-lg hover:bg-emerald-500/20 transition-all active:scale-95 cursor-pointer">Approve</button>
                      <button onClick={() => handleVerify(app.id, 'rejected')} className="text-[10px] font-semibold badge-danger px-3 py-1 rounded-lg hover:bg-red-500/20 transition-all active:scale-95 cursor-pointer">Reject</button>
                    </div>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaints */}
      <div className="glass-card overflow-hidden mb-6 animate-fade-in-up stagger-2">
        <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <h2 className="text-sm font-semibold text-slate-200">Citizen Complaints</h2>
          <span className="ml-auto text-[10px] badge-warning px-2 py-0.5 rounded-full font-semibold">{complaints.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead><tr className="border-b border-white/[0.04]">
              {['ID','Category','Location','Status','Response'].map(h => <th key={h} className="px-5 py-2.5 text-left text-[9px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>)}
            </tr></thead>
            <tbody>
              {complaints.length === 0 ? <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-600 text-xs">No complaints yet</td></tr> :
              complaints.map((c, i) => (
                <tr key={c.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors animate-fade-in" style={{animationDelay:`${i*0.05}s`}}>
                  <td className="px-5 py-3 text-xs font-medium text-slate-300">#{c.id}</td>
                  <td className="px-5 py-3 text-xs text-slate-200 font-medium">{c.category}</td>
                  <td className="px-5 py-3 text-xs text-slate-400 max-w-[140px] truncate">{c.location}</td>
                  <td className="px-5 py-3">{badge(c.status)}</td>
                  <td className="px-5 py-3">{c.status === 'responded' || c.status === 'resolved' ? (
                    <span className="text-[10px] badge-success px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Sent
                    </span>
                  ) : (
                    <div className="flex gap-1.5">
                      <input type="text" value={complaintResponses[c.id] || ''} onChange={e => setComplaintResponses(p => ({ ...p, [c.id]: e.target.value }))} placeholder="Type response..." className="flex-1 text-xs px-3 py-1.5 glass-input !rounded-lg min-w-[120px]" />
                      <button onClick={() => handleRespond(c.id)} disabled={!complaintResponses[c.id]} className="text-[10px] font-semibold btn-primary px-3 py-1.5 !rounded-lg disabled:opacity-20">Reply</button>
                    </div>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Knowledge Base */}
      <div className="glass-card p-5 mb-6 animate-fade-in-up stagger-3">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <h2 className="text-sm font-semibold text-slate-200">AI Knowledge Base</h2>
        </div>
        <p className="text-[10px] text-slate-500 mb-4 ml-6">Add content to train CivicSaathi AI</p>
        <form onSubmit={handleAddDoc} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Title</label><input type="text" value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder="e.g. Water Connection Rules" className="w-full px-3 py-2.5 glass-input text-sm" required /></div>
            <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Source URL</label><input type="text" value={docUrl} onChange={e => setDocUrl(e.target.value)} placeholder="e.g. waterboard.gov.in" className="w-full px-3 py-2.5 glass-input text-sm" required /></div>
          </div>
          <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Content</label><textarea value={docContent} onChange={e => setDocContent(e.target.value)} placeholder="Paste official rules or information..." rows={4} className="w-full px-3 py-2.5 glass-input text-sm resize-none" required /></div>
          <div className="flex justify-end">
            <button type="submit" disabled={addingDoc} className="btn-primary text-xs px-5 py-2 flex items-center gap-2 disabled:opacity-30">
              {addingDoc ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Adding...</> :
              <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> Add to Knowledge Base</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
