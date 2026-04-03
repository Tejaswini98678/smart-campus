'use client';

import React, { useState } from 'react';
import { useRole } from '@/context/RoleContext';
import { useRouter } from 'next/navigation';
import { GraduationCap, ShieldCheck, User, Users, ArrowRight, Loader2, CheckCircle2, AlertCircle, Bot, Sparkles, BarChart3, Calendar, BrainCircuit, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Login3DBackground from '@/components/Login3DBackground';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'hod' | 'faculty' | 'student'>('student');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [batch, setBatch] = useState('');
  const [mentor, setMentor] = useState('');
  
  const { login, signup } = useRole();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = isSignUp 
      ? await signup({ 
          email, password, name, role: selectedRole, 
          rollNumber, branch, batch, mentor 
        })
      : await login(email, password);

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Authorization Granted' });
      setTimeout(() => {
        if (isSignUp) {
          setIsSignUp(false);
          setLoading(false);
        } else {
          router.push('/');
        }
      }, 1500);
    } else {
      setMessage({ type: 'error', text: result.error || 'Authentication Failed' });
      setLoading(false);
    }
  };

  const roles = [
    { id: 'student', title: 'Student', icon: User },
    { id: 'faculty', title: 'Faculty', icon: Users },
    { id: 'hod', title: 'HOD / Admin', icon: ShieldCheck }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617] overflow-hidden">
      
      {/* 3D Background - Spans absolute full screen area */}
      <Login3DBackground />

      {/* Main Container - Expansive Split Layout */}
      <div className="w-full flex flex-col lg:flex-row items-center justify-around relative z-20 gap-16 lg:gap-8 px-12 lg:px-24 h-full py-16 lg:py-0">
        
        {/* LEFT COLUMN: BRANDING (Aligned to Full Grid) */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center translate-y-[-2%]">
          {/* Relaxed Content Wrapper */}
          <div className="w-full max-w-[520px] mx-auto lg:mx-0 flex flex-col space-y-12">
            
            <div className="flex flex-col space-y-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: 'spring' }}
                className="flex items-center gap-6"
              >
                <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-cyan-400 via-indigo-500 to-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.4)] border border-cyan-300/30 shrink-0 relative group">
                  <div className="absolute inset-0 rounded-[28px] bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                  <GraduationCap className="text-white drop-shadow-lg" size={44} />
                </div>
                <div>
                  <h1 className="text-5xl sm:text-6xl tracking-tight text-white leading-[0.9]">
                    <span className="font-extralight opacity-80">Smart</span>
                    <br />
                    <span className="font-black bg-gradient-to-r from-white via-white to-indigo-300 bg-clip-text text-transparent">Campus</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-4 ml-1">
                    <div className="h-[1px] w-8 bg-gradient-to-r from-cyan-500 to-transparent" />
                    <p className="text-cyan-400 font-bold tracking-[0.4em] uppercase text-[10px] opacity-90">
                      Academic Excellence Portal
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <div className="space-y-6">
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="text-white text-2xl sm:text-3xl leading-tight font-extrabold max-w-[480px] ml-1"
                >
                  Build your future with <span className="text-cyan-400">knowledge</span> and <span className="text-indigo-400">consistency</span>.
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="text-slate-400 text-lg leading-relaxed font-medium max-w-[450px] ml-1"
                >
                  Manage your academics, stay organized, and unlock your full potential. Your journey to excellence starts here.
                </motion.p>
              </div>

              {/* Minimal Feature Highlights */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="flex flex-col gap-4 ml-1"
              >
                {[
                  { icon: BarChart3, text: 'Track Your Progress', color: 'text-cyan-400' },
                  { icon: Calendar, text: 'Stay Organized', color: 'text-indigo-400' },
                  { icon: BrainCircuit, text: 'Smart Academic Insights', color: 'text-blue-400' }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 group">
                    <div className={`p-2 rounded-lg bg-white/[0.03] border border-white/5 transition-colors group-hover:bg-white/[0.08]`}>
                      <feature.icon size={18} className={feature.color} />
                    </div>
                    <span className="text-slate-300 font-bold text-sm tracking-wide">{feature.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN NEXUS - Dominant & Impactful */}
        <div className="w-full lg:w-[42%] flex flex-col items-center justify-center relative">
          
          {/* Main Login Card - Stronger Presence */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.2 }}
            className="w-full max-w-[480px] relative"
          >
            {/* Holographic Glow behind card */}
            <div className="absolute -inset-6 bg-indigo-500/10 rounded-[60px] blur-[80px] -z-10 animate-pulse" />
            <div className="absolute -inset-2 rounded-[42px] bg-gradient-to-br from-cyan-400/20 via-transparent to-indigo-600/20 -z-5 opacity-30" />

            <div className="glass-panel px-10 sm:px-16 py-16 sm:py-24 border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.7)] bg-white/[0.04] backdrop-blur-3xl rounded-[40px] relative overflow-hidden group">
              {/* Internal Accent Glow */}
              <div className="absolute -right-24 -top-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="mb-16 relative z-20 text-center">
                <h2 className="text-4xl font-light tracking-tight mb-5 text-white leading-tight">
                  {isSignUp ? <><span className="font-bold">Create</span> Your Account</> : <><span className="font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Sign In</span> to Continue<br/>Your Journey</>}
                </h2>
                <div className="flex items-center justify-center gap-4 opacity-60">
                   <div className="h-[1px] w-8 bg-slate-600" />
                   <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.5em]">
                     University Authentication
                   </p>
                   <div className="h-[1px] w-8 bg-slate-600" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10 relative z-20">
                
                {/* Minimalist Role Switcher */}
                <div className="flex relative p-2 bg-black/40 rounded-2xl mb-12 border border-white/5">
                  {roles.map((role) => {
                    const isActive = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id as any)}
                        className={`flex-1 py-4 rounded-xl flex flex-col items-center gap-2 transition-all relative z-10 ${
                          isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="v9-role-pill"
                            className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg rounded-xl border border-white/10"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <motion.div
                          animate={isActive ? { scale: 1.1, y: -0.5 } : { scale: 1, y: 0 }}
                          className="relative z-10"
                        >
                          <role.icon size={20} />
                        </motion.div>
                        <span className="relative z-10 text-[10px] font-black uppercase tracking-widest leading-none">{role.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Glassy Input Fields - Expanded Spacing */}
                <div className="space-y-8">
                  <AnimatePresence mode="wait">
                    {isSignUp && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Full Legal Name</label>
                          <input
                            type="text"
                            placeholder="Ex: Alexander Pierce"
                            className="w-full h-16 bg-white/[0.03] border border-white/5 focus:border-cyan-500/50 focus:bg-white/[0.05] rounded-[22px] px-8 text-white text-base outline-none transition-all font-medium placeholder:text-slate-700 shadow-inner"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={isSignUp}
                          />
                        </div>

                        {selectedRole === 'student' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Roll Number</label>
                              <input
                                type="text"
                                placeholder="2024CITXXXX"
                                className="w-full h-16 bg-white/[0.03] border border-white/5 focus:border-cyan-500/50 focus:bg-white/[0.05] rounded-[22px] px-8 text-white text-base outline-none transition-all font-medium placeholder:text-slate-700 shadow-inner"
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value)}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Program / Branch</label>
                              <input
                                type="text"
                                placeholder="B.Tech CSE"
                                className="w-full h-16 bg-white/[0.03] border border-white/5 focus:border-cyan-500/50 focus:bg-white/[0.05] rounded-[22px] px-8 text-white text-base outline-none transition-all font-medium placeholder:text-slate-700 shadow-inner"
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Batch / Year</label>
                              <input
                                type="text"
                                placeholder="2024-2028"
                                className="w-full h-16 bg-white/[0.03] border border-white/5 focus:border-cyan-500/50 focus:bg-white/[0.05] rounded-[22px] px-8 text-white text-base outline-none transition-all font-medium placeholder:text-slate-700 shadow-inner"
                                value={batch}
                                onChange={(e) => setBatch(e.target.value)}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Assigned Mentor</label>
                              <input
                                type="text"
                                placeholder="Dr. Sarah Johnson"
                                className="w-full h-16 bg-white/[0.03] border border-white/5 focus:border-cyan-500/50 focus:bg-white/[0.05] rounded-[22px] px-8 text-white text-base outline-none transition-all font-medium placeholder:text-slate-700 shadow-inner"
                                value={mentor}
                                onChange={(e) => setMentor(e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Academic Email ID</label>
                    <input
                      type="email"
                      placeholder="student_id@university.edu"
                      className="w-full h-16 bg-white/[0.03] border border-white/5 focus:border-cyan-500/50 focus:bg-white/[0.05] rounded-[22px] px-8 text-white text-base outline-none transition-all font-medium placeholder:text-slate-700 shadow-inner"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Security Passcode</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full h-16 bg-white/[0.03] border border-white/5 focus:border-cyan-500/50 focus:bg-white/[0.05] rounded-[22px] px-8 text-white text-base outline-none transition-all font-medium tracking-[0.4em] placeholder:text-slate-700 placeholder:tracking-normal shadow-inner"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className={`p-6 rounded-[28px] flex items-center gap-5 border backdrop-blur-2xl ${
                        message.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                      <span className="text-[14px] font-bold tracking-wide leading-snug">{message.text}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-6 mt-8">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={loading}
                    className="w-full h-18 rounded-[24px] font-black text-[13px] text-white shadow-[0_25px_50px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-4 group relative overflow-hidden disabled:opacity-50 border border-white/10 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right transition-all duration-700 uppercase tracking-[0.3em]"
                  >
                    <div className="relative z-10 flex items-center gap-3">
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>AUTHORIZING...</span>
                        </>
                      ) : (
                        <>
                          <span>{isSignUp ? 'Establish Identity' : 'Continue to Dashboard'}</span>
                          <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform duration-500" />
                        </>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                  
                  {/* Trust Element */}
                  <div className="flex items-center justify-center gap-3 opacity-50 px-4 text-center">
                    <Lock size={14} className="text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-normal">Secure multi-layer institutional authentication</span>
                  </div>
                </div>
              </form>

              <div className="mt-14 pt-10 text-center border-t border-white/5">
                <button 
                  onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
                  className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] hover:text-cyan-400 transition-colors flex items-center justify-center mx-auto w-full group/btn gap-3"
                >
                  {isSignUp ? '← Back to Authentication Gate' : 
                   selectedRole === 'student' ? 'Initialize New Scholar Profile' : 
                   selectedRole === 'faculty' ? 'Register New Faculty Profile' : 
                   'Register Administrative Profile'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FLOATING NEXUS ASSISTANT - Uncluttered & Separate */}
        <div className="fixed bottom-10 right-10 z-[110]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-4 bg-[#020617]/80 backdrop-blur-2xl border border-white/10 p-3 pl-5 rounded-full shadow-2xl group cursor-pointer"
          >
            <div className="flex flex-col items-end pr-2">
               <span className="text-white font-black text-[9px] uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity leading-none mb-1">Nexus AI</span>
               <span className="text-cyan-500 font-bold text-[8px] uppercase tracking-widest leading-none">Security Active</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] relative">
               <Bot size={24} className="text-white drop-shadow-md" />
               <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#020617] animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
