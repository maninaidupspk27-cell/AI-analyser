import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Code, 
  Layers, 
  RefreshCw, 
  Copy, 
  Download, 
  FileCheck,
  CheckCircle,
  HelpCircle,
  Terminal,
  ArrowRightLeft
} from 'lucide-react';

const promptTemplates = {
  V1: 'Provide a short customer engagement strategy for the customer segment: "[Segment]". Keep it under 2 paragraphs.',
  V2: 'Write a customer retention and engagement strategy for the customer segment "[Segment]" described as "[Description]". Suggest concrete actions focusing on their RFM behavior (Recency, Frequency, and Monetary levels).',
  V3: 'As an AI business consultant for Manikanta Enterprises, design a customer strategy for the "[Segment]" segment (description: "[Description]"). Highlight concrete payment terms, collection strategies, or upsell models to protect company cash flow and minimize credit risk.',
  V4: 'Act as a senior growth consultant for Manikanta Enterprises. Design a customer success strategy for the customer segment "[Segment]" (description: "[Description]").\n\nYou MUST return your response as a raw JSON object with this exact structure:\n{\n  "strategyType": "RETENTION | UPSELL | DISCOUNT | REMINDER | GROWTH",\n  "executiveSummary": "...",\n  "actionSteps": ["...", "...", "..."],\n  "scriptTemplate": "..."\n}'
};

const promptVersions = [
  {
    version: 'V1',
    label: 'Baseline Prompt',
    desc: 'Simple direct instruction request (low detail)',
  },
  {
    version: 'V2',
    label: 'Role-Based Prompt',
    desc: 'Injecting role boundaries & task rules',
  },
  {
    version: 'V3',
    label: 'Context-Rich Prompts',
    desc: 'Detailed context, tone guidance, and variables',
  },
  {
    version: 'V4',
    label: 'JSON Schema Output',
    desc: 'Strict format rules and programmatic keys (Recommended)',
  }
];

export default function Recommendations() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [activeVersion, setActiveVersion] = useState('V4'); // Default to recommended JSON output
  const [activeSegment, setActiveSegment] = useState('VIP Customers');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recommendations', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
        if (data.recommendations.length > 0) {
          // Find first recommendation with a valid segment and select it
          const firstRec = data.recommendations[0];
          setActiveSegment(firstRec.segment?.name || 'VIP Customers');
          setActiveVersion(firstRec.promptVersion || 'V4');
        }
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      addToast('Failed to load AI recommendations from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const currentRec = recommendations.find(r => r.segment?.name === activeSegment);
  
  // Clean up template text replacing segment variables
  const templateText = (promptTemplates[activeVersion] || '')
    .replace('[Segment]', activeSegment)
    .replace('[Description]', currentRec?.segment?.description || 'No description available');

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(templateText);
    addToast('Prompt template copied!', 'success');
  };

  const handleCopyOutput = () => {
    const text = currentRec ? currentRec.strategyContent : '';
    if (text) {
      navigator.clipboard.writeText(text);
      addToast('Generated script copied!', 'success');
    } else {
      addToast('No generated text to copy.', 'error');
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('http://localhost:5000/api/recommendations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ promptVersion: activeVersion })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Regeneration failed');
      }
      setRecommendations(data.recommendations);
      addToast(`Gemini AI strategies synchronized successfully for Prompt ${activeVersion}!`, 'success');
    } catch (error) {
      console.error(error);
      addToast(error.message, 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Extract list of segments from active recommendations to render tabs dynamically
  const uniqueSegments = recommendations.map(r => r.segment?.name).filter(Boolean);
  const displaySegments = uniqueSegments.length > 0 ? uniqueSegments : ['VIP Customers', 'Regular Customers', 'At Risk'];

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-lg">
            AI Prompt Engineering Portal <Sparkles className="w-5 h-5 text-indigo-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Compare Gemini prompt versions, configurations, and structural outputs.
          </p>
        </div>
        
        {user?.role === 'ADMIN' && (
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 border border-indigo-550/20 hover:border-transparent text-indigo-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-55"
          >
            {isRegenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync Gemini Engine
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl shadow-xl flex flex-col items-center justify-center text-slate-400 gap-3">
          <LoaderSpinner className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs font-semibold">Connecting Gemini strategies database...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left column (1/4 width): Prompt selector buttons list */}
          <div className="space-y-3 lg:col-span-1">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
              Prompt Versions
            </span>
            <div className="space-y-2">
              {promptVersions.map((p) => (
                <button
                  key={p.version}
                  onClick={() => setActiveVersion(p.version)}
                  className={`
                    w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer group
                    ${activeVersion === p.version 
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-slate-100' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700/80 hover:bg-slate-850/60'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      activeVersion === p.version 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-slate-950 text-slate-500 group-hover:text-slate-400'
                    }`}>
                      {p.version}
                    </span>
                    {p.version === 'V4' && (
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded font-bold uppercase">
                        JSON Formatted
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold group-hover:text-slate-200 transition-colors">{p.label}</h4>
                  <p className="text-[9px] text-slate-500 mt-1 leading-normal truncate">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right column (3/4 width): Prompt display & comparative output panels */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Prompt Template display box */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Code className="w-4 h-4 text-indigo-400" /> Prompt instructions (Input Schema)
                </span>
                <button
                  onClick={handleCopyPrompt}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Prompt
                </button>
              </div>
              
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs font-mono text-slate-300 leading-relaxed font-light whitespace-pre-wrap select-text">
                {templateText}
              </div>
            </div>

            {/* AI Outputs Panel */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              
              {/* Tab header to switch customer segments */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80 flex-wrap gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-400" /> Segment Output comparisons
                </span>

                {/* Segment selectors */}
                <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                  {displaySegments.map((seg) => (
                    <button
                      key={seg}
                      onClick={() => setActiveSegment(seg)}
                      className={`
                        px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all
                        ${activeSegment === seg 
                          ? 'bg-indigo-650 text-slate-100 shadow-md' 
                          : 'text-slate-500 hover:text-slate-300'
                        }
                      `}
                    >
                      {seg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategy Response text area */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    AI Output Script Log ({currentRec?.promptVersion || 'Historical'})
                  </span>
                  <button
                    onClick={handleCopyOutput}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy script
                  </button>
                </div>

                {/* Console rendering text */}
                <div className={`p-4 bg-slate-950 border border-slate-850 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap select-text h-64 overflow-y-auto scrollbar-thin ${
                  activeVersion === 'V4' ? 'text-emerald-400/90' : 'text-slate-200'
                }`}>
                  {currentRec ? currentRec.strategyContent : 'No strategy advice has been generated for this segment yet.'}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

function LoaderSpinner({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
