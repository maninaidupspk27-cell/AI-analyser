import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { History as HistoryIcon, Star, FileText, Eye, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function History() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGen, setSelectedGen] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/generations`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        const data = await response.json();
        if (data.success) {
          setGenerations(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchHistory();
  }, [user?.token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <HistoryIcon className="w-6 h-6 text-indigo-400" />
          Generation History
        </h2>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden hover-lift">
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="animate-spin border-4 border-indigo-500 border-t-transparent rounded-full w-8 h-8"></span>
          </div>
        ) : generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p>No generations found in your history.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Author</th>
                  <th className="py-3 px-6">Subject</th>
                  <th className="py-3 px-6">Requirements Snippet</th>
                  <th className="py-3 px-6 text-center">Rating</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {generations.map((gen) => (
                  <tr key={gen.id} className="hover:bg-slate-850/20 transition-colors">
                    <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                      {new Date(gen.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      {gen.user ? (
                        <div>
                          <div className="font-semibold text-slate-200">{gen.user.fullName}</div>
                          <div className={`mt-1 inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            gen.user.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-400' :
                            gen.user.role === 'SALES_MANAGER' ? 'bg-indigo-500/10 text-indigo-400' :
                            'bg-slate-500/10 text-slate-400'
                          }`}>
                            {gen.user.role.replace('_', ' ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unknown</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-200">
                      {gen.subject}
                    </td>
                    <td className="py-4 px-6 text-slate-400 max-w-xs truncate">
                      {gen.requirements}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1">
                        {gen.rating ? (
                          <>
                            <span className="font-bold text-amber-400">{gen.rating}</span>
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          </>
                        ) : (
                          <span className="text-slate-600 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setSelectedGen(gen)}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-800/50 text-slate-300 hover:text-white hover:bg-indigo-500/20 transition-all border border-slate-700 hover:border-indigo-500/50"
                        title="View Generated Analysis"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Generated Analysis
              </h3>
              <button 
                onClick={() => setSelectedGen(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-1">Subject</p>
                <p className="text-slate-200 font-semibold">{selectedGen.subject}</p>
              </div>
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-slate-100 prose-a:text-indigo-400">
                <ReactMarkdown>{selectedGen.aiResponse}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
