import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Helper to map route paths to display page titles
  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Dashboard';
      case '/upload': return 'Upload CSV Data';
      case '/segments': return 'Customer Segments';
      case '/recommendations': return 'AI Recommendations Portal';
      case '/analytics': return 'Performance Analytics';
      case '/history': return 'Activity History Logs';
      case '/settings': return 'System Settings';
      default:
        if (path.startsWith('/customer/')) return 'Customer Deep-Dive';
        return 'AI Segmenter';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased relative overflow-hidden">
      {/* Global Background Gradient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse delay-700"></div>
      <div className="fixed top-[40%] left-[50%] w-[30vw] h-[30vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-float"></div>

      {/* Sidebar Navigation */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Work Area Container */}
      <div 
        className={`transition-all duration-300 min-h-screen flex flex-col pt-16
          ${collapsed ? 'pl-20' : 'pl-0 md:pl-64'}
        `}
      >
        {/* Top Header Bar */}
        <Navbar 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          pageTitle={getPageTitle(location.pathname)} 
        />

        {/* Dynamic Inner Page Content */}
        <main className="flex-1 p-6 overflow-y-auto animate-on-mount relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
