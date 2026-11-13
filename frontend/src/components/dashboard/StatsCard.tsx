import React from 'react';
import { Activity, ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StatsCard: React.FC = () => {
  const { analysisHistory } = useApp();

  const total = analysisHistory.length;
  const highCount = analysisHistory.filter((item) => item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL').length;
  const mediumCount = analysisHistory.filter((item) => item.riskLevel === 'MEDIUM').length;
  const lowCount = analysisHistory.filter((item) => item.riskLevel === 'LOW').length;

  const stats = [
    {
      label: 'Recordings Analysed',
      count: total,
      icon: Activity,
      textColor: 'text-violet-300',
      bgColor: 'bg-violet-950/40',
      borderColor: 'border-violet-900/30',
      description: 'Total user-authorized audio audits',
    },
    {
      label: 'High-Risk Reports',
      count: highCount,
      icon: ShieldAlert,
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-950/40',
      borderColor: 'border-rose-900/40',
      description: 'Strong warning indicators; not proof of fraud',
    },
    {
      label: 'Medium-Risk Flags',
      count: mediumCount,
      icon: AlertTriangle,
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-900/40',
      description: 'Suspicious elements requiring caution',
    },
    {
      label: 'Low-Risk Reports',
      count: lowCount,
      icon: ShieldCheck,
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-900/40',
      description: 'No major indicator found; not proof of safety',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-4 sm:p-5 rounded-2xl bg-[#0E132A] border ${stat.borderColor} shadow-md flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 max-w-[110px] truncate">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl ${stat.bgColor} ${stat.textColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className={`text-2xl sm:text-3xl font-extrabold ${stat.textColor} font-mono`}>
                {stat.count}
              </div>
              <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                {stat.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
