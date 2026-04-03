'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import {
  Send, Paperclip, Search, Plus, MessageSquare,
  Zap, UserPlus, ArrowRight, ShieldAlert, X, Smile, Users, CheckCheck, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRole } from '@/context/RoleContext';
import { useRouter, useSearchParams } from 'next/navigation';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  roomId: string;
  fileData?: string;
  fileType?: 'image' | 'file' | 'voice';
  isPriority: boolean;
  createdAt: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: string;
  participantIds: string;
}

const roleColor: Record<string, string> = {
  hod: 'text-amber-400',
  faculty: 'text-cyan-400',
  student: 'text-violet-400',
};

function NexusChatContent() {
  const { user, role } = useRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRoomId = searchParams.get('room');

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  // activeRoom is now a computed value from rooms + URL param
  const activeRoom = useMemo(() => rooms.find(r => r.id === activeRoomId), [rooms, activeRoomId]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [isPriority, setIsPriority] = useState(false);
  const [showAddChat, setShowAddChat] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollRef    = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRooms();
    const t = setInterval(fetchRooms, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!activeRoomId) return;
    fetchMessages();
    const t = setInterval(fetchMessages, 3000);
    return () => clearInterval(t);
  }, [activeRoomId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/chat-rooms');
      if (res.ok) {
        const data: ChatRoom[] = await res.json();
        setRooms(data);
        // Default to General if no room is selected or just started
        if (initializing && !activeRoomId && data.length > 0) {
          const general = data.find(r => r.name === 'General');
          if (general) router.replace(`/messages?room=${general.id}`);
        }
      }
    } finally { setInitializing(false); }
  };

  const fetchMessages = async () => {
    if (!activeRoomId) return;
    const res = await fetch(`/api/messages?roomId=${activeRoomId}`);
    if (res.ok) setMessages(await res.json());
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim() || !user) return;
    setSending(true); setError(null);
    try {
      const res = await fetch('/api/chat-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail.trim(), senderId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setRooms(p => [...p.filter(r => r.id !== data.id), data]);
        router.push(`/messages?room=${data.id}`);
        setShowAddChat(false);
        setTargetEmail('');
      } else { setError(data.error || 'Connection failed'); }
    } finally { setSending(false); }
  };

  const handleDeleteRoom = async () => {
    if (!activeRoomId || !activeRoom) return;
    if (activeRoom.name === 'General') return alert("The Nexus Core (General) cannot be dismantled.");
    
    const confirmed = window.confirm(`Permanently purge conversation history with "${activeRoom.name}"? This action is irreversible.`);
    if (!confirmed) return;

    setSending(true);
    try {
      const res = await fetch(`/api/chat-rooms?roomId=${activeRoomId}`, { method: 'DELETE' });
      if (res.ok) {
        setRooms(p => p.filter(r => r.id !== activeRoomId));
        const generalRoom = rooms.find(r => r.name === 'General');
        router.replace(generalRoom ? `/messages?room=${generalRoom.id}` : '/messages');
      } else {
        const data = await res.json();
        alert(data.error || 'Purge failed');
      }
    } finally { setSending(false); }
  };

  const sendMessage = async (e?: React.FormEvent, extra?: Partial<Message>) => {
    e?.preventDefault();
    if ((!input.trim() && !extra?.fileData) || !user || !activeRoom || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id, senderName: user.name, senderRole: role,
          content: input.trim(), roomId: activeRoomId, isPriority, ...extra
        }),
      });
      if (res.ok) { setInput(''); setIsPriority(false); fetchMessages(); }
    } finally { setSending(false); }
  };

  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    /* Fullscreen panel filling the remaining flex area next to sidebar */
    <div className="flex bg-[#06061a] overflow-hidden h-screen w-full">

      {/* ══ COLUMN 2: History ══════════════════════════ */}
      <aside className="w-[300px] shrink-0 flex flex-col bg-[#0d0d26] border-r border-white/[0.08] relative z-20">

        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[18px] font-black text-white flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-violet-500 inline-block" />
              Messages
            </h2>
            <motion.button
              whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}
              onClick={() => setShowAddChat(true)}
              className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/40 hover:bg-violet-500 transition-all"
            >
              <Plus size={14} />
            </motion.button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text" placeholder="Search conversations…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 text-[14px] text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all"
            />
          </div>
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2">
          {initializing ? (
            <div className="flex justify-center items-center h-20">
              <div className="w-5 h-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin opacity-50" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <MessageSquare size={32} className="text-slate-700" />
              <p className="text-[14px] font-bold text-slate-500">No active conversations</p>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filteredRooms.map((room, idx) => {
                const active = activeRoom?.id === room.id;
                return (
                  <motion.li key={room.id} initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.04 }}>
                    <button
                      onClick={() => router.push(`/messages?room=${room.id}`)}
                      className={`w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-all duration-200 border ${activeRoomId === room.id ? 'bg-violet-600/15 border-violet-500/30 shadow-[0_2px_12px_rgba(124,58,237,0.12)]' : 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]'}`}
                    >
                      <div className={`w-12 h-12 rounded-xl shrink-0 overflow-hidden border transition-all ${active ? 'border-violet-500/50' : 'border-white/[0.1]'}`}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=8b5cf6&color=fff`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 pr-1">
                        <p className={`text-[15px] font-bold truncate ${active ? 'text-white' : 'text-slate-300'}`}>{room.name}</p>
                        <p className="text-[13px] text-slate-500 truncate mt-0.5">{room.type === 'dm' ? 'Direct Message' : 'Group Channel'}</p>
                      </div>
                      {activeRoomId === room.id && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,1)] shrink-0" />}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* ══ COLUMN 3: Main Chat ════════════════════════ */}
      <main className="flex-1 min-w-0 flex flex-col bg-[#0d0d26] relative z-10">

        {/* Ambient glow */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 bg-violet-700/8 rounded-full blur-[100px] pointer-events-none" />

        {activeRoom ? (
          <>
            {/* Header */}
            <header className="relative z-10 shrink-0 flex items-center justify-between px-8 py-5 border-b border-white/[0.06] bg-[#0d0d26]/80 backdrop-blur-xl">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-violet-500/25">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeRoom.name)}&background=8b5cf6&color=fff`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[2.5px] border-[#0d0d26]" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-[24px] font-black text-white leading-tight truncate">{activeRoom.name}</h1>
                  <p className="text-[13px] text-slate-400 font-semibold flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    Live Interface
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {activeRoom.name !== 'General' && (
                  <button
                    onClick={handleDeleteRoom}
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm group"
                    title="Purge Conversation"
                  >
                    <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                )}
                <button
                  onClick={() => setShowAddChat(true)}
                  className="flex items-center gap-2 h-11 px-5 shrink-0 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-300 hover:bg-violet-600 hover:text-white transition-all shadow-sm"
                >
                  <UserPlus size={16} />
                  <span className="text-[14px] font-bold">Add Member</span>
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-8 py-8 space-y-6 no-scrollbar relative z-10 flex flex-col">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-[640px] rounded-[2.5rem] border border-white/[0.1] bg-white/[0.02] backdrop-blur-xl p-10 sm:p-14 text-center relative overflow-hidden shadow-[0_0_100px_rgba(124,58,237,0.1)] flex flex-col items-center"
                  >
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-violet-600 to-transparent opacity-60" />

                    <div className="w-24 h-24 shrink-0 rounded-[1.5rem] bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(124,58,237,0.2)]">
                      <MessageSquare size={42} className="text-violet-400" />
                    </div>

                    <h2 className="text-[32px] font-black text-white mb-4 tracking-tight">Welcome to {activeRoom.name}</h2>
                    <p className="text-[16px] text-slate-400 leading-relaxed mb-10 max-w-[480px]">
                      This is the beginning of your secure link. Start collaborating by sending your first message below.
                    </p>

                    <div className="flex flex-wrap justify-center sm:gap-14 gap-8 mt-4 pt-10 border-t border-white/[0.06] w-full">
                      {[
                        [activeRoom.type === 'dm' ? '2' : 'Group', 'Members'],
                        ['Ready', 'Status'],
                        ['AES-256', 'Encryption']
                      ].map(([val, label]) => (
                        <div key={label} className="text-center">
                          <p className="text-[18px] font-black text-violet-400">{val}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        {!isMe && (
                          <div className="w-5 h-5 rounded-md overflow-hidden border border-white/10">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=8b5cf6&color=fff`} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isMe ? 'You' : msg.senderName}</span>
                        <span className="text-[9px] text-slate-700">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`
                        max-w-[70%] min-w-0 px-6 py-4 rounded-[1.25rem] text-[15px] leading-relaxed break-words whitespace-pre-wrap
                        ${msg.isPriority
                          ? 'border border-amber-500/30 bg-amber-500/[0.07] text-amber-200'
                          : isMe
                            ? 'bg-violet-600 text-white rounded-tr-sm shadow-lg shadow-violet-600/20'
                            : 'bg-white/[0.06] border border-white/[0.08] text-slate-200 rounded-tl-sm'}
                      `}>
                        {msg.isPriority && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full mr-2 mb-1.5">
                            <Zap size={8} fill="currentColor" /> Priority
                          </span>
                        )}
                        {msg.fileType === 'image' && msg.fileData && (
                          <img src={msg.fileData} alt="" className="mb-2.5 rounded-xl max-w-full border border-white/10" />
                        )}
                        <p className="select-text">{msg.content}</p>
                        {isMe && <CheckCheck size={11} className="ml-auto mt-1.5 opacity-40" />}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Input bar */}
            <div className="relative z-10 px-6 pb-5 pt-3 shrink-0">
              <form
                onSubmit={sendMessage}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${
                  isPriority
                    ? 'border-amber-500/40 bg-amber-500/[0.04]'
                    : 'border-white/[0.1] bg-white/[0.04] focus-within:border-violet-500/40 focus-within:bg-white/[0.07]'
                }`}
              >
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-slate-600 hover:text-violet-400 hover:bg-violet-600/10 transition-all">
                  <Paperclip size={16} />
                </button>
                <button type="button" className="p-2 rounded-full text-slate-600 hover:text-violet-400 hover:bg-violet-600/10 transition-all">
                  <Smile size={16} />
                </button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={isPriority ? '⚡ Priority message…' : 'Type a message…'}
                  className={`flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] font-medium ${isPriority ? 'text-amber-300 placeholder:text-amber-900/40' : 'text-white placeholder:text-slate-700'}`}
                />
                <button
                  type="button"
                  onClick={() => setIsPriority(p => !p)}
                  className={`p-2 rounded-full transition-all ${isPriority ? 'bg-amber-500 text-black' : 'text-slate-600 hover:text-amber-400 hover:bg-amber-500/10'}`}
                >
                  <Zap size={16} fill={isPriority ? 'currentColor' : 'none'} />
                </button>
                <motion.button
                  type="submit"
                  disabled={sending || !input.trim()}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                  className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 disabled:opacity-20 transition-all shrink-0"
                >
                  <Send size={15} className="ml-0.5" />
                </motion.button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-10 relative z-10">
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-[340px] p-8 rounded-3xl border border-white/[0.08] bg-[#13132e] text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-violet-600 to-transparent" />
              <div className="w-16 h-16 rounded-2xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center mx-auto mb-5">
                <MessageSquare size={30} className="text-violet-400" />
              </div>
              <p className="text-[16px] font-black text-white mb-2">Nexus Chat</p>
              <p className="text-[12px] text-slate-500 leading-relaxed mb-6">
                Start a conversation with any campus member using their email address.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setShowAddChat(true)}
                className="flex items-center gap-2 mx-auto h-11 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-black uppercase tracking-widest shadow-lg shadow-violet-600/30 transition-all"
              >
                <UserPlus size={14} /> Start Conversation <ArrowRight size={13} />
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* Add-chat modal */}
        <AnimatePresence>
          {showAddChat && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="w-[360px] bg-[#13132e] border border-white/[0.12] rounded-2xl overflow-hidden shadow-2xl"
              >
                <div className="inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-violet-600 to-transparent" />
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                      <UserPlus size={15} className="text-violet-400" />
                    </div>
                    <p className="text-[13px] font-black text-white uppercase tracking-widest">New Chat</p>
                  </div>
                  <button onClick={() => setShowAddChat(false)} className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/[0.05] transition-all">
                    <X size={15} />
                  </button>
                </div>
                <form onSubmit={handleCreateRoom} className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Recipient Email</label>
                    <input
                      type="email" value={targetEmail} onChange={e => setTargetEmail(e.target.value)}
                      placeholder="user@smartcampus.edu" autoFocus
                      className="w-full h-11 rounded-xl bg-white/[0.05] border border-white/[0.1] px-4 text-[13px] text-white font-medium placeholder:text-slate-800 focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                  </div>
                  {error && <p className="text-[11px] text-red-400 font-bold flex items-center gap-1.5"><ShieldAlert size={12} />{error}</p>}
                  <button
                    disabled={sending || !targetEmail.trim()}
                    className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-black uppercase tracking-widest transition-all disabled:opacity-30 shadow-lg shadow-violet-600/20"
                  >
                    {sending ? 'Connecting…' : 'Start Chat'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <input ref={fileInputRef} type="file" className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = ev => sendMessage(undefined, { fileData: ev.target?.result as string, fileType: file.type.startsWith('image/') ? 'image' : 'file' });
          reader.readAsDataURL(file);
        }}
      />
    </div>
  );
}

export default function NexusChat() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-10 h-screen bg-[#020617]"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <NexusChatContent />
    </Suspense>
  );
}
