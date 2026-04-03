'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, TrendingDown, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function AcademicInsightsPanel({ role }: { role: string }) {
  // Mock data variations based on role preview
  const data = {
    student: {
      title: "Student Overview",
      attendance: { label: "DBMS Attendance", value: "68%", status: "critical" },
      task: { label: "Project Phase 2", due: "Tomorrow, 11:59 PM" },
      aiTip: "Your attendance is low in DBMS. Attend the next 3 consecutive lectures to meet the 75% threshold."
    },
    faculty: {
      title: "Faculty Overview",
      attendance: { label: "Operating Systems", value: "45/60 Marked Today", status: "warning" },
      task: { label: "Grade Midterm Papers", due: "Friday, 5:00 PM" },
      aiTip: "You have 15 unsync'd attendance logs for the OS module. Tap the sync button on your dashboard."
    },
    hod: {
      title: "Department Overview",
      attendance: { label: "CS Dept Attendance", value: "88% Avg", status: "good" },
      task: { label: "Review Curriculum Adjustments", due: "Next Monday" },
      aiTip: "Faculty submission rates for continuous assessments are 12% below the quarterly target."
    }
  };

  const currentData = data[role as keyof typeof data] || data.student;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="hidden lg:flex flex-col w-[360px] relative z-20"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center">
          <BookOpen size={20} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">{currentData.title}</h3>
          <p className="text-[11px] text-slate-400 font-medium">Smart Campus Analytics</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Attendance Meta-Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Status Metric</p>
            <p className="text-sm font-medium text-slate-200">{currentData.attendance.label}</p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${
              currentData.attendance.status === 'critical' ? 'text-rose-400' : 
              currentData.attendance.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {currentData.attendance.value}
            </p>
            <div className="flex items-center justify-end gap-1 mt-0.5">
               {currentData.attendance.status === 'critical' && <TrendingDown size={12} className="text-rose-400" />}
               {currentData.attendance.status === 'good' && <CheckCircle2 size={12} className="text-emerald-400" />}
               <span className="text-[10px] text-slate-500 font-medium tracking-wide">Live Sync</span>
            </div>
          </div>
        </motion.div>

        {/* Deadline Meta-Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex gap-3"
        >
          <div className="mt-0.5">
            <Calendar size={16} className="text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Upcoming Milestone</p>
            <p className="text-sm font-medium text-slate-200 mb-1">{currentData.task.label}</p>
            <p className="text-[11px] text-slate-400 font-medium">{currentData.task.due}</p>
          </div>
        </motion.div>

        {/* AI Academic Suggestion */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-4 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl" />
          <div className="flex gap-3">
             <div className="mt-0.5">
               <Lightbulb size={16} className="text-indigo-400" />
             </div>
             <div>
               <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                 Academic Assistant
                 <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
               </p>
               <p className="text-[12px] text-slate-300 leading-relaxed font-medium">
                 {currentData.aiTip}
               </p>
             </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
