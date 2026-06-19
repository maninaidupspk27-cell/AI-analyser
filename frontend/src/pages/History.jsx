import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { History as HistoryIcon, Star, FileText } from 'lucide-react';

export default function History() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/generations', {
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

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
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
                  <th className="py-3 px-6">Subject</th>
                  <th className="py-3 px-6">Requirements Snippet</th>
                  <th className="py-3 px-6 text-center">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {generations.map((gen) => (
                  <tr key={gen.id} className="hover:bg-slate-850/20 transition-colors">
                    <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                      {new Date(gen.createdAt).toLocaleDateString()}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
