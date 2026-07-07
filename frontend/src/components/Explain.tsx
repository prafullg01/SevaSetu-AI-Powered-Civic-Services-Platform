import React, { useState, useRef } from 'react';

export default function Explain() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ simple: string; standard: string; legal: string; next_steps?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'simple' | 'standard' | 'legal'>('simple');
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'pdf'>('text');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSimplify = async () => {
    if (inputMode === 'text' && !text.trim()) return;
    if (inputMode === 'pdf' && !pdfFile) return;
    setLoading(true); setError(null); setResult(null);
    try {
      let res: Response;
      if (inputMode === 'pdf' && pdfFile) {
        const fd = new FormData(); fd.append('file', pdfFile);
        res = await fetch('http://localhost:8000/api/explain/pdf', { method: 'POST', body: fd });
      } else {
        res = await fetch('http://localhost:8000/api/explain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      }
      const data = await res.json();
      if (data.error) setError(data.error);
      else { setResult(data); setActiveTab('simple'); }
    } catch { setError("Failed to reach the server."); }
    finally { setLoading(false); }
  };

  const loadSample = () => {
    setInputMode('text');
    setText("Pursuant to Section 15 of the Municipal Water Code (Amended 2023), it is hereby mandated that all residential property owners shall submit their bi-annual water consumption declarations no later than the fifteenth day of the fourth month following the close of the designated billing cycle. Failure to remit said declarations in a timely manner will result in the immediate imposition of a 5% penalty per annum on any outstanding principal balance, and may culminate in the temporary suspension of water services pending full compliance and payment of associated reinstatement fees.");
  };

  const tabConfig = [
    { key: 'simple' as const, label: 'Simple', sub: 'Grade 5', color: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20 text-emerald-400' },
    { key: 'standard' as const, label: 'Standard', sub: 'Grade 10', color: 'from-sky-500/15 to-sky-500/5 border-sky-500/20 text-sky-400' },
    { key: 'legal' as const, label: 'Legal', sub: 'Exact', color: 'from-slate-500/15 to-slate-500/5 border-slate-500/20 text-slate-300' },
  ];

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-5 animate-fade-in-up">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h2 className="text-lg font-bold text-white">Gov-Speak Simplifier</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] badge-purple px-2.5 py-1 rounded-full font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
          AI Powered
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up stagger-1">
        {/* Input */}
        <div className="glass-card p-4 flex flex-col h-[440px]">
          <div className="flex justify-between items-center mb-3 border-b border-white/[0.04] pb-2.5">
            <div className="flex items-center gap-1">
              <button onClick={() => setInputMode('text')} className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${inputMode === 'text' ? 'tab-active' : 'tab-inactive'}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Text
              </button>
              <button onClick={() => setInputMode('pdf')} className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${inputMode === 'pdf' ? 'tab-active' : 'tab-inactive'}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                PDF Upload
              </button>
            </div>
            {inputMode === 'text' && (
              <button onClick={loadSample} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-500/[0.06] hover:bg-indigo-500/10 px-2.5 py-1 rounded-lg transition-all border border-indigo-500/15">
                Load Sample
              </button>
            )}
          </div>

          {inputMode === 'text' ? (
            <textarea className="flex-1 w-full p-3 glass-input text-sm resize-none !rounded-xl" placeholder="Paste complex government notifications, legal acts, or scheme details here..." value={text} onChange={e => setText(e.target.value)} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.015] hover:bg-white/[0.03] transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={e => e.target.files?.[0] && setPdfFile(e.target.files[0])} className="hidden" />
              {pdfFile ? (
                <div className="flex flex-col items-center gap-3 animate-fade-in">
                  <div className="w-14 h-14 bg-red-500/[0.08] rounded-xl flex items-center justify-center border border-red-500/15 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                  </div>
                  <p className="text-sm font-medium text-slate-200">{pdfFile.name}</p>
                  <p className="text-[10px] text-slate-500">{(pdfFile.size / 1024).toFixed(1)} KB · Click to change</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white/[0.03] rounded-xl flex items-center justify-center border border-white/[0.06] group-hover:scale-110 group-hover:border-indigo-500/20 transition-all duration-300">
                    <svg className="w-7 h-7 text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                  </div>
                  <p className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Drop a PDF or click to browse</p>
                  <p className="text-[10px] text-slate-600">Government notices, circulars, legal documents</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 flex justify-end">
            <button onClick={handleSimplify} disabled={loading || (inputMode === 'text' ? !text.trim() : !pdfFile)} className="btn-primary text-xs px-5 py-2 flex items-center gap-2 disabled:opacity-30">
              {loading ? (
                <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Analyzing...</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> {inputMode === 'pdf' ? 'Scan PDF' : 'Simplify'}</>
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="glass-card p-4 flex flex-col h-[440px]">
          <div className="flex gap-1 mb-3 border-b border-white/[0.04] pb-2.5">
            {tabConfig.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-200 ${activeTab === t.key ? `bg-gradient-to-r ${t.color} border` : 'tab-inactive'}`}>
                {t.label} <span className="text-[9px] opacity-60 ml-0.5">{t.sub}</span>
              </button>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
            {error ? (
              <div className="text-red-400 text-sm p-3 bg-red-500/5 rounded-lg border border-red-500/15 flex items-center gap-2 animate-fade-in">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </div>
            ) : result ? (
              <div className="flex flex-col h-full animate-fade-in">
                <div className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed flex-1">{result[activeTab]}</div>
                {result.next_steps && (
                  <div className="mt-4 p-3.5 bg-indigo-500/[0.06] border border-indigo-500/15 rounded-xl shrink-0 animate-fade-in-up">
                    <h4 className="text-[10px] font-bold text-indigo-300 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      Recommended Next Step
                    </h4>
                    <p className="text-sm text-indigo-200/80">{result.next_steps}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                <svg className="w-10 h-10 text-slate-700 animate-float" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-xs text-center px-4">Paste text or upload a PDF to begin</p>
              </div>
            )}
          </div>
          
          {result && (
            <div className="mt-2.5 flex justify-end">
              <button onClick={() => navigator.clipboard.writeText(result[activeTab])} className="text-[10px] text-slate-500 hover:text-indigo-300 flex items-center gap-1.5 transition-colors btn-ghost py-1 px-2.5 text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
