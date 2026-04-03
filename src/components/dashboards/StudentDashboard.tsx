import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Clock, Target, Award, Rocket, ArrowUpRight, Zap, Bell, Sparkles, Calendar, Users, ClipboardCheck, AlertCircle, ShieldCheck, LogOut } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useSearchParams } from 'next/navigation';

export default function StudentDashboard({ user }: { user: any }) {
  const { logout } = useRole();
  const searchParams = useSearchParams();
  const view = searchParams.get('v') || 'home';
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [leaveType, setLeaveType] = React.useState('Medical');
  const [leaveReason, setLeaveReason] = React.useState('');
  const [leaveSubmitted, setLeaveSubmitted] = React.useState(false);
  const [exams, setExams] = React.useState<any[]>([]);
  const [leavesData, setLeavesData] = React.useState<any[]>([]);

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
    if (view === 'leaves') fetchLeaves();
  }, [view]);

  React.useEffect(() => {
    if (user?.id) fetchDashboardData();
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/api/student/dashboard?studentId=${user.id}`);
      const json = await res.json();
      setData(json);
      const exRes = await fetch('/api/exams');
      const exData = await exRes.json();
      setExams(Array.isArray(exData) ? exData : []);
    } catch (error) {
      console.error('Failed to fetch dashboard data');
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const attendancePercent = React.useMemo(() => {
    if (!data?.attendance || data.attendance.length === 0) return 0;
    const present = data.attendance.filter((a: any) => a.status === 'PRESENT').length;
    return Math.round((present / data.attendance.length) * 100);
  }, [data]);

  const computedGPA = React.useMemo(() => {
    if (!data?.grades || data.grades.length === 0) return null;
    let totalPoints = 0;
    let totalCredits = 0;
    data.grades.forEach((g: any) => {
      const credits = 3; 
      let points = 0;
      if (g.score >= 90) points = 10;
      else if (g.score >= 80) points = 9;
      else if (g.score >= 70) points = 8;
      else if (g.score >= 60) points = 7;
      else if (g.score >= 50) points = 6;
      else points = 0;
      totalPoints += points * credits;
      totalCredits += credits;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : null;
  }, [data]);

  const getLetterGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const dynamicGradeData = React.useMemo(() => {
    if (!data?.grades || data.grades.length === 0) return [];
    return data.grades.map((g: any) => ({ subject: g.subject, score: g.score, letter: getLetterGrade(g.score) }));
  }, [data]);

  if (isLoading) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-500">Synchronizing Nexus Data...</div>;

  const examBlockBanner = data?.examBlocked ? (
    <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/30 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
        <AlertCircle className="w-5 h-5 text-red-400" />
      </div>
      <div>
        <p className="text-sm font-black text-red-400 uppercase tracking-wide">⚠ Examination Access Revoked</p>
        <p className="text-xs text-red-400/70 font-medium mt-1">You have been barred from appearing in examinations due to low attendance. Contact your HOD or mentor immediately.</p>
      </div>
    </div>
  ) : null;

  /* ─── HOME ─── */
  const renderHome = () => (
    <div className="animate-in fade-in zoom-in duration-500">
      <div className="grid-nexus">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Attendance Ring */}
          <div className="glass-panel p-8 flex flex-col items-center text-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 self-start border-l-2 border-emerald-500 pl-4">Vitality Quotient</h3>
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                <motion.circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                  strokeDasharray={553}
                  initial={{ strokeDashoffset: 553 }}
                  animate={{ strokeDashoffset: 553 - (553 * (attendancePercent / 100)) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={attendancePercent < 75 ? "text-red-500" : "text-emerald-500"}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white">{attendancePercent}%</span>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Attendance</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[8px] uppercase font-black text-slate-500 tracking-widest mb-1">Current GPA</p>
                <p className="text-xl font-black text-cyan-400">{computedGPA ?? '—'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[8px] uppercase font-black text-slate-500 tracking-widest mb-1">Subjects</p>
                <p className="text-xl font-black text-violet-400">{data?.grades?.length ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Latest Announcement */}
          {data?.announcements?.length > 0 && (
            <div className="glass-panel p-6 bg-gradient-to-br from-violet-600/5 to-transparent border-violet-500/10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <Bell size={12} className="text-violet-400" /> Latest Notice
              </h3>
              <h4 className="text-sm font-black text-slate-200 leading-tight mb-2">{data.announcements[0].title}</h4>
              <p className="text-[10px] text-slate-500 line-clamp-2">{data.announcements[0].content}</p>
              <span className="mt-3 inline-block text-[8px] font-black uppercase tracking-widest text-violet-400">
                {new Date(data.announcements[0].createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 py-3 border-b-2 border-violet-600">Daily Nexus Operational Stream</h3>
            <span className="text-[10px] font-black text-slate-600 uppercase italic">Updated Live</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Schedule */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-cyan-400" /> Today's Schedule
              </h4>
              {data?.schedule?.length > 0 ? data.schedule.slice(0, 4).map((item: any, i: number) => (
                <div key={i} className="p-5 rounded-2xl border transition-all flex items-center gap-4 bg-white/5 border-white/5 hover:border-white/20">
                  <div className="text-center shrink-0">
                    <p className="text-xs font-black text-slate-500">{item.time}</p>
                  </div>
                  <div className="h-8 w-[1px] bg-white/10" />
                  <div>
                    <h5 className="text-sm font-black text-slate-300">{item.subject}</h5>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{item.room}</p>
                  </div>
                </div>
              )) : (
                <p className="text-[10px] text-slate-600 italic p-4 glass-panel">No schedule published by HOD yet</p>
              )}
            </div>

            {/* Recent Grades */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-2">
                <Target size={14} className="text-amber-400" /> Recent Grades
              </h4>
              {data?.grades?.length > 0 ? data.grades.slice(0, 4).map((item: any, i: number) => (
                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">Score: {item.score}%</span>
                    </div>
                    <h5 className="text-sm font-black text-slate-200 group-hover:text-white transition-colors">{item.subject}</h5>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex flex-col items-center justify-center font-black text-sm border shadow-lg ${item.score >= 90 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : item.score >= 75 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : item.score >= 60 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {getLetterGrade(item.score)}
                  </div>
                </div>
              )) : (
                <p className="text-[10px] text-slate-600 italic p-4 glass-panel">No grades published yet</p>
              )}
            </div>

            {/* Upcoming Exams (HOD Scheduled) */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-red-400" /> Upcoming Examinations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(exams) && exams.length > 0 ? exams.map((e, i) => (
                  <div key={i} className="p-5 rounded-3xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 hover:border-red-500/40 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-white bg-red-500 px-2 py-0.5 rounded-lg shadow-lg shadow-red-500/20 uppercase tracking-widest">Final</span>
                      <span className="text-[9px] font-bold text-slate-500">{e.date}</span>
                    </div>
                    <h5 className="text-sm font-black text-slate-200 mb-2">{e.subject}</h5>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1"><Clock size={12} className="text-red-400" /> {e.time}</span>
                      <span className="flex items-center gap-1"><Users size={12} className="text-cyan-400" /> {e.room}</span>
                    </div>
                  </div>
                )) : (
                  <p className="col-span-full text-[10px] text-slate-600 italic p-6 glass-panel border-dashed text-center">No examinations scheduled yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── NOTICES (HOD Announcements) ─── */
  const renderNotices = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-panel p-8">
        <h3 className="text-2xl font-black tracking-tight mb-2">HOD Notices</h3>
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-8">Published by your department head</p>
        {data?.announcements?.length > 0 ? (
          <div className="space-y-4">
            {data.announcements.map((ann: any, i: number) => {
              const audienceColor = ann.audience === 'ALL'
                ? 'text-violet-400 bg-violet-500/10 border-violet-500/30'
                : ann.audience === 'STUDENTS'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
              return (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="text-base font-black text-slate-100 leading-snug">{ann.title}</h4>
                    <span className={`shrink-0 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${audienceColor}`}>
                      {ann.audience}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{ann.content}</p>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    {new Date(ann.createdAt).toLocaleString()}
                  </p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
              <Bell size={28} className="text-slate-600" />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No Notices Yet</p>
            <p className="text-slate-700 text-xs mt-2">Your HOD hasn't published any announcements</p>
          </div>
        )}
      </div>
    </div>
  );

  /* ─── EVALUATION ─── */
  const renderEvaluation = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-panel p-8 bg-gradient-to-tr from-cyan-600/5 to-transparent border-cyan-500/10">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-2xl font-black tracking-tight">Academic Evaluation</h3>
          <div className="text-right">
            {computedGPA ? (
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">{computedGPA}</span>
            ) : (
              <span className="text-lg font-black text-slate-600">No grades yet</span>
            )}
          </div>
        </div>
        {dynamicGradeData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicGradeData}>
                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0f172a] border border-white/10 p-3 rounded-2xl shadow-xl">
                          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-1">{data.subject}</p>
                          <div className="flex items-end gap-3">
                            <span className="text-2xl font-black text-violet-400">{data.score}%</span>
                            <span className="text-sm font-black text-white bg-white/10 px-2 py-0.5 rounded uppercase">{data.letter}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="score" radius={[8, 8, 8, 8]} fill="#7c3aed" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No Grades Published</p>
            <p className="text-slate-700 text-xs mt-2">Ask your HOD or faculty to enter your grades</p>
          </div>
        )}
      </div>
    </div>
  );

  /* ─── SCHEDULE ─── */
  const renderSchedule = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid-nexus">
        <div className="col-span-12 lg:col-span-8 glass-panel p-8">
          <h3 className="text-2xl font-black tracking-tight mb-12">Timeline Nexus</h3>
          {data?.schedule?.length > 0 ? (
            <div className="space-y-4">
              {data.schedule.map((item: any, i: number) => (
                <div key={i} className="p-6 rounded-3xl flex items-center gap-8 border transition-all bg-white/5 border-white/5 hover:border-white/20">
                  <div className="w-24 shrink-0"><p className="text-sm font-black font-mono">{item.time}</p></div>
                  <div className="flex-1">
                    <h5 className="font-black">{item.subject}</h5>
                    <p className="text-xs text-slate-500 uppercase">{item.room} · {item.day}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No Timetable Published</p>
              <p className="text-slate-700 text-xs mt-2">The HOD hasn't published a timetable yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* ─── COURSES ─── */
  const renderCourses = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-panel p-8">
        <h3 className="text-2xl font-black tracking-tight mb-8">Enrolled Courses</h3>
        {data?.grades?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.grades.map((g: any, i: number) => {
              const color = g.score >= 90
                ? 'from-emerald-600/20 border-emerald-500/30 text-emerald-400'
                : g.score >= 75
                ? 'from-cyan-600/20 border-cyan-500/30 text-cyan-400'
                : 'from-amber-600/20 border-amber-500/30 text-amber-400';
              return (
                <div key={i} className={`p-6 rounded-3xl bg-gradient-to-br ${color.split(' ')[0]} to-transparent border ${color.split(' ')[1]} hover:bg-white/[0.07] transition-all`}>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${color.split(' ')[2]} mb-3 flex items-center gap-2`}>
                    Score: {g.score}% <span className="bg-white/10 px-1.5 py-0.5 rounded text-[8px]">{getLetterGrade(g.score)}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-200 leading-tight">{g.subject}</h4>
                  <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-current ${color.split(' ')[2]}`} style={{ width: `${g.score}%`, transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
              <BookOpen size={28} className="text-slate-600" />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No Courses Yet</p>
            <p className="text-slate-700 text-xs mt-2">Courses will appear once your HOD or faculty enters your grades</p>
          </div>
        )}
      </div>
    </div>
  );

  /* ─── LEAVES ─── */
  const renderLeaves = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-8">
          <h3 className="text-2xl font-black tracking-tight mb-8">Leave Application</h3>
          {leaveSubmitted ? (
            <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="text-emerald-400" size={32} />
              </div>
              <h4 className="text-xl font-black text-emerald-400">Application Submitted</h4>
              <p className="text-slate-400 text-sm">Your leave request has been sent for approval.</p>
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
    </div>
  );

  /* ─── SPORTS ─── */
  const renderSports = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-panel p-8">
        <h3 className="text-2xl font-black tracking-tight mb-12">Nexus Campus Pulse</h3>
        <p className="text-slate-600 text-sm font-medium">Sports & events data coming soon.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {examBlockBanner}

      {/* Identity Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-0 overflow-hidden border-violet-500/30 bg-gradient-to-r from-violet-600/20 via-violet-600/5 to-transparent"
      >
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute top-6 right-6">
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all group"
            >
              <LogOut size={12} className="group-hover:scale-110 transition-transform" />
              Sign Out
            </button>
          </div>
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-violet-500/50 overflow-hidden shadow-xl">
              <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=8b5cf6&color=fff&size=256`} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white uppercase">{user?.name || "AUTHENTICATED STUDENT"}</h2>
              <span className="px-2 py-0.5 bg-violet-600/20 border border-violet-500/30 rounded-full text-[8px] font-black text-violet-400 uppercase tracking-widest w-fit mx-auto md:mx-0">Active</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div><p className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Roll No</p><p className="text-[11px] font-bold text-slate-200">{user?.rollNumber || "—"}</p></div>
              <div><p className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Branch</p><p className="text-[11px] font-bold text-slate-200">{user?.branch || "—"}</p></div>
              <div><p className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Batch</p><p className="text-[11px] font-bold text-slate-200">{user?.batch || "—"}</p></div>
              <div><p className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Mentor</p><p className="text-[11px] font-bold text-violet-400">{user?.mentor || "—"}</p></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Module Content */}
      <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
        {view === 'home' && renderHome()}
        {view === 'notices' && renderNotices()}
        {view === 'evaluation' && renderEvaluation()}
        {view === 'schedule' && renderSchedule()}
        {view === 'courses' && renderCourses()}
        {view === 'leaves' && renderLeaves()}
        {view === 'sports' && renderSports()}
      </motion.div>
    </div>
  );
}
