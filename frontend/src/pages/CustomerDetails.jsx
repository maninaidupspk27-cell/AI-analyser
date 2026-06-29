import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ArrowLeft, 
  Building, 
  MapPin,
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Sparkles, 
  Star, 
  Copy, 
  Download, 
  MessageSquareCode,
  AlertTriangle,
  Repeat,
  PackageX,
  Edit
} from 'lucide-react';
import EditCustomerModal from '../components/EditCustomerModal';

const mockAIRecommendations = {
  'VIP Customers': {
    strategy: 'Exclusive Account Management & Loyalty Locking',
    points: [
      'Assign a senior business manager as their direct personal liaison.',
      'Provide a 10% premium VIP rebate on early bill settlements.',
      'Invite to the Annual Executive Leadership Summit.',
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
  const { user } = useAuth();
  const { addToast } = useToast();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers/${id}`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCustomer(data.customer);
      } else {
        addToast(data.message || 'Customer not found', 'error');
        navigate('/segments');
      }
    } catch (err) {
      addToast('Failed to fetch customer details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchCustomer();
  }, [id, user?.token, navigate, addToast]);

  const aiAdvice = customer ? (mockAIRecommendations[customer.segment] || mockAIRecommendations['Regular Customers']) : null;

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
    if (!aiAdvice) return;
    const text = `${customer.name} Strategy:\n- ${aiAdvice.points.join('\n- ')}`;
    navigator.clipboard.writeText(text);
    addToast('Strategy copied to clipboard!', 'success');
  };

  const handleDownload = () => {
    if (!aiAdvice) return;
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

  if (loading || !customer) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <Clock className="w-8 h-8 animate-pulse text-indigo-500 mb-4" />
        <p className="ml-4 font-semibold">Loading Customer Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <button onClick={() => navigate('/segments')} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Return to Segments Ledger
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-indigo-600/15 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-md">
                <Building className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-100">{customer.name}</h2>
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-1.5 bg-slate-800 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors"
                    title="Edit Customer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${getSegmentStyles(customer.segment)}`}>
                    {customer.segment}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    ID: {customer.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>Location: {customer.location}</span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-850 transition-colors shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Purchases</span>
              </div>
              <span className="text-xl font-extrabold text-slate-100">${customer.totalPurchases.toLocaleString()}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-850 transition-colors shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
              </div>
              <span className="text-xl font-extrabold text-slate-100">{customer.orders}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-850 transition-colors shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <DollarSign className="w-4 h-4 text-sky-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Order Value</span>
              </div>
              <span className="text-xl font-extrabold text-slate-100">${customer.avgOrderValue.toLocaleString()}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-850 transition-colors shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Outstanding Bal</span>
              </div>
              <span className="text-xl font-extrabold text-rose-400">${customer.outstanding.toLocaleString()}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-850 transition-colors shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Payment Delay</span>
              </div>
              <span className="text-xl font-extrabold text-slate-100">{customer.paymentDelayDays} Days</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-850 transition-colors shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Repeat className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Repeat Rate</span>
              </div>
              <span className="text-xl font-extrabold text-slate-100">{customer.repeatRate}%</span>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-850 transition-colors shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <PackageX className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Returns</span>
              </div>
              <span className="text-xl font-extrabold text-slate-100">{customer.returns}</span>
            </div>
          </div>

        </div>

        {/* AI Recommendations */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/80">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> AI Strategy Advisor
                </span>
                <div className="flex gap-1.5">
                  <button onClick={handleCopy} title="Copy" className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"><Copy className="w-4 h-4" /></button>
                  <button onClick={handleDownload} title="Download" className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"><Download className="w-4 h-4" /></button>
                </div>
              </div>
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
            
            <div className="mt-8 pt-4 border-t border-slate-800/80">
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rate this recommendation</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} className="text-slate-600 hover:scale-110 transition-transform">
                      <Star className={`w-5 h-5 ${star <= (hover || rating) ? 'fill-amber-500 text-amber-500' : 'text-slate-650'}`} />
                    </button>
                  ))}
                </div>
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Tell us why you liked or disliked this recommendations script..." className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 min-h-[60px] resize-none" />
                <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-transparent text-indigo-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50">
                  <MessageSquareCode className="w-4 h-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit Advisor Feedback'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <EditCustomerModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onCustomerUpdated={(updatedCust) => {
          fetchCustomer();
          addToast('Customer updated successfully!', 'success');
        }}
        initialData={customer}
      />
    </div>
  );
}
