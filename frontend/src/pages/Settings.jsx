import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Settings as SettingsIcon, 
  Key, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Save, 
  HelpCircle 
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/settings', {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setApiKey(data.settings.apiKey);
          setSelectedModel(data.settings.model);
          setSystemPrompt(data.settings.systemPrompt);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        addToast('Failed to load system settings from server.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchSettings();
    }
  }, [user?.token]);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast('Only administrators can modify system parameters.', 'error');
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          apiKey,
          model: selectedModel,
          systemPrompt
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save settings');
      }
      addToast('System settings persisted successfully!', 'success');
      if (data.settings) {
        setApiKey(data.settings.apiKey);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      addToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl shadow-xl flex flex-col items-center justify-center text-slate-400 gap-3">
        <svg className="w-8 h-8 text-indigo-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs font-semibold">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h3 className="font-bold text-slate-100 flex items-center gap-2 text-lg">
          System Administration Options <SettingsIcon className="w-5 h-5 text-indigo-400" />
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Adjust Gemini API variables, refine default prompt guidelines, and check portal operators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column (2/3 width): Configuration Forms */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveConfig} className="space-y-6">
            
            {/* Box 1: Gemini API Config Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
                <Key className="w-4 h-4 text-indigo-400" />
                <h4 className="font-semibold text-slate-200 text-sm">Gemini AI Engine Credentials</h4>
              </div>

              <div className="space-y-4">
                {/* API Key */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      disabled={!isAdmin}
                      placeholder={isAdmin ? "Enter your Google AI Studio API Key..." : "API Key is hidden (requires Admin privilege)"}
                      className="w-full pl-4 pr-11 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      disabled={!isAdmin}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer disabled:opacity-30"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-550 mt-1.5 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> API Keys are masked and secured upon save. Unsaved edits will revert.
                  </span>
                </div>

                {/* Model Version Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Active AI Model Version
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={!isAdmin}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none disabled:opacity-50"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fastest)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep reasoning)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Box 2: System Prompt Template Config Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="font-semibold text-slate-200 text-sm">Base System Prompts Instructions</h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  System Context Prompt Instruction
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  disabled={!isAdmin}
                  rows={5}
                  placeholder="Provide default context instructions..."
                  className="w-full p-4 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed disabled:opacity-50"
                />
              </div>

              {isAdmin && (
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-650/20 hover:shadow-indigo-650/30 flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving parameters...' : 'Save Configuration'}
                  </button>
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Right column (1/3 width): User Access Controls list panel */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl h-fit space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <Users className="w-4 h-4 text-indigo-400" />
            <h4 className="font-semibold text-slate-200 text-sm">System Operator Profiles</h4>
          </div>

          <div className="space-y-3">
            {/* Operator 1: Admin */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2 flex items-start justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-200">Manikanta Admin</h5>
                <span className="text-[10px] text-slate-500 block mt-0.5">admin@manikanta.com</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            </div>

            {/* Operator 2: Sales Manager */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2 flex items-start justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-200">Sanjay Kumar (Sales)</h5>
                <span className="text-[10px] text-slate-500 block mt-0.5">sales@manikanta.com</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/15">
                <UserCheck className="w-3 h-3" /> Sales
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
