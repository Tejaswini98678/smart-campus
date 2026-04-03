'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { MessageSquare, Send, X, Bot, Sparkles, User, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const { role, user } = useRole();
  const [proactiveTip, setProactiveTip] = useState<string | null>(null);

  useEffect(() => {
    if (role && !proactiveTip && !isOpen) {
      if (role === 'hod') {
        setProactiveTip("Management Insight: 2 faculty members have pending timetable approvals. Review now?");
      } else if (role === 'faculty') {
        setProactiveTip("Academic Alert: Attendance for 'Cloud Computing' is below 75% for 3 students.");
      } else {
        setProactiveTip("Notice: Your attendance trend is 5% lower this week. Shall we check your schedule?");
      }
    }
  }, [role, isOpen]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length > 0) return;
    
    if (isOpen) {
        const welcomeMsg = role === 'hod' 
          ? `Greetings, ${user?.name}. Global Nexus synchronized. How can I assist with your administrative oversight today?`
          : role === 'faculty'
          ? `Welcome, Professor ${user?.name}. Syllabus tracking and grading systems are online. How can I help with your courses?`
          : `Hello ${user?.name}! I'm UniBot. Need help with your grades, attendance, or upcoming exams?`;
        
        setMessages([{ role: 'bot', text: welcomeMsg }]);
    }
  }, [isOpen, role, user?.name]);

  const [isTyping, setIsTyping] = useState(false);
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, role, userId: user?.id, history: messages })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.response || "I'm having trouble accessing the Nexus right now." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Connection to Nexus Core lost. Please retry." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (pathname === '/login') return null;

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      {/* Proactive Tip Bubble */}
      <AnimatePresence>
        {proactiveTip && !isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 10, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-24 right-0 w-[300px] glass-panel p-5 bg-violet-600/10 border-violet-500/30 shadow-2xl cursor-pointer group"
            onClick={() => { setIsOpen(true); setProactiveTip(null); }}
          >
             <div className="flex gap-4">
               <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-violet-600/30 border border-white/10">
                 <Sparkles size={18} />
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-1">Nexus AI Suggestion</p>
                 <p className="text-xs font-bold text-slate-300 leading-relaxed group-hover:text-white transition-colors">{proactiveTip}</p>
               </div>
             </div>
             <button 
                onClick={(e) => { e.stopPropagation(); setProactiveTip(null); }}
                className="absolute top-2 right-2 p-1 text-slate-600 hover:text-slate-400"
             >
                <X size={12} />
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) setProactiveTip(null); }}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all z-50 relative group ${
          isOpen ? 'bg-slate-800 text-slate-400' : 'bg-violet-600 text-white shadow-2xl shadow-violet-600/40'
        }`}
      >
        {isOpen ? <X size={28} /> : (
          <div className="relative">
             <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
             {proactiveTip && <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />}
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-24 right-0 w-[420px] h-[600px] glass-panel z-50 flex flex-col overflow-hidden border-violet-500/20 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-violet-600/10 to-cyan-600/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <h4 className="font-black text-sm tracking-tight">Nexus Intelligence</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Context Synchronized</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                    ? 'bg-violet-600 text-white font-medium shadow-xl' 
                    : 'bg-white/5 border border-white/10 text-slate-300 leading-relaxed shadow-inner'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-1">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="px-6 py-4 flex gap-2">
               {['Attendance?', 'Grades Voyage', 'Schedule'].map(tag => (
                 <button 
                  key={tag} 
                  onClick={() => setInput(tag)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                 >
                   {tag}
                 </button>
               ))}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/5 bg-white/[0.02]">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Query the Nexus..."
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 pr-14 text-white focus:outline-none focus:border-violet-500/50 transition-all text-sm font-medium shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 text-white top-2 w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center hover:bg-violet-500 hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
