'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot } from 'lucide-react';

export default function LoginAIHelper({ role }: { role: string }) {
  const [typing, setTyping] = useState(true);
  const [message, setMessage] = useState('Initializing Nexus AI...');

  useEffect(() => {
    setTyping(true);
    let timeout: NodeJS.Timeout;

    if (role === 'student') {
      setMessage('Analyzing academic trajectory...');
      timeout = setTimeout(() => {
        setTyping(false);
        setMessage('Ready to sync student profile and upcoming coursework.');
      }, 1500);
    } else if (role === 'faculty') {
      setMessage('Connecting to operational hub...');
      timeout = setTimeout(() => {
        setTyping(false);
        setMessage('Awaiting faculty credentials for syllabus and attendance sync.');
      }, 1500);
    } else if (role === 'hod') {
      setMessage('Accessing enterprise analytics...');
      timeout = setTimeout(() => {
        setTyping(false);
        setMessage('Secure connection established. Awaiting HOD clearance.');
      }, 1500);
    }

    return () => clearTimeout(timeout);
  }, [role]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -40, y: 20 }}
      animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
      transition={{ opacity: { duration: 0.8 }, y: { delay: 1, duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
      className="hidden lg:flex absolute left-[10%] top-[40%] flex-col gap-4 max-w-[280px]"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-violet-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <Bot size={24} className="text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white tracking-widest uppercase">Nexus Core</h3>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-400/80 font-bold tracking-widest">ONLINE</span>
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 border-violet-500/20 bg-violet-950/20 shadow-2xl relative">
        <div className="absolute top-0 left-4 -translate-y-[1px] w-8 h-[2px] bg-gradient-to-r from-violet-500 to-transparent" />
        
        <AnimatePresence mode="wait">
          {typing ? (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Sparkles size={14} className="text-violet-400 animate-spin-slow" />
              <span className="text-xs text-slate-300 font-mono">{message}</span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-1 h-3 bg-violet-400 ml-1 block"
              />
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-slate-300 leading-relaxed font-medium"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
