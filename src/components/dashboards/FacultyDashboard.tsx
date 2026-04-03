'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Clock, BookOpen, UserCheck, BarChart2, ArrowUpRight, User, ArrowLeft, LogOut, Calendar, ShieldCheck } from 'lucide-react';
import ProfileSection from '@/components/ProfileSection';
import { useRole } from '@/context/RoleContext';

export default function FacultyDashboard({ user }: { user: any }) {
  const { logout } = useRole();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawV = searchParams.get('v') || 'overview';
  const VALID_TABS = ['overview', 'attendance', 'students', 'courses', 'schedule', 'announcements', 'leaves', 'evaluation'];
  const activeTool = (VALID_TABS.includes(rawV) ? rawV : 'overview') as string;
  
  const goTo = (tool: string) => {
    router.push(`/?v=${tool}`);
  };

  const setActiveTool = (tool: string) => goTo(tool);

  const [students, setStudents] = React.useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = React.useState('Quantum Computing (CS501)');
  const [isLoading, setIsLoading] = React.useState(true);
  const [markingData, setMarkingData] = React.useState<any[]>([]);
  const [exams, setExams] = React.useState<any[]>([]);
  const [announcements, setAnnouncements] = React.useState<any[]>([]);
  const [courses, setCourses] = React.useState<any[]>([]);
  const [leaveType, setLeaveType] = React.useState('Medical');
  const [leaveReason, setLeaveReason] = React.useState('');
  const [leaveSubmitted, setLeaveSubmitted] = React.useState(false);
  const [leavesData, setLeavesData] = React.useState<any[]>([]);
  const [evalStudentId, setEvalStudentId] = React.useState<string>('');
  const [evaluationData, setEvaluationData] = React.useState<Record<string, { obtained: string, max: string }>>({});

  const handleGradeChange = (courseId: string, field: 'obtained'|'max', val: string) => {
    setEvaluationData(p => {
       const cur = p[courseId] || { obtained: '', max: '' };
       return { ...p, [courseId]: { ...cur, [field]: val } };
    });
  };

  const computeScore = (courseId: string) => {
    const data = evaluationData[courseId];
    if (!data || !data.obtained || !data.max) return '';
    const o = parseFloat(data.obtained);
    const m = parseFloat(data.max);
    if (isNaN(o) || isNaN(m) || m === 0) return '';
    const pct = Math.round((o / m) * 100);
    return Math.min(100, Math.max(0, pct)).toString();
  };

  const getLetterGrade = (scoreStr: string) => {
    const score = parseInt(scoreStr);
    if (isNaN(score)) return '—';
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const publishGrades = async () => {
    if (!evalStudentId) return alert('Select a student first.');
    try {
      const payloadReadyCourses = courses.filter(c => computeScore(c.id) !== '');
      if (payloadReadyCourses.length === 0) return alert('No valid grades entered. Ensure both Obtained and Max marks are provided.');
      
      const promises = payloadReadyCourses.map(c => 
        fetch('/api/faculty/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: evalStudentId, subject: c.title, score: computeScore(c.id) })
        })
      );
      await Promise.all(promises);
      alert(`${payloadReadyCourses.length} Grade(s) Published Successfully!`);
      setEvaluationData({});
      setActiveTool('overview');
    } catch (e) {
      alert('Error publishing grades');
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await fetch('/api/leaves');
      const data = await res.json();
      setLeavesData(Array.isArray(data) ? data : []);
    } catch {
      setLeavesData([]);
    }
  };

  React.useEffect(() => {
    if (activeTool === 'leaves') fetchLeaves();
  }, [activeTool]);

  React.useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/faculty/students');
      const data = await res.json();
      setStudents(data);
      setMarkingData(data.map((s: any) => ({ id: s.id, name: s.name, status: 'PRESENT' })));
      
      const exRes = await fetch('/api/exams');
      const exData = await exRes.json();
      const classes = [
        { type: 'Class', subject: 'Machine Learning (CS601)', time: '10:00 AM - 11:30 AM', room: 'Room 304', date: new Date().toISOString().split('T')[0] },
        { type: 'Class', subject: 'Web Development (CS502)', time: '01:00 PM - 02:30 PM', room: 'Lab 2', date: new Date().toISOString().split('T')[0] }
      ];
      setExams(Array.isArray(exData) && exData.length > 0 ? [...exData, ...classes] : classes);

      const annRes = await fetch('/api/hod/announcements');
      try { const annData = await annRes.json(); setAnnouncements(Array.isArray(annData) ? annData : []); } catch(e){}

      const crsRes = await fetch('/api/hod/courses');
      try { const crsData = await crsRes.json(); setCourses(Array.isArray(crsData) ? crsData : []); } catch(e){}

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch data');
      setExams([]);
    }
  };

  const toggleStatus = (id: string) => {
    setMarkingData(prev => prev.map(s => 
      s.id === id ? { ...s, status: s.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' } : s
    ));
  };

  const finalizeAttendance = async () => {
    try {
      const promises = markingData.map(s => 
        fetch('/api/faculty/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: s.id, status: s.status, subject: selectedSubject })
        })
      );
      await Promise.all(promises);
      alert('Attendance Processed Successfully');
      setActiveTool('overview');
    } catch (error) {
      alert('Failed to process attendance');
    }
  };

  const [watchlistData, setWatchlistData] = React.useState([
    { name: 'Alice Johnson', id: 'S1024', att: '94%', grade: 'A', status: 'Optimal' },
    { name: 'Bob Smith', id: 'S1025', att: '62%', grade: 'C', status: 'Warning' },
    { name: 'Charlie Davis', id: 'S1026', att: '88%', grade: 'B+', status: 'Stable' },
  ]);

  if (isLoading) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-500">Initializing Faculty Nexus...</div>;

  return (
    <div className="space-y-6 pb-16">
      {/* Tab Bar like HOD */}
      <div className="flex flex-wrap gap-2">
        {VALID_TABS.map(t => (
          <button key={t} onClick={() => goTo(t)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTool === t
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-[1.03]'
                : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:scale-[1.02]'
            }`}>
            {t}
          </button>
        ))}
        <button onClick={logout}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all hover:scale-[1.02]">
          <LogOut size={13} /> Logout
        </button>
      </div>

    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-12"
    >
      {activeTool === 'overview' && (
        <div className="grid-nexus">
          {/* Course Progress Section - 8 Column */}
          <div className="col-span-12 lg:col-span-8 space-y-12">
            <div className="glass-panel p-8">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-3 mb-8">
                <BookOpen className="text-cyan-400" size={20} /> Syllabus Synchronization
              </h3>
              <div className="grid-nexus">
                {[
                  { name: 'Quantum Computing (CS501)', progress: 72, color: 'bg-cyan-500' },
                  { name: 'Advanced AI (CS602)', progress: 48, color: 'bg-indigo-500' },
                ].map((course, i) => (
                  <div key={i} className="col-span-12 md:col-span-6 p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-200">{course.name}</span>
                      <span className="text-[10px] font-black px-2 py-1 bg-white/5 border border-white/10 rounded uppercase tracking-widest text-slate-400">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, delay: 0.2 + i*0.2 }}
                        className={`h-full ${course.color} shadow-[0_0_12px_rgba(34,211,238,0.3)]`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      <span>Topic 14/20</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> Nov 12</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Performance Watchlist */}
            <div className="glass-panel p-8">
               <h3 className="text-xl font-black tracking-tight flex items-center gap-3 mb-8">
                 <UserCheck className="text-emerald-400" size={20} /> Student Performance Watchlist
               </h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                       <th className="pb-5 font-black">Student Identity</th>
                       <th className="pb-5 font-black text-center">Attendance</th>
                       <th className="pb-5 font-black text-center">Avg Grade</th>
                       <th className="pb-5 font-black text-right">Nexus Status</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm">
                     {watchlistData.map((s, i) => (
                       <tr key={i} className="border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-colors">
                         <td className="py-5 font-bold">
                            <div className="flex flex-col">
                              <span className="text-slate-200">{s.name}</span>
                              <span className="text-[10px] text-slate-600 font-medium tracking-widest">REG NO • {s.id}</span>
                            </div>
                         </td>
                         <td className="py-5 text-center font-medium text-slate-400">{s.att}</td>
                         <td className="py-5 text-center font-black text-violet-400">{s.grade}</td>
                         <td className="py-5 text-right">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.status === 'Warning' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                             {s.status}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            {/* Upcoming Examinations */}
            <div className="glass-panel p-8">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-3 mb-8">
                <Calendar className="text-red-400" size={20} /> Departmental Examination Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.isArray(exams) && exams.length > 0 ? exams.map((e, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-red-500/[0.03] border border-red-500/10 hover:border-red-500/30 transition-all flex justify-between items-center group">
                    <div className="space-y-2">
                       <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded-lg">Final</span>
                       <h4 className="text-base font-black text-slate-100">{e.subject}</h4>
                       <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase">
                          <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400" /> {e.time}</span>
                          <span className="flex items-center gap-1.5"><User size={12} className="text-slate-400" /> {e.room}</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-white">{e.date.split('-')[2]}</p>
                       <p className="text-[9px] font-black text-slate-500 uppercase">{new Date(e.date).toLocaleString('default', { month: 'short' })}</p>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 py-10 text-center glass-panel border-dashed border-white/5 text-slate-600 font-bold text-[10px] uppercase tracking-widest">
                    No examinations currently scheduled
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Sidebar - 4 Column */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="glass-panel p-8 bg-gradient-to-b from-cyan-600/5 to-transparent relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all" />
              <h3 className="text-lg font-black tracking-tight mb-8">Operational Nexus</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setActiveTool('attendance')}
                  className="w-full h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 px-6 hover:bg-white/10 hover:border-white/20 transition-all group/btn shadow-lg"
                >
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover/btn:scale-110 transition-transform">
                    <UserCheck size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Mark Attendance</span>
                </button>
                <button 
                  onClick={() => setActiveTool('evaluation')}
                  className="w-full h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 px-6 hover:bg-white/10 hover:border-white/20 transition-all group/btn shadow-lg"
                >
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 group-hover/btn:scale-110 transition-transform">
                    <BarChart2 size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Evaluate Students</span>
                </button>
                <button 
                  onClick={() => setActiveTool('profile')}
                  className="w-full h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 px-6 hover:bg-white/10 hover:border-white/20 transition-all group/btn shadow-lg"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover/btn:scale-110 transition-transform">
                    <User size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Profile Settings</span>
                </button>
                <button 
                  onClick={logout}
                  className="w-full h-16 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center gap-4 px-6 hover:bg-red-500 hover:border-red-500 transition-all group/btn shadow-lg mt-8"
                >
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500 group-hover/btn:bg-white/20 group-hover/btn:text-white transition-colors">
                    <LogOut size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 group-hover/btn:text-white transition-colors">Exit Nexus Console</span>
                </button>
              </div>
            </div>

            <div className="glass-panel p-8 opacity-95">
              <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-6 underline decoration-violet-500/30 underline-offset-8">Pending Auth Signatures</h4>
              <div className="space-y-6">
                 {[
                   { user: 'David Miller', type: 'Medical Leave', color: 'bg-amber-500' },
                   { user: 'Sarah Chen', type: 'Thesis Defense', color: 'bg-blue-500' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-pointer">
                     <div className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full ${item.color} animate-pulse`} />
                       <div className="flex flex-col">
                         <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{item.user}</span>
                         <span className="text-[10px] text-slate-600">{item.type}</span>
                       </div>
                     </div>
                     <ArrowUpRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
                   </div>
                 ))}
              </div>
            </div>
            </div>
          </div>
        )}
        
        {activeTool === 'profile' && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setActiveTool('overview')}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-2xl font-black tracking-tighter">Your Profile</h2>
                <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500">Security & Account Identity</p>
              </div>
            </div>
            <ProfileSection />
          </div>
        )}

        {activeTool === 'attendance' && (
        <div className="space-y-8">
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
               <button 
                 onClick={() => setActiveTool('overview')}
                 className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400"
               >
                 <ArrowUpRight className="rotate-[225deg]" size={20} />
               </button>
               <div>
                  <h2 className="text-2xl font-black tracking-tighter">Attendance Marking Service</h2>
                  <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500">Course Identification • {selectedSubject}</p>
               </div>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Synced Live</span>
             </div>
           </div>

           <div className="glass-panel p-0 overflow-hidden">
              <div className="grid grid-cols-12 bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 p-6">
                <div className="col-span-6">Student Workspace</div>
                <div className="col-span-3 text-center">Current Status</div>
                <div className="col-span-3 text-right">Operational Toggle</div>
              </div>
              <div className="divide-y divide-white/5">
                {markingData.map((student) => (
                  <div key={student.id} className="grid grid-cols-12 p-6 items-center group transition-colors hover:bg-white/[0.01]">
                    <div className="col-span-6 flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/5 flex items-center justify-center font-black text-xs">
                          {student.name.split(' ').map((n: string) => n[0]).join('')}
                       </div>
                       <div className="flex flex-col">
                          <span className="font-bold text-slate-300">{student.name}</span>
                          <span className="text-[10px] text-slate-600 font-medium">#{student.id}</span>
                       </div>
                    </div>
                    <div className="col-span-3 text-center">
                       <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-tighter ${student.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {student.status}
                       </span>
                    </div>
                    <div className="col-span-3 text-right">
                       <button 
                         onClick={() => toggleStatus(student.id)}
                         className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${student.status === 'PRESENT' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'}`}
                       >
                         Toggle {student.status === 'PRESENT' ? 'Absent' : 'Present'}
                       </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-white/5 flex justify-end">
                 <button 
                  onClick={finalizeAttendance}
                  className="px-10 py-4 bg-violet-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-violet-600/30 hover:scale-[1.05] active:scale-95 transition-all">
                    Finalize Session
                 </button>
              </div>
            </div>
         </div>
      )}

      {activeTool === 'evaluation' && (
        <div className="space-y-8">
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
               <button 
                 onClick={() => setActiveTool('overview')}
                 className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400"
               >
                 <ArrowUpRight className="rotate-[225deg]" size={20} />
               </button>
               <div>
                  <h2 className="text-2xl font-black tracking-tighter">Academic Evaluation Grid</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500">Target Student • </p>
                    <select 
                      className="bg-transparent text-[10px] uppercase font-bold text-violet-400 outline-none border-b border-violet-500/30 pb-0.5 cursor-pointer max-w-[200px]"
                      value={evalStudentId}
                      onChange={(e) => setEvalStudentId(e.target.value)}
                    >
                      <option value="" className="bg-slate-900 text-slate-500 text-xs">Select Student to Grade...</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.name} ({s.rollNumber || s.id})</option>
                      ))}
                    </select>
                  </div>
               </div>
             </div>
           </div>

           {!evalStudentId ? (
              <div className="glass-panel p-16 text-center border border-dashed border-white/10">
                <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Select A Student From the Dropdown To Begin Evaluation</p>
              </div>
           ) : (
             <div className="glass-panel p-0 overflow-hidden border-violet-500/20">
                <div className="grid grid-cols-12 bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 p-6">
                  <div className="col-span-4">Course Identification</div>
                  <div className="col-span-4 text-center">Marks Input (Obtained / Max)</div>
                  <div className="col-span-2 text-center">Score %</div>
                  <div className="col-span-2 text-right">Computed Grade</div>
                </div>
                <div className="divide-y divide-white/5">
                  {courses.map((course) => {
                    const score = computeScore(course.id);
                    const letter = getLetterGrade(score);
                    const cd = evaluationData[course.id] || { obtained: '', max: '' };
                    return (
                      <div key={course.id} className="grid grid-cols-12 items-center group transition-colors hover:bg-white/[0.02]">
                        <div className="col-span-4 flex items-center gap-4 p-6">
                           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/20 to-violet-600/20 border border-violet-500/20 flex flex-col items-center justify-center font-black text-violet-400">
                              <span className="text-xs leading-none">{course.credits}</span>
                              <span className="text-[6px] tracking-widest uppercase opacity-70">Cr</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="font-bold text-slate-200">{course.title}</span>
                              <span className="text-[10px] text-slate-500 font-medium font-mono">{course.code} • Sem {course.semester}</span>
                           </div>
                        </div>
                        <div className="col-span-4 flex flex-col items-center justify-center p-6">
                           <div className="flex items-center gap-3">
                              <input 
                                type="number"
                                min={0}
                                value={cd.obtained}
                                onChange={(e) => handleGradeChange(course.id, 'obtained', e.target.value)}
                                placeholder="0"
                                className="w-20 text-center bg-white/[0.03] border-b-2 border-white/10 hover:border-violet-500/50 focus:border-violet-500 focus:bg-white/[0.05] text-lg font-black text-white px-2 py-1 outline-none transition-all rounded-t-lg placeholder:text-slate-700"
                              />
                              <span className="text-slate-500 font-black text-lg">/</span>
                              <input 
                                type="number"
                                min={1}
                                value={cd.max}
                                onChange={(e) => handleGradeChange(course.id, 'max', e.target.value)}
                                placeholder="100"
                                className="w-20 text-center bg-white/[0.03] border-b-2 border-white/10 hover:border-violet-500/50 focus:border-violet-500 focus:bg-white/[0.05] text-lg font-black text-white px-2 py-1 outline-none transition-all rounded-t-lg placeholder:text-slate-700"
                              />
                           </div>
                        </div>
                        <div className="col-span-2 text-center p-6">
                           <span className={`text-lg font-black ${score ? 'text-violet-400' : 'text-slate-700'}`}>
                             {score ? `${score}%` : '—'}
                           </span>
                        </div>
                        <div className="col-span-2 text-right p-6 flex justify-end">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border shadow-lg ${
                              !score ? 'bg-white/5 border-white/10 text-slate-600' :
                              letter.includes('A') ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                              letter.includes('B') || letter.includes('C') ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' :
                              letter === 'D' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' :
                              'bg-red-500/20 border-red-500/30 text-red-400'
                           }`}>
                             {letter}
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-8 bg-white/5 flex items-center justify-between border-t border-violet-500/20">
                   <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                      Entering grades for <span className="text-white font-black">{Object.values(evaluationData).filter(d => d.obtained !== '').length}</span> courses
                   </p>
                   <button 
                    onClick={publishGrades}
                    className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-xl shadow-violet-600/30 hover:scale-[1.05] active:scale-95 transition-all">
                      Publish Transcript
                   </button>
                </div>
              </div>
           )}
         </div>
      )}

      {/* ── STUDENTS ── */}
      {activeTool === 'students' && (
        <div className="glass-panel p-8">
          <h3 className="text-xl font-black tracking-tight mb-8">Assigned Students ({students.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-slate-500">
                  <th className="pb-4 font-black">Student</th>
                  <th className="pb-4 font-black">Roll No</th>
                  <th className="pb-4 font-black">Branch</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="py-4 font-bold text-slate-200">{s.name}</td>
                    <td className="py-4 text-xs font-mono text-slate-400">{s.rollNumber || '—'}</td>
                    <td className="py-4 text-xs text-slate-400">{s.branch || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── COURSES ── */}
      {activeTool === 'courses' && (
        <div className="glass-panel p-8">
          <h3 className="text-xl font-black tracking-tight mb-8">Department Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(c => (
              <div key={c.id} className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-3">{c.code}</div>
                <h4 className="text-base font-black text-slate-200">{c.title}</h4>
                <div className="mt-4 flex gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  <span>Sem {c.semester}</span>
                  <span>{c.credits} Credits</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SCHEDULE ── */}
      {activeTool === 'schedule' && (
        <div className="glass-panel p-8">
          <h3 className="text-xl font-black tracking-tight mb-8">Examination & Class Schedule</h3>
          {exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((e, i) => (
                <div key={i} className="p-6 rounded-3xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20">
                  <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
                    <span className={`text-white px-2 py-0.5 rounded-lg shadow-lg ${e.type === 'Class' ? 'bg-cyan-600 shadow-cyan-500/20' : 'bg-violet-600 shadow-violet-500/20'}`}>{e.type || 'Exam'}</span>
                    <span className="text-slate-500">{e.date}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-200 mb-2">{e.subject}</h4>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                      <span>{e.time}</span>
                      <span>{e.room}</span>
                    </div>
                    {e.type === 'Class' && (
                      <button 
                        onClick={() => { setSelectedSubject(e.subject); setActiveTool('attendance'); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
                        <UserCheck size={12} /> Take Attendance
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-slate-500 font-bold text-center">No current schedules</p>
          )}
        </div>
      )}

      {/* ── ANNOUNCEMENTS ── */}
      {activeTool === 'announcements' && (
        <div className="glass-panel p-8">
          <h3 className="text-xl font-black tracking-tight mb-8">Department Notices</h3>
          <div className="space-y-4">
            {announcements.map((ann: any) => (
              <div key={ann.id} className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <h4 className="text-base font-black text-slate-100">{ann.title}</h4>
                <p className="text-sm text-slate-400 mt-2">{ann.content}</p>
                <div className="mt-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  {new Date(ann.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LEAVES ── */}
      {activeTool === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-8">
            <h3 className="text-2xl font-black tracking-tight mb-8">Leave Application</h3>
            {leaveSubmitted ? (
              <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="text-emerald-400" size={32} />
                </div>
                <h4 className="text-xl font-black text-emerald-400">Application Submitted</h4>
                <p className="text-slate-400 text-sm">Your leave request has been sent for HOD approval.</p>
                <button onClick={() => { setLeaveSubmitted(false); setLeaveReason(''); }} className="mt-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-black text-slate-300 hover:bg-white/10 transition-all">Submit Another</button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (leaveReason.trim()) {
                  await fetch('/api/leaves', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: leaveType, reason: leaveReason, startDate: new Date().toISOString(), endDate: new Date().toISOString() })
                  });
                  setLeaveSubmitted(true);
                  fetchLeaves();
                }
              }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">Leave Type</label>
                  <div className="flex gap-3 flex-wrap">
                    {['Medical', 'Personal', 'Event', 'Emergency'].map(t => (
                      <button key={t} type="button" onClick={() => setLeaveType(t)}
                        className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${leaveType === t ? 'bg-violet-600 text-white border border-violet-500' : 'bg-white/5 border border-white/10 text-slate-400 hover:border-white/20'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">Reason</label>
                  <textarea
                    className="w-full h-32 bg-white/[0.03] border border-white/5 focus:border-violet-500/50 rounded-[22px] px-6 py-4 text-white text-sm outline-none transition-all font-medium resize-none placeholder:text-slate-700"
                    placeholder="Describe the reason for your leave request..."
                    value={leaveReason}
                    onChange={e => setLeaveReason(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="w-full h-14 rounded-[20px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-[12px] uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-[0_15px_40px_rgba(124,58,237,0.3)]">
                  Submit Application
                </button>
              </form>
            )}
          </div>
          <div className="glass-panel p-8">
            <h3 className="text-2xl font-black tracking-tight mb-8">Leave History</h3>
            <div className="space-y-3">
              {leavesData.length === 0 ? (
                <p className="text-sm font-bold text-slate-500 italic text-center py-10">No previous leaves found.</p>
              ) : (
                leavesData.map((leave, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase text-violet-400">{leave.type}</span>
                      <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${leave.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : leave.status === 'DENIED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{leave.status}</span>
                    </div>
                    <p className="text-sm text-slate-300 font-medium">{leave.reason}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </motion.div>
    </div>
  );
}
