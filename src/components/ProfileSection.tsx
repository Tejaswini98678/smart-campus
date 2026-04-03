'use client';

import React, { useState } from 'react';
import { useRole } from '@/context/RoleContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Shield, Building, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

const InputField = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, disabled = false }: any) => (
  <div className="space-y-2">
    <label className="text-[12px] font-black tracking-widest text-slate-500 uppercase">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors z-10">
        <Icon size={18} />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        style={{ paddingLeft: '60px' }}
        className={`w-full h-14 bg-white/[0.03] border border-white/[0.08] rounded-xl pr-4 text-[15px] font-medium text-white placeholder-slate-600 outline-none transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'focus:border-violet-500/50 focus:bg-white/[0.06]'
        }`}
      />
    </div>
  </div>
);

export default function ProfileSection() {
  const { user, updateProfile } = useRole();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    newPassword: '',
  });

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 h-[60vh]">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload: any = { id: user.id };
    if (formData.name !== user.name) payload.name = formData.name;
    if (formData.email !== user.email) payload.email = formData.email;
    if (formData.newPassword) payload.password = formData.newPassword;

    if (Object.keys(payload).length === 1) {
      setErrorMsg('No changes detected to update.');
      setLoading(false);
      return;
    }

    const result = await updateProfile(payload);
    
    if (result.success) {
      setSuccessMsg('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '', newPassword: '' }));
    } else {
      setErrorMsg(result.error || 'Failed to update profile.');
    }
    setLoading(false);

    setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-black text-white tracking-tight flex items-center gap-3">
          <span className="w-2 h-8 rounded-full bg-violet-600 inline-block" />
          Profile Settings
        </h1>
        <p className="text-slate-400 font-medium mt-2 text-[15px]">Manage your personal information, security preferences, and academic identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-8 rounded-[2rem] bg-[#06061a] border border-white/[0.06] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <h2 className="text-[18px] font-black text-white mb-6 flex items-center gap-2">
              <User size={18} className="text-violet-400" /> Account Security
            </h2>

            <form onSubmit={handleUpdate} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  key="field-name"
                  label="Full Name" icon={User} value={formData.name} 
                  onChange={(e: any) => setFormData({...formData, name: e.target.value})} 
                />
                <InputField 
                  key="field-email"
                  label="Official Email" icon={Mail} value={formData.email} 
                  onChange={(e: any) => setFormData({...formData, email: e.target.value})} 
                />
                <div className="col-span-1 md:col-span-2 mt-4 pt-6 border-t border-white/[0.06]">
                  <h3 className="text-[12px] font-black tracking-widest text-slate-500 uppercase mb-4">Password Modification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                      key="field-password"
                      label="New Password" icon={Lock} type="password" value={formData.newPassword} placeholder="Leave blank to keep unchanged"
                      onChange={(e: any) => setFormData({...formData, newPassword: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-[14px] font-bold">
                  <AlertCircle size={18} /> {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-[14px] font-bold">
                  <CheckCircle2 size={18} /> {successMsg}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit" disabled={loading}
                  className="h-14 px-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold tracking-wide shadow-[0_8px_24px_rgba(124,58,237,0.3)] hover:shadow-[0_12px_32px_rgba(124,58,237,0.5)] disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Modifications'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Sidebar Info Area */}
        <div className="space-y-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="p-8 rounded-[2rem] bg-gradient-to-br from-violet-600/10 to-[#06061a] border border-violet-500/20 text-center relative overflow-hidden">
            <div className="w-24 h-24 mx-auto rounded-[2rem] bg-violet-600 flex items-center justify-center border-4 border-[#020617] shadow-xl mb-4">
              <span className="text-[32px] font-black text-white">{user.name.substring(0, 2).toUpperCase()}</span>
            </div>
            <h3 className="text-[20px] font-black text-white">{user.name}</h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-black tracking-widest uppercase mt-3">
              <Shield size={12} /> {user.role} Authorization
            </div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="p-8 rounded-[2rem] bg-[#06061a] border border-white/[0.06] space-y-5">
            <h2 className="text-[14px] font-black text-white tracking-wide flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Building size={16} className="text-violet-400" /> Identity Metadata
            </h2>
            
            <div className="space-y-4">
              {user.dept && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Department</label>
                  <p className="text-[15px] font-semibold text-white mt-0.5">{user.dept}</p>
                </div>
              )}
              {user.branch && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Branch Specialization</label>
                  <p className="text-[15px] font-semibold text-white mt-0.5">{user.branch}</p>
                </div>
              )}
              {user.rollNumber && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Roll/ID Number</label>
                  <p className="text-[15px] font-mono font-medium text-amber-400 mt-0.5">{user.rollNumber}</p>
                </div>
              )}
              {user.batch && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Academic Batch</label>
                  <p className="text-[15px] font-semibold text-white mt-0.5">{user.batch}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
