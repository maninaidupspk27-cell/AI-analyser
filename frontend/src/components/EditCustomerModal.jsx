import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Save, RefreshCw } from 'lucide-react';

export default function EditCustomerModal({ isOpen, onClose, onCustomerUpdated, initialData }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    id: '',
    customerName: '',
    totalPurchases: '',
    orders: '',
    avgOrderValue: '',
    paymentDelayDays: '',
    outstanding: '',
    repeatRate: '',
    returns: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        customerName: initialData.name || '',
        totalPurchases: initialData.totalPurchases || 0,
        orders: initialData.orders || 0,
        avgOrderValue: initialData.avgOrderValue || 0,
        paymentDelayDays: initialData.paymentDelayDays || 0,
        outstanding: initialData.outstanding || 0,
        repeatRate: initialData.repeatRate || 0,
        returns: initialData.returns || 0,
        location: initialData.location || ''
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        onCustomerUpdated(data.customer);
        onClose();
      } else {
        setError(data.message || 'Failed to update customer');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">Edit Customer Data</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold text-center">
              {error}
            </div>
          )}
          
          <form id="edit-customer-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Customer ID</label>
              <input required disabled type="text" value={formData.id} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-500 focus:outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Customer Name</label>
              <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Total Purchases ($)</label>
              <input required type="number" step="0.01" value={formData.totalPurchases} onChange={e => setFormData({...formData, totalPurchases: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Orders (Count)</label>
              <input required type="number" value={formData.orders} onChange={e => setFormData({...formData, orders: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Avg Order Value ($)</label>
              <input required type="number" step="0.01" value={formData.avgOrderValue} onChange={e => setFormData({...formData, avgOrderValue: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Payment Delay (Days)</label>
              <input required type="number" value={formData.paymentDelayDays} onChange={e => setFormData({...formData, paymentDelayDays: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Outstanding ($)</label>
              <input required type="number" step="0.01" value={formData.outstanding} onChange={e => setFormData({...formData, outstanding: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Repeat Rate (%)</label>
              <input required type="number" step="0.01" value={formData.repeatRate} onChange={e => setFormData({...formData, repeatRate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Returns (Count)</label>
              <input required type="number" value={formData.returns} onChange={e => setFormData({...formData, returns: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Location</label>
              <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} type="button" disabled={loading} className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
