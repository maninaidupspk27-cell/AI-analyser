import React from 'react';
import { Menu, User, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ collapsed, setCollapsed, pageTitle }) {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 fixed top-0 right-0 left-0 z-20 flex items-center justify-between px-6 transition-all duration-300">
      {/* Page Title & Sidebar Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-200 block md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-100 uppercase tracking-wider">
          {pageTitle}
        </h1>
      </div>

      {/* Date & User Info */}
      <div className="flex items-center gap-6 text-sm text-slate-400">
        <div className="hidden sm:flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>{currentDate}</span>
        </div>
        
        <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-200">{user?.fullName}</span>
            <span className="text-[10px] text-indigo-400 tracking-wide font-medium">{user?.role}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>
    </header>
  );
}
