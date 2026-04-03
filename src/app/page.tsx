'use client';

import React, { useEffect } from 'react';
import { useRole } from '@/context/RoleContext';
import { useRouter } from 'next/navigation';
import ThreeNexus from '@/components/ThreeNexus';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

import HODDashboard from '@/components/dashboards/HODDashboard';
import FacultyDashboard from '@/components/dashboards/FacultyDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';

export default function DashboardPage() {
  const { role, user, isLoading } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !role) {
      router.push('/login');
    }
  }, [role, isLoading, router]);

  if (isLoading || !role) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container relative space-y-1">
      {/* Header Section */}
      <div className="relative z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-4 mb-2">
             <span className="px-3 py-1 bg-violet-600/10 text-violet-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-violet-500/20">
               Nexus Sync Active
             </span>
             <div className="h-[1px] w-8 bg-white/10" />
             <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
               System Identity: {role}
             </span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
            {role === 'hod' ? 'EXECUTIVE ' : role === 'faculty' ? 'ACADEMIC ' : 'PERSONAL '}
            <span className="gradient-text">{role?.toUpperCase()}</span>
            <span className="text-xl font-medium text-slate-400 tracking-tight ml-4 opacity-50">Authorized to: {user?.name}</span>
          </h1>
        </motion.div>
      </div>

      {/* Floating 3D Nexus - Absolute to not affect layout height */}
      <div className="absolute top-[-40px] right-0 w-[300px] h-[200px] pointer-events-none opacity-40 z-0 hidden lg:block">
        <ThreeNexus />
      </div>

      {/* Primary Role Content */}
      <div className="relative z-10 pt-4">
        {role === 'hod' && <HODDashboard user={user} />}
        {role === 'faculty' && <FacultyDashboard user={user} />}
        {role === 'student' && <StudentDashboard user={user} />}
      </div>
    </div>
  );
}
