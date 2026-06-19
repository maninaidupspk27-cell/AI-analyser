import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert,
  SlidersHorizontal,
  Mail,
  Building
} from 'lucide-react';

// Extensive mock customer list for testing search, filters, sorting and pagination
const mockCustomers = [
  { id: '1', name: 'Acme Corporation', contact: 'John Doe', email: 'john@acme.com', revenue: 45000, recency: 5, frequency: 24, segment: 'VIP Customers', status: 'PAID' },
  { id: '2', name: 'Beta Industries', contact: 'Sarah Smith', email: 'sarah@betaind.com', revenue: 28000, recency: 12, frequency: 18, segment: 'VIP Customers', status: 'PAID' },
  { id: '3', name: 'Gamma Enterprises', contact: 'Richard Roe', email: 'richard@gamma.com', revenue: 15500, recency: 28, frequency: 14, segment: 'High Potential', status: 'PENDING' },
  { id: '4', name: 'Delta Logistical', contact: 'Alice Jones', email: 'alice@deltalog.com', revenue: 12000, recency: 45, frequency: 10, segment: 'Regular Customers', status: 'OVERDUE' },
  { id: '5', name: 'Epsilon Tech', contact: 'David Vance', email: 'david@epsilon.com', revenue: 9500, recency: 92, frequency: 8, segment: 'At Risk', status: 'PENDING' },
  { id: '6', name: 'Zeta Solutions', contact: 'Elena Rostova', email: 'elena@zeta.com', revenue: 1100, recency: 180, frequency: 2, segment: 'Lost Customers', status: 'OVERDUE' },
  { id: '7', name: 'Omega Consulting', contact: 'Marcus Aurelius', email: 'marcus@omega.com', revenue: 54000, recency: 2, frequency: 32, segment: 'VIP Customers', status: 'PAID' },
  { id: '8', name: 'Sigma Hardware', contact: 'Lisa Simpson', email: 'lisa@sigma.com', revenue: 19800, recency: 15, frequency: 15, segment: 'High Potential', status: 'PAID' },
  { id: '9', name: 'Theta Digital', contact: 'Carl Sagan', email: 'carl@theta.com', revenue: 7600, recency: 55, frequency: 6, segment: 'Regular Customers', status: 'PENDING' },
  { id: '10', name: 'Kappa Clothing', contact: 'Grace Hopper', email: 'grace@kappa.com', revenue: 8200, recency: 110, frequency: 7, segment: 'At Risk', status: 'OVERDUE' },
  { id: '11', name: 'Lambda Analytics', contact: 'Alan Turing', email: 'alan@lambda.com', revenue: 32000, recency: 8, frequency: 20, segment: 'VIP Customers', status: 'PAID' },
  { id: '12', name: 'Mu Manufacturing', contact: 'Marie Curie', email: 'marie@mu.com', revenue: 6500, recency: 135, frequency: 4, segment: 'Lost Customers', status: 'PENDING' }
];

export default function CustomerSegments() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('revenue');
  const [sortDirection, setSortDirection] = useState('desc'); // asc | desc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Perform search, filter, and sorting calculations inside useMemo to optimize speed
  const processedCustomers = useMemo(() => {
    let result = [...mockCustomers];

    // 1. Search Query Filter
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.contact.toLowerCase().includes(query) || 
        c.email.toLowerCase().includes(query)
      );
    }

    // 2. Segment Badge Filter
    if (segmentFilter !== 'ALL') {
      result = result.filter(c => c.segment.toUpperCase().replace(' ', '_') === segmentFilter);
    }

    // 3. Payment Status Filter
    if (statusFilter !== 'ALL') {
      result = result.filter(c => c.status === statusFilter);
    }

    // 4. Sort columns
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
  }, [search, segmentFilter, statusFilter, sortField, sortDirection]);

  // Pagination Math
  const totalItems = processedCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [processedCustomers, currentPage]);

  const getSegmentBadge = (segment) => {
    switch (segment) {
      case 'VIP Customers':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'High Potential':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Regular Customers':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'At Risk':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-[9px] px-2 py-0.5 rounded-md font-bold';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/10 text-[9px] px-2 py-0.5 rounded-md font-bold';
      default:
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/10 text-[9px] px-2 py-0.5 rounded-md font-bold';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Filtering Header Control Panel */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-slate-100">Customer Segmentation Ledger</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search company, contact, email..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Segment Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Filter className="w-4 h-4" />
            </span>
            <select
              value={segmentFilter}
              onChange={(e) => { setSegmentFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="ALL">All Segments</option>
              <option value="VIP_CUSTOMERS">VIP Customers</option>
              <option value="HIGH_POTENTIAL">High Potential</option>
              <option value="REGULAR_CUSTOMERS">Regular Customers</option>
              <option value="AT_RISK">At Risk</option>
              <option value="LOST_CUSTOMERS">Lost Customers</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="ALL">All Payment States</option>
              <option value="PAID">Paid Only</option>
              <option value="PENDING">Pending Only</option>
              <option value="OVERDUE">Overdue Only</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Customers Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-4 px-6">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer uppercase">
                    Company Info <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                  </button>
                </th>
                <th className="py-4 px-6">
                  <button onClick={() => handleSort('revenue')} className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer uppercase">
                    LTV Revenue <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                  </button>
                </th>
                <th className="py-4 px-6">
                  <button onClick={() => handleSort('recency')} className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer uppercase">
                    Recency <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                  </button>
                </th>
                <th className="py-4 px-6">Segment Status</th>
                <th className="py-4 px-6">Bills Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-medium italic">
                    No matching records found. Refine your filters.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-850/30 transition-all duration-150">
                    
                    {/* Customer Core Detail column */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-sm">
                          <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          {cust.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-600 shrink-0" />
                          {cust.contact} ({cust.email})
                        </span>
                      </div>
                    </td>

                    {/* Revenue generated */}
                    <td className="py-4 px-6 font-bold text-slate-200 text-sm">
                      ${cust.revenue.toLocaleString()}
                    </td>

                    {/* Recency (days active) */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-300">{cust.recency} Days ago</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">{cust.frequency} Total transactions</span>
                      </div>
                    </td>

                    {/* Profitability segment badge */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${getSegmentBadge(cust.segment)}`}>
                        {cust.segment}
                      </span>
                    </td>

                    {/* Bills status */}
                    <td className="py-4 px-6">
                      {getStatusBadge(cust.status)}
                    </td>

                    {/* Navigate actions buttons */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => navigate(`/customer/${cust.id}`)}
                        className="px-3.5 py-2 bg-slate-950 border border-slate-850 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-400 rounded-xl font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer shadow-sm"
                      >
                        <Eye className="w-4 h-4" /> View Cards
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Footer controls */}
        {totalPages > 1 && (
          <div className="bg-slate-950/40 border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing <span className="font-bold text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-bold text-slate-300">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
              <span className="font-bold text-slate-300">{totalItems}</span> entries
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center px-3 font-semibold text-slate-300 bg-slate-900 border border-slate-800/80 rounded-lg">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
