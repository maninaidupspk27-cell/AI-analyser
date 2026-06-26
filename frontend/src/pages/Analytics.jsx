import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Target, Star, FileText, Users } from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/analytics', {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        const data = await response.json();
        if (data.success) {
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchAnalytics();
  }, [user?.token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <span className="animate-spin mr-3 border-4 border-indigo-500 border-t-transparent rounded-full w-8 h-8"></span>
        Loading Analytics...
      </div>
    );
  }

  const summary = analyticsData?.summary || { totalGenerations: 0, averageRating: 0, totalRated: 0 };
  const usageTrends = analyticsData?.usageTrends || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Generation Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between hover-lift group">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Total Generations</span>
            <h4 className="text-3xl font-black text-slate-100 mt-1">{summary.totalGenerations}</h4>
          </div>
          <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl"><FileText className="w-8 h-8" /></div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between hover-lift group">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Average Rating</span>
            <h4 className="text-3xl font-black text-slate-100 mt-1">{summary.averageRating} <span className="text-lg text-slate-400">/ 5.0</span></h4>
          </div>
          <div className="p-3 bg-amber-600/10 text-amber-400 rounded-xl"><Star className="w-8 h-8" /></div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between hover-lift group">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Total Rated</span>
            <h4 className="text-3xl font-black text-slate-100 mt-1">{summary.totalRated}</h4>
          </div>
          <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl"><Target className="w-8 h-8" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl hover-lift">
          <h3 className="font-bold text-slate-200 mb-6">Generations Over Time</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Area type="monotone" dataKey="generations" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl hover-lift">
          <h3 className="font-bold text-slate-200 mb-6">Average Output Rating</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 5]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="averageRating" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Performance Leaderboard */}
      <div className="glass-panel overflow-hidden mt-8 hover-lift">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-200 text-lg">Team Performance Leaderboard</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-850/50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-4 px-6 border-b border-slate-800">Team Member</th>
                <th className="py-4 px-6 border-b border-slate-800">Role</th>
                <th className="py-4 px-6 border-b border-slate-800 text-center">Generations</th>
                <th className="py-4 px-6 border-b border-slate-800 text-center">Avg Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {analyticsData?.teamPerformance?.length > 0 ? (
                analyticsData.teamPerformance.map((member, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-200">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        member.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-400' :
                        member.role === 'SALES_MANAGER' ? 'bg-indigo-500/10 text-indigo-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-slate-300">{member.generationsCount}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {member.averageRating ? (
                          <>
                            <span className="font-bold text-amber-400">{member.averageRating}</span>
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          </>
                        ) : (
                          <span className="text-slate-600 text-xs">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    No team generation data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
