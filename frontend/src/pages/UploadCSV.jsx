import React, { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Terminal,
  FileWarning
} from 'lucide-react';

export default function UploadCSV() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | parsing | validating | saving | completed | failed
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const addLog = (message, type = 'info') => {
    setLogs((prev) => [...prev, { 
      time: new Date().toLocaleTimeString(), 
      message, 
      type 
    }]);
  };

  const processCSVFile = async (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      addToast('Invalid file format. Please upload a standard CSV file.', 'error');
      return;
    }

    setFile(selectedFile);
    setStatus('parsing');
    setProgress(10);
    setLogs([]);
    addLog(`Loading file: "${selectedFile.name}" (${(selectedFile.size / 1024).toFixed(2)} KB)`, 'info');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      addLog('Uploading file to backend transaction ingestion engine...', 'info');
      setProgress(30);

      const response = await fetch('http://localhost:5000/api/customers/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      setProgress(70);
      setStatus('saving');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'CSV ingestion failed');
      }

      setProgress(100);
      setStatus('completed');
      addLog(data.message, 'success');
      
      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach(warn => addLog(warn, 'warning'));
      }

      addToast('Transaction CSV processed successfully!', 'success');

    } catch (error) {
      setProgress(100);
      setStatus('failed');
      addLog(`CSV ingestion aborted: ${error.message}`, 'error');
      addToast(error.message, 'error');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCSVFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processCSVFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const resetUpload = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setLogs([]);
  };

  return (
    <div className="space-y-6">
      
      {/* Description Info Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h3 className="font-bold text-slate-100 flex items-center gap-2 text-lg">
          Upload Transaction Database <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
        </h3>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Import client sales histories using a CSV file. The system will automatically parse spending, validate dates, remove duplicates, recalculate RFM profitability segments, and generate new AI advice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column (2/3 width): Upload Target Zone */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-center min-h-[350px]">
            
            {status === 'idle' && (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`
                  border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[300px]
                  ${dragActive 
                    ? 'border-indigo-500 bg-indigo-500/5' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-indigo-400 mb-4 shadow-md">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <h4 className="font-semibold text-slate-200 text-sm">Drag & Drop transaction CSV file here</h4>
                <p className="text-xs text-slate-500 mt-2">or click here to search your computer</p>
                <span className="text-[10px] text-slate-600 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-900 mt-6 font-medium">
                  Columns required: CustomerName, Email, Amount, Date, Status
                </span>
              </div>
            )}

            {status !== 'idle' && (
              <div className="space-y-6 p-4">
                <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                  <div className="p-3 bg-indigo-600/10 rounded-xl">
                    <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="font-semibold text-slate-200 text-sm truncate">{file?.name}</h4>
                    <span className="text-xs text-slate-500">{(file?.size / 1024).toFixed(2)} KB</span>
                  </div>
                  {status === 'completed' && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                  {status === 'failed' && <AlertCircle className="w-6 h-6 text-rose-400" />}
                  {['parsing', 'validating', 'saving'].includes(status) && (
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  )}
                </div>

                {/* Progress bar container */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400 capitalize">
                      {status === 'parsing' && 'Scanning lines...'}
                      {status === 'validating' && 'Validating parameters...'}
                      {status === 'saving' && 'Updating PostgreSQL ledger...'}
                      {status === 'completed' && 'Database Sync Complete'}
                    </span>
                    <span className="text-slate-200">{progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  {status === 'completed' && (
                    <button
                      onClick={resetUpload}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
                    >
                      Import Another CSV
                    </button>
                  )}
                  {['parsing', 'validating', 'saving'].includes(status) && (
                    <button
                      disabled
                      className="px-4 py-2 bg-slate-800 text-slate-500 rounded-xl text-xs font-semibold cursor-not-allowed border border-slate-700/40"
                    >
                      Synchronizing...
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right column (1/3 width): Terminal Validation Console */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col h-[350px]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Terminal className="w-4 h-4 text-indigo-400" /> Validation Log
            </span>
            <button 
              onClick={() => setLogs([])}
              className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer font-semibold"
            >
              Clear Logs
            </button>
          </div>

          {/* Console canvas */}
          <div className="flex-1 bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-[11px] overflow-y-auto space-y-2 select-text scrollbar-thin">
            {logs.length === 0 ? (
              <span className="text-slate-600 italic block mt-1">Console idle. Drop file to capture logs.</span>
            ) : (
              logs.map((log, index) => {
                let colorClass = 'text-slate-300';
                let Icon = null;
                if (log.type === 'success') {
                  colorClass = 'text-emerald-400';
                } else if (log.type === 'warning') {
                  colorClass = 'text-amber-400';
                  Icon = FileWarning;
                } else if (log.type === 'error') {
                  colorClass = 'text-rose-400';
                }
                return (
                  <div key={index} className={`flex items-start gap-2 leading-relaxed ${colorClass}`}>
                    <span className="text-slate-600 shrink-0 font-light select-none">[{log.time}]</span>
                    <span className="flex-1">
                      {Icon && <Icon className="w-3.5 h-3.5 inline mr-1 text-amber-400 align-text-bottom" />}
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
