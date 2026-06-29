import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  BarChart3,
  PlusCircle,
  CreditCard,
  Target
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'SALES_MANAGER', 'USER'] },
    { name: 'Customers', path: '/segments', icon: UserCheck, roles: ['ADMIN', 'SALES_MANAGER', 'USER'] },
    { name: 'Upload CSV', path: '/upload', icon: PlusCircle, roles: ['ADMIN', 'SALES_MANAGER'] },
    { name: 'New Generation', path: '/generate', icon: Target, roles: ['ADMIN', 'SALES_MANAGER', 'USER'] },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['ADMIN', 'SALES_MANAGER'] },
    { name: 'History Logs', path: '/history', icon: History, roles: ['ADMIN', 'SALES_MANAGER'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen glass-panel text-slate-200 transition-all duration-300 z-30 flex flex-col justify-between
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
                M
              </div>
              <span className="font-semibold text-sm gradient-text leading-tight">
                AI Customer Segment Profitability Analyzer
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white mx-auto shadow-lg shadow-indigo-500/30">
              M
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-200 hidden md:block"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer
                  ${isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 pl-2' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105`} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800">
        <div className="p-3">
          <button
            onClick={logout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors duration-200 cursor-pointer
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
