'use client';

import React, { useEffect } from 'react';
import { useRole } from '@/context/RoleContext';
import { useRouter } from 'next/navigation';
import FacultyDashboard from '@/components/dashboards/FacultyDashboard';

export default function FacultyDashboardPage() {
  const { role, user, isLoading } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !role) {
      router.push('/login');
    } else if (!isLoading && role !== 'faculty') {
      router.push('/'); // HOD/Student go to the main dashboard
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
      <div className="relative z-20">
        <div className="space-y-2">
          <div className="flex items-center gap-4 mb-2">
            <span className="px-3 py-1 bg-violet-600/10 text-violet-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-violet-500/20">
              Nexus Sync Active
            </span>
            <div className="h-[1px] w-8 bg-white/10" />
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              System Identity: Faculty
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
            ACADEMIC{' '}
            <span className="gradient-text">FACULTY</span>
            <span className="text-xl font-medium text-slate-400 tracking-tight ml-4 opacity-50">
              Authorized to: {user?.name}
            </span>
          </h1>
        </div>
      </div>

      <div className="relative z-10 pt-4">
        <FacultyDashboard user={user} />
      </div>
    </div>
  );
}
