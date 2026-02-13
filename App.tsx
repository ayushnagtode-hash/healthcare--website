
import React, { useState, useEffect } from 'react';
import { SymptomReport, AppView, AnalysisResult, PotentialCondition } from './types';
import { analyzeHealthCondition } from './geminiService';
import { CameraView } from './components/CameraView';
import { HistoryCard } from './components/HistoryCard';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [symptoms, setSymptoms] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SymptomReport | null>(null);
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ayushlens_reports');
    if (saved) {
      setReports(JSON.parse(saved));
    }
  }, []);

  const saveReport = (report: SymptomReport) => {
    const updated = [report, ...reports];
    setReports(updated);
    localStorage.setItem('ayushlens_reports', JSON.stringify(updated));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setView(AppView.DASHBOARD);
    } else {
      alert("Please enter a username");
    }
  };

  const handleStartScan = () => {
    setSymptoms('');
    setCapturedImage(null);
    setView(AppView.NEW_SCAN);
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      alert("Please describe your symptoms.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeHealthCondition(symptoms, capturedImage || undefined);
      const newReport: SymptomReport = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        symptoms,
        imageUrl: capturedImage || undefined,
        analysis
      };
      saveReport(newReport);
      setSelectedReport(newReport);
      setView(AppView.DETAILS);
    } catch (error) {
      console.error(error);
      alert("Symptom correlation failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-violet-600 to-indigo-800">
      <div className="w-full max-w-md glass rounded-[2.5rem] p-10 shadow-2xl animate-slide-up">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-violet-600 font-black text-3xl shadow-xl mb-4">A</div>
          <h1 className="text-3xl font-bold text-white drop-shadow-sm">AyushLens</h1>
          <p className="text-violet-100 text-sm mt-2 opacity-80">AI Symptom Correlation Engine</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:bg-white/30 outline-none transition-all"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:bg-white/30 outline-none transition-all"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-white text-violet-700 rounded-2xl font-bold text-lg shadow-xl hover:bg-violet-50 active:scale-95 transition-all"
          >
            Enter Engine
          </button>
        </form>
        
        <p className="text-center text-white/50 text-xs mt-8">
          By logging in, you agree to our Terms and recognize that this is not professional medical advice.
        </p>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8 pb-20">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl animate-slide-up">
        <div className="relative z-10">
          <p className="text-violet-100 font-medium mb-1">Welcome back, {username}</p>
          <h2 className="text-3xl font-black mb-4">AyushLens Analysis</h2>
          <p className="text-indigo-100 max-w-xs text-sm leading-relaxed mb-6 opacity-90">
            Harness the power of AI to correlate symptoms and discover potential health patterns.
          </p>
          <button 
            onClick={handleStartScan}
            className="px-8 py-3.5 bg-white text-indigo-600 rounded-2xl font-bold shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-50 transition-all active:scale-95 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Analysis</span>
          </button>
        </div>
        <div className="absolute top-[-50px] right-[-50px] w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Analysis History</h3>
          <button 
            onClick={() => setView(AppView.HISTORY)}
            className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            See All
          </button>
        </div>
        {reports.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-slate-400 font-semibold text-lg">Your health history is empty</p>
            <p className="text-slate-400 text-sm mt-1">Perform a correlation check to see results here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.slice(0, 4).map(report => (
              <HistoryCard 
                key={report.id} 
                report={report} 
                onClick={(r) => {
                  setSelectedReport(r);
                  setView(AppView.DETAILS);
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderNewScan = () => (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center space-x-4">
        <button onClick={() => setView(AppView.DASHBOARD)} className="p-3 bg-white hover:bg-slate-100 rounded-2xl shadow-sm transition-all active:scale-90">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-black text-slate-900">New Correlation</h2>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-8">
        <div>
          <label className="block text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Visual Context</label>
          <div className="flex space-x-4">
            {capturedImage ? (
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-100 group shadow-inner">
                <img src={capturedImage} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setCapturedImage(null)}
                  className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white p-2 rounded-2xl hover:bg-black transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowCamera(true)}
                className="w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center space-y-3 text-slate-400 hover:border-violet-400 hover:text-violet-500 hover:bg-violet-50/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-100 transition-all">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
                <span className="text-sm font-bold">Add Visual Evidence</span>
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Detailed Symptoms</label>
          <textarea 
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe what you're feeling... (e.g., persistent cough, dizziness, localized swelling)"
            className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 focus:bg-white outline-none transition-all resize-none text-slate-800"
          />
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing || !symptoms.trim()}
          className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center space-x-3 ${
            isAnalyzing || !symptoms.trim() 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 hover:shadow-indigo-500/40'
          }`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Correlating Data...</span>
            </>
          ) : (
            <span>Analyze with Engine</span>
          )}
        </button>
      </div>
    </div>
  );

  const renderDetails = () => {
    if (!selectedReport) return null;
    const { analysis, symptoms: desc, imageUrl } = selectedReport;

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-slide-up">
        <div className="flex items-center space-x-4">
          <button onClick={() => setView(AppView.DASHBOARD)} className="p-3 bg-white hover:bg-slate-100 rounded-2xl shadow-sm transition-all active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-2xl font-black text-slate-900">Analysis Result</h2>
        </div>

        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 transition-all">
          {imageUrl && (
            <div className="w-full h-72 overflow-hidden relative">
              <img src={imageUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <span className="text-white font-bold text-sm bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">Visual Context Analyzed</span>
              </div>
            </div>
          )}
          
          <div className="p-8 space-y-10">
            {/* Header Result */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Primary Condition</p>
                <h3 className="text-3xl font-black text-slate-900">{analysis?.primaryCondition}</h3>
              </div>
              <div className="md:text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Severity Level</p>
                <span className={`inline-block px-5 py-2 rounded-2xl text-sm font-black shadow-sm ${
                  analysis?.severity === 'Low' ? 'bg-blue-100 text-blue-700' :
                  analysis?.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                  analysis?.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {analysis?.severity}
                </span>
              </div>
            </div>

            {/* AI Summary Banner */}
            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                <h4 className="font-black text-sm uppercase tracking-widest mb-3 opacity-80">Engine Summary</h4>
                <p className="text-indigo-50 text-sm font-medium leading-relaxed">{analysis?.summary}</p>
               </div>
               <svg className="absolute top-[-20px] right-[-20px] w-24 h-24 text-white/5 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14H11V21L20 10H13Z" />
               </svg>
            </div>

            {/* Correlation Engine Report */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h4 className="font-black text-slate-900">Disease Correlation Report</h4>
              </div>
              <div className="space-y-3">
                {analysis?.correlationReport.map((cond, i) => (
                  <div key={cond.name} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 flex flex-col items-center">
                       <span className="text-[10px] font-bold text-slate-400 mb-1">{Math.round(cond.likelihood * 100)}%</span>
                       <div className="w-1.5 h-12 bg-slate-200 rounded-full overflow-hidden">
                         <div 
                           className="bg-indigo-500 w-full transition-all duration-1000" 
                           style={{ height: `${cond.likelihood * 100}%` }}
                         />
                       </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-slate-800 text-md">{cond.name}</h5>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cond.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              <h4 className="font-black text-slate-900">Action Plan</h4>
              <div className="grid grid-cols-1 gap-3">
                {analysis?.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-3 text-sm p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100">
                    <div className="mt-0.5 bg-emerald-200 rounded-full p-1">
                      <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-semibold">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100">
              <div className="flex items-center space-x-3 text-rose-700 font-black mb-3">
                <div className="bg-rose-100 p-2 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <span className="text-sm uppercase tracking-widest">Medical Disclaimer</span>
              </div>
              <p className="text-xs text-rose-600 font-medium leading-relaxed opacity-90">{analysis?.disclaimer}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setView(AppView.DASHBOARD)}
          className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-black shadow-2xl transition-all active:scale-95"
        >
          Return to Dashboard
        </button>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center space-x-4">
        <button onClick={() => setView(AppView.DASHBOARD)} className="p-3 bg-white hover:bg-slate-100 rounded-2xl shadow-sm transition-all active:scale-90">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-black text-slate-900">Full History</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 pb-24">
        {reports.map(report => (
          <HistoryCard 
            key={report.id} 
            report={report} 
            onClick={(r) => {
              setSelectedReport(r);
              setView(AppView.DETAILS);
            }} 
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {view === AppView.LOGIN ? (
        renderLogin()
      ) : (
        <>
          {/* Header */}
          <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110">A</div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">AyushLens</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 border-2 border-slate-50 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden">
                {username.charAt(0).toUpperCase()}
              </div>
            </div>
          </nav>

          <main className="max-w-4xl mx-auto p-6 md:p-10">
            {view === AppView.DASHBOARD && renderDashboard()}
            {view === AppView.NEW_SCAN && renderNewScan()}
            {view === AppView.HISTORY && renderHistory()}
            {view === AppView.DETAILS && renderDetails()}
          </main>

          {/* Camera Modal */}
          {showCamera && (
            <CameraView 
              onCapture={(uri) => {
                setCapturedImage(uri);
                setShowCamera(false);
              }}
              onClose={() => setShowCamera(false)}
            />
          )}

          {/* Floating Action Button (FAB) Mobile */}
          {view === AppView.DASHBOARD && (
            <button 
              onClick={handleStartScan}
              className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center lg:hidden hover:bg-indigo-700 transition-all active:scale-90 z-50 hover:shadow-indigo-500/50"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default App;
