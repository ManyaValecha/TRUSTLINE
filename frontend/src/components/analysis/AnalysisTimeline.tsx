import React, { useEffect, useState } from 'react';
import { UploadCloud, MessageSquare, BrainCircuit, ShieldCheck, Languages, FileCheck2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface AnalysisTimelineProps {
  isAnalyzing: boolean;
  isSimulation?: boolean;
  error: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

interface PipelineStage {
  id: number;
  title: string;
  provider: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

export const AnalysisTimeline: React.FC<AnalysisTimelineProps> = ({
  isAnalyzing,
  isSimulation = false,
  error,
  onRetry,
  onCancel,
}) => {
  const providerStages: PipelineStage[] = [
    {
      id: 1,
      title: 'Preparing Authorized Audio Upload',
      provider: 'FastAPI Stream',
      description: 'Preparing the selected recording for upload to the configured backend.',
      icon: UploadCloud,
      accentColor: 'text-violet-400 border-violet-500/50 bg-violet-950/40',
    },
    {
      id: 2,
      title: 'Transcribing Multilingual Speech',
      provider: 'Gnani Speech STT',
      description: 'The configured speech provider attempts to convert the submitted recording into text.',
      icon: MessageSquare,
      accentColor: 'text-purple-400 border-purple-500/50 bg-purple-950/40',
    },
    {
      id: 3,
      title: 'Analysing Manipulation & Coercion Patterns',
      provider: 'Cohere AI',
      description: 'Evaluating psychological pressure, false urgency, and authority impersonation.',
      icon: BrainCircuit,
      accentColor: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40',
    },
    {
      id: 4,
      title: 'Evaluating Deterministic Rule Constraints',
      provider: 'TRUSTLINE Heuristics',
      description: 'Matching credential extraction patterns (OTP, PIN, UPI, Netbanking requests).',
      icon: ShieldCheck,
      accentColor: 'text-indigo-400 border-indigo-500/50 bg-indigo-950/40',
    },
    {
      id: 5,
      title: 'Synthesizing Regional Safety Advisory',
      provider: 'Sarvam AI',
      description: 'Translating risk analysis and warnings into your preferred Indic language.',
      icon: Languages,
      accentColor: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40',
    },
    {
      id: 6,
      title: 'Compiling Comprehensive Safety Report',
      provider: 'TRUSTLINE Engine',
      description: 'Formatting actionable recommendations and critical safety directives.',
      icon: FileCheck2,
      accentColor: 'text-blue-400 border-blue-500/50 bg-blue-950/40',
    },
  ];

  const simulationStages: PipelineStage[] = [
    {
      id: 1,
      title: 'Loading prewritten sample',
      provider: 'Local simulation',
      description: 'This example contains authored text only. No audio is sent and no external provider is called.',
      icon: FileCheck2,
      accentColor: 'text-violet-400 border-violet-500/50 bg-violet-950/40',
    },
    {
      id: 2,
      title: 'Preparing example assessment',
      provider: 'Local simulation',
      description: 'The prewritten demonstration result is being displayed; it is not a live model or detector run.',
      icon: ShieldCheck,
      accentColor: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40',
    },
  ];
  const stages = isSimulation ? simulationStages : providerStages;

  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Advance progressive stages naturally while waiting for server response
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStageIndex(0);
      return;
    }

    // Step through the visual stages progressively
    const milestones = isSimulation ? [500] : [700, 2200, 4200, 6200, 8200];
    const timers = milestones.map((delay, index) =>
      setTimeout(() => setCurrentStageIndex(index + 1), delay),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isAnalyzing, isSimulation]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#0E132A] border border-violet-900/40 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/70 border border-violet-500/30 text-xs font-bold text-violet-300">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
          <span>{isSimulation ? 'Simulation · local only' : 'Multi-Provider Behavioral Audit Active'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">
          {isSimulation ? 'Preparing Demonstration' : 'Analysing Conversational Safety'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          {isSimulation
            ? 'This prewritten sample uses no audio and contacts no AI or speech provider.'
            : 'The submitted recording is being processed through the configured transcription, analysis, and optional translation providers.'}
        </p>
      </div>

      {/* Progress Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex && !error;
          const isPending = idx > currentStageIndex;

          return (
            <div key={stage.id} className="relative flex items-start gap-4 transition-all duration-300">
              {/* Step indicator node */}
              <div
                className={`absolute -left-6 sm:-left-8 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-900/50'
                    : isCurrent
                    ? 'bg-violet-600 border-violet-300 text-white shadow-lg shadow-violet-600/50 scale-110 animate-pulse'
                    : 'bg-[#151936] border-slate-700 text-slate-500'
                }`}
              >
                {isDone ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-[11px] font-bold">{stage.id}</span>
                )}
              </div>

              {/* Stage content */}
              <div
                className={`p-3.5 rounded-xl border transition-all duration-200 flex-1 ${
                  isCurrent
                    ? 'bg-[#151B3D] border-violet-500/50 shadow-md'
                    : isDone
                    ? 'bg-[#0E132A]/90 border-emerald-900/30 opacity-90'
                    : 'bg-[#0A0D1E]/40 border-slate-900 opacity-40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Icon className="w-4 h-4 text-violet-400" />
                    <span>{stage.title}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-violet-300 border border-violet-900/40">
                    {stage.provider}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error state if analysis fails */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 space-y-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="text-sm font-bold">Analysis Request Interrupted</div>
          </div>
          <p className="text-xs text-rose-300 leading-relaxed">
            {error}
          </p>
          <div className="flex items-center gap-3 pt-1">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Analysis</span>
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
