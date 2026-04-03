'use client';

import React from 'react';
import { useRole } from '@/context/RoleContext';
import {
  Home, BookOpen, ClipboardList, Calendar, Award,
  GraduationCap, Zap, ClipboardCheck, MessageSquare, LogOut, Settings, 
  Users, ShieldAlert, Megaphone, BarChart3, UserCheck, ShieldCheck, FileText
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Sidebar() {
  const { role, user, logout } = useRole();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const currentView  = searchParams.get('v') || 'home';

  if (!mounted || !role) return null;
  const isHOD = role === 'hod';
  const isFaculty = role === 'faculty';
  const isStudent = role === 'student';

  const getMenu = () => {
    if (isHOD) {
      return [
        { name: 'Overview',      icon: BarChart3,      path: '/?v=overview' },
        { name: 'Students',      icon: GraduationCap,  path: '/?v=students' },
        { name: 'Faculty',       icon: Users,          path: '/?v=faculty' },
        { name: 'Courses',       icon: BookOpen,       path: '/?v=courses' },
        { name: 'Timetable',     icon: Calendar,       path: '/?v=timetable' },
        { name: 'Exam Control',  icon: ShieldAlert,    path: '/?v=exams' },
        { name: 'Announcements', icon: Megaphone,      path: '/?v=announcements' },
        { name: 'Leaves',        icon: FileText,       path: '/?v=leaves' },
        { name: 'Evaluation',    icon: Award,          path: '/?v=evaluation' },
        { name: 'Profile',       icon: Settings,       path: '/profile' },
      ];
    }
    if (isFaculty) {
      return [
        { name: 'Nexus Dashboard', icon: Home,           path: '/' },
        { name: 'Attendance',      icon: UserCheck,      path: '/?v=attendance' },
        { name: 'Students',        icon: GraduationCap,  path: '/?v=students' },
        { name: 'Courses',         icon: BookOpen,       path: '/?v=courses' },
        { name: 'Schedule',        icon: Calendar,       path: '/?v=schedule' },
        { name: 'Announcements',   icon: Megaphone,      path: '/?v=announcements' },
        { name: 'Leaves',          icon: FileText,       path: '/?v=leaves' },
        { name: 'Evaluation',      icon: Award,          path: '/?v=evaluation' },
        { name: 'Profile',         icon: Settings,       path: '/profile' },
      ];
    }
    // Student Menu
    return [
      { name: 'Home',        icon: Home,           path: '/' },
      { name: 'Notices',     icon: Megaphone,      path: '/?v=notices' },
      { name: 'Courses',     icon: BookOpen,       path: '/?v=courses' },
      { name: 'Schedule',    icon: Calendar,       path: '/?v=schedule' },
      { name: 'Evaluation',  icon: Award,          path: '/?v=evaluation' },
      { name: 'Sports',      icon: Zap,            path: '/?v=sports' },
      { name: 'Leaves',      icon: FileText,       path: '/?v=leaves' },
      { name: 'Profile',     icon: Settings,       path: '/profile' },
    ];
  };

  const menu = getMenu();

  return (
    <aside
      style={{ width: 'var(--sidebar-width)' }}
      className="shrink-0 sticky top-0 h-screen z-[200] flex flex-col bg-[#06061a] border-r border-violet-900/30"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-7 pb-6">
        <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.6)] border border-violet-400/30 shrink-0">
          <GraduationCap size={22} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black tracking-[0.3em] text-violet-400 uppercase leading-none">Smart</p>
          <p className="text-[17px] font-black text-white leading-tight tracking-tight">Campus</p>
        </div>
      </div>

      {/* Section label */}
      <p className="px-5 mb-3 text-[9px] font-black tracking-[0.25em] text-slate-600 uppercase">Navigation</p>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {menu.map((item) => {
          const isChat = item.path === '/messages';
          const isActive = isChat
            ? pathname === '/messages'
            : item.path === pathname || (item.path.includes('v=') && searchParams.get('v') === item.path.split('v=')[1]);

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 border
                ${isActive
                  ? 'bg-violet-600/20 border-violet-500/40 shadow-[0_2px_16px_rgba(124,58,237,0.2),inset_0_0_0_1px_rgba(124,58,237,0.1)]'
                  : 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.08]'}
              `}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all
                ${isActive
                  ? 'bg-violet-600/30 text-violet-300'
                  : 'bg-white/[0.05] text-slate-500 group-hover:bg-violet-900/30 group-hover:text-violet-400'}
              `}>
                <item.icon size={16} />
              </div>
              <span className={`text-[13px] font-semibold transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-200'}`}>
                {item.name}
              </span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,1)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 my-3 h-px bg-white/[0.06]" />

      {/* User card */}
      <div className="px-3 pb-4">
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-violet-700 border-2 border-violet-400/30 flex items-center justify-center shadow-lg">
              <span className="text-[13px] font-black text-white uppercase">
                {(user?.name || 'U').substring(0, 2)}
              </span>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#06061a]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-black text-white truncate uppercase">{user?.name || 'User'}</p>
            <p className="text-[9px] text-violet-400 font-bold uppercase tracking-widest">{role}</p>
          </div>
          <button onClick={logout} className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Logout">
            <LogOut size={15} />
          </button>
        </div>
        <button
          onClick={logout}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-red-500/40 hover:text-red-400 hover:bg-red-500/[0.07] transition-all"
        >
          <LogOut size={12} />
          <span className="text-[9px] font-black tracking-widest uppercase">Exit Nexus</span>
        </button>
      </div>
    </aside>
  );
}
