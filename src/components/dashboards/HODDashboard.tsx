'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Users, BookOpen, Calendar, ShieldAlert, Megaphone,
  Plus, Trash2, Check, X, AlertTriangle, Lock, Unlock,
  GraduationCap, BarChart3, Loader2, Bell, Upload, FileSpreadsheet, Download, User, LogOut,
  Clock, Timer, MapPin, ClipboardCheck, Award
} from 'lucide-react';
import ProfileSection from '@/components/ProfileSection';
import { useRole } from '@/context/RoleContext';

type Tab = 'overview' | 'students' | 'faculty' | 'courses' | 'timetable' | 'exams' | 'announcements' | 'leaves' | 'evaluation' | 'profile';
const VALID_TABS: Tab[] = ['overview','students','faculty','courses','timetable','exams','announcements', 'leaves', 'evaluation', 'profile'];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-base font-black tracking-tight text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </motion.div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
      <input {...props} className="w-full h-12 bg-white/[0.03] border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 text-white text-sm outline-none transition-all placeholder:text-slate-700" />
    </div>
  );
}

export default function HODDashboard({ user }: { user: any }) {
  const router = useRouter();
  const { logout } = useRole();
  const searchParams = useSearchParams();
  // Derive tab from URL — sidebar clicks change ?v= param
  const rawV = searchParams.get('v') || 'overview';
  const tab: Tab = VALID_TABS.includes(rawV as Tab) ? (rawV as Tab) : 'overview';

  const goTo = (t: Tab) => router.push(`/?v=${t}`);

  const [stats, setStats] = React.useState<any>(null);
  const [students, setStudents] = React.useState<any[]>([]);
  const [faculty, setFaculty] = React.useState<any[]>([]);
  const [courses, setCourses] = React.useState<any[]>([]);
  const [timetable, setTimetable] = React.useState<any[]>([]);
  const [announcements, setAnnouncements] = React.useState<any[]>([]);
  const [exams, setExams] = React.useState<any[]>([]);
  const [leavesData, setLeavesData] = React.useState<any[]>([]);
  const [modal, setModal] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<any>({});
  const [uploadResult, setUploadResult] = React.useState<any>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedDay, setSelectedDay] = React.useState('Monday');
  const [selectedStudent, setSelectedStudent] = React.useState<any>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const loadStats = async () => {
    const r = await fetch('/api/hod/stats'); setStats(await r.json());
  };
  const loadStudents = async () => {
    const r = await fetch('/api/hod/students'); setStudents(await r.json());
  };
  const loadFaculty = async () => {
    const r = await fetch('/api/hod/faculty'); setFaculty(await r.json());
  };
  const loadCourses = async () => {
    const r = await fetch('/api/hod/courses'); setCourses(await r.json());
  };
  const loadTimetable = async () => {
    const r = await fetch('/api/hod/timetable'); setTimetable(await r.json());
  };
  const loadAnnouncements = async () => {
    const r = await fetch('/api/hod/announcements'); setAnnouncements(await r.json());
  };
  const loadLeaves = async () => {
    try {
      const r = await fetch('/api/hod/leaves');
      const d = await r.json();
      setLeavesData(Array.isArray(d) ? d : []);
    } catch {
      setLeavesData([]);
    }
  };
  const loadExams = async () => {
    try {
      const r = await fetch('/api/hod/exams');
      const data = await r.json();
      setExams(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setExams([]);
    }
  };

  React.useEffect(() => { loadStats(); }, []);
  React.useEffect(() => {
    if (tab === 'students') loadStudents();
    if (tab === 'faculty') loadFaculty();
    if (tab === 'courses') { loadCourses(); loadFaculty(); }
    if (tab === 'timetable') { loadTimetable(); loadFaculty(); }
    if (tab === 'exams') { loadStudents(); loadExams(); }
    if (tab === 'announcements') loadAnnouncements();
    if (tab === 'leaves') loadLeaves();
    if (tab === 'evaluation') loadStudents(); // GPA maps from students endpoint
  }, [tab]);

  const post = async (url: string, data: any) => {
    setLoading(true);
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setLoading(false);
    return r;
  };
  const patch = async (url: string, data: any) => {
    await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  };
  const del = async (url: string) => {
    await fetch(url, { method: 'DELETE' });
  };

  const handleAddStudent = async () => {
    if (!form.name || !form.email || !form.password) return;
    await post('/api/hod/students', form);
    setModal(null); setForm({}); loadStudents(); loadStats();
    showToast('Student added successfully');
  };
  const handleAddFaculty = async () => {
    if (!form.name || !form.email || !form.password) return;
    await post('/api/hod/faculty', form);
    setModal(null); setForm({}); loadFaculty(); loadStats();
    showToast('Faculty added successfully');
  };
  const handleAddCourse = async () => {
    if (!form.code || !form.title) return;
    await post('/api/hod/courses', form);
    setModal(null); setForm({}); loadCourses(); loadStats();
    showToast('Course added');
  };
  const handleAddSlot = async () => {
    if (!form.subject || !form.time || !form.room || !form.day) return;
    await post('/api/hod/timetable', { ...form, facultyId: form.facultyId || null });
    setModal(null); setForm({}); loadTimetable();
    showToast('Timetable slot added');
  };
  const handlePublishAnnouncement = async () => {
    if (!form.title || !form.content) return;
    await post('/api/hod/announcements', { ...form, authorId: user?.id });
    setModal(null); setForm({}); loadAnnouncements(); loadStats();
    showToast('Announcement published');
  };
  const handleAddExam = async () => {
    if (!form.subject || !form.date || !form.time || !form.room) return;
    await post('/api/hod/exams', form);
    setModal(null); setForm({}); loadExams();
    showToast('Exam scheduled');
  };
  const toggleExamBlock = async (s: any) => {
    await post('/api/hod/exam-block', { studentId: s.id, blocked: !s.examBlocked });
    loadStudents();
    showToast(s.examBlocked ? `${s.name} unblocked` : `${s.name} blocked from exams`);
  };
  const blockAllLowAttendance = async () => {
    const r = await fetch('/api/hod/exam-block', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ threshold: 75, mode: 'block' }) });
    const d = await r.json();
    loadStudents(); loadStats();
    showToast(`Blocked ${d.blocked} students with attendance < 75%`);
  };
  const unblockAllStudents = async () => {
    const r = await fetch('/api/hod/exam-block', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'unblock' }) });
    await r.json();
    loadStudents(); loadStats();
    showToast(`All students have been unblocked for exams`);
  };

  const processLeave = async (id: string, status: string) => {
    await patch('/api/hod/leaves', { id, status });
    showToast(`Leave application ${status.toLowerCase()}`);
    loadLeaves();
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'faculty', label: 'Faculty', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'exams', label: 'Exam Control', icon: ShieldAlert },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'leaves', label: 'Leaves', icon: ClipboardCheck },
    { id: 'evaluation', label: 'Evaluation', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[300] flex items-center gap-3 px-5 py-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl backdrop-blur-xl shadow-xl font-bold text-sm">
            <Check size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => goTo(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === t.id
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-[1.03]'
                : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:scale-[1.02]'
            }`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
        <button onClick={logout}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all hover:scale-[1.02]">
          <LogOut size={13} /> Logout
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Students', value: stats?.students ?? '—', icon: GraduationCap, color: 'text-blue-400' },
                  { label: 'Faculty', value: stats?.faculty ?? '—', icon: Users, color: 'text-violet-400' },
                  { label: 'Courses', value: stats?.courses ?? '—', icon: BookOpen, color: 'text-cyan-400' },
                  { label: 'Announcements', value: stats?.announcements ?? '—', icon: Bell, color: 'text-amber-400' },
                  { label: 'Low Attendance', value: stats?.lowAttendance ?? '—', icon: AlertTriangle, color: 'text-orange-400' },
                  { label: 'Exam Blocked', value: stats?.blockedStudents ?? '—', icon: Lock, color: 'text-red-400' },
                ].map((item, i) => (
                  <div key={i} className="glass-panel p-5 flex flex-col gap-3">
                    <item.icon size={20} className={item.color} />
                    <div>
                      <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500">{item.label}</p>
                      <p className="text-2xl font-black text-white mt-1">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Add Student', action: () => { goTo('students'); setTimeout(() => setModal('add-student'), 200); }, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                      { label: 'Add Faculty', action: () => { goTo('faculty'); setTimeout(() => setModal('add-faculty'), 200); }, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                      { label: 'Add Course', action: () => { goTo('courses'); setTimeout(() => setModal('add-course'), 200); }, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                      { label: 'Publish Notice', action: () => { goTo('announcements'); setTimeout(() => setModal('add-ann'), 200); }, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    ].map((a, i) => (
                      <button key={i} onClick={a.action} className={`flex flex-col items-center justify-center p-5 rounded-2xl ${a.bg} border border-white/5 hover:border-white/20 transition-all group`}>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${a.color} group-hover:text-white transition-colors`}>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="glass-panel p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">System Alerts</h3>
                  <div className="space-y-3">
                    {(stats?.lowAttendance ?? 0) > 0 && (
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                        <AlertTriangle size={16} className="text-orange-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-black text-orange-400">{stats.lowAttendance} students below 75% attendance</p>
                          <button onClick={() => goTo('exams')} className="text-[10px] font-bold text-orange-400/60 hover:text-orange-400 mt-1">Go to Exam Control →</button>
                        </div>
                      </div>
                    )}
                    {(stats?.blockedStudents ?? 0) > 0 && (
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                        <Lock size={16} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm font-black text-red-400">{stats.blockedStudents} students currently blocked from exams</p>
                      </div>
                    )}
                    {(stats?.lowAttendance ?? 0) === 0 && (stats?.blockedStudents ?? 0) === 0 && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <Check size={16} className="text-emerald-400" />
                        <p className="text-sm font-black text-emerald-400">All systems optimal</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── LEAVES ── */}
          {tab === 'leaves' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black">Leave Approvals ({leavesData.filter((l: any) => l.status === 'PENDING').length} Pending)</h2>
              </div>
              <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-slate-500">
                        {['Applicant', 'Details', 'Reason', 'Status', 'Actions'].map(h => <th key={h} className="px-5 py-4 font-black">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leavesData.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-600 text-sm font-bold">No leave applications found.</td></tr>
                      ) : leavesData.map((l: any) => (
                        <tr key={l.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-slate-200">{l.user?.name}</span>
                              <span className="text-[9px] font-black px-2 py-0.5 rounded border border-white/10 uppercase">{l.user?.role}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-[10px] font-black uppercase text-violet-400">{l.type}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(l.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="px-5 py-4 text-xs font-medium text-slate-300 max-w-[200px] truncate" title={l.reason}>
                            {l.reason}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${l.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : l.status === 'DENIED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                              {l.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {l.status === 'PENDING' ? (
                              <div className="flex gap-2">
                                <button onClick={() => processLeave(l.id, 'APPROVED')} className="p-2 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"><Check size={14} /></button>
                                <button onClick={() => processLeave(l.id, 'DENIED')} className="p-2 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><X size={14} /></button>
                              </div>
                            ) : <span className="text-[10px] text-slate-600 font-black tracking-widest uppercase">Processed</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── EVALUATION ── */}
          {tab === 'evaluation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">Academic Evaluation Overview</h2>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Cross-departmental performance metrics</p>
                </div>
              </div>
              <div className="glass-panel overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-slate-500">
                      <th className="px-5 py-4 font-black">Student</th>
                      <th className="px-5 py-4 font-black">Branch / Batch</th>
                      <th className="px-5 py-4 font-black">Attendance</th>
                      <th className="px-5 py-4 font-black">CGPA</th>
                      <th className="px-5 py-4 font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {students.map((s: any) => (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-200">{s.name}</span>
                            <span className="text-xs font-mono text-slate-500">{s.rollNumber || '—'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400">
                          {s.branch || '—'} <span className="mx-2 text-white/20">|</span> {s.batch || '—'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-black px-2 py-1 rounded-full ${s.attendancePct < 75 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{s.attendancePct}%</span>
                        </td>
                        <td className="px-5 py-4">
                          {s.gpa ? (
                            <span className="text-lg font-black text-violet-400">{s.gpa}</span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-slate-600 italic">No Data</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <button 
                            onClick={() => {
                              setSelectedStudent(s);
                              setModal('view-grades');
                            }}
                            className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest transition-all">
                            View Transcript
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {modal === 'view-grades' && selectedStudent && (
                <Modal title={`Academic Transcript • ${selectedStudent.name}`} onClose={() => setModal(null)}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl font-black">
                        {selectedStudent.gpa || '?'}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cumulative GPA</p>
                        <p className="text-xs font-medium text-slate-400">Calculated over {selectedStudent.grades?.length || 0} subjects</p>
                      </div>
                    </div>
                    {selectedStudent.grades && selectedStudent.grades.length > 0 ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {selectedStudent.grades.map((g: any, i: number) => {
                          const letter = g.score >= 90 ? 'A+' : g.score >= 80 ? 'A' : g.score >= 70 ? 'B' : g.score >= 60 ? 'C' : g.score >= 50 ? 'D' : 'F';
                          return (
                            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                              <h5 className="text-sm font-black text-slate-300">{g.subject}</h5>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-slate-500 font-black">{g.score}%</span>
                                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-black text-violet-400">{letter}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 text-xs py-10 font-bold uppercase tracking-widest italic border border-dashed border-white/10 rounded-2xl">No recorded grades</p>
                    )}
                  </div>
                </Modal>
              )}
            </div>
          )}

          {/* ── STUDENTS ── */}
          {tab === 'students' && (
            <div className="space-y-4">
              {/* Header row */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-black">Student Registry ({students.length})</h2>
                <div className="flex items-center gap-2">
                  {/* Excel Upload */}
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true); setUploadResult(null);
                      const fd = new FormData(); fd.append('file', file);
                      const r = await fetch('/api/hod/bulk-upload', { method: 'POST', body: fd });
                      const result = await r.json();
                      setUploadResult(result); setUploading(false);
                      if (result.created > 0) { loadStudents(); loadStats(); }
                      showToast(`Imported ${result.created} students, skipped ${result.skipped}`);
                      e.target.value = '';
                    }}
                  />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50">
                    {uploading ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
                    {uploading ? 'Processing...' : 'Upload Excel'}
                  </button>
                  <button onClick={() => { setForm({}); setModal('add-student'); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-500 transition-all">
                    <Plus size={14} /> Add Student
                  </button>
                </div>
              </div>

              {/* Excel format hint */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <Download size={14} className="text-blue-400 shrink-0" />
                <p className="text-[10px] text-slate-400 font-medium">
                  Excel format: columns <span className="font-black text-blue-400">Name, Email, RollNumber, Branch, Batch, Mentor, Dept</span> (Password optional, defaults to <span className="font-black text-blue-400">student123</span>)
                </p>
              </div>

              {/* Upload result */}
              {uploadResult && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border flex items-start gap-4 ${
                    uploadResult.error ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                  <div>
                    {uploadResult.error ? (
                      <p className="text-sm font-black text-red-400">{uploadResult.error}</p>
                    ) : (
                      <>
                        <p className="text-sm font-black text-emerald-400">Import Complete</p>
                        <p className="text-xs text-slate-400 mt-1">
                          ✅ Created: <span className="font-black text-white">{uploadResult.created}</span> &nbsp;
                          ⏭ Skipped: <span className="font-black text-white">{uploadResult.skipped}</span>
                          {uploadResult.errors?.length > 0 && <span className="ml-2 text-red-400">⚠ {uploadResult.errors[0]}</span>}
                        </p>
                      </>
                    )}
                  </div>
                  <button onClick={() => setUploadResult(null)} className="ml-auto text-slate-500 hover:text-white"><X size={14} /></button>
                </motion.div>
              )}

              <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-slate-500">
                        {['Name', 'Roll No', 'Branch', 'Batch', 'Attendance', 'Exam Status'].map(h => <th key={h} className="px-5 py-4 font-black">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {students.length === 0 ? (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-600 text-sm font-bold">No students found</td></tr>
                      ) : students.map(s => (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-[10px] font-black text-violet-400">
                                {s.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </div>
                              <span className="text-sm font-bold text-slate-200">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs font-mono text-slate-400">{s.rollNumber || '—'}</td>
                          <td className="px-5 py-4 text-xs text-slate-400">{s.branch || '—'}</td>
                          <td className="px-5 py-4 text-xs text-slate-400">{s.batch || '—'}</td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-black px-2 py-1 rounded-full ${s.attendancePct < 75 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {s.attendancePct}%
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {s.examBlocked ? (
                              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-fit">
                                <Lock size={10} /> BLOCKED
                              </span>
                            ) : (
                              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                                <Check size={10} /> ELIGIBLE
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {modal === 'add-student' && (
                <Modal title="Add New Student" onClose={() => setModal(null)}>
                  <Field label="Full Name" placeholder="M Sharath" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <Field label="Email" type="email" placeholder="student@smartcampus.edu" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                  <Field label="Password" type="password" placeholder="••••••••" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Roll Number" placeholder="20211CIT0083" value={form.rollNumber || ''} onChange={e => setForm({ ...form, rollNumber: e.target.value })} />
                    <Field label="Branch" placeholder="B.Tech CSE" value={form.branch || ''} onChange={e => setForm({ ...form, branch: e.target.value })} />
                    <Field label="Batch" placeholder="2021-2025" value={form.batch || ''} onChange={e => setForm({ ...form, batch: e.target.value })} />
                    <Field label="Mentor" placeholder="Dr. Jane Smith" value={form.mentor || ''} onChange={e => setForm({ ...form, mentor: e.target.value })} />
                  </div>
                  <button onClick={handleAddStudent} disabled={loading} className="w-full h-12 rounded-2xl bg-violet-600 text-white font-black text-xs uppercase tracking-widest hover:bg-violet-500 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add Student
                  </button>
                </Modal>
              )}
            </div>
          )}

          {/* ── FACULTY ── */}
          {tab === 'faculty' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black">Faculty Registry ({faculty.length})</h2>
                <button onClick={() => { setForm({}); setModal('add-faculty'); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-500 transition-all">
                  <Plus size={14} /> Add Faculty
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {faculty.map(f => (
                  <div key={f.id} className="glass-panel p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-[11px] font-black text-blue-400">
                        {f.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-200">{f.name}</p>
                        <p className="text-[10px] text-slate-500">{f.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{f.dept}</span>
                      <span className="text-[9px] font-bold text-cyan-400">{f.courses?.length || 0} courses</span>
                    </div>
                    {f.courses?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {f.courses.map((c: string, i: number) => (
                          <span key={i} className="text-[8px] font-black px-2 py-1 rounded-lg bg-white/5 text-slate-400">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {modal === 'add-faculty' && (
                <Modal title="Add New Faculty" onClose={() => setModal(null)}>
                  <Field label="Full Name" placeholder="Dr. Jane Smith" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <Field label="Email" type="email" placeholder="faculty@smartcampus.edu" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                  <Field label="Password" type="password" placeholder="••••••••" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <Field label="Department" placeholder="CSE" value={form.dept || ''} onChange={e => setForm({ ...form, dept: e.target.value })} />
                  <button onClick={handleAddFaculty} disabled={loading} className="w-full h-12 rounded-2xl bg-violet-600 text-white font-black text-xs uppercase tracking-widest hover:bg-violet-500 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add Faculty
                  </button>
                </Modal>
              )}
            </div>
          )}

          {/* ── COURSES ── */}
          {tab === 'courses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black">Course Registry ({courses.length})</h2>
                <button onClick={() => { setForm({}); setModal('add-course'); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-500 transition-all">
                  <Plus size={14} /> Add Course
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(c => (
                  <div key={c.id} className="glass-panel p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">{c.code}</span>
                        <h4 className="text-sm font-black text-white mt-1">{c.title}</h4>
                      </div>
                      <button onClick={async () => { await del(`/api/hod/courses/${c.id}`); loadCourses(); showToast('Course removed'); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span>{c.credits} credits</span>
                      <span>Sem {c.semester}</span>
                    </div>
                    {c.faculty && <p className="text-[10px] text-violet-400 font-bold">{c.faculty.name}</p>}
                  </div>
                ))}
              </div>
              {modal === 'add-course' && (
                <Modal title="Add New Course" onClose={() => setModal(null)}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Course Code" placeholder="CS301" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} />
                    <Field label="Semester" type="number" placeholder="1" value={form.semester || ''} onChange={e => setForm({ ...form, semester: parseInt(e.target.value) })} />
                  </div>
                  <Field label="Course Title" placeholder="Machine Learning" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
                  <Field label="Credits" type="number" placeholder="3" value={form.credits || ''} onChange={e => setForm({ ...form, credits: parseInt(e.target.value) })} />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Assign Faculty</label>
                    <select className="w-full h-12 bg-white/[0.03] border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 text-white text-sm outline-none"
                      value={form.facultyId || ''} onChange={e => setForm({ ...form, facultyId: e.target.value })}>
                      <option className="bg-slate-900 text-white" value="">— Not Assigned —</option>
                      {faculty.map(f => <option className="bg-slate-900 text-white" key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <button onClick={handleAddCourse} disabled={loading} className="w-full h-12 rounded-2xl bg-violet-600 text-white font-black text-xs uppercase tracking-widest hover:bg-violet-500 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add Course
                  </button>
                </Modal>
              )}
            </div>
          )}

          {/* ── TIMETABLE ── */}
          {tab === 'timetable' && (() => {
            const SCHEDULE_TEMPLATE = [
              { period: 1, label: 'Period 1', time: '08:00 AM – 09:00 AM', type: 'class' as const },
              { period: 2, label: 'Period 2', time: '09:00 AM – 10:00 AM', type: 'class' as const },
              { period: null, label: '☕ Morning Break', time: '10:00 AM – 10:15 AM', type: 'break' as const },
              { period: 3, label: 'Period 3', time: '10:15 AM – 11:15 AM', type: 'class' as const },
              { period: 4, label: 'Period 4', time: '11:15 AM – 12:15 PM', type: 'class' as const },
              { period: null, label: '🍽️ Lunch Break', time: '12:15 PM – 01:00 PM', type: 'lunch' as const },
              { period: 5, label: 'Period 5', time: '01:00 PM – 02:00 PM', type: 'class' as const },
              { period: 6, label: 'Period 6', time: '02:00 PM – 03:00 PM', type: 'class' as const },
              { period: null, label: '🌆 Evening Break', time: '03:00 PM – 03:15 PM', type: 'break' as const },
              { period: 7, label: 'Period 7', time: '03:15 PM – 04:15 PM', type: 'class' as const },
            ];
            const daySlots = timetable.filter((t: any) => t.day === selectedDay);
            return (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black">Timetable Manager</h2>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">7 course slots · 1 lunch · 2 breaks per day</p>
                  </div>
                  <button onClick={() => { setForm({ day: selectedDay }); setModal('add-slot'); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-500 transition-all">
                    <Plus size={14} /> Assign Slot
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {DAYS.map(d => (
                    <button key={d} onClick={() => setSelectedDay(d)}
                      className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                        ${selectedDay === d ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/20' : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                      {d}
                    </button>
                  ))}
                </div>
                <div className="glass-panel overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 w-28">Period</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 w-52">Time</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Subject</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 w-32">Room</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 w-40">Faculty</th>
                        <th className="px-6 py-4 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {SCHEDULE_TEMPLATE.map((block, idx) => {
                        if (block.type === 'break') return (
                          <tr key={idx} className="border-b border-white/[0.04] bg-amber-500/[0.05]">
                            <td colSpan={6} className="px-6 py-6">
                              <div className="flex items-center gap-4">
                                <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">{block.label}</span>
                                <span className="text-[10px] text-slate-500 font-bold">{block.time}</span>
                                <span className="ml-auto text-[10px] text-amber-500/60 font-black bg-amber-500/10 px-3 py-1 rounded-lg">15 min</span>
                              </div>
                            </td>
                          </tr>
                        );
                        if (block.type === 'lunch') return (
                          <tr key={idx} className="border-b border-white/[0.04] bg-emerald-500/[0.05]">
                            <td colSpan={6} className="px-6 py-6">
                              <div className="flex items-center gap-4">
                                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">{block.label}</span>
                                <span className="text-[10px] text-slate-500 font-bold">{block.time}</span>
                                <span className="ml-auto text-[10px] text-emerald-500/60 font-black bg-emerald-500/10 px-3 py-1 rounded-lg">45 min</span>
                              </div>
                            </td>
                          </tr>
                        );
                        const assigned = daySlots.find((s: any) => Number(s.period) === block.period);
                        return (
                          <tr key={idx} className="border-b border-white/[0.04] hover:bg-white/[0.03] group transition-colors">
                            <td className="px-6 py-8">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-[9px] font-black text-violet-400">{block.period}</span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{block.label}</span>
                              </div>
                            </td>
                            <td className="px-6 py-8"><span className="text-[10px] text-slate-400 font-bold">{block.time}</span></td>
                            {assigned ? (
                              <>
                                <td className="px-6 py-8"><div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span><span className="text-sm font-black text-slate-100">{assigned.subject}</span></div></td>
                                <td className="px-6 py-8"><span className="text-[11px] text-slate-400 font-bold bg-white/5 px-2.5 py-1 rounded-lg">{assigned.room}</span></td>
                                <td className="px-6 py-8">{assigned.faculty && <span className="text-[11px] text-violet-400 font-bold">{assigned.faculty.name}</span>}</td>
                                <td className="px-6 py-8">
                                  <button onClick={async () => { await del(`/api/hod/timetable/${assigned.id}`); loadTimetable(); showToast('Slot removed'); }}
                                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-8"><span className="text-[10px] text-slate-700 italic">— empty —</span></td>
                                <td className="px-6 py-8"></td>
                                <td className="px-6 py-8"></td>
                                <td className="px-6 py-8">
                                  <button onClick={() => { setForm({ day: selectedDay, period: block.period, time: block.time }); setModal('add-slot'); }}
                                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[9px] text-violet-400 font-black uppercase tracking-widest bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 rounded-lg">
                                    <Plus size={10} /> Assign
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {modal === 'add-slot' && (
                  <Modal title="Assign Course to Slot" onClose={() => setModal(null)}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Day</label>
                        <select className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-4 text-white text-sm outline-none" value={form.day || ''} onChange={e => setForm({ ...form, day: e.target.value })}>
                          <option className="bg-slate-900 text-white" value="">Select Day</option>
                          {DAYS.map(d => <option className="bg-slate-900 text-white" key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Period</label>
                        <select className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-4 text-white text-sm outline-none"
                          value={form.period || ''} onChange={e => { const p = parseInt(e.target.value); setForm({ ...form, period: p, time: SCHEDULE_TEMPLATE.find(s => s.period === p)?.time || '' }); }}>
                          <option className="bg-slate-900 text-white" value="">Select Period</option>
                          {[1,2,3,4,5,6,7].map(p => <option className="bg-slate-900 text-white" key={p} value={p}>Period {p}</option>)}
                        </select>
                      </div>
                    </div>
                    {form.period && <p className="text-[10px] text-violet-400 font-bold bg-violet-500/10 px-3 py-2 rounded-lg">🕐 {SCHEDULE_TEMPLATE.find(s => s.period === form.period)?.time}</p>}
                    <Field label="Subject" placeholder="Machine Learning" value={form.subject || ''} onChange={e => setForm({ ...form, subject: e.target.value })} />
                    <Field label="Room" placeholder="B-Block 201" value={form.room || ''} onChange={e => setForm({ ...form, room: e.target.value })} />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Faculty</label>
                      <select className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-4 text-white text-sm outline-none" value={form.facultyId || ''} onChange={e => setForm({ ...form, facultyId: e.target.value })}>
                        <option className="bg-slate-900 text-white" value="">— Auto Assign —</option>
                        {faculty.map((f: any) => <option className="bg-slate-900 text-white" key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <button onClick={handleAddSlot} disabled={loading} className="w-full h-12 rounded-2xl bg-violet-600 text-white font-black text-xs uppercase tracking-widest hover:bg-violet-500 transition-all flex items-center justify-center gap-2">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Assign Slot
                    </button>
                  </Modal>
                )}
              </div>
            );
          })()}

          {/* ── EXAM CONTROL ── */}
          {tab === 'exams' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-black">Exam Eligibility Control</h2>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Students below 75% attendance can be blocked from appearing in exams</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={unblockAllStudents} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600/20 transition-all">
                    <Unlock size={13} /> Unblock All
                  </button>
                  <button onClick={blockAllLowAttendance} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                    <Lock size={13} /> Block All Below 75%
                  </button>
                </div>
              </div>
              <div className="glass-panel overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-slate-500">
                      {['Student', 'Roll No', 'Branch', 'Attendance', 'Status', 'Action'].map(h => <th key={h} className="px-5 py-4 font-black">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {students.map(s => (
                      <tr key={s.id} className={`group transition-colors ${s.attendancePct < 75 ? 'bg-red-500/[0.03]' : ''}`}>
                        <td className="px-5 py-4 text-sm font-bold text-slate-200">{s.name}</td>
                        <td className="px-5 py-4 text-xs font-mono text-slate-500">{s.rollNumber || '—'}</td>
                        <td className="px-5 py-4 text-xs text-slate-500">{s.branch || '—'}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${s.attendancePct < 75 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${s.attendancePct}%` }} />
                            </div>
                            <span className={`text-xs font-black ${s.attendancePct < 75 ? 'text-red-400' : 'text-emerald-400'}`}>{s.attendancePct}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {s.examBlocked ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20"><Lock size={9} /> BLOCKED</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Check size={9} /> ELIGIBLE</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => toggleExamBlock(s)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${s.examBlocked ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
                            {s.examBlocked ? <><Unlock size={11} /> Unblock</> : <><Lock size={11} /> Block</>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Exam Timings Management */}
              <div className="space-y-4 pt-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black tracking-tight">Exam Schedule</h2>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">Manage exam dates and timings for students and faculty.</p>
                  </div>
                  <button onClick={() => { setForm({}); setModal('add-exam'); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20">
                    <Calendar size={14} /> Schedule Exam
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.isArray(exams) && exams.map(e => (
                    <div key={e.id} className="glass-panel p-5 space-y-4 group">
                      <div className="flex items-start justify-between">
                        <div className="p-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20">
                          <Calendar size={20} className="text-violet-400" />
                        </div>
                        <button onClick={async () => { if(confirm('Remove this exam schedule?')) { await del(`/api/hod/exams/${e.id}`); loadExams(); showToast('Exam removed'); } }}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">{e.subject}</h4>
                        <div className="flex flex-wrap gap-3 mt-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <Clock size={12} className="text-violet-500" /> {e.date}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <Timer size={12} className="text-cyan-500" /> {e.time}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <MapPin size={12} className="text-emerald-500" /> {e.room}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {exams.length === 0 && (
                    <div className="lg:col-span-3 glass-panel p-10 text-center text-slate-600 font-bold text-sm italic">No exams scheduled yet. Use the button above to add one.</div>
                  )}
                </div>

                {modal === 'add-exam' && (
                  <Modal title="Schedule Exam" onClose={() => setModal(null)}>
                    <Field label="Subject" placeholder="Software Engineering" value={form.subject || ''} onChange={e => setForm({ ...form, subject: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Date" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
                      <Field label="Time" placeholder="10:00 AM – 01:00 PM" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} />
                    </div>
                    <Field label="Exam Room" placeholder="Block A, Room 302" value={form.room || ''} onChange={e => setForm({ ...form, room: e.target.value })} />
                    <button onClick={handleAddExam} disabled={loading} className="w-full h-12 rounded-2xl bg-violet-600 text-white font-black text-xs uppercase tracking-widest hover:bg-violet-500 transition-all flex items-center justify-center gap-2">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />} Schedule Now
                    </button>
                  </Modal>
                )}
              </div>
            </div>
          )}

          {/* ── ANNOUNCEMENTS ── */}
          {tab === 'announcements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black">Announcements ({announcements.length})</h2>
                <button onClick={() => { setForm({ audience: 'ALL' }); setModal('add-ann'); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-500 transition-all">
                  <Megaphone size={14} /> Publish Notice
                </button>
              </div>
              <div className="space-y-3">
                {announcements.length === 0 && <div className="glass-panel p-10 text-center text-slate-600 font-bold text-sm">No announcements yet</div>}
                {announcements.map(a => (
                    <div key={a.id} className="glass-panel p-5 flex items-start justify-between gap-4 group">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-black text-white">{a.title}</h4>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${a.audience === 'ALL' ? 'bg-violet-500/10 text-violet-400' : a.audience === 'STUDENTS' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>{a.audience}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{a.content}</p>
                        <p className="text-[9px] text-slate-600 font-bold">{new Date(a.createdAt).toLocaleString()}</p>
                      </div>
                      <button onClick={async () => { if(confirm('Delete this announcement?')) { await del(`/api/hod/announcements?id=${a.id}`); loadAnnouncements(); showToast('Announcement removed'); } }}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                ))}
              </div>
              {modal === 'add-ann' && (
                <Modal title="Publish Announcement" onClose={() => setModal(null)}>
                  <Field label="Title" placeholder="Important Notice" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Audience</label>
                    <select className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-4 text-white text-sm outline-none"
                      value={form.audience || 'ALL'} onChange={e => setForm({ ...form, audience: e.target.value })}>
                      <option value="ALL">All (Students + Faculty)</option>
                      <option value="STUDENTS">Students Only</option>
                      <option value="FACULTY">Faculty Only</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Content</label>
                    <textarea className="w-full h-28 bg-white/[0.03] border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 py-3 text-white text-sm outline-none transition-all resize-none placeholder:text-slate-700"
                      placeholder="Write the announcement content..."
                      value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} />
                  </div>
                  <button onClick={handlePublishAnnouncement} disabled={loading} className="w-full h-12 rounded-2xl bg-violet-600 text-white font-black text-xs uppercase tracking-widest hover:bg-violet-500 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Megaphone size={16} />} Publish Now
                  </button>
                </Modal>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <ProfileSection />
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
