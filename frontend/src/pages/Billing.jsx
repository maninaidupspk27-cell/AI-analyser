import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Zap, CheckCircle2 } from 'lucide-react';

export default function Billing() {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Check if returning from mock checkout
    const params = new URLSearchParams(location.search);
    if (params.get('mock_success') === 'true') {
      const credits = params.get('credits');
      handleMockWebhook(credits);
    }
  }, [location]);

  const handleMockWebhook = async (credits) => {
    try {
      const response = await fetch('http://localhost:5000/api/billing/mock-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ credits })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(`Successfully purchased ${credits} AI Credits!`);
        // We could fetch profile to update AuthContext user credits, 
        // but a simple reload works perfectly for prototypes
        setTimeout(() => window.location.href = '/billing', 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async (packageId) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ packageId })
      });
      const data = await response.json();
      if (data.success && data.url) {
        // Redirect to mock checkout url
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-indigo-400" />
          Billing & Credits
        </h1>
        <p className="text-slate-400 mt-2">
          Manage your AI Generation credits and purchase refills.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-800 rounded-lg flex items-center gap-3 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Current Plan */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Current Balance</h2>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400">
              {user?.credits || 0}
            </span>
            <span className="text-slate-400 font-medium mb-1">Credits Remaining</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Zap className="w-4 h-4 text-amber-400" />
              1 Credit = 1 AI Generation
            </div>
          </div>
        </div>

        {/* Refill Options */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-xs font-bold px-3 py-1 text-white rounded-bl-lg">
            POPULAR
          </div>
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Buy More Credits</h2>
          
          <div className="space-y-4">
            <button
              onClick={() => handleCheckout('starter')}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-600 hover:border-indigo-500 hover:bg-slate-700/50 transition-all text-left"
            >
              <div>
                <div className="font-bold text-slate-200">Starter Pack</div>
                <div className="text-sm text-slate-400">50 AI Generations</div>
              </div>
              <div className="text-lg font-bold text-indigo-400">$10.00</div>
            </button>

            <button
              onClick={() => handleCheckout('premium')}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-indigo-500 bg-indigo-900/20 hover:bg-indigo-900/40 transition-all text-left"
            >
              <div>
                <div className="font-bold text-slate-200">Premium Pack</div>
                <div className="text-sm text-slate-400">150 AI Generations</div>
              </div>
              <div className="text-lg font-bold text-indigo-400">$25.00</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
