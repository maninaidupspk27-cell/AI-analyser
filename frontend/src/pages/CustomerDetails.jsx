import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Sparkles, 
  Star, 
  Copy, 
  Download, 
  RefreshCw,
  MessageSquareCode
} from 'lucide-react';

// Shared mock customer database matching the Segments page ids
const mockCustomers = [
  { id: '1', name: 'Acme Corporation', contact: 'John Doe', email: 'john@acme.com', phone: '+1 (555) 019-2834', revenue: 45000, recency: 5, frequency: 24, segment: 'VIP Customers', status: 'PAID' },
  { id: '2', name: 'Beta Industries', contact: 'Sarah Smith', email: 'sarah@betaind.com', phone: '+1 (555) 014-9982', revenue: 28000, recency: 12, frequency: 18, segment: 'VIP Customers', status: 'PAID' },
  { id: '3', name: 'Gamma Enterprises', contact: 'Richard Roe', email: 'richard@gamma.com', phone: '+1 (555) 012-7489', revenue: 15500, recency: 28, frequency: 14, segment: 'High Potential', status: 'PENDING' },
  { id: '4', name: 'Delta Logistical', contact: 'Alice Jones', email: 'alice@deltalog.com', phone: '+1 (555) 015-8833', revenue: 12000, recency: 45, frequency: 10, segment: 'Regular Customers', status: 'OVERDUE' },
  { id: '5', name: 'Epsilon Tech', contact: 'David Vance', email: 'david@epsilon.com', phone: '+1 (555) 017-6644', revenue: 9500, recency: 92, frequency: 8, segment: 'At Risk', status: 'PENDING' },
  { id: '6', name: 'Zeta Solutions', contact: 'Elena Rostova', email: 'elena@zeta.com', phone: '+1 (555) 019-5511', revenue: 1100, recency: 180, frequency: 2, segment: 'Lost Customers', status: 'OVERDUE' }
];

const mockTransactions = {
  '1': [
    { id: 'T101', date: '2026-06-13', amount: 5000, status: 'PAID', method: 'Wire Transfer' },
    { id: 'T102', date: '2026-05-28', amount: 12000, status: 'PAID', method: 'ACH' },
    { id: 'T103', date: '2026-05-10', amount: 8000, status: 'PAID', method: 'Wire Transfer' },
    { id: 'T104', date: '2026-04-15', amount: 20000, status: 'PAID', method: 'ACH' }
  ],
  '4': [
    { id: 'T401', date: '2026-05-04', amount: 4500, status: 'OVERDUE', method: 'Credit Card' },
    { id: 'T402', date: '2026-04-12', amount: 5500, status: 'PAID', method: 'ACH' },
    { id: 'T403', date: '2026-03-01', amount: 2000, status: 'PAID', method: 'Wire Transfer' }
  ]
};

const mockAIRecommendations = {
  'VIP Customers': {
    strategy: 'Exclusive Account Management & Loyalty Locking',
    points: [
      'Assign a senior business manager as their direct personal liaison.',
      'Provide a 10% premium VIP rebate on early bill settlements.',
      'Invite to the মানিকান্ত (Manikanta) Annual Executive Leadership Summit.',
      'Pitch high-tier automated system upgrade licenses (Upsell Opportunity).'
    ]
  },
  'Regular Customers': {
    strategy: 'Standard Engagement & Transaction Nurturing',
    points: [
      'Enroll in automated quarterly feedback collection scripts.',
      'Send tailored updates showcasing newly integrated analysis templates.',
      'Provide mild volume discount thresholds (5% reduction for orders > $15,000).'
    ]
  },
  'At Risk': {
    strategy: 'Proactive Re-engagement & Settlement Support',
    points: [
      'Trigger an automated call from local sales manager to offer support.',
      'Verify if pending invoices are blocking progress. Offer partial invoice splitting options.',
      'Send a feedback checkup inquiry asking about recent dashboard experiences.'
    ]
  }
};

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve matching customer data
  const customer = useMemo(() => {
    return mockCustomers.find(c => c.id === id) || mockCustomers[0];
  }, [id]);

  // Retrieve client transactions ledger
  const transactions = useMemo(() => {
    return mockTransactions[customer.id] || [
      { id: 'TX-MOCK', date: '2026-06-01', amount: customer.revenue, status: customer.status, method: 'ACH' }
    ];
  }, [customer]);

  // Retrieve AI Recommendations
  const aiAdvice = useMemo(() => {
    return mockAIRecommendations[customer.segment] || mockAIRecommendations['Regular Customers'];
  }, [customer]);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      addToast('Please select a star rating first.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addToast('AI recommendation feedback rating saved!', 'success');
      setRating(0);
      setFeedback('');
      setIsSubmitting(false);
    }, 800);
  };

  const handleCopy = () => {
    const text = `${customer.name} Strategy:\n- ${aiAdvice.points.join('\n- ')}`;
    navigator.clipboard.writeText(text);
    addToast('Strategy copied to clipboard!', 'success');
  };

  const handleDownload = () => {
    const text = `Customer: ${customer.name}\nSegment: ${customer.segment}\nStrategy: ${aiAdvice.strategy}\n\nRecommendations:\n${aiAdvice.points.map((p, i) => `${i+1}. ${p}`).join('\n')}`;
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${customer.name.replace(/\s+/g, '_')}_AI_Strategy.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('TXT strategy file download started.', 'success');
  };

  const getSegmentStyles = (seg) => {
    switch (seg) {
      case 'VIP Customers': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'High Potential': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Regular Customers': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'At Risk': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Return Navigation Back Button */}
      <button 
        onClick={() => navigate('/segments')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Return to Segments Ledger
      </button>

      {/* Grid wrapper for profile banner and RFM details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width): Profiles info cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile metadata banner */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-indigo-600/15 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-md">
                <Building className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">{customer.name}</h2>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md inline-block mt-1.5 ${getSegmentStyles(customer.segment)}`}>
                  {customer.segment}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>{customer.phone}</span>
              </div>
            </div>
          </div>

          {/* RFM Score metrics breakdown */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* Monetary (Revenue) */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-850 transition-colors shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Monetary (LTV)</span>
              </div>
              <span className="text-xl font-extrabold text-slate-100">${customer.revenue.toLocaleString()}</span>
            </div>

            {/* Frequency */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-850 transition-colors shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Frequency</span>
              </div>
              <span className="text-xl font-extrabold text-slate-100">{customer.frequency} orders</span>
            </div>

            {/* Recency */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-850 transition-colors shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Recency</span>
              </div>
              <span className="text-xl font-extrabold text-slate-100">{customer.recency} Days Ago</span>
            </div>

          </div>

          {/* Transaction History Ledger List */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Account Transaction History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-850/20">
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">{tx.id}</td>
                      <td className="py-3 px-4 text-slate-300">{tx.date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-200">${tx.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-400">{tx.method}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          tx.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' :
                          tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width): AI Recommendation script panel */}
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[400px]">
            
            {/* Header */}
            <div>
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/80">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> AI Strategy Advisor
                </span>
                
                <div className="flex gap-1.5">
                  <button 
                    onClick={handleCopy} 
                    title="Copy advice to clipboard"
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleDownload}
                    title="Download advice as text file"
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Recommendations text container */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Suggested strategy</h4>
                  <p className="text-sm font-bold text-slate-100 mt-1">{aiAdvice.strategy}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Key action points</h4>
                  <ul className="space-y-2.5">
                    {aiAdvice.points.map((pt, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* AI Advisor Ratings feedback box */}
            <div className="mt-8 pt-4 border-t border-slate-800/80">
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Rate this recommendation
                </span>
                
                {/* Stars index selectors */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="text-slate-600 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          star <= (hover || rating) ? 'fill-amber-500 text-amber-500' : 'text-slate-650'
                        }`} 
                      />
                    </button>
                  ))}
                </div>

                {/* Optional Feedback text */}
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us why you liked or disliked this recommendations script..."
                  className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 min-h-[60px] resize-none"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-transparent text-indigo-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <MessageSquareCode className="w-4 h-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit Advisor Feedback'}
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
