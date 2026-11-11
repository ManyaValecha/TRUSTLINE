import React from 'react';
import { ShieldCheck, ShieldOff, Info, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProtectionCard: React.FC = () => {
  const { settings, updateSettings, analysisHistory } = useApp();
  const isActive = settings.protectionActive;

  const lastAnalysis = analysisHistory.length > 0 ? analysisHistory[0] : null;

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121634] via-[#0E132A] to-[#0A0D1E] border border-violet-900/40 shadow-2xl">
      {/* Background ambient lighting */}
      <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        isActive ? 'bg-violet-600/15' : 'bg-slate-700/10'
      }`} />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Shield graphic & Status details */}
        <div className="flex items-start sm:items-center gap-5">
          {/* Animated Shield */}
          <div className="relative flex items-center justify-center shrink-0">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                isActive
                  ? 'bg-violet-600/20 border-violet-500/60 shadow-[0_0_30px_-5px_rgba(139,92,246,0.4)]'
                  : 'bg-slate-800/40 border-slate-700 text-slate-500'
              }`}
            >
              {isActive ? (
                <ShieldCheck className="w-9 h-9 sm:w-11 sm:h-11 text-violet-400 transition-transform duration-300" />
              ) : (
                <ShieldOff className="w-9 h-9 sm:w-11 sm:h-11 text-slate-500" />
              )}
            </div>

            {/* Pulsing radar ring when active */}
            {isActive && (
              <div className="absolute inset-0 rounded-2xl border-2 border-violet-400/40 animate-radar pointer-events-none" />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span
                className={`text-xs font-extrabold uppercase tracking-widest ${
                  isActive ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {isActive ? 'Analysis Readiness Active' : 'Protection Paused'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isActive ? 'Guard Mode Engaged' : 'Shield Standby'}
            </h2>

            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Ready to examine authorized audio clips with Gnani speech transcription, Cohere deception modelling, and Sarvam Indic translation.
            </p>

            {lastAnalysis && (
              <div className="text-[11px] text-slate-400 pt-0.5">
                Last checked:{' '}
                <span className="text-slate-200 font-medium">
                  {new Date(lastAnalysis.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  &bull; {new Date(lastAnalysis.timestamp).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle switch & Privacy notice */}
        <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">
              {isActive ? 'Active' : 'Disabled'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => updateSettings({ protectionActive: !isActive })}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#090B16] ${
                isActive ? 'bg-violet-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Honest transparency note */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-violet-900/30 text-[11px] text-slate-400 max-w-xs">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              Controls manual analysis state. Does <strong>not</strong> silently wiretap cellular phone calls.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
