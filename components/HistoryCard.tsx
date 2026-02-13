
import React from 'react';
import { SymptomReport } from '../types';

interface HistoryCardProps {
  report: SymptomReport;
  onClick: (report: SymptomReport) => void;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ report, onClick }) => {
  const dateStr = new Date(report.timestamp).toLocaleDateString();
  const timeStr = new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'Low': return 'bg-blue-100 text-blue-700';
      case 'Moderate': return 'bg-yellow-100 text-yellow-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Emergency': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div 
      onClick={() => onClick(report)}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer flex items-center space-x-4 animate-slide-up hover:scale-[1.02]"
    >
      <div className="flex-shrink-0">
        {report.imageUrl ? (
          <img 
            src={report.imageUrl} 
            alt="Scan" 
            className="w-16 h-16 rounded-xl object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-violet-50 flex items-center justify-center text-violet-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-gray-900 truncate">
            {report.analysis?.primaryCondition || "No Analysis"}
          </h4>
          <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${getSeverityColor(report.analysis?.severity)}`}>
            {report.analysis?.severity || "N/A"}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate mt-1">
          {report.symptoms}
        </p>
        <div className="flex items-center mt-2 text-xs text-gray-400">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {dateStr} • {timeStr}
        </div>
      </div>
    </div>
  );
};
