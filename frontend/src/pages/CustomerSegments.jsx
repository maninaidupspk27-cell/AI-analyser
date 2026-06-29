import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert,
  SlidersHorizontal,
  Building,
  Plus
} from 'lucide-react';
import AddCustomerModal from '../components/AddCustomerModal';

export default function CustomerSegments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('totalPurchases');
  const [sortDirection, setSortDirection] = useState('desc'); // asc | desc
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const itemsPerPage = 10;

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchCustomers();
    }
  }, [user?.token]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const processedCustomers = useMemo(() => {
    let result = [...customers];

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.location.toLowerCase().includes(query) || 
        c.id.toLowerCase().includes(query)
      );
    }

    if (segmentFilter !== 'ALL') {
      result = result.filter(c => c.segment.toUpperCase().replace(' ', '_') === segmentFilter);
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(c => c.status === statusFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [customers, search, segmentFilter, statusFilter, sortField, sortDirection]);

  const totalItems = processedCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [processedCustomers, currentPage]);

  const getSegmentBadge = (segment) => {
    switch (segment) {
      case 'VIP Customers': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'High Potential': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Regular Customers': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'At Risk': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-[9px] px-2 py-0.5 rounded-md font-bold';
      case 'PENDING': return 'bg-amber-500/10 text-amber-400 border border-amber-500/10 text-[9px] px-2 py-0.5 rounded-md font-bold';
      default: return 'bg-rose-500/10 text-rose-400 border border-rose-500/10 text-[9px] px-2 py-0.5 rounded-md font-bold';
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100">Customer Segmentation Ledger</h3>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Search className="w-4 h-4" /></span>
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search ID, name, location..." className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Filter className="w-4 h-4" /></span>
            <select value={segmentFilter} onChange={(e) => { setSegmentFilter(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer">
              <option value="ALL">All Segments</option>
              <option value="VIP_CUSTOMERS">VIP Customers</option>
              <option value="HIGH_POTENTIAL">High Potential</option>
              <option value="REGULAR_CUSTOMERS">Regular Customers</option>
              <option value="AT_RISK">At Risk</option>
              <option value="LOST_CUSTOMERS">Lost Customers</option>
            </select>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><ShieldAlert className="w-4 h-4" /></span>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer">
              <option value="ALL">All Payment States</option>
              <option value="PAID">Paid Only</option>
              <option value="PENDING">Pending Only</option>
              <option value="OVERDUE">Overdue Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-4 px-6"><button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer uppercase">Company Info <ArrowUpDown className="w-3 h-3 text-indigo-400" /></button></th>
                <th className="py-4 px-6"><button onClick={() => handleSort('totalPurchases')} className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer uppercase">Total Purchases <ArrowUpDown className="w-3 h-3 text-indigo-400" /></button></th>
                <th className="py-4 px-6"><button onClick={() => handleSort('orders')} className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer uppercase">Orders <ArrowUpDown className="w-3 h-3 text-indigo-400" /></button></th>
                <th className="py-4 px-6">Segment Status</th>
                <th className="py-4 px-6">Bills Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr><td colSpan="6" className="py-8 text-center text-indigo-400 font-medium">Loading customers...</td></tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-500 font-medium italic">No matching records found.</td></tr>
              ) : (
                paginatedCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-850/30 transition-all duration-150">
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-sm">
                          <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {cust.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{cust.id} • {cust.location}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-200 text-sm">${cust.totalPurchases.toLocaleString()}</td>
                    <td className="py-4 px-6"><div className="flex flex-col"><span className="font-semibold text-slate-300">{cust.orders}</span></div></td>
                    <td className="py-4 px-6"><span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${getSegmentBadge(cust.segment)}`}>{cust.segment}</span></td>
                    <td className="py-4 px-6">{getStatusBadge(cust.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => navigate(`/customer/${cust.id}`)} className="px-3.5 py-2 bg-slate-950 border border-slate-850 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-400 rounded-xl font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer shadow-sm">
                        <Eye className="w-4 h-4" /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-slate-950/40 border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-400">
            <div>Showing <span className="font-bold text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-300">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-slate-300">{totalItems}</span> entries</div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              <div className="flex items-center px-3 font-semibold text-slate-300 bg-slate-900 border border-slate-800/80 rounded-lg">Page {currentPage} of {totalPages}</div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onCustomerAdded={(newCust) => fetchCustomers()} 
      />
    </div>
  );
}
