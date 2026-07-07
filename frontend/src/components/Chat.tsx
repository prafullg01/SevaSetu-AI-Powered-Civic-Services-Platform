import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../config';

export default function Chat({ userId, language }: { userId: number, language: string }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Namaste! I am CivicSaathi, your AI companion for civic services. How can I help you today?', isAi: true, sources: 0 }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const startListening = () => {
    // @ts-ignore
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech Recognition not supported."); return; }
    const recognition = new SR();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => { setInput(prev => prev + (prev ? ' ' : '') + event.results[0][0].transcript); };
    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', content: input, isAi: false };
    setMessages(prev => [...prev, userMsg]);
    setInput(''); setIsTyping(true);
    try {
      const res = await fetch(`${API_URL}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: input, user_id: userId, language }) });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: data.answer, isAi: true, sources: data.sources?.length || 0 }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: "Couldn't reach the server. Is it running?", isAi: true, sources: 0 }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, i) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`} style={{animationDelay: `${i * 0.05}s`}}>
            <div className="flex items-end gap-2.5 max-w-[80%]">
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
              )}
              <div>
                <div className={`p-3.5 text-[13px] leading-relaxed ${msg.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.isAi && (
                  <div className="mt-1.5 flex items-center gap-2 text-[9px] text-slate-600 pl-1">
                    <span className="flex items-center gap-1 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/[0.06]">
                      <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse"></span>
                      AI Response
                    </span>
                    {msg.sources > 0 && (
                      <span className="text-indigo-400/80">{msg.sources} source{msg.sources > 1 ? 's' : ''} cited</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-end gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <div className="msg-ai px-5 py-4">
                <div className="flex gap-1"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 glass-card p-1.5 !rounded-xl focus-within:border-indigo-500/25 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.06)] transition-all duration-300">
          <button onClick={isListening ? undefined : startListening} className={`p-2 transition-all duration-200 rounded-lg ${isListening ? 'text-red-400 bg-red-500/10 animate-pulse' : 'text-slate-500 hover:text-indigo-400 hover:bg-white/[0.04]'}`} title="Voice Input">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask about civic services, documents, or complaints..." className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-600 px-2 text-sm" />
          <button onClick={handleSend} disabled={!input.trim()} className="p-2 rounded-lg transition-all duration-200 disabled:opacity-20 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
