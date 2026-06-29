import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [selectedPortal, setSelectedPortal] = useState(null); // 'admin' | 'sales' | null
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };

  const renderPortalSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20 mb-6">
          <KeyRound className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Manikanta Enterprises</h1>
        <p className="text-sm text-slate-400 mt-2">Select your portal to continue</p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => setSelectedPortal('admin')}
          className="group relative w-full flex items-center p-5 bg-slate-900 border border-slate-700 hover:border-emerald-500/50 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 overflow-hidden cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100">Admin Portal</h3>
            <p className="text-xs text-slate-400 mt-1">Manage system configurations</p>
          </div>
          <div className="text-slate-600 group-hover:text-emerald-400 transition-colors ml-4">
            →
          </div>
        </button>

        <button
          onClick={() => setSelectedPortal('sales')}
          className="group relative w-full flex items-center p-5 bg-slate-900 border border-slate-700 hover:border-sky-500/50 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10 overflow-hidden cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shrink-0">
            <UserCheck className="w-6 h-6 text-sky-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100">Sales Manager</h3>
            <p className="text-xs text-slate-400 mt-1">Analyze segment profitability</p>
          </div>
          <div className="text-slate-600 group-hover:text-sky-400 transition-colors ml-4">
            →
          </div>
        </button>
      </div>
    </div>
  );

  const renderLoginForm = () => {
    const isAdmin = selectedPortal === 'admin';
    const title = isAdmin ? 'Admin Portal' : 'Sales Manager';
    const Icon = isAdmin ? ShieldCheck : UserCheck;
    const color = isAdmin ? 'text-emerald-400' : 'text-sky-400';
    const bg = isAdmin ? 'bg-emerald-500/10' : 'bg-sky-500/10';

    return (
      <>
        <button
          onClick={() => setSelectedPortal(null)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 mb-8 transition-colors cursor-pointer"
        >
          ← Back to Portals
        </button>

        <div className="text-center mb-8">
          <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4 border ${isAdmin ? 'border-emerald-500/20' : 'border-sky-500/20'}`}>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{title} Login</h1>
          <p className="text-xs text-slate-400 mt-2">Enter your credentials to access the system</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <input type="email" name="fake_email_remembered" style={{ display: 'none' }} />
          <input type="password" name="fake_password_remembered" style={{ display: 'none' }} />
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adminmanikanta@gmail.com"
                autoComplete="off"
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-55 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              `Sign In as ${title}`
            )}
          </button>
        </form>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none animate-pulse delay-700"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 transition-all duration-500">
        {selectedPortal === null ? renderPortalSelection() : renderLoginForm()}
      </div>
    </div>
  );
}

