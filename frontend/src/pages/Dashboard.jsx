import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  FileCheck,
  Percent
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers/analytics`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchAnalytics();
    }
  }, [user?.token]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl shadow-xl flex flex-col items-center justify-center text-slate-400 gap-3">
        <svg className="w-8 h-8 text-indigo-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs font-semibold">Loading dashboard overview...</span>
      </div>
    );
  }

  const summary = analyticsData?.summary || {
    totalRevenue: 0,
    totalCustomers: 0,
    overdueCustomersCount: 0,
    aov: 0,
    collectionEfficiency: 0,
    vipRevenueContribution: 0,
    revenueChangePercent: '+0.0%',
    customerChangePercent: '+0.0%',
    overdueChangeText: '0 overdue requires action'
  };

  const monthlySalesData = analyticsData?.monthlySales || [];
  const segmentDistributionData = analyticsData?.segmentDistribution || [];
  const recentActivityLog = analyticsData?.recentActivities || [];

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-panel p-6 rounded-2xl gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Welcome to Manikanta Executive Portal <Sparkles className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing customer profitability, segments, and custom Gemini engagement scripts.
          </p>
        </div>
        <div className="px-4 py-2 bg-indigo-650/10 border border-indigo-550/20 text-indigo-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <FileCheck className="w-4 h-4" /> Latest Data Sync: Active
        </div>
      </div>

      {/* KPI Stats Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Revenue */}
        <div className="glass-panel p-6 rounded-2xl hover-lift group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
              <span className="text-3xl font-extrabold text-slate-100">${summary.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-indigo-600/10 rounded-xl group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>{summary.revenueChangePercent}</span>
            <span className="text-slate-500">from last month</span>
          </div>
        </div>

        {/* Card 2: Total Customers */}
        <div className="glass-panel p-6 rounded-2xl hover-lift group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Accounts</span>
              <span className="text-3xl font-extrabold text-slate-100">{summary.totalCustomers}</span>
            </div>
            <div className="p-3 bg-emerald-600/10 rounded-xl group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>{summary.customerChangePercent}</span>
            <span className="text-slate-500">new signups today</span>
          </div>
        </div>

        {/* Card 3: Overdue Payments Ratio */}
        <div className="glass-panel p-6 rounded-2xl hover-lift group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Overdue Accounts</span>
              <span className="text-3xl font-extrabold text-slate-100">{summary.overdueCustomersCount}</span>
            </div>
            <div className="p-3 bg-amber-600/10 rounded-xl group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-rose-400">
            <ArrowDownRight className="w-4 h-4" />
            <span>{summary.overdueChangeText}</span>
          </div>
        </div>

      </div>

      {/* Main Charts & Visualizations Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width on large screens): Sales Line Trend Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between hover-lift">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-200">Revenue Performance Trends</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Tracking sales revenue over the past 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400 font-semibold rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> H1 Performance
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column (1/3 width on large screens): Segment distribution donut chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover-lift">
          <div className="mb-4">
            <h3 className="font-bold text-slate-200 font-sans">Segment Distribution</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Current counts of profitability clusters</p>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segmentDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {segmentDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-100">{summary.totalCustomers}</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Clients</span>
            </div>
          </div>

          {/* Custom legends list mapping */}
          <div className="space-y-1.5 mt-2">
            {segmentDistributionData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-slate-400 font-medium">{entry.name}</span>
                </div>
                <span className="text-slate-300 font-semibold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row - Recent Activity log list */}
      <div className="glass-panel p-6 rounded-2xl hover-lift">
        <div className="mb-6">
          <h3 className="font-bold text-slate-200">Recent Portal Activity Logs</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Tracks upload activity and AI strategy revisions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Description details</th>
                <th className="py-3 px-4 text-right">Time Elapsed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {recentActivityLog.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-1.5 text-[10px] font-bold rounded-lg ${log.badge}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-300">{log.details}</td>
                  <td className="py-3.5 px-4 text-right text-xs text-slate-500 font-medium">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
