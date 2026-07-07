import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function Dashboard({ userId }: { userId: number }) {
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/conversations?user_id=${userId}`)
      .then(res => res.json()).then(setConversations).catch(console.error);
  }, []);

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-5 animate-fade-in-up">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h2 className="text-lg font-bold text-white">Trust & Provenance</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] badge-success px-2.5 py-1 rounded-full font-semibold">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Tamper-Evident Logs
        </div>
      </div>
      
      <div className="space-y-4 max-w-4xl">
        {conversations.map((conv, i) => (
          <div key={conv.id} className="glass-card p-5 animate-fade-in-up" style={{animationDelay: `${i * 0.08}s`}}>
            <div className="flex items-center justify-between mb-4 border-b border-white/[0.04] pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {new Date(conv.timestamp).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="bg-white/[0.03] text-slate-500 px-2 py-1 rounded-lg border border-white/[0.06] font-mono">{conv.model_version}</span>
                <span className="badge-info px-2 py-1 rounded-lg font-semibold">
                  {conv.sources_used ? conv.sources_used.length : 0} Sources
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              {conv.messages_json.map((msg: any, idx: number) => (
                <div key={idx} className={`p-3 rounded-xl transition-all duration-200 hover:translate-x-1 ${msg.role === 'user' ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-indigo-500/[0.03] border border-indigo-500/[0.08]'}`}>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1 block flex items-center gap-1.5">
                    {msg.role === 'user' ? (
                      <><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Citizen</>
                    ) : (
                      <><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>CivicSaathi</>
                    )}
                  </span>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              ))}
            </div>
            
            {conv.sources_used && conv.sources_used.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/[0.04]">
                <h4 className="text-[9px] font-bold uppercase text-slate-600 mb-2 tracking-widest flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Sources Referenced
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {conv.sources_used.map((source: any, idx: number) => {
                    const href = source.source_url.startsWith('http') ? source.source_url : `https://${source.source_url}`;
                    return (
                      <a key={idx} href={href} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 text-[10px] bg-white/[0.02] border border-white/[0.05] rounded-lg hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all text-indigo-300/70 hover:text-indigo-300 truncate group">
                        <svg className="w-3 h-3 shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        <span className="truncate">{source.title}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="mt-3 flex justify-between items-center text-[8px] text-slate-700">
              <div className="font-mono truncate max-w-[200px] sm:max-w-md" title={conv.previous_hash}>Hash: {conv.previous_hash}</div>
              <button className="text-red-500/40 hover:text-red-400 transition-colors text-[10px]">Report</button>
            </div>
          </div>
        ))}
        {conversations.length === 0 && (
          <div className="text-center p-10 glass-card flex flex-col items-center gap-3 animate-fade-in">
            <svg className="w-10 h-10 text-slate-700 animate-float" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <p className="text-xs text-slate-500">No conversations yet. Start chatting!</p>
          </div>
        )}
      </div>
    </div>
  );
}
