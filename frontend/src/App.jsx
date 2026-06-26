import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadCSV from './pages/UploadCSV';
import CustomerSegments from './pages/CustomerSegments';
import CustomerDetails from './pages/CustomerDetails';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Generate from './pages/Generate';

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

// Public Route wrapper component (prevents logged-in users from seeing Login screen)
function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Temporary card stubs to show sidebar navigation functional testing
function PlaceholderCard({ title, description }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl animate-fade-in">
      <h2 className="text-xl font-bold text-slate-100 mb-2">{title}</h2>
      <p className="text-sm text-slate-400 mb-6">{description}</p>
      <div className="p-8 rounded-xl bg-slate-950 border border-slate-800/60 flex items-center justify-center border-dashed">
        <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">
          Draft Component Screen
        </span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Access */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />

            {/* Protected Management Suite */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <UploadCSV />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/generate" 
              element={
                <ProtectedRoute>
                  <Generate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/segments" 
              element={
                <ProtectedRoute>
                  <CustomerSegments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/:id" 
              element={
                <ProtectedRoute>
                  <CustomerDetails />
                </ProtectedRoute>
              } 
            />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
