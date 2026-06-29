import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Send, FileText, Settings, Target, Copy, Download, Star, RefreshCw, FileImage, Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useReactToPrint } from 'react-to-print';

export default function Generate() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCustomerId = searchParams.get('customerId') || '';

  const [formData, setFormData] = useState({
    subject: '',
    requirements: '',
    constraints: '',
    preferences: '',
    customerId: initialCustomerId
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [rating, setRating] = useState(0);
  const contentRef = useRef(null);

  // When customerId changes, update subject and requirements automatically
  useEffect(() => {
    if (formData.customerId) {
      setFormData(prev => ({
        ...prev,
        subject: `Strategic Analysis for Customer ${prev.customerId}`,
        requirements: `Analyze the purchasing patterns and recent activity for customer ${prev.customerId} and provide a personalized engagement strategy.`
      }));
    }
  }, [formData.customerId]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResult(null);
    setRating(0);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert(data.message || 'Generation failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (val) => {
    if (!result) return;
    try {
      setRating(val);
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/generations/${result.id}/rate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ rating: val })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result?.aiResponse || '');
    alert('Copied to clipboard!');
  };

  const handleExportPDF = useReactToPrint({
    contentRef: contentRef,
    documentTitle: formData.subject ? `Analysis_${formData.subject.replace(/[^a-zA-Z0-9]/g, '_')}` : 'Analysis_Report',
    onPrintError: (error) => console.error(error),
  });

  const handleEmail = async () => {
    if (!result) return;
    const email = window.prompt("Enter the recipient's email address to send this report:");
    if (!email) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/generations/${result.id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        alert('Email dispatched successfully! Check backend logs for the Ethereal preview link.');
      } else {
        alert(data.message || 'Failed to send email.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while sending the email.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
      
      {/* Form Sidebar */}
      <div className="lg:col-span-4 glass-panel p-6 overflow-y-auto hover-lift">
        <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          AI Analysis Request
        </h2>

        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-2">
              <Target className="w-3.5 h-3.5" />
              Customer ID
            </label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. C001"
              value={formData.customerId}
              onChange={e => setFormData({...formData, customerId: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 disabled:opacity-50 transition-all duration-300 animate-glow"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {loading ? 'Generating Strategy...' : 'Generate AI Strategy'}
          </button>
        </form>
      </div>

      {/* Result Area */}
      <div className="lg:col-span-8 glass-panel flex flex-col overflow-hidden hover-lift">
        
        {/* Header Actions */}
        <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-850">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Analysis Output
          </h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCopy}
              disabled={!result}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={!result}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-slate-100 rounded-lg disabled:opacity-30 transition-colors"
            >
              <FileImage className="w-4 h-4" />
              Export PDF
            </button>
            <button 
              onClick={handleEmail}
              disabled={!result}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-slate-100 rounded-lg disabled:opacity-30 transition-colors"
              title="Email Report"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-900/40 relative">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
              <p>The AI is synthesizing your strategy...</p>
            </div>
          ) : result ? (
            <div ref={contentRef} id="pdf-content" className="p-8 bg-white text-slate-900 rounded-lg shadow-inner min-h-full">
              <div className="border-b-2 border-indigo-600 pb-4 mb-6">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manikanta Enterprises</h1>
                <p className="text-sm font-semibold text-slate-500 uppercase mt-1">AI Strategic Analysis Report</p>
              </div>
              <div className="prose prose-slate max-w-none prose-headings:text-indigo-900 prose-a:text-indigo-600">
                <ReactMarkdown>{result.aiResponse}</ReactMarkdown>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 text-xs text-slate-400 flex justify-between">
                <span>Generated on {new Date(result.createdAt || Date.now()).toLocaleDateString()}</span>
                <span>Subject: {result.subject}</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <Target className="w-16 h-16 mb-4 opacity-20" />
              <p>Submit the form on the left to generate an analysis.</p>
            </div>
          )}
        </div>

        {/* Footer / Rating */}
        {result && !loading && (
          <div className="border-t border-slate-800 p-4 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-500 uppercase">Rate this output:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className={`p-1 transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-700 hover:text-amber-400/50'}`}
                  >
                    <Star className={`w-5 h-5 ${rating >= star ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => handleGenerate()}
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
